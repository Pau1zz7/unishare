import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Task } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onQuickApply?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onQuickApply }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const getTimeAgo = (timestamp: number) => {
    const diffMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${Math.floor(diffHours / 24)} ngày trước`;
  };

  const getCategoryInfo = (category?: string) => {
    switch (category) {
      case 'delivery':
        return { label: 'Giao nhận', color: colors.categories.taskDelivery, bg: colors.primary[50], icon: 'package' as const };
      case 'food':
        return { label: 'Mua đồ ăn', color: colors.categories.taskFood, bg: colors.secondary[50], icon: 'coffee' as const };
      case 'print':
        return { label: 'In ấn', color: colors.categories.taskPrint, bg: '#F5F3FF', icon: 'file-text' as const };
      case 'study':
        return { label: 'Học tập', color: colors.categories.tutorStudy, bg: '#FDF4FF', icon: 'book-open' as const };
      default:
        return { label: 'Việc vặt', color: colors.primary[600], bg: colors.primary[50], icon: 'check-circle' as const };
    }
  };

  const categoryInfo = getCategoryInfo(task.category);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(task)}
      style={styles.card}
    >
      {/* Header: Requester Info & Category */}
      <View style={styles.header}>
        <View style={styles.requesterGroup}>
          {task.requesterAvatar ? (
            <Image source={{ uri: task.requesterAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {task.requesterName ? task.requesterName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}

          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.requesterName} numberOfLines={1}>
                {task.requesterName}
              </Text>
              {task.requesterTrustScore && (
                <View style={styles.trustBadge}>
                  <Feather name="star" size={11} color="#F59E0B" />
                  <Text style={styles.trustScore}>{task.requesterTrustScore.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.timeAgo}>{getTimeAgo(task.createdAt)}</Text>
          </View>
        </View>

        <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.bg }]}>
          <Feather name={categoryInfo.icon} size={12} color={categoryInfo.color} style={{ marginRight: 4 }} />
          <Text style={[styles.categoryText, { color: categoryInfo.color }]}>{categoryInfo.label}</Text>
        </View>
      </View>

      {/* Task Title */}
      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>

      {/* Description Snippet */}
      {task.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      {/* Route Info: Pickup -> Delivery */}
      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, styles.pickupDot]} />
          <Text style={styles.routeLabel}>Lấy:</Text>
          <Text style={styles.routeAddress} numberOfLines={1}>
            {task.pickupLocation.address}
          </Text>
        </View>

        <View style={styles.routeConnector}>
          <View style={styles.verticalDashedLine} />
        </View>

        <View style={styles.routePoint}>
          <View style={[styles.dot, styles.deliveryDot]} />
          <Text style={styles.routeLabel}>Giao:</Text>
          <Text style={styles.routeAddress} numberOfLines={1}>
            {task.deliveryLocation.address}
          </Text>
        </View>
      </View>

      {/* Footer: Bounty, Distance & Action */}
      <View style={styles.footer}>
        <View style={styles.bountyGroup}>
          <Text style={styles.bountyValue}>{formatCurrency(task.bounty)}</Text>
          <View style={styles.paymentMethodTag}>
            <Text style={styles.paymentMethodText}>
              {task.paymentMethod === 'cash'
                ? 'Tiền mặt'
                : task.paymentMethod === 'transfer'
                ? 'Chuyển khoản'
                : 'Trao đổi'}
            </Text>
          </View>
        </View>

        <View style={styles.actionGroup}>
          {task.distanceKm !== undefined && (
            <View style={styles.distanceBadge}>
              <Feather name="navigation" size={12} color={colors.neutral.textSecondary} />
              <Text style={styles.distanceText}>{task.distanceKm} km</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => (onQuickApply ? onQuickApply(task) : onPress(task))}
          >
            <Text style={styles.quickButtonText}>Nhận việc</Text>
            <Feather name="chevron-right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  requesterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  avatarInitial: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requesterName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
    maxWidth: 130,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing[1],
  },
  trustScore: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#B45309',
    marginLeft: 2,
  },
  timeAgo: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    lineHeight: typography.lineHeight.base,
    marginBottom: spacing[1],
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textSecondary,
    lineHeight: typography.lineHeight.sm,
    marginBottom: spacing[3],
  },
  routeContainer: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginVertical: spacing[2],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[2],
  },
  pickupDot: {
    backgroundColor: '#0EA5E9',
  },
  deliveryDot: {
    backgroundColor: '#10B981',
  },
  routeConnector: {
    height: 10,
    marginLeft: 3,
    justifyContent: 'center',
  },
  verticalDashedLine: {
    width: 2,
    height: 8,
    backgroundColor: colors.neutral.border,
  },
  routeLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textMuted,
    marginRight: 4,
  },
  routeAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    flex: 1,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  bountyGroup: {
    flexDirection: 'column',
  },
  bountyValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.dark,
  },
  paymentMethodTag: {
    marginTop: 2,
  },
  paymentMethodText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textMuted,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    paddingHorizontal: spacing[2],
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  distanceText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  quickButton: {
    backgroundColor: colors.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    gap: 2,
  },
  quickButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
