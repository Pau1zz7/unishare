import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Product, Task } from '../types';
import { ReviewItem } from '../components/ReviewItem';
import { useAuthStore } from '../store/useAuthStore';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useUserTasks } from '../features/tasks/hooks/useTasks';
import { useUserProducts } from '../features/market/hooks/useProducts';
import { useUserProfile, useUserReviews } from '../features/reviews/hooks/useReviews';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

type ProfileTab = 'reviews' | 'history' | 'myItems';

export default function ProfileScreen({ route, navigation }: any) {
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { handleLogout } = useAuth();

  const paramUserId: string | undefined = route?.params?.userId;
  const targetUid = paramUserId || authUser?.uid;
  const isOwnProfile = !paramUserId || paramUserId === authUser?.uid;

  const { profile: liveProfile, loading: loadingProfile } = useUserProfile(targetUid);
  const { reviews, loading: loadingReviews } = useUserReviews(targetUid);
  const { tasks: userTasks, loading: loadingTasks } = useUserTasks(targetUid);
  const { products: userProducts, loading: loadingProducts } = useUserProducts(targetUid);

  const [activeTab, setActiveTab] = useState<ProfileTab>('reviews');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');

  useEffect(() => {
    if (isOwnProfile && liveProfile) {
      const changed =
        !authUser ||
        authUser.trustScore !== liveProfile.trustScore ||
        authUser.totalReviews !== liveProfile.totalReviews ||
        authUser.displayName !== liveProfile.displayName ||
        authUser.avatarUrl !== liveProfile.avatarUrl ||
        authUser.bio !== liveProfile.bio;

      if (changed) {
        setUser(liveProfile);
      }
    }
  }, [isOwnProfile, liveProfile, authUser, setUser]);

  const profileUser = isOwnProfile ? liveProfile || authUser : liveProfile;

  const reviewFilterTags = ['all', 'Đúng giờ', 'Thân thiện', 'Cẩn thận', 'Giao nhanh'];

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedTagFilter === 'all') return true;
      return r.tags?.some((t) =>
        t.toLowerCase().includes(selectedTagFilter.toLowerCase())
      );
    });
  }, [reviews, selectedTagFilter]);

  const stats = useMemo(() => {
    const acceptedTasks = userTasks.filter((t) => t.workerId === targetUid);
    const postedTasks = userTasks.filter((t) => t.requesterId === targetUid);
    const completedAccepted = acceptedTasks.filter((t) => t.status === 'completed');
    const completedTotal = userTasks.filter((t) => t.status === 'completed').length;
    const totalEarned = completedAccepted.reduce((sum, t) => sum + (t.bounty || 0), 0);
    const activeProducts = userProducts.filter((p) => p.status === 'available');

    const nonOpenTasks = userTasks.filter((t) => t.status !== 'open');
    const completionRate =
      nonOpenTasks.length > 0
        ? `${Math.round((completedTotal / nonOpenTasks.length) * 100)}%`
        : '—';

    const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
    const satisfactionRate =
      reviews.length > 0
        ? `${Math.round((positiveReviews / reviews.length) * 100)}%`
        : '—';

    return {
      acceptedCount: acceptedTasks.length,
      postedCount: postedTasks.length,
      completedCount: completedTotal,
      totalEarned,
      activeProductsCount: activeProducts.length,
      completionRate,
      satisfactionRate,
    };
  }, [userTasks, userProducts, reviews, targetUid]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN').format(amount) + ' đ';

  const getTaskStatusMeta = (status: Task['status']) => {
    switch (status) {
      case 'open':
        return { label: 'Đang mở', bg: colors.primary[50], text: colors.primary[700] };
      case 'matched':
        return { label: 'Đang thực hiện', bg: colors.semantic.warning.light, text: colors.semantic.warning.text };
      case 'completed':
        return { label: 'Hoàn thành', bg: colors.semantic.success.light, text: colors.semantic.success.text };
      case 'cancelled':
        return { label: 'Đã hủy', bg: colors.semantic.danger.light, text: colors.semantic.danger.text };
      default:
        return { label: 'Đã ẩn', bg: '#F1F5F9', text: colors.neutral.textMuted };
    }
  };

  const getProductStatusMeta = (status: Product['status']) => {
    switch (status) {
      case 'available':
        return { label: 'Đang bán', bg: colors.semantic.success.light, text: colors.semantic.success.text };
      case 'sold':
        return { label: 'Đã bán', bg: '#F1F5F9', text: colors.neutral.textSecondary };
      default:
        return { label: 'Đã ẩn', bg: colors.semantic.danger.light, text: colors.semantic.danger.text };
    }
  };

  const handleOpenReviewForTask = (task: Task) => {
    if (!authUser?.uid) return;
    const isRequester = task.requesterId === authUser.uid;
    const partnerId = isRequester ? task.workerId : task.requesterId;
    const partnerName = isRequester
      ? task.workerName || 'Người nhận việc'
      : task.requesterName;
    const partnerAvatar = isRequester ? null : task.requesterAvatar ?? null;

    if (!partnerId) {
      Alert.alert('Thông báo', 'Không tìm thấy đối tác để đánh giá cho công việc này.');
      return;
    }

    navigation?.navigate('ReviewRating', {
      targetUserId: partnerId,
      targetUserName: partnerName,
      targetUserAvatar: partnerAvatar,
      relatedType: 'task',
      relatedId: task.taskId,
      relatedTitle: task.title,
    });
  };

  const performLogout = async () => {
    await handleLogout();
    if (navigation?.replace) {
      navigation.replace('Login');
    } else {
      navigation?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const onLogoutPress = () => {
    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' &&
        window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản UniShare?');
      if (confirmed) {
        performLogout();
      }
      return;
    }

    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản UniShare?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: performLogout,
        },
      ]
    );
  };

  if (!targetUid) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.goBack()}>
            <Feather name="arrow-left" size={20} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Hồ sơ cá nhân & Uy tín</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centerState}>
          <Feather name="user" size={48} color={colors.neutral.disabled} />
          <Text style={styles.emptyTabTitle}>Bạn chưa đăng nhập</Text>
          <Text style={styles.emptyTabSub}>
            Vui lòng đăng nhập tài khoản sinh viên để xem hồ sơ và lịch sử hoạt động.
          </Text>
          <TouchableOpacity
            style={styles.loginPromptBtn}
            onPress={() => navigation?.replace ? navigation.replace('Login') : navigation?.navigate('Login')}
          >
            <Text style={styles.loginPromptBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingProfile && !profileUser) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.goBack()}>
            <Feather name="arrow-left" size={20} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Hồ sơ cá nhân & Uy tín</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.emptyTabSub}>Đang tải hồ sơ người dùng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = profileUser?.displayName || profileUser?.email || 'Sinh viên UniShare';
  const email = profileUser?.email || '';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U';
  const trustScore = typeof profileUser?.trustScore === 'number' ? profileUser.trustScore : 0;
  const totalReviews =
    typeof profileUser?.totalReviews === 'number' ? profileUser.totalReviews : reviews.length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. TOP APP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.neutral.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>
          {isOwnProfile ? 'Hồ sơ cá nhân & Uy tín' : 'Hồ sơ thành viên'}
        </Text>

        {isOwnProfile ? (
          <View style={styles.topActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { marginRight: 8 }]}
              onPress={() =>
                Alert.alert(
                  'Chỉnh sửa hồ sơ',
                  'Tính năng cập nhật ảnh đại diện, số điện thoại và giới thiệu bản thân.'
                )
              }
            >
              <Feather name="edit-2" size={18} color={colors.neutral.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() =>
                Alert.alert('Cài đặt', 'Cài đặt thông báo, quyền riêng tư và tài khoản.')
              }
            >
              <Feather name="settings" size={18} color={colors.neutral.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. USER PROFILE HERO CARD */}
        <View style={styles.profileHeroCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              {profileUser?.avatarUrl ? (
                <Image source={{ uri: profileUser.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{avatarInitial}</Text>
                </View>
              )}
              {isOwnProfile && (
                <View style={styles.cameraBadge}>
                  <Feather name="camera" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.userMainInfo}>
              <View style={styles.userNameLine}>
                <Text style={styles.displayName}>{displayName}</Text>
              </View>

              {email ? <Text style={styles.emailText}>{email}</Text> : null}

              {/* Edu Verified Badge */}
              <View style={styles.eduVerifiedBadge}>
                <Feather name="shield" size={12} color="#2563EB" style={{ marginRight: 4 }} />
                <Text style={styles.eduVerifiedText}>
                  {email.endsWith('.edu.vn') || profileUser?.studentIdVerified
                    ? 'Đã xác thực Email SV (.edu.vn)'
                    : 'Thành viên UniShare'}
                </Text>
              </View>
            </View>
          </View>

          {/* Campus Tag */}
          {profileUser?.university ? (
            <View style={styles.campusInfoBox}>
              <Feather name="book" size={14} color={colors.primary[600]} style={{ marginTop: 1 }} />
              <Text style={styles.campusText}>{profileUser.university}</Text>
            </View>
          ) : null}

          {/* Bio */}
          <Text style={styles.bioText}>
            {profileUser?.bio?.trim()
              ? profileUser.bio
              : 'Chưa có giới thiệu bản thân.'}
          </Text>
        </View>

        {/* 3. TRUST SCORE CARD */}
        <View style={styles.trustScoreCard}>
          <View style={styles.trustHeader}>
            <View style={styles.trustHeaderTextCol}>
              <Text style={styles.trustTitle}>ĐIỂM UY TÍN SINH VIÊN (TRUST SCORE)</Text>
              <Text style={styles.trustSubtitle}>Đánh giá thực tế từ bạn học sau giao dịch</Text>
            </View>
          </View>

          <View style={styles.trustScoreMainRow}>
            {/* Big Score Box */}
            <View style={styles.bigScoreBox}>
              <View style={styles.bigScoreRow}>
                <Feather name="star" size={26} color="#F59E0B" />
                <Text style={styles.bigScoreNumber}>{trustScore.toFixed(1)}</Text>
                <Text style={styles.bigScoreMax}>/5.0</Text>
              </View>
              <Text style={styles.reviewCountText}>
                {totalReviews} lượt đánh giá uy tín
              </Text>
            </View>

            {/* Quick Metrics */}
            <View style={styles.metricsBox}>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{stats.completionRate}</Text>
                <Text style={styles.metricLab}>Hoàn tất việc</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{stats.completedCount}</Text>
                <Text style={styles.metricLab}>Việc xong</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{stats.satisfactionRate}</Text>
                <Text style={styles.metricLab}>Hài lòng</Text>
              </View>
            </View>
          </View>

          {/* Student Honor Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.honorBadge}>
              <Text style={styles.honorEmoji}>🛡️</Text>
              <Text style={styles.honorText}>
                {trustScore >= 4.5 ? 'Sinh viên uy tín' : 'Tài khoản xác thực'}
              </Text>
            </View>
            <View style={styles.honorBadge}>
              <Text style={styles.honorEmoji}>⚡</Text>
              <Text style={styles.honorText}>{stats.acceptedCount} việc đã nhận</Text>
            </View>
            <View style={styles.honorBadge}>
              <Text style={styles.honorEmoji}>🤝</Text>
              <Text style={styles.honorText}>{totalReviews} đánh giá</Text>
            </View>
          </View>
        </View>

        {/* 4. ACTIVITY SUMMARY CARDS */}
        <View style={styles.statsSummaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{stats.acceptedCount}</Text>
            <Text style={styles.summaryLabel}>Việc đã nhận</Text>
            <Text style={styles.summarySub}>
              {stats.totalEarned > 0 ? `+${formatCurrency(stats.totalEarned)}` : 'Chưa có thu nhập'}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: colors.primary[600] }]}>
              {stats.postedCount}
            </Text>
            <Text style={styles.summaryLabel}>Việc đã đăng</Text>
            <Text style={styles.summarySub}>{stats.completedCount} đã xong</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#EA580C' }]}>
              {stats.activeProductsCount}
            </Text>
            <Text style={styles.summaryLabel}>Đồ đang pass</Text>
            <Text style={styles.summarySub}>{userProducts.length} tổng bài</Text>
          </View>
        </View>

        {/* 5. TABS & LISTS */}
        <View style={styles.tabsSection}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'reviews' && styles.tabItemActive]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === 'reviews' && styles.tabItemTextActive,
                ]}
              >
                Đánh giá ({reviews.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
              onPress={() => setActiveTab('history')}
            >
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === 'history' && styles.tabItemTextActive,
                ]}
              >
                Lịch sử việc ({userTasks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'myItems' && styles.tabItemActive]}
              onPress={() => setActiveTab('myItems')}
            >
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === 'myItems' && styles.tabItemTextActive,
                ]}
              >
                Đồ pass ({userProducts.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Review Filter Tags if on reviews tab */}
          {activeTab === 'reviews' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.reviewTagScroll}
              contentContainerStyle={{ paddingVertical: 8, gap: 6 }}
            >
              {reviewFilterTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.filterTagChip,
                    selectedTagFilter === tag && styles.filterTagChipActive,
                  ]}
                  onPress={() => setSelectedTagFilter(tag)}
                >
                  <Text
                    style={[
                      styles.filterTagText,
                      selectedTagFilter === tag && styles.filterTagTextActive,
                    ]}
                  >
                    {tag === 'all' ? 'Tất cả đánh giá' : tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* TAB 1: REVIEWS */}
          {activeTab === 'reviews' && (
            <View style={styles.tabContentList}>
              {loadingReviews ? (
                <ActivityIndicator size="small" color={colors.primary[600]} style={{ marginVertical: 24 }} />
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => (
                  <ReviewItem key={rev.reviewId} review={rev} />
                ))
              ) : (
                <View style={styles.emptyTabCard}>
                  <Feather name="star" size={32} color={colors.neutral.disabled} />
                  <Text style={styles.emptyTabTitle}>Chưa có đánh giá nào</Text>
                  <Text style={styles.emptyTabSub}>
                    Đánh giá từ bạn học sẽ hiển thị tại đây sau khi hoàn thành công việc hoặc giao dịch.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 2: TASK HISTORY (requesterId == uid || workerId == uid) */}
          {activeTab === 'history' && (
            <View style={styles.tabContentList}>
              {loadingTasks ? (
                <ActivityIndicator size="small" color={colors.primary[600]} style={{ marginVertical: 24 }} />
              ) : userTasks.length > 0 ? (
                userTasks.map((task) => {
                  const statusMeta = getTaskStatusMeta(task.status);
                  const isRequester = task.requesterId === targetUid;
                  const canRatePartner =
                    isOwnProfile &&
                    task.status === 'completed' &&
                    !!(isRequester ? task.workerId : task.requesterId);

                  return (
                    <TouchableOpacity
                      key={task.taskId}
                      style={styles.historyCard}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation?.navigate('TaskDetail', { taskId: task.taskId, task })
                      }
                    >
                      <View style={styles.historyTopRow}>
                        <View style={styles.roleTag}>
                          <Text style={styles.roleTagText}>
                            {isRequester ? 'Việc đã đăng' : 'Việc đã nhận'}
                          </Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
                          <Text style={[styles.statusPillText, { color: statusMeta.text }]}>
                            {statusMeta.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.historyTitle} numberOfLines={2}>
                        {task.title}
                      </Text>

                      <Text style={styles.historyAddress} numberOfLines={1}>
                        {task.pickupLocation.address} ➔ {task.deliveryLocation.address}
                      </Text>

                      <View style={styles.historyBottomRow}>
                        <Text style={styles.historyBounty}>{formatCurrency(task.bounty)}</Text>
                        {canRatePartner ? (
                          <TouchableOpacity
                            style={styles.ratePartnerBtn}
                            onPress={() => handleOpenReviewForTask(task)}
                          >
                            <Feather name="star" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                            <Text style={styles.ratePartnerBtnText}>Đánh giá đối tác</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.viewDetailLink}>Xem chi tiết ›</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyTabCard}>
                  <Feather name="inbox" size={36} color={colors.neutral.disabled} />
                  <Text style={styles.emptyTabTitle}>Chưa có lịch sử việc vặt</Text>
                  <Text style={styles.emptyTabSub}>
                    Các công việc bạn đã đăng hoặc nhận thực hiện sẽ xuất hiện tại đây.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 3: MY PRODUCTS (sellerId == uid) */}
          {activeTab === 'myItems' && (
            <View style={styles.tabContentList}>
              {loadingProducts ? (
                <ActivityIndicator size="small" color={colors.secondary[500]} style={{ marginVertical: 24 }} />
              ) : userProducts.length > 0 ? (
                userProducts.map((product) => {
                  const statusMeta = getProductStatusMeta(product.status);
                  const coverUrl =
                    product.imageUrls && product.imageUrls.length > 0
                      ? product.imageUrls[0]
                      : null;

                  return (
                    <TouchableOpacity
                      key={product.productId}
                      style={styles.productHistoryCard}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation?.navigate('ProductDetail', {
                          productId: product.productId,
                          product,
                        })
                      }
                    >
                      {coverUrl ? (
                        <Image source={{ uri: coverUrl }} style={styles.productThumb} />
                      ) : (
                        <View style={styles.productThumbPlaceholder}>
                          <Feather name="image" size={20} color={colors.neutral.disabled} />
                        </View>
                      )}

                      <View style={styles.productHistoryInfo}>
                        <View style={styles.historyTopRow}>
                          <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
                            <Text style={[styles.statusPillText, { color: statusMeta.text }]}>
                              {statusMeta.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.historyTitle} numberOfLines={1}>
                          {product.title}
                        </Text>

                        <Text style={styles.productPrice}>
                          {product.isFree ? 'Tặng miễn phí 0đ' : formatCurrency(product.price)}
                        </Text>

                        <Text style={styles.historyAddress} numberOfLines={1}>
                          {product.location.address}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyTabCard}>
                  <Feather name="shopping-bag" size={36} color={colors.neutral.disabled} />
                  <Text style={styles.emptyTabTitle}>Chưa có món đồ nào đang pass</Text>
                  <Text style={styles.emptyTabSub}>
                    Các món đồ cũ bạn đăng bán hoặc cho tặng trên Chợ đồ cũ sẽ hiển thị tại đây.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 6. ACCOUNT SETTINGS MENU (Only when viewing own profile) */}
        {isOwnProfile && (
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert('Đổi mật khẩu', 'Vui lòng sử dụng chức năng Quên mật khẩu ở màn hình Đăng nhập để đặt lại mật khẩu qua email.')
              }
            >
              <View style={styles.menuIconWrap}>
                <Feather name="lock" size={18} color={colors.primary[600]} />
              </View>
              <Text style={styles.menuItemText}>Đổi mật khẩu & Bảo mật</Text>
              <Feather name="chevron-right" size={18} color={colors.neutral.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  'Quy chuẩn uy tín',
                  'Điểm Trust Score được tính từ trung bình cộng các đánh giá sau mỗi công việc hoặc giao dịch hoàn thành.'
                )
              }
            >
              <View style={styles.menuIconWrap}>
                <Feather name="help-circle" size={18} color={colors.primary[600]} />
              </View>
              <Text style={styles.menuItemText}>Quy chuẩn uy tín & Hướng dẫn sinh viên</Text>
              <Feather name="chevron-right" size={18} color={colors.neutral.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={onLogoutPress}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="log-out" size={18} color={colors.semantic.danger.DEFAULT} />
              </View>
              <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
              <Feather name="chevron-right" size={18} color={colors.semantic.danger.DEFAULT} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  topBarTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    gap: spacing[2],
  },
  loginPromptBtn: {
    marginTop: spacing[3],
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
  },
  loginPromptBtnText: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  profileHeroCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userMainInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  userNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  emailText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  eduVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  eduVerifiedText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  campusInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    marginTop: spacing[3],
    gap: 6,
  },
  campusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.textSecondary,
    flex: 1,
  },
  bioText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    marginTop: spacing[2],
    lineHeight: 18,
  },
  trustScoreCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    ...shadows.card,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  trustHeaderTextCol: {
    flex: 1,
    marginRight: 8,
  },
  trustTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#92400E',
    letterSpacing: 0.5,
  },
  trustSubtitle: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
  trustScoreMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  bigScoreBox: {
    alignItems: 'center',
    paddingRight: spacing[3],
    borderRightWidth: 1,
    borderRightColor: '#FDE68A',
  },
  bigScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bigScoreNumber: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: '#B45309',
  },
  bigScoreMax: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: typography.fontWeight.semibold,
  },
  reviewCountText: {
    fontSize: 10,
    color: '#92400E',
    marginTop: 2,
    fontWeight: typography.fontWeight.medium,
  },
  metricsBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: spacing[2],
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  metricLab: {
    fontSize: 9,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#FDE68A',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  honorBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: 4,
  },
  honorEmoji: {
    fontSize: 12,
  },
  honorText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.dark,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
    marginTop: 2,
  },
  summarySub: {
    fontSize: 10,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
  tabsSection: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 3,
    borderRadius: borderRadius.lg,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabItemActive: {
    backgroundColor: colors.neutral.surface,
    ...shadows.sm,
  },
  tabItemText: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  tabItemTextActive: {
    color: colors.neutral.textPrimary,
    fontWeight: typography.fontWeight.bold,
  },
  reviewTagScroll: {
    flexDirection: 'row',
  },
  filterTagChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  filterTagChipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterTagText: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTagTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  tabContentList: {
    marginTop: spacing[2],
    gap: spacing[2],
  },
  historyCard: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: 6,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  historyTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  historyAddress: {
    fontSize: 11,
    color: colors.neutral.textMuted,
  },
  historyBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  historyBounty: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.dark,
  },
  viewDetailLink: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  ratePartnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
  },
  ratePartnerBtnText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  productHistoryCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    padding: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: spacing[3],
    alignItems: 'center',
  },
  productThumb: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.md,
    backgroundColor: '#E2E8F0',
  },
  productThumbPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.md,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productHistoryInfo: {
    flex: 1,
    gap: 3,
  },
  productPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#EA580C',
  },
  emptyTabCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: spacing[4],
  },
  emptyTabTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginTop: spacing[2],
  },
  emptyTabSub: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  menuSection: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  menuItemText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.textPrimary,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.danger.DEFAULT,
  },
});
