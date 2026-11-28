import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { uploadImages } from '../../../lib/firebase/storageService';
import {
  calculateDistanceKm,
  enrichLocationWithGeohash,
} from '../../../lib/location/locationService';
import { CreateTaskInput, Task, TaskStatus, User } from '../../../types';

const TASKS_COLLECTION = 'tasks';

const mapTaskDoc = (
  id: string,
  rawData: Omit<Task, 'taskId'> & { taskId?: string }
): Task => ({
  ...rawData,
  taskId: rawData.taskId || id,
});

/**
 * Lắng nghe realtime danh sách việc vặt đang mở (status == 'open').
 * Sắp xếp giảm dần theo createdAt ở client để tránh phụ thuộc composite index.
 */
export const subscribeOpenTasks = (
  onData: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const q = query(collection(db, TASKS_COLLECTION), where('status', '==', 'open'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((docSnap) =>
        mapTaskDoc(docSnap.id, docSnap.data() as Omit<Task, 'taskId'> & { taskId?: string })
      );

      tasks.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      onData(tasks);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * Lắng nghe realtime lịch sử việc vặt của user (requesterId == uid hoặc workerId == uid).
 */
export const subscribeUserTasks = (
  uid: string,
  onData: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const requesterQuery = query(
    collection(db, TASKS_COLLECTION),
    where('requesterId', '==', uid)
  );
  const workerQuery = query(
    collection(db, TASKS_COLLECTION),
    where('workerId', '==', uid)
  );

  let requesterTasks: Task[] = [];
  let workerTasks: Task[] = [];

  const emitMerged = () => {
    const mergedMap = new Map<string, Task>();
    for (const item of requesterTasks) {
      mergedMap.set(item.taskId, item);
    }
    for (const item of workerTasks) {
      mergedMap.set(item.taskId, item);
    }
    const merged = Array.from(mergedMap.values()).sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
    onData(merged);
  };

  const unsubRequester = onSnapshot(
    requesterQuery,
    (snapshot) => {
      requesterTasks = snapshot.docs.map((docSnap) =>
        mapTaskDoc(docSnap.id, docSnap.data() as Omit<Task, 'taskId'> & { taskId?: string })
      );
      emitMerged();
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  const unsubWorker = onSnapshot(
    workerQuery,
    (snapshot) => {
      workerTasks = snapshot.docs.map((docSnap) =>
        mapTaskDoc(docSnap.id, docSnap.data() as Omit<Task, 'taskId'> & { taskId?: string })
      );
      emitMerged();
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return () => {
    unsubRequester();
    unsubWorker();
  };
};

/**
 * Lắng nghe realtime chi tiết một việc vặt theo taskId.
 */
export const subscribeTaskById = (
  taskId: string,
  onData: (task: Task | null) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);

  return onSnapshot(
    taskRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        onData(null);
        return;
      }
      onData(
        mapTaskDoc(docSnap.id, docSnap.data() as Omit<Task, 'taskId'> & { taskId?: string })
      );
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * Tạo việc vặt mới:
 * - Upload ảnh đính kèm lên Firebase Storage (lưu mảng imageUrls)
 * - Sinh trường geohash cho pickupLocation & deliveryLocation bằng geofire-common
 * - Lưu kèm requesterName, requesterAvatar, requesterTrustScore (Denormalization)
 */
export const createTask = async (
  input: CreateTaskInput,
  requester: User
): Promise<string> => {
  const uploadedUrls = await uploadImages(
    input.imageUrls ?? [],
    'tasks',
    requester.uid
  );

  const pickupLocation = enrichLocationWithGeohash(input.pickupLocation);
  const deliveryLocation = enrichLocationWithGeohash(input.deliveryLocation);
  const distanceKm = calculateDistanceKm(
    pickupLocation.latitude,
    pickupLocation.longitude,
    deliveryLocation.latitude,
    deliveryLocation.longitude
  );

  const taskRef = doc(collection(db, TASKS_COLLECTION));
  const now = Date.now();

  const newTask: Task = {
    taskId: taskRef.id,
    title: input.title.trim(),
    description: input.description.trim(),
    requesterId: requester.uid,
    requesterName: requester.displayName || requester.email,
    requesterAvatar: requester.avatarUrl ?? null,
    requesterTrustScore:
      typeof requester.trustScore === 'number' && requester.trustScore > 0
        ? requester.trustScore
        : 5.0,
    bounty: input.bounty,
    paymentMethod: input.paymentMethod,
    category: input.category,
    pickupLocation,
    deliveryLocation,
    distanceKm,
    imageUrls: uploadedUrls,
    status: 'open',
    workerId: null,
    workerName: null,
    ...(input.deadline ? { deadline: input.deadline } : {}),
    ...(input.estimatedTime !== undefined ? { estimatedTime: input.estimatedTime } : {}),
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(taskRef, newTask);
  return taskRef.id;
};

/**
 * Nhận việc an toàn bằng Firestore Transaction (runTransaction):
 * Kiểm tra status === 'open' rồi mới chuyển sang 'matched' để tránh 2 người nhận cùng lúc.
 */
export const acceptTask = async (
  taskId: string,
  workerId: string,
  workerName: string
): Promise<void> => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);

  await runTransaction(db, async (transaction) => {
    const taskSnap = await transaction.get(taskRef);

    if (!taskSnap.exists()) {
      throw new Error('Công việc không tồn tại hoặc đã bị xóa.');
    }

    const taskData = taskSnap.data() as Task;

    if (taskData.requesterId === workerId) {
      throw new Error('Bạn không thể tự nhận công việc do chính mình đăng.');
    }

    if (taskData.status !== 'open') {
      throw new Error('Công việc này đã được người khác nhận hoặc không còn mở.');
    }

    transaction.update(taskRef, {
      status: 'matched',
      workerId,
      workerName,
      updatedAt: Date.now(),
    });
  });
};

/**
 * Cập nhật trạng thái việc vặt (VD: 'completed' hoặc 'cancelled').
 */
export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
): Promise<void> => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, {
    status,
    updatedAt: Date.now(),
  });
};
