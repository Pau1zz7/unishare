import { useEffect, useState } from 'react';
import {
  subscribeUserProfile,
  subscribeUserReviews,
} from '../services/reviewService';
import { Review, User } from '../../../types';

/**
 * Hook lắng nghe realtime danh sách đánh giá của một người dùng (targetUserId == uid).
 */
export const useUserReviews = (targetUserId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!!targetUserId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = subscribeUserReviews(
      targetUserId,
      (data) => {
        setReviews(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Không thể tải danh sách đánh giá.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [targetUserId]);

  return { reviews, loading, error };
};

/**
 * Hook lắng nghe realtime thông tin hồ sơ người dùng từ Firestore (users/{uid}).
 */
export const useUserProfile = (uid?: string) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!uid);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = subscribeUserProfile(
      uid,
      (data) => {
        setProfile(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Không thể tải hồ sơ người dùng.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [uid]);

  return { profile, loading, error };
};
