import { useCallback, useEffect, useState } from 'react';
import {
  acceptTask as acceptTaskService,
  subscribeOpenTasks,
  subscribeTaskById,
} from '../services/taskService';
import { Task } from '../../../types';

/**
 * Hook lắng nghe realtime danh sách việc vặt đang mở (status == 'open') từ Firestore.
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribeVersion, setSubscribeVersion] = useState(0);

  useEffect(() => {
    setError(null);
    const unsubscribe = subscribeOpenTasks(
      (data) => {
        setTasks(data);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        setError(err.message || 'Không thể tải danh sách việc vặt.');
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [subscribeVersion]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setSubscribeVersion((v) => v + 1);
  }, []);

  return { tasks, loading, refreshing, error, refresh };
};

/**
 * Hook lắng nghe realtime chi tiết 1 việc vặt và cung cấp action nhận việc qua Transaction.
 */
export const useTaskDetail = (taskId?: string, initialTask?: Task | null) => {
  const [task, setTask] = useState<Task | null>(initialTask ?? null);
  const [loading, setLoading] = useState(!initialTask && !!taskId);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedId = taskId || initialTask?.taskId;
    if (!resolvedId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeTaskById(
      resolvedId,
      (data) => {
        setTask(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Không thể tải chi tiết công việc.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [taskId, initialTask?.taskId]);

  const acceptTask = useCallback(
    async (workerId: string, workerName: string) => {
      if (!task?.taskId) {
        throw new Error('Không tìm thấy mã công việc.');
      }
      setAccepting(true);
      try {
        await acceptTaskService(task.taskId, workerId, workerName);
      } finally {
        setAccepting(false);
      }
    },
    [task?.taskId]
  );

  return { task, loading, accepting, error, acceptTask };
};
