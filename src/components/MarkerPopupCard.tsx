import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MapMarkerItem } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

interface MarkerPopupCardProps {
  marker: MapMarkerItem;
  onClose: () => void;
  onViewDetail: (marker: MapMarkerItem) => void;
  onQuickAction?: (marker: MapMarkerItem) => void;
}

export const MarkerPopupCard: React.FC<MarkerPopupCardProps> = ({
  marker,
  onClose,
  onViewDetail,
  onQuickAction,
}) => {
  const formatCurrency = (val?: number) => {
    if (!val) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  const isTask = marker.type === 'task';
  const isProduct = marker.type === 'product';

  return (
    <View style={styles.cardContainer}>
      {/* Top Tag & Close */}
      <View style={styles.headerRow}>
        <View style={styles.tagGroup}>
          <View
            style={[
              styles.typeBadge,
              isTask ? styles.taskTypeBadge : styles.productTypeBadge,
            ]}
          >
            <Feather
              name={isTask ? 'zap' : 'shopping-bag'}
              size={11}
              color={isTask ? colors.primary[700] : colors.secondary[700]}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.typeBadgeText,
                isTask ? styles.taskTypeText : styles.productTypeText,
              ]}
            >
              {isTask ? 'Việc tiện đường' : 'Đồ thanh lý'}
            </Text>
          </View>

          {marker.deviationMeters !== undefined && (
            <View style={styles.deviationBadge}>
              <Text style={styles.deviationFlame}>🔥</Text>
              <Text style={styles.deviationText}>
                Lệch chỉ {marker.deviationMeters}m
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="x" size={16} color={colors.neutral.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {marker.title}
      </Text>

      {/* Address / Location Line */}
      <View style={styles.addressRow}>
        <Feather name="map-pin" size={13} color={colors.neutral.textMuted} style={{ marginTop: 2 }} />
        <Text style={styles.addressText} numberOfLines={1}>
          {marker.address}
        </Text>
      </View>

      {/* User Info Line */}
      {marker.requesterOrSellerName && (
        <View style={styles.userRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {marker.requesterOrSellerName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName} numberOfLines={1}>
            {marker.requesterOrSellerName}
          </Text>
          {marker.trustScore && (
            <View style={styles.ratingBadge}>
              <Feather name="star" size={10} color="#D97706" />
              <Text style={styles.ratingText}>{marker.trustScore.toFixed(1)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer: Price/Bounty & Actions */}
      <View style={styles.footerRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>
            {isTask ? 'Thù lao:' : 'Giá:'}
          </Text>
          {marker.isFree ? (
            <Text style={styles.freeText}>TẶNG 0Đ</Text>
          ) : (
            <Text style={[styles.priceValue, !isTask && { color: '#EA580C' }]}>
              {formatCurrency(marker.bountyOrPrice)}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => onViewDetail(marker)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailBtnText}>Chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryActionBtn, !isTask && { backgroundColor: colors.secondary[500] }]}
            onPress={() => (onQuickAction ? onQuickAction(marker) : onViewDetail(marker))}
            activeOpacity={0.85}
          >
            <Feather name={isTask ? 'check-circle' : 'message-circle'} size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.primaryActionText}>
              {isTask ? 'Nhận' : 'Chat'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card,
    minWidth: 280,
    maxWidth: 320,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
  },
  taskTypeBadge: {
    backgroundColor: colors.primary[50],
  },
  productTypeBadge: {
    backgroundColor: colors.secondary[50],
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  taskTypeText: {
    color: colors.primary[700],
  },
  productTypeText: {
    color: colors.secondary[700],
  },
  deviationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
  },
  deviationFlame: {
    fontSize: 10,
    marginRight: 2,
  },
  deviationText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#B45309',
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    lineHeight: 18,
    marginBottom: spacing[2],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing[2],
  },
  addressText: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  userAvatarText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  userName: {
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.textPrimary,
    maxWidth: 120,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#92400E',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.neutral.textMuted,
  },
  priceValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.dark,
  },
  freeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.DEFAULT,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  detailBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  detailBtnText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[600],
  },
  primaryActionText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
