import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { CreateReviewInput, Review, User } from '../../../types';

const REVIEWS_COLLECTION = 'reviews';
const USERS_COLLECTION = 'users';

/**
 * Lắng nghe realtime danh sách đánh giá nhận được của một người dùng (targetUserId == uid).
 */
export const subscribeUserReviews = (
  targetUserId: string,
  onData: (reviews: Review[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where('targetUserId', '==', targetUserId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const reviews: Review[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<Review, 'reviewId'> & { reviewId?: string };
        return {
          ...data,
          reviewId: data.reviewId || docSnap.id,
        };
      });

      reviews.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      onData(reviews);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * Lắng nghe realtime thông tin hồ sơ người dùng từ Firestore (users/{uid}).
 */
export const subscribeUserProfile = (
  uid: string,
  onData: (user: User | null) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const userRef = doc(db, USERS_COLLECTION, uid);

  return onSnapshot(
    userRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        onData(null);
        return;
      }
      const data = docSnap.data() as User;
      onData({ ...data, uid: data.uid || docSnap.id });
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * Gửi đánh giá mới:
 * - Lưu document mới vào collection `reviews`
 * - Dùng Firestore Transaction tính lại trung bình `trustScore` và tăng `totalReviews`
 *   trong document `users/{targetUserId}`
 */
export const submitReview = async (
  input: CreateReviewInput,
  reviewer: User,
  isPublicIdentity = true
): Promise<string> => {
  if (!input.targetUserId) {
    throw new Error('Thiếu thông tin người được đánh giá (targetUserId).');
  }
  if (input.targetUserId === reviewer.uid) {
    throw new Error('Bạn không thể tự đánh giá chính mình.');
  }
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Số sao đánh giá phải từ 1 đến 5.');
  }

  // Kiểm tra tránh đánh giá trùng lặp cho cùng 1 giao dịch
  if (input.relatedId) {
    const existingQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('reviewerId', '==', reviewer.uid),
      where('relatedId', '==', input.relatedId)
    );
    const existingSnap = await getDocs(existingQuery);
    if (!existingSnap.empty) {
      throw new Error('Bạn đã đánh giá giao dịch này rồi.');
    }
  }

  const targetUserRef = doc(db, USERS_COLLECTION, input.targetUserId);
  const reviewRef = doc(collection(db, REVIEWS_COLLECTION));

  await runTransaction(db, async (transaction) => {
    const targetUserSnap = await transaction.get(targetUserRef);

    if (!targetUserSnap.exists()) {
      throw new Error('Không tìm thấy hồ sơ người dùng cần đánh giá.');
    }

    const userData = targetUserSnap.data() as User;
    const prevTotal = typeof userData.totalReviews === 'number' ? userData.totalReviews : 0;
    const prevScore = typeof userData.trustScore === 'number' ? userData.trustScore : 0;

    const newTotalReviews = prevTotal + 1;
    const rawAverage = (prevScore * prevTotal + input.rating) / newTotalReviews;
    const newTrustScore = Math.min(5, Math.max(0, Math.round(rawAverage * 10) / 10));

    const newReview: Review = {
      reviewId: reviewRef.id,
      reviewerId: reviewer.uid,
      reviewerName: isPublicIdentity
        ? reviewer.displayName || reviewer.email || 'Sinh viên UniShare'
        : 'Sinh viên ẩn danh',
      reviewerAvatar: isPublicIdentity ? reviewer.avatarUrl ?? null : null,
      targetUserId: input.targetUserId,
      rating: input.rating,
      comment: input.comment.trim(),
      tags: input.tags,
      relatedType: input.relatedType,
      relatedTitle: input.relatedTitle,
      relatedId: input.relatedId,
      createdAt: Date.now(),
    };

    transaction.update(targetUserRef, {
      trustScore: newTrustScore,
      totalReviews: newTotalReviews,
      updatedAt: Date.now(),
    });
    transaction.set(reviewRef, newReview);
  });

  return reviewRef.id;
};
