import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Task } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskDetail } from '../features/tasks/hooks/useTasks';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

export default function TaskDetailScreen({ route, navigation }: any) {
  const initialTask: Task | undefined = route?.params?.task;
  const taskId: string | undefined = route?.params?.taskId || initialTask?.taskId;

  const user = useAuthStore((state) => state.user);
  const {
    task,
    loading,
    accepting,
    updatingStatus,
    error,
    acceptTask,
    updateStatus,
  } = useTaskDetail(taskId, initialTask);

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
    if (!task) return;
    try {
      await Share.share({
        message: `[UniShare Việc Vặt] ${task.title} - Thù lao: ${formatCurrency(task.bounty)}. Nhận việc ngay trên UniShare!`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const executeAccept = async () => {
    if (!task || !user?.uid) return;
    try {
      await acceptTask(
        user.uid,
        user.displayName || user.email || 'Sinh viên UniShare'
      );
      Alert.alert(
        'Nhận việc thành công! 🎉',
        'Bạn đã nhận công việc này. Hãy liên hệ với người nhờ để xác nhận thời gian nhận hàng nhé!',
        [{ text: 'Đóng' }]
      );
    } catch (err: any) {
      Alert.alert(
        'Không thể nhận việc',
        err?.message || 'Đã có lỗi xảy ra khi nhận việc. Vui lòng thử lại.'
      );
    }
  };

  const handleAcceptTask = () => {
    if (!task) return;

    if (!user?.uid) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản sinh viên để nhận việc.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation?.navigate('Login') },
        ]
      );
      return;
    }

    if (task.requesterId === user.uid) {
      Alert.alert('Thông báo', 'Bạn không thể tự nhận việc do chính mình đăng.');
      return;
    }

    if (task.status !== 'open') {
      Alert.alert('Thông báo', 'Công việc này đã được nhận hoặc không còn mở.');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' &&
        window.confirm(
          `Bạn chắc chắn muốn nhận việc "${task.title}" với thù lao ${formatCurrency(task.bounty)}?`
        );
      if (confirmed) {
        executeAccept();
      }
      return;
    }

    Alert.alert(
      'Xác nhận nhận việc',
      `Bạn chắc chắn muốn nhận việc "${task.title}" với thù lao ${formatCurrency(task.bounty)}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý nhận',
          style: 'default',
          onPress: executeAccept,
        },
      ]
    );
  };

  const executeCompleteTask = async () => {
    if (!task) return;
    try {
      await updateStatus('completed');
      Alert.alert(
        'Đã hoàn thành công việc! 🎉',
        'Công việc đã được đánh dấu hoàn thành. Bạn có thể đánh giá đối tác ngay bây giờ.'
      );
    } catch (err: any) {
      Alert.alert(
        'Lỗi cập nhật',
        err?.message || 'Không thể hoàn thành công việc. Vui lòng thử lại.'
      );
    }
  };

  const handleCompleteTask = () => {
    if (!task) return;
    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' &&
        window.confirm(`Xác nhận công việc "${task.title}" đã được giao nhận hoàn tất?`);
      if (confirmed) {
        executeCompleteTask();
      }
      return;
    }

    Alert.alert(
      'Xác nhận hoàn thành',
      `Xác nhận công việc "${task.title}" đã được giao nhận hoàn tất?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hoàn thành',
          onPress: executeCompleteTask,
        },
      ]
    );
  };

  const handleOpenReview = () => {
    if (!task || !user?.uid) return;

    const isRequester = user.uid === task.requesterId;
    const targetUserId = isRequester ? task.workerId : task.requesterId;
    const targetUserName = isRequester
      ? task.workerName || 'Người nhận việc'
      : task.requesterName;
    const targetUserAvatar = isRequester ? null : task.requesterAvatar ?? null;

    if (!targetUserId) {
      Alert.alert('Thông báo', 'Không tìm thấy thông tin đối tác để đánh giá.');
      return;
    }

    navigation?.navigate('ReviewRating', {
      targetUserId,
      targetUserName,
      targetUserAvatar,
      relatedType: 'task',
      relatedId: task.taskId,
      relatedTitle: task.title,
    });
  };

  if (loading && !task) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}>
            <Feather name="arrow-left" size={22} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Chi tiết việc vặt</Text>
          <View style={styles.navBtnPlaceholder} />
        </View>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.centerStateText}>Đang tải thông tin công việc...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}>
            <Feather name="arrow-left" size={22} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Chi tiết việc vặt</Text>
          <View style={styles.navBtnPlaceholder} />
        </View>
        <View style={styles.centerState}>
          <Feather name="alert-circle" size={48} color={colors.neutral.disabled} />
          <Text style={styles.centerStateTitle}>Không tìm thấy công việc</Text>
          <Text style={styles.centerStateText}>
            {error || 'Bài đăng này có thể đã bị xóa hoặc không tồn tại.'}
          </Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backHomeBtnText}>Quay lại bảng tin</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOpen = task.status === 'open';
  const isOwnTask = !!user?.uid && task.requesterId === user.uid;
  const isMyAcceptedTask = !!user?.uid && task.workerId === user.uid;
  const isParticipant = isOwnTask || isMyAcceptedTask;
  const canComplete = task.status === 'matched' && isParticipant;
  const canReview =
    task.status === 'completed' &&
    isParticipant &&
    !!(isOwnTask ? task.workerId : task.requesterId);

  const statusMeta = (() => {
    switch (task.status) {
      case 'open':
        return {
          label: 'Đang chờ nhận việc',
          badgeStyle: styles.statusOpenBadge,
          dotColor: colors.semantic.success.DEFAULT,
          textColor: colors.semantic.success.text,
        };
      case 'matched':
        return {
          label: isMyAcceptedTask ? 'Bạn đang thực hiện' : 'Đã có người nhận',
          badgeStyle: styles.statusMatchedBadge,
          dotColor: colors.semantic.warning.DEFAULT,
          textColor: colors.semantic.warning.text,
        };
      case 'completed':
        return {
          label: 'Đã hoàn thành',
          badgeStyle: styles.statusOpenBadge,
          dotColor: colors.semantic.success.DEFAULT,
          textColor: colors.semantic.success.text,
        };
      default:
        return {
          label: 'Đã đóng / Hủy',
          badgeStyle: styles.statusClosedBadge,
          dotColor: colors.semantic.danger.DEFAULT,
          textColor: colors.semantic.danger.text,
        };
    }
  })();

  const primaryAction = (() => {
    if (canReview) {
      return {
        label: 'Đánh giá đối tác',
        icon: 'star' as const,
        onPress: handleOpenReview,
        disabled: false,
        style: styles.reviewActionBtn,
        loading: false,
      };
    }
    if (canComplete) {
      return {
        label: updatingStatus ? 'Đang cập nhật...' : 'Xác nhận hoàn thành',
        icon: 'check-circle' as const,
        onPress: handleCompleteTask,
        disabled: updatingStatus,
        style: styles.completeActionBtn,
        loading: updatingStatus,
      };
    }
    if (accepting) {
      return {
        label: 'Đang xử lý...',
        icon: 'zap' as const,
        onPress: handleAcceptTask,
        disabled: true,
        style: styles.acceptedBtnDisabled,
        loading: true,
      };
    }
    if (isOwnTask && isOpen) {
      return {
        label: 'Bài đăng của bạn',
        icon: 'check-circle' as const,
        onPress: handleAcceptTask,
        disabled: true,
        style: styles.acceptedBtnDisabled,
        loading: false,
      };
    }
    if (task.status === 'matched') {
      return {
        label: isMyAcceptedTask ? 'Bạn đã nhận việc này' : 'Đã có người nhận việc',
        icon: 'check-circle' as const,
        onPress: handleAcceptTask,
        disabled: true,
        style: styles.acceptedBtnDisabled,
        loading: false,
      };
    }
    if (task.status === 'completed') {
      return {
        label: 'Công việc đã hoàn thành',
        icon: 'check-circle' as const,
        onPress: handleAcceptTask,
        disabled: true,
        style: styles.acceptedBtnDisabled,
        loading: false,
      };
    }
    if (!isOpen) {
      return {
        label: 'Công việc không còn mở',
        icon: 'check-circle' as const,
        onPress: handleAcceptTask,
        disabled: true,
        style: styles.acceptedBtnDisabled,
        loading: false,
      };
    }
    return {
      label: 'Nhận việc này ngay',
      icon: 'zap' as const,
      onPress: handleAcceptTask,
      disabled: false,
      style: undefined,
      loading: false,
    };
  })();

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
            <View style={[styles.statusBadge, statusMeta.badgeStyle]}>
              <View style={[styles.statusDot, { backgroundColor: statusMeta.dotColor }]} />
              <Text style={[styles.statusText, { color: statusMeta.textColor }]}>
                {statusMeta.label}
              </Text>
            </View>

            <View style={styles.timeTag}>
              <Feather name="clock" size={12} color={colors.neutral.textMuted} />
              <Text style={styles.timeText}>{getTimeAgo(task.createdAt)}</Text>
            </View>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>

          {task.deadline ? (
            <View style={styles.deadlineBanner}>
              <Feather name="calendar" size={13} color={colors.primary[600]} />
              <Text style={styles.deadlineBannerText}>Thời hạn: {task.deadline}</Text>
            </View>
          ) : null}

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
                    {(task.requesterName || 'U').charAt(0).toUpperCase()}
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
                <Text style={styles.campusTag}>• Thành viên UniShare</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.directChatBtn}
              onPress={() =>
                navigation?.navigate('Profile', { userId: task.requesterId })
              }
            >
              <Feather name="user" size={16} color={colors.primary[600]} />
              <Text style={styles.directChatText}>Hồ sơ</Text>
            </TouchableOpacity>
          </View>

          {(task.status === 'matched' || task.status === 'completed') && task.workerName ? (
            <View style={styles.workerInfoBox}>
              <Feather name="user-check" size={15} color={colors.semantic.warning.text} />
              <Text style={styles.workerInfoText}>
                Người nhận việc: <Text style={{ fontWeight: '700' }}>{task.workerName}</Text>
              </Text>
            </View>
          ) : null}
        </View>

        {/* 4. ROUTE INFO (Visual Stepper & MiniMap) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Lộ trình di chuyển</Text>
            {task.distanceKm !== undefined && (
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

          {/* MiniMap Banner */}
          <View style={styles.miniMapPlaceholder}>
            <Feather name="map" size={24} color={colors.primary[500]} />
            <Text style={styles.miniMapText}>
              {task.distanceKm !== undefined
                ? `Lộ trình khoảng ~${task.distanceKm} km • Tiện đường đi lại`
                : 'Xem vị trí giao nhận trên bản đồ lộ trình'}
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
          <Text style={styles.descriptionText}>
            {task.description || 'Người đăng không có ghi chú thêm.'}
          </Text>

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
            Alert.alert('Thông báo', `Tính năng nhắn tin trực tiếp với ${task.requesterName} đang được kết nối.`)
          }
          activeOpacity={0.8}
        >
          <Feather name="message-square" size={20} color={colors.neutral.textPrimary} />
          <Text style={styles.chatBeforeBtnText}>Nhắn tin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, primaryAction.style]}
          onPress={primaryAction.onPress}
          disabled={primaryAction.disabled}
          activeOpacity={0.85}
        >
          {primaryAction.loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : (
            <Feather
              name={primaryAction.icon}
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={styles.primaryActionBtnText}>{primaryAction.label}</Text>
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
  navBtnPlaceholder: {
    width: 38,
    height: 38,
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
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    gap: spacing[3],
  },
  centerStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  centerStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textMuted,
    textAlign: 'center',
  },
  backHomeBtn: {
    marginTop: spacing[2],
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
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
  statusClosedBadge: {
    backgroundColor: colors.semantic.danger.light,
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
  deadlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing[2],
  },
  deadlineBannerText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
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
  workerInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing[3],
    padding: spacing[2],
    backgroundColor: colors.semantic.warning.light,
    borderRadius: borderRadius.md,
  },
  workerInfoText: {
    fontSize: typography.fontSize.xs,
    color: colors.semantic.warning.text,
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
  completeActionBtn: {
    backgroundColor: colors.semantic.success.DEFAULT,
  },
  reviewActionBtn: {
    backgroundColor: '#F59E0B',
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
