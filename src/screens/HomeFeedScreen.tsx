import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Task, Product } from '../types';
import { TaskCard } from '../components/TaskCard';
import { ProductCard } from '../components/ProductCard';
import { useAuthStore } from '../store/useAuthStore';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { acceptTask } from '../features/tasks/services/taskService';
import { useProducts } from '../features/market/hooks/useProducts';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

type ActiveTab = 'tasks' | 'market';

export default function HomeFeedScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  const {
    tasks,
    loading: loadingTasks,
    refreshing: refreshingTasks,
    error: tasksError,
    refresh: refreshTasks,
  } = useTasks();
  const {
    products,
    loading: loadingProducts,
    refreshing: refreshingProducts,
    error: productsError,
    refresh: refreshProducts,
  } = useProducts();

  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');
  const [selectedMarketCategory, setSelectedMarketCategory] = useState<string>('all');
  const [fabModalVisible, setFabModalVisible] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null);

  const avatarInitial = useMemo(() => {
    const source = user?.displayName?.trim() || user?.email?.trim() || '';
    return source ? source.charAt(0).toUpperCase() : 'U';
  }, [user?.displayName, user?.email]);

  // Task Filter options
  const taskFilterChips = [
    { id: 'all', label: 'Tất cả' },
    { id: 'near', label: '📍 Gần tôi (<2km)' },
    { id: 'highBounty', label: '💰 Thù lao >30k' },
    { id: 'delivery', label: '📦 Giao nhận' },
    { id: 'food', label: '🍱 Mua đồ ăn' },
    { id: 'print', label: '🖨️ In ấn' },
    { id: 'study', label: '🎓 Học tập' },
  ];

  // Market Category options
  const marketFilterChips = [
    { id: 'all', label: 'Tất cả' },
    { id: 'free', label: '🎁 Tặng 0đ (Free)' },
    { id: 'book', label: '📚 Giáo trình & Sách' },
    { id: 'electronic', label: '💻 Đồ điện tử' },
    { id: 'furniture', label: '🪑 Đồ KTX' },
    { id: 'other', label: '🏸 Thể thao & Khác' },
  ];

  const onRefresh = () => {
    if (activeTab === 'tasks') {
      refreshTasks();
    } else {
      refreshProducts();
    }
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchQuery =
        !keyword ||
        task.title.toLowerCase().includes(keyword) ||
        (task.description ?? '').toLowerCase().includes(keyword) ||
        task.pickupLocation.address.toLowerCase().includes(keyword) ||
        task.deliveryLocation.address.toLowerCase().includes(keyword);

      if (!matchQuery) return false;

      if (selectedTaskFilter === 'near') return (task.distanceKm ?? 0) <= 2;
      if (selectedTaskFilter === 'highBounty') return task.bounty >= 30000;
      if (selectedTaskFilter !== 'all') return task.category === selectedTaskFilter;

      return true;
    });
  }, [tasks, searchQuery, selectedTaskFilter]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchQuery =
        !keyword ||
        product.title.toLowerCase().includes(keyword) ||
        (product.description ?? '').toLowerCase().includes(keyword) ||
        product.location.address.toLowerCase().includes(keyword);

      if (!matchQuery) return false;

      if (selectedMarketCategory === 'free') return product.isFree;
      if (selectedMarketCategory !== 'all') return product.category === selectedMarketCategory;

      return true;
    });
  }, [products, searchQuery, selectedMarketCategory]);

  const toggleBookmark = (product: Product) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.productId)) {
        next.delete(product.productId);
      } else {
        next.add(product.productId);
      }
      return next;
    });
  };

  const handleTaskPress = (task: Task) => {
    navigation?.navigate('TaskDetail', { taskId: task.taskId, task });
  };

  const handleProductPress = (product: Product) => {
    navigation?.navigate('ProductDetail', { productId: product.productId, product });
  };

  const executeAcceptTask = async (task: Task) => {
    if (!user?.uid) return;
    if (acceptingTaskId) return;

    setAcceptingTaskId(task.taskId);
    try {
      await acceptTask(
        task.taskId,
        user.uid,
        user.displayName || user.email || 'Sinh viên UniShare'
      );
      Alert.alert(
        'Nhận việc thành công!',
        `Bạn đã nhận việc "${task.title}". Hãy xem chi tiết để liên hệ với người nhờ nhé.`,
        [
          {
            text: 'Xem chi tiết',
            onPress: () =>
              navigation?.navigate('TaskDetail', {
                taskId: task.taskId,
                task: {
                  ...task,
                  status: 'matched',
                  workerId: user.uid,
                  workerName: user.displayName || user.email,
                },
              }),
          },
          { text: 'Đóng' },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Không thể nhận việc',
        error?.message || 'Đã có lỗi xảy ra khi nhận việc. Vui lòng thử lại.'
      );
    } finally {
      setAcceptingTaskId(null);
    }
  };

  const handleQuickAcceptTask = (task: Task) => {
    if (!user?.uid) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản sinh viên để nhận việc.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation?.navigate('Login') },
        ]
      );
      return;
    }

    if (task.requesterId === user.uid) {
      Alert.alert('Thông báo', 'Bạn không thể tự nhận việc do chính mình đăng.');
      return;
    }

    const formattedBounty = new Intl.NumberFormat('vi-VN').format(task.bounty) + ' đ';

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' &&
        window.confirm(
          `Xác nhận nhận việc "${task.title}" với thù lao ${formattedBounty}?`
        );
      if (confirmed) {
        executeAcceptTask(task);
      }
      return;
    }

    Alert.alert(
      'Xác nhận nhận việc',
      `Bạn chắc chắn muốn nhận việc "${task.title}" với thù lao ${formattedBounty}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý nhận',
          onPress: () => executeAcceptTask(task),
        },
      ]
    );
  };

  const handleNavigateCreate = (screen: 'CreateTask' | 'CreateProduct') => {
    setFabModalVisible(false);
    if (!user?.uid) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản sinh viên để đăng bài mới.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation?.navigate('Login') },
        ]
      );
      return;
    }
    navigation?.navigate(screen);
  };

  const isLoadingCurrentTab = activeTab === 'tasks' ? loadingTasks : loadingProducts;
  const currentError = activeTab === 'tasks' ? tasksError : productsError;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation?.navigate('Profile')}
          activeOpacity={0.8}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
          <Feather name="map-pin" size={14} color={colors.primary[600]} />
          <Text style={styles.locationCampus} numberOfLines={1}>
            {user?.university || 'ĐHQG TP.HCM • KTX Khu B'}
          </Text>
          <Feather name="chevron-down" size={14} color={colors.neutral.textMuted} />
        </TouchableOpacity>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { marginRight: 8 }]}
            onPress={() => navigation?.navigate('RouteMatching')}
          >
            <Feather name="map" size={18} color={colors.primary[600]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Alert.alert('Thông báo', 'Bạn chưa có thông báo mới.')}
          >
            <Feather name="bell" size={20} color={colors.neutral.textPrimary} />
            <View style={styles.unreadDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SEARCH BAR */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.neutral.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'tasks'
                ? 'Tìm việc vặt, giao đồ ăn, nhận hàng...'
                : 'Tìm giáo trình, tủ lạnh, đồ sinh viên...'
            }
            placeholderTextColor={colors.neutral.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Feather name="x" size={16} color={colors.neutral.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterTuneBtn}
          onPress={() =>
            Alert.alert(
              'Bộ lọc nâng cao',
              'Sử dụng các thẻ lọc bên dưới để lọc nhanh theo danh mục, thù lao và khoảng cách.'
            )
          }
        >
          <Feather name="sliders" size={18} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>

      {/* 3. SEGMENTED TAB SWITCHER */}
      <View style={styles.tabSwitcherContainer}>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('tasks')}
            style={[styles.tabButton, activeTab === 'tasks' && styles.activeTabButton]}
          >
            <Feather
              name="zap"
              size={15}
              color={activeTab === 'tasks' ? colors.primary[600] : colors.neutral.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'tasks' && styles.activeTabButtonText,
              ]}
            >
              Việc Vặt ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('market')}
            style={[styles.tabButton, activeTab === 'market' && styles.activeTabButton]}
          >
            <Feather
              name="shopping-bag"
              size={15}
              color={activeTab === 'market' ? colors.secondary[600] : colors.neutral.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'market' && styles.activeTabButtonText,
              ]}
            >
              Chợ Đồ Cũ ({products.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. DYNAMIC FILTER CHIPS */}
      <View style={styles.chipsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {activeTab === 'tasks'
            ? taskFilterChips.map((chip) => {
                const isSelected = selectedTaskFilter === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.chip, isSelected && styles.activeChip]}
                    onPress={() => setSelectedTaskFilter(chip.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })
            : marketFilterChips.map((chip) => {
                const isSelected = selectedMarketCategory === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.chip, isSelected && styles.activeMarketChip]}
                    onPress={() => setSelectedMarketCategory(chip.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.activeMarketChipText]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
        </ScrollView>
      </View>

      {/* 5. FEED CONTENT (FlatList) */}
      <View style={styles.contentContainer}>
        {currentError ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color={colors.semantic.danger.DEFAULT} />
            <Text style={styles.errorBannerText}>{currentError}</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isLoadingCurrentTab ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={styles.loadingText}>Đang tải dữ liệu realtime...</Text>
          </View>
        ) : activeTab === 'tasks' ? (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.taskId}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={handleTaskPress}
                onQuickApply={handleQuickAcceptTask}
              />
            )}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshingTasks} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color={colors.neutral.disabled} />
                <Text style={styles.emptyTitle}>Chưa có việc vặt phù hợp</Text>
                <Text style={styles.emptySubtitle}>
                  Thử tìm kiếm với từ khóa khác, xóa bớt bộ lọc hoặc nhấn nút + để đăng việc mới!
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.productId}
            numColumns={2}
            key="market-grid-2"
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={handleProductPress}
                onBookmark={toggleBookmark}
                isBookmarked={bookmarkedIds.has(item.productId)}
              />
            )}
            contentContainerStyle={styles.gridPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshingProducts} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="shopping-bag" size={48} color={colors.neutral.disabled} />
                <Text style={styles.emptyTitle}>Chưa có món đồ nào</Text>
                <Text style={styles.emptySubtitle}>
                  Không tìm thấy sản phẩm trong danh mục này hoặc hãy là người đầu tiên đăng bán!
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* 6. FLOATING ACTION BUTTON (+) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setFabModalVisible(true)}
      >
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* CREATE MODAL / BOTTOM SHEET */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={fabModalVisible}
        onRequestClose={() => setFabModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFabModalVisible(false)}
        >
          <View style={styles.fabMenuContainer}>
            <Text style={styles.fabMenuTitle}>Bạn muốn đăng tin gì hôm nay?</Text>

            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => handleNavigateCreate('CreateTask')}
            >
              <View style={[styles.fabMenuIcon, { backgroundColor: colors.primary[100] }]}>
                <Feather name="zap" size={22} color={colors.primary[600]} />
              </View>
              <View style={styles.fabMenuTextCol}>
                <Text style={styles.fabMenuOptionTitle}>Đăng việc vặt cần nhờ</Text>
                <Text style={styles.fabMenuOptionSubtitle}>
                  Nhờ nhận hộ hàng Shopee, mua đồ ăn, in tài liệu, giao đồ...
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => handleNavigateCreate('CreateProduct')}
            >
              <View style={[styles.fabMenuIcon, { backgroundColor: colors.secondary[100] }]}>
                <Feather name="tag" size={22} color={colors.secondary[600]} />
              </View>
              <View style={styles.fabMenuTextCol}>
                <Text style={styles.fabMenuOptionTitle}>Đăng bán hoặc tặng đồ cũ</Text>
                <Text style={styles.fabMenuOptionSubtitle}>
                  Pass lại giáo trình, đồ gia dụng phòng trọ, đồ điện tử...
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fabMenuCloseBtn}
              onPress={() => setFabModalVisible(false)}
            >
              <Text style={styles.fabMenuCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: spacing[2],
  },
  profileBtn: {
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing[3],
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    maxWidth: '65%',
    gap: 5,
  },
  locationCampus: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.neutral.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.danger.DEFAULT,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    height: 44,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textPrimary,
    height: '100%',
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterTuneBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  tabSwitcherContainer: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[1],
    marginBottom: spacing[2],
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: borderRadius.xl,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: borderRadius.lg,
  },
  activeTabButton: {
    backgroundColor: colors.neutral.surface,
    ...shadows.sm,
  },
  tabButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.textSecondary,
  },
  activeTabButtonText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  chipsSection: {
    marginBottom: spacing[2],
  },
  chipsScroll: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: 7,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  activeChip: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  activeMarketChip: {
    backgroundColor: colors.secondary[600],
    borderColor: colors.secondary[600],
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  activeMarketChipText: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  contentContainer: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.danger.light,
    marginHorizontal: spacing[4],
    marginBottom: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.semantic.danger.text,
  },
  retryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: spacing[3],
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textMuted,
  },
  listPadding: {
    paddingHorizontal: spacing[4],
    paddingBottom: 80,
  },
  gridPadding: {
    paddingHorizontal: spacing[3],
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing[6],
  },
  emptyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginTop: spacing[3],
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textMuted,
    textAlign: 'center',
    marginTop: spacing[1],
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  fabMenuContainer: {
    backgroundColor: colors.neutral.surface,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing[5],
    paddingBottom: spacing[8],
  },
  fabMenuTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  fabMenuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  fabMenuTextCol: {
    flex: 1,
  },
  fabMenuOptionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  fabMenuOptionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    lineHeight: 16,
  },
  fabMenuCloseBtn: {
    marginTop: spacing[2],
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  fabMenuCloseText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textMuted,
    fontWeight: typography.fontWeight.semibold,
  },
});
