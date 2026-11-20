import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Task } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

// Fallback Mock Task nếu không có route params
const DEFAULT_TASK: Task = {
  taskId: 't1',
  title: 'Nhận hộ kiện hàng Shopee tại Cổng 1 KTX Khu B',
  description:
    'Mình đang bận học trên giảng đường ĐH CNTT không về kịp trước 17h, nhờ bạn nào lấy hộ kiện quần áo (khoảng 1kg) mang về sảnh Tòa B3 giúp mình. Hàng đã thanh toán trước trên Shopee, chỉ cần đọc mã vận đơn là lấy được ngay.',
  requesterId: 'u1',
  requesterName: 'Nguyễn Văn An',
  requesterTrustScore: 4.9,
  bounty: 25000,
  paymentMethod: 'transfer',
  category: 'delivery',
  pickupLocation: {
    latitude: 10.88,
    longitude: 106.78,
    address: 'Cổng 1 KTX Khu B ĐHQG TP.HCM (Quầy bưu tá Shopee)',
  },
  deliveryLocation: {
    latitude: 10.881,
    longitude: 106.782,
    address: 'Sảnh Tòa B3, KTX Khu B ĐHQG TP.HCM',
  },
  status: 'open',
  distanceKm: 0.8,
  estimatedTime: 20,
  imageUrls: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80',
  ],
  createdAt: Date.now() - 25 * 60 * 1000,
};

export default function TaskDetailScreen({ route, navigation }: any) {
  const task: Task = route?.params?.task || DEFAULT_TASK;
  const [isAccepted, setIsAccepted] = useState(task.status !== 'open');

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `[UniShare Việc Vặt] ${task.title} - Thù lao: ${formatCurrency(task.bounty)}. Nhận việc ngay trên UniShare!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAcceptTask = () => {
    Alert.alert(
      'Xác nhận nhận việc',
      `Bạn chắc chắn muốn nhận việc "${task.title}" với thù lao ${formatCurrency(task.bounty)}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý nhận',
          style: 'default',
          onPress: () => {
            setIsAccepted(true);
            Alert.alert(
              'Nhận việc thành công! 🎉',
              'Bạn đã nhận công việc này. Hãy nhắn tin cho người nhờ để xác nhận thời gian nhận hàng nhé!',
              [
                {
                  text: 'Nhắn tin ngay',
                  onPress: () =>
                    navigation?.navigate('ChatRoom', {
                      partnerName: task.requesterName,
                      taskTitle: task.title,
                      taskId: task.taskId,
                    }),
                },
                { text: 'Đóng' },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. TOP APP BAR */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={colors.neutral.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.navTitle} numberOfLines={1}>
          Chi tiết việc vặt
        </Text>

        <View style={styles.navRightActions}>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Feather name="share-2" size={20} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. STATUS & BOUNTY HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.statusBadge,
                isAccepted ? styles.statusMatchedBadge : styles.statusOpenBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isAccepted ? colors.semantic.warning.DEFAULT : colors.semantic.success.DEFAULT },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isAccepted ? colors.semantic.warning.text : colors.semantic.success.text },
                ]}
              >
                {isAccepted ? 'Đang thực hiện' : 'Đang chờ nhận việc'}
              </Text>
            </View>

            <View style={styles.timeTag}>
              <Feather name="clock" size={12} color={colors.neutral.textMuted} />
              <Text style={styles.timeText}>{getTimeAgo(task.createdAt)}</Text>
            </View>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>

          {/* Bounty Big Tag */}
          <View style={styles.bountyBox}>
            <View>
              <Text style={styles.bountyLabel}>Thù lao nhận được</Text>
              <Text style={styles.bountyNumber}>{formatCurrency(task.bounty)}</Text>
            </View>
            <View style={styles.paymentMethodPill}>
              <Feather
                name={task.paymentMethod === 'transfer' ? 'credit-card' : 'dollar-sign'}
                size={14}
                color={colors.primary[600]}
              />
              <Text style={styles.paymentMethodPillText}>
                {task.paymentMethod === 'transfer'
                  ? 'Chuyển khoản'
                  : task.paymentMethod === 'cash'
                  ? 'Tiền mặt'
                  : 'Thương lượng'}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. REQUESTER PROFILE CARD */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Người yêu cầu hỗ trợ</Text>
          <View style={styles.requesterRow}>
            <View style={styles.avatarWrap}>
              {task.requesterAvatar ? (
                <Image source={{ uri: task.requesterAvatar }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {task.requesterName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.requesterInfo}>
              <View style={styles.requesterNameLine}>
                <Text style={styles.requesterName}>{task.requesterName}</Text>
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={10} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.requesterSubLine}>
                <View style={styles.ratingBadge}>
                  <Feather name="star" size={12} color="#D97706" />
                  <Text style={styles.ratingText}>
                    {task.requesterTrustScore ? task.requesterTrustScore.toFixed(1) : '5.0'}
                  </Text>
                </View>
                <Text style={styles.campusTag}>• KTX Khu B ĐHQG</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.directChatBtn}
              onPress={() =>
                navigation?.navigate('ChatRoom', {
                  partnerName: task.requesterName,
                  taskTitle: task.title,
                })
              }
            >
              <Feather name="message-circle" size={18} color={colors.primary[600]} />
              <Text style={styles.directChatText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. ROUTE INFO (Visual Stepper & MiniMap) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Lộ trình di chuyển</Text>
            {task.distanceKm && (
              <View style={styles.distanceChip}>
                <Feather name="navigation" size={12} color={colors.primary[600]} />
                <Text style={styles.distanceChipText}>{task.distanceKm} km</Text>
              </View>
            )}
          </View>

          <View style={styles.stepperContainer}>
            {/* Step 1: Điểm lấy */}
            <View style={styles.stepItem}>
              <View style={styles.stepIndicatorCol}>
                <View style={[styles.stepDot, { backgroundColor: '#0EA5E9' }]}>
                  <Feather name="arrow-up-right" size={12} color="#FFFFFF" />
                </View>
                <View style={styles.stepConnectingLine} />
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepLabel}>ĐIỂM LẤY ĐỒ</Text>
                <Text style={styles.stepAddress}>{task.pickupLocation.address}</Text>
              </View>
            </View>

            {/* Step 2: Điểm giao */}
            <View style={styles.stepItem}>
              <View style={styles.stepIndicatorCol}>
                <View style={[styles.stepDot, { backgroundColor: '#10B981' }]}>
                  <Feather name="map-pin" size={12} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepLabel}>ĐIỂM GIAO ĐẾN</Text>
                <Text style={styles.stepAddress}>{task.deliveryLocation.address}</Text>
              </View>
            </View>
          </View>

          {/* MiniMap Mockup Banner */}
          <View style={styles.miniMapPlaceholder}>
            <Feather name="map" size={24} color={colors.primary[500]} />
            <Text style={styles.miniMapText}>
              Lộ trình khoảng ~{task.distanceKm || 0.8} km • Tiện đường đi lại
            </Text>
            <TouchableOpacity
              style={styles.viewRouteBtn}
              onPress={() => navigation?.navigate('RouteMatching', { task })}
            >
              <Text style={styles.viewRouteText}>Xem trên bản đồ</Text>
              <Feather name="chevron-right" size={14} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. DESCRIPTION & NOTES */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Mô tả chi tiết</Text>
          <Text style={styles.descriptionText}>{task.description}</Text>

          {/* Attached Image if exists */}
          {task.imageUrls && task.imageUrls.length > 0 && (
            <View style={styles.attachedImagesArea}>
              <Text style={styles.attachedTitle}>Ảnh đính kèm:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {task.imageUrls.map((url, idx) => (
                  <Image key={idx} source={{ uri: url }} style={styles.attachedImg} resizeMode="cover" />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Safety Notice Box */}
          <View style={styles.safetyBox}>
            <Feather name="shield" size={18} color={colors.primary[600]} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.safetyTitle}>Cam kết giao nhận an toàn</Text>
              <Text style={styles.safetyDesc}>
                Sinh viên nhận việc cần kiểm tra kỹ kiện hàng và chụp ảnh xác nhận lúc giao nhận để bảo đảm quyền lợi.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 6. FIXED BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.chatBeforeBtn}
          onPress={() =>
            navigation?.navigate('ChatRoom', {
              partnerName: task.requesterName,
              taskTitle: task.title,
            })
          }
          activeOpacity={0.8}
        >
          <Feather name="message-square" size={20} color={colors.neutral.textPrimary} />
          <Text style={styles.chatBeforeBtnText}>Nhắn tin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryActionBtn,
            isAccepted && styles.acceptedBtnDisabled,
          ]}
          onPress={handleAcceptTask}
          disabled={isAccepted}
          activeOpacity={0.85}
        >
          <Feather
            name={isAccepted ? 'check-circle' : 'zap'}
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.primaryActionBtnText}>
            {isAccepted ? 'Bạn đã nhận việc này' : 'Nhận việc này ngay'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
  },
  navTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  heroCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  statusOpenBadge: {
    backgroundColor: colors.semantic.success.light,
  },
  statusMatchedBadge: {
    backgroundColor: colors.semantic.warning.light,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textMuted,
  },
  taskTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    lineHeight: 26,
    marginVertical: spacing[2],
  },
  bountyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginTop: spacing[2],
  },
  bountyLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.semantic.success.text,
    fontWeight: typography.fontWeight.medium,
  },
  bountyNumber: {
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.dark,
    marginTop: 2,
  },
  paymentMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  paymentMethodPillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
  },
  sectionCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  sectionHeaderTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[3],
  },
  distanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  distanceChipText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  requesterInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  requesterNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requesterName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  requesterSubLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#92400E',
  },
  campusTag: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textMuted,
    marginLeft: 6,
  },
  directChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: 4,
  },
  directChatText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  stepperContainer: {
    marginVertical: spacing[1],
  },
  stepItem: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepConnectingLine: {
    width: 2,
    height: 36,
    backgroundColor: colors.neutral.border,
    marginVertical: 2,
  },
  stepTextCol: {
    flex: 1,
    marginLeft: spacing[2],
    paddingBottom: spacing[3],
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textMuted,
    letterSpacing: 0.5,
  },
  stepAddress: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.textPrimary,
    marginTop: 2,
  },
  miniMapPlaceholder: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing[3],
    alignItems: 'center',
    marginTop: spacing[2],
    gap: 6,
  },
  miniMapText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  viewRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  viewRouteText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  descriptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textSecondary,
    lineHeight: 22,
  },
  attachedImagesArea: {
    marginTop: spacing[3],
  },
  attachedTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
  },
  attachedImg: {
    width: 110,
    height: 80,
    borderRadius: borderRadius.lg,
    marginRight: spacing[2],
  },
  safetyBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginTop: spacing[4],
  },
  safetyTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  safetyDesc: {
    fontSize: 11,
    color: colors.primary[800],
    marginTop: 2,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    ...shadows.bottomSheet,
  },
  chatBeforeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: 6,
  },
  chatBeforeBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[600],
  },
  acceptedBtnDisabled: {
    backgroundColor: colors.neutral.disabled,
  },
  primaryActionBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
