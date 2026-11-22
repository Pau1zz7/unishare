import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { User, Review } from '../types';
import { ReviewItem } from '../components/ReviewItem';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

const CURRENT_USER: User = {
  uid: 'u_khoi',
  email: 'khoi.nm@uit.edu.vn',
  displayName: 'Nguyễn Minh Khôi',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
  bio: 'Sinh viên K17 ngành Kỹ thuật Phần mềm ĐH CNTT (UIT). Thường xuyên đi tuyến UIT ➔ KTX Khu B lúc 17h, nhận tiện đường lấy hộ hàng Shopee và in ấn tài liệu!',
  phone: '0987654321',
  role: 'user',
  status: 'active',
  trustScore: 4.9,
  totalReviews: 32,
  createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
  university: 'ĐH Công Nghệ Thông Tin (UIT) - ĐHQG TP.HCM',
  studentIdVerified: true,
  completedTasksCount: 14,
  postedTasksCount: 8,
  activeProductsCount: 3,
};

const MOCK_REVIEWS: Review[] = [
  {
    reviewId: 'r1',
    reviewerId: 'u1',
    reviewerName: 'Trần Thị Mai (ĐH KHTN)',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    targetUserId: 'u_khoi',
    rating: 5,
    comment: 'Khôi nhận lấy hộ giáo trình và giao tận sảnh KTX cực kỳ đúng giờ, nói chuyện rất lịch sự và nhiệt tình. 10/10 uy tín!',
    tags: ['Đúng giờ', 'Thân thiện', 'Cẩn thận'],
    relatedType: 'task',
    relatedTitle: 'In & bấm ghim tài liệu Giải tích 1',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    reviewId: 'r2',
    reviewerId: 'u2',
    reviewerName: 'Lê Hoàng Long (ĐH Bách Khoa)',
    reviewerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80',
    targetUserId: 'u_khoi',
    rating: 5,
    comment: 'Giao hàng Shopee giúp mình lúc trời mưa mà gói hàng vẫn khô ráo nguyên vẹn, cảm ơn bạn rất nhiều nhé.',
    tags: ['Cẩn thận giữ đồ', 'Giao nhanh chóng', 'Nhiệt tình'],
    relatedType: 'task',
    relatedTitle: 'Nhận hộ gói đồ Shopee Cổng 1 KTX B',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    reviewId: 'r3',
    reviewerId: 'u3',
    reviewerName: 'Vũ Thị Ngọc (ĐH KHXH&NV)',
    reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    targetUserId: 'u_khoi',
    rating: 5,
    comment: 'Mua sách Giải tích của bạn này, sách còn rất mới và sạch đẹp, có highlight sẵn công thức thi rất có tâm.',
    tags: ['Đồ dùng như mô tả', 'Nhiệt tình hỗ trợ'],
    relatedType: 'product',
    relatedTitle: 'Giáo trình Giải tích 1 & ĐSTT',
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
  {
    reviewId: 'r4',
    reviewerId: 'u4',
    reviewerName: 'Phạm Đức Duy (ĐH Quốc Tế)',
    reviewerAvatar: null,
    targetUserId: 'u_khoi',
    rating: 4,
    comment: 'Giao đồ ăn nhanh, đồ ăn còn nóng hổi. Rất hài lòng.',
    tags: ['Đúng giờ', 'Thân thiện'],
    relatedType: 'task',
    relatedTitle: 'Mua hộ 2 phần cơm gà xối mỡ',
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
];

type ProfileTab = 'reviews' | 'history' | 'myItems';

export default function ProfileScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('reviews');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');

  const reviewFilterTags = ['all', 'Đúng giờ', 'Thân thiện', 'Cẩn thận giữ đồ', 'Giao nhanh'];

  const filteredReviews = MOCK_REVIEWS.filter((r) => {
    if (selectedTagFilter === 'all') return true;
    return r.tags?.some((t) => t.toLowerCase().includes(selectedTagFilter.toLowerCase()));
  });

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản UniShare?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            navigation?.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

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

        <Text style={styles.topBarTitle}>Hồ sơ cá nhân & Uy tín</Text>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { marginRight: 8 }]}
            onPress={() => Alert.alert('Chỉnh sửa hồ sơ', 'Tính năng cập nhật ảnh đại diện, số điện thoại và giới thiệu bản thân.')}
          >
            <Feather name="edit-2" size={18} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Alert.alert('Cài đặt', 'Cài đặt thông báo, quyền riêng tư và tài khoản.')}
          >
            <Feather name="settings" size={18} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. USER PROFILE HERO CARD */}
        <View style={styles.profileHeroCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: CURRENT_USER.avatarUrl! }} style={styles.avatarImg} />
              <View style={styles.cameraBadge}>
                <Feather name="camera" size={12} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.userMainInfo}>
              <View style={styles.userNameLine}>
                <Text style={styles.displayName}>{CURRENT_USER.displayName}</Text>
              </View>

              <Text style={styles.emailText}>{CURRENT_USER.email}</Text>

              {/* Edu Verified Badge */}
              <View style={styles.eduVerifiedBadge}>
                <Feather name="shield" size={12} color="#2563EB" style={{ marginRight: 4 }} />
                <Text style={styles.eduVerifiedText}>Đã xác thực Email SV (.edu.vn)</Text>
              </View>
            </View>
          </View>

          {/* Campus Tag */}
          <View style={styles.campusInfoBox}>
            <Feather name="book" size={14} color={colors.primary[600]} style={{ marginTop: 1 }} />
            <Text style={styles.campusText}>{CURRENT_USER.university}</Text>
          </View>

          {/* Bio */}
          <Text style={styles.bioText}>{CURRENT_USER.bio}</Text>
        </View>

        {/* 3. TRUST SCORE CARD (ĐẶC TẢ TRỌNG TÂM) */}
        <View style={styles.trustScoreCard}>
          <View style={styles.trustHeader}>
            <View>
              <Text style={styles.trustTitle}>ĐIỂM UY TÍN SINH VIÊN (TRUST SCORE)</Text>
              <Text style={styles.trustSubtitle}>Đánh giá thực tế từ bạn học sau giao dịch</Text>
            </View>
            <TouchableOpacity
              style={styles.simulateReviewBtn}
              onPress={() =>
                navigation?.navigate('ReviewRating', {
                  targetUserName: 'Nguyễn Văn An',
                  relatedTitle: 'Nhận hộ gói đồ Shopee KTX B',
                })
              }
            >
              <Feather name="edit-3" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.simulateReviewBtnText}>Đánh giá đối tác</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustScoreMainRow}>
            {/* Big Score Box */}
            <View style={styles.bigScoreBox}>
              <View style={styles.bigScoreRow}>
                <Feather name="star" size={26} color="#F59E0B" />
                <Text style={styles.bigScoreNumber}>{CURRENT_USER.trustScore.toFixed(1)}</Text>
                <Text style={styles.bigScoreMax}>/5.0</Text>
              </View>
              <Text style={styles.reviewCountText}>
                {CURRENT_USER.totalReviews} lượt đánh giá uy tín
              </Text>
            </View>

            {/* Quick Metrics */}
            <View style={styles.metricsBox}>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>98%</Text>
                <Text style={styles.metricLab}>Hoàn tất việc</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>&lt; 5p</Text>
                <Text style={styles.metricLab}>Phản hồi chat</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>100%</Text>
                <Text style={styles.metricLab}>Hài lòng</Text>
              </View>
            </View>
          </View>

          {/* Student Honor Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.honorBadge}>
              <Text style={styles.honorEmoji}>🛡️</Text>
              <Text style={styles.honorText}>Sinh viên uy tín</Text>
            </View>
            <View style={styles.honorBadge}>
              <Text style={styles.honorEmoji}>🛵</Text>
              <Text style={styles.honorText}>Đúng giờ 100%</Text>
            </View>
            <View style={styles.honorBadge}>
              <Text style={styles.honorEmoji}>🤝</Text>
              <Text style={styles.honorText}>Thân thiện</Text>
            </View>
          </View>
        </View>

        {/* 4. ACTIVITY SUMMARY CARDS */}
        <View style={styles.statsSummaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{CURRENT_USER.completedTasksCount}</Text>
            <Text style={styles.summaryLabel}>Việc đã nhận</Text>
            <Text style={styles.summarySub}>Thu nhập ~420k</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: colors.primary[600] }]}>
              {CURRENT_USER.postedTasksCount}
            </Text>
            <Text style={styles.summaryLabel}>Việc đã đăng</Text>
            <Text style={styles.summarySub}>Đã hoàn thành</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#EA580C' }]}>
              {CURRENT_USER.activeProductsCount}
            </Text>
            <Text style={styles.summaryLabel}>Đồ đang pass</Text>
            <Text style={styles.summarySub}>Chợ đồ cũ</Text>
          </View>
        </View>

        {/* 5. TABS & REVIEWS LIST */}
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
                Đánh giá ({CURRENT_USER.totalReviews})
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
                Lịch sử việc ({CURRENT_USER.completedTasksCount})
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
                Đồ pass ({CURRENT_USER.activeProductsCount})
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

          {/* List Content */}
          {activeTab === 'reviews' && (
            <View style={styles.reviewsList}>
              {filteredReviews.map((rev) => (
                <ReviewItem key={rev.reviewId} review={rev} />
              ))}
            </View>
          )}

          {activeTab === 'history' && (
            <View style={styles.emptyTabCard}>
              <Feather name="check-circle" size={36} color={colors.semantic.success.DEFAULT} />
              <Text style={styles.emptyTabTitle}>Đã hoàn thành 14 công việc</Text>
              <Text style={styles.emptyTabSub}>
                Tất cả các việc nhận hộ đồ Shopee, in ấn tài liệu và mua đồ ăn đều được xác nhận hoàn thành đầy đủ.
              </Text>
            </View>
          )}

          {activeTab === 'myItems' && (
            <View style={styles.emptyTabCard}>
              <Feather name="shopping-bag" size={36} color={colors.secondary[500]} />
              <Text style={styles.emptyTabTitle}>3 món đồ đang rao bán</Text>
              <Text style={styles.emptyTabSub}>
                Bao gồm: Giáo trình Giải tích 1, Nồi cơm điện mini Lock&Lock và Bàn học gấp gọn KTX.
              </Text>
            </View>
          )}
        </View>

        {/* 6. ACCOUNT SETTINGS MENU */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Feather name="lock" size={18} color={colors.primary[600]} />
            </View>
            <Text style={styles.menuItemText}>Đổi mật khẩu & Bảo mật</Text>
            <Feather name="chevron-right" size={18} color={colors.neutral.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Feather name="help-circle" size={18} color={colors.primary[600]} />
            </View>
            <Text style={styles.menuItemText}>Quy chuẩn uy tín & Hướng dẫn sinh viên</Text>
            <Feather name="chevron-right" size={18} color={colors.neutral.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="log-out" size={18} color={colors.semantic.danger.DEFAULT} />
            </View>
            <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
            <Feather name="chevron-right" size={18} color={colors.semantic.danger.DEFAULT} />
          </TouchableOpacity>
        </View>

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
  trustTitle: {
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
  simulateReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[600],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  simulateReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
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
  reviewsList: {
    marginTop: spacing[2],
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
