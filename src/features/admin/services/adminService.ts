import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import {
  User,
  Task,
  Product,
  TaskStatus,
  ProductStatus,
} from '../../../types';

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, 'users'));
  const users: User[] = snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as User),
    uid: docSnap.id,
  }));
  return users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

export const getAllTasks = async (): Promise<Task[]> => {
  const snapshot = await getDocs(collection(db, 'tasks'));
  const tasks: Task[] = snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as Task),
    taskId: docSnap.id,
  }));
  return tasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

export const getAllProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(db, 'products'));
  const products: Product[] = snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as Product),
    productId: docSnap.id,
  }));
  return products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

export const toggleUserBanStatus = async (
  uid: string,
  currentStatus: 'active' | 'banned'
): Promise<'active' | 'banned'> => {
  const nextStatus: 'active' | 'banned' =
    currentStatus === 'banned' ? 'active' : 'banned';
  await updateDoc(doc(db, 'users', uid), {
    status: nextStatus,
    updatedAt: Date.now(),
  });
  return nextStatus;
};

export const toggleTaskVisibility = async (
  taskId: string,
  currentStatus: TaskStatus
): Promise<TaskStatus> => {
  const nextStatus: TaskStatus =
    currentStatus === 'hidden' ? 'open' : 'hidden';
  await updateDoc(doc(db, 'tasks', taskId), {
    status: nextStatus,
    updatedAt: Date.now(),
  });
  return nextStatus;
};

export const toggleProductVisibility = async (
  productId: string,
  currentStatus: ProductStatus
): Promise<ProductStatus> => {
  const nextStatus: ProductStatus =
    currentStatus === 'hidden' ? 'available' : 'hidden';
  await updateDoc(doc(db, 'products', productId), {
    status: nextStatus,
    updatedAt: Date.now(),
  });
  return nextStatus;
};