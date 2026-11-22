import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Review } from '../types';
import { colors, typography, spacing, borderRadius } from '../theme/tokens';

interface ReviewItemProps {
  review: Review;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const getTimeAgo = (timestamp: number) => {
    const diffMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  return (
    <View style={styles.card}>
      {/* Header: Reviewer info & Rating */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          {review.reviewerAvatar ? (
            <Image source={{ uri: review.reviewerAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>
                {review.reviewerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.userMeta}>
            <Text style={styles.reviewerName} numberOfLines={1}>
              {review.reviewerName}
            </Text>
            <Text style={styles.timeAgo}>{getTimeAgo(review.createdAt)}</Text>
          </View>
        </View>

        {/* Stars */}
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Feather
              key={star}
              name="star"
              size={13}
              color={star <= review.rating ? '#F59E0B' : colors.neutral.disabled}
              style={{ marginLeft: 1 }}
            />
          ))}
        </View>
      </View>

      {/* Related Transaction Tag */}
      {review.relatedTitle && (
        <View style={styles.relatedBox}>
          <Feather
            name={review.relatedType === 'task' ? 'zap' : 'shopping-bag'}
            size={11}
            color={colors.primary[600]}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.relatedText} numberOfLines={1}>
            {review.relatedTitle}
          </Text>
        </View>
      )}

      {/* Quick Tags */}
      {review.tags && review.tags.length > 0 && (
        <View style={styles.tagRow}>
          {review.tags.map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Comment Body */}
      {review.comment ? (
        <Text style={styles.commentText}>{review.comment}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  userMeta: {
    marginLeft: spacing[2],
    flex: 1,
  },
  reviewerName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  timeAgo: {
    fontSize: 10,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
  },
  relatedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
    alignSelf: 'flex-start',
  },
  relatedText: {
    fontSize: 10,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
    maxWidth: 240,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing[2],
  },
  tagPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tagText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: '#065F46',
  },
  commentText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    lineHeight: 18,
  },
});
