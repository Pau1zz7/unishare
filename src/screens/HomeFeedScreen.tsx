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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Task, Product } from '../types';
import { TaskCard } from '../components/TaskCard';
import { ProductCard } from '../components/ProductCard';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

// Mock Data Việc Vặt
const MOCK_TASKS: Task[] = [
  {
    taskId: 't1',
    title: 'Nhận hộ kiện hàng Shopee tại Cổng 1 KTX Khu B',
    description: 'Mình đang học ở trường không về kịp trước 17h, nhờ bạn nào lấy hộ kiện quần áo mang về sảnh Tòa B3 giúp mình.',
    requesterId: 'u1',
    requesterName: 'Nguyễn Văn An',
    requesterTrustScore: 4.9,
    bounty: 25000,
    paymentMethod: 'transfer',
    category: 'delivery',
    pickupLocation: {
      latitude: 10.88,
      longitude: 106.78,
      address: 'Cổng 1 KTX Khu B ĐHQG',
    },
    deliveryLocation: {
      latitude: 10.881,
      longitude: 106.782,
      address: 'Sảnh Tòa B3, KTX Khu B',
    },
    status: 'open',
    distanceKm: 0.8,
    createdAt: Date.now() - 15 * 60 * 1000, // 15 mins ago
  },
  {
    taskId: 't2',
    title: 'In & bấm ghim tập tài liệu Giải tích 1 (40 trang)',
    description: 'Cần in 1 bản 2 mặt slide bài giảng tại tiệm photo cổng ĐH KHTN rồi mang sang nhà xe.',
    requesterId: 'u2',
    requesterName: 'Trần Thị Mai',
    requesterTrustScore: 5.0,
    bounty: 30000,
    paymentMethod: 'cash',
    category: 'print',
    pickupLocation: {
      latitude: 10.87,
      longitude: 106.79,
      address: 'Quán Photo Minh Đạt - Cổng ĐH KHTN',
    },
    deliveryLocation: {
      latitude: 10.872,
      longitude: 106.792,
      address: 'Khu tự học Nhà C ĐH KHTN',
    },
    status: 'open',
    distanceKm: 1.2,
    createdAt: Date.now() - 40 * 60 * 1000, // 40 mins ago
  },
  {
    taskId: 't3',
    title: 'Mua hộ 2 phần cơm gà xối mỡ & 1 trà tắc',
    description: 'Giao lên phòng 502 tòa A14 KTX Khu A. Tiền cơm hết 65k mình chuyển khoản hoàn trả kèm tiền công.',
    requesterId: 'u3',
    requesterName: 'Lê Hoàng Long',
    requesterTrustScore: 4.8,
    bounty: 35000,
    paymentMethod: 'transfer',
    category: 'food',
    pickupLocation: {
      latitude: 10.875,
      longitude: 106.8,
      address: 'Quán Cơm Sinh Viên - Ngã 3 621',
    },
    deliveryLocation: {
      latitude: 10.876,
      longitude: 106.798,
      address: 'P.502 Tòa A14 KTX Khu A',
    },
    status: 'open',
    distanceKm: 2.1,
    createdAt: Date.now() - 75 * 60 * 1000, // 1 hour ago
  },
  {
    taskId: 't4',
    title: 'Gia sư nhanh bài tập Cấu trúc dữ liệu & Giải thuật',
    description: 'Cần bạn nào nắm chắc Tree & Graph giải thích giúp mình 3 bài tập lớn trong 1 tiếng tối nay.',
    requesterId: 'u4',
    requesterName: 'Đặng Tuấn Kiệt',
    requesterTrustScore: 4.7,
    bounty: 80000,
    paymentMethod: 'transfer',
    category: 'study',
    pickupLocation: {
      latitude: 10.87,
      longitude: 106.8,
      address: 'Thư viện Trung tâm ĐHQG',
    },
    deliveryLocation: {
      latitude: 10.87,
      longitude: 106.8,
      address: 'Phòng học nhóm Thư viện TT',
    },
    status: 'open',
    distanceKm: 0.5,
    createdAt: Date.now() - 120 * 60 * 1000,
  },
];

// Mock Data Chợ Đồ Cũ
const MOCK_PRODUCTS: Product[] = [
  {
    productId: 'p1',
    title: 'Giáo trình Giải tích 1 & Đại số tuyến tính ĐHQG',
    description: 'Sách còn mới 95%, có highlight một số công thức trọng tâm. Tặng kèm tập đề cương cương ôn tập.',
    price: 35000,
    isFree: false,
    category: 'book',
    condition: 'like-new',
    imageUrls: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'],
    sellerId: 'u10',
    sellerName: 'Vũ Thị Ngọc',
    sellerTrustScore: 4.9,
    location: {
      latitude: 10.88,
      longitude: 106.78,
      address: 'KTX Khu B ĐHQG',
    },
    distanceKm: 0.6,
    status: 'available',
    createdAt: Date.now() - 25 * 60 * 1000,
  },
  {
    productId: 'p2',
    title: 'Nồi cơm điện mini Lock&Lock 0.8L cho sinh viên',
    description: 'Nấu cơm nhanh, chống dính tốt, dùng được 6 tháng. Mình chuyển trọ nên thanh lý gấp.',
    price: 150000,
    isFree: false,
    category: 'electronic',
    condition: 'used',
    imageUrls: ['https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=400&q=80'],
    sellerId: 'u11',
    sellerName: 'Phạm Đức Duy',
    sellerTrustScore: 4.8,
    location: {
      latitude: 10.875,
      longitude: 106.79,
      address: 'KTX Khu A ĐHQG',
    },
    distanceKm: 1.5,
    status: 'available',
    createdAt: Date.now() - 90 * 60 * 1000,
  },
  {
    productId: 'p3',
    title: 'Bàn học gấp gọn chân chữ U mặt gỗ MDF',
    description: 'Bàn còn rất chắc chắn, tặng lại cho bạn nào tân sinh viên cần dùng học tập tại phòng KTX.',
    price: 0,
    isFree: true,
    category: 'furniture',
    condition: 'used',
    imageUrls: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80'],
    sellerId: 'u12',
    sellerName: 'Lê Minh Quân',
    sellerTrustScore: 5.0,
    location: {
      latitude: 10.88,
      longitude: 106.78,
      address: 'Tòa C1, KTX Khu B',
    },
    distanceKm: 0.9,
    status: 'available',
    createdAt: Date.now() - 180 * 60 * 1000,
  },
  {
    productId: 'p4',
    title: 'Cặp vợt cầu lông Yonex kèm túi và 3 quả cầu',
    description: 'Vợt căng 10kg phù hợp bạn nào muốn tập thể thao buổi chiều ở sân KTX.',
    price: 85000,
    isFree: false,
    category: 'other',
    condition: 'like-new',
    imageUrls: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=80'],
    sellerId: 'u13',
    sellerName: 'Nguyễn Hải Đăng',
    sellerTrustScore: 4.6,
    location: {
      latitude: 10.87,
      longitude: 106.8,
      address: 'Sân bóng ĐH CNTT (UIT)',
    },
    distanceKm: 1.8,
    status: 'available',
    createdAt: Date.now() - 300 * 60 * 1000,
  },
];

type ActiveTab = 'tasks' | 'market';

export default function HomeFeedScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');
  const [selectedMarketCategory, setSelectedMarketCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [fabModalVisible, setFabModalVisible] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

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
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return MOCK_TASKS.filter((task) => {
      const matchQuery =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.pickupLocation.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.deliveryLocation.address.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchQuery) return false;

      if (selectedTaskFilter === 'near') return (task.distanceKm || 0) <= 2;
      if (selectedTaskFilter === 'highBounty') return task.bounty >= 30000;
      if (selectedTaskFilter !== 'all') return task.category === selectedTaskFilter;

      return true;
    });
  }, [searchQuery, selectedTaskFilter]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchQuery =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.location.address.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchQuery) return false;

      if (selectedMarketCategory === 'free') return product.isFree;
      if (selectedMarketCategory !== 'all') return product.category === selectedMarketCategory;

      return true;
    });
  }, [searchQuery, selectedMarketCategory]);

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
    if (navigation?.navigate) {
      navigation.navigate('TaskDetail', { taskId: task.taskId, task });
    }
  };

  const handleProductPress = (product: Product) => {
    if (navigation?.navigate) {
      navigation.navigate('ProductDetail', { productId: product.productId, product });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation?.navigate('Profile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
          <Feather name="map-pin" size={14} color={colors.primary[600]} />
          <Text style={styles.locationCampus} numberOfLines={1}>
            ĐHQG TP.HCM • KTX Khu B
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
            onPress={() => navigation?.navigate('Notifications')}
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
          onPress={() => alert('Bộ lọc nâng cao (Khoảng cách, Mức giá, Thời gian)')}
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
              Việc Vặt ({MOCK_TASKS.length})
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
              Chợ Đồ Cũ ({MOCK_PRODUCTS.length})
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
        {activeTab === 'tasks' ? (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.taskId}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={handleTaskPress}
                onQuickApply={(task) => alert(`Đã gửi yêu cầu nhận việc: "${task.title}"`)}
              />
            )}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color={colors.neutral.disabled} />
                <Text style={styles.emptyTitle}>Chưa có việc vặt phù hợp</Text>
                <Text style={styles.emptySubtitle}>
                  Thử tìm kiếm với từ khóa khác hoặc xóa bớt bộ lọc bạn nhé!
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="shopping-bag" size={48} color={colors.neutral.disabled} />
                <Text style={styles.emptyTitle}>Chưa có món đồ nào</Text>
                <Text style={styles.emptySubtitle}>
                  Không tìm thấy sản phẩm trong danh mục này quanh khu vực bạn.
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
              onPress={() => {
                setFabModalVisible(false);
                navigation?.navigate('CreateTask');
              }}
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
              onPress={() => {
                setFabModalVisible(false);
                navigation?.navigate('CreateProduct');
              }}
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
