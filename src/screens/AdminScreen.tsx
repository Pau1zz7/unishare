import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import {
  getAllUsers,
  getAllTasks,
  getAllProducts,
  toggleUserBanStatus,
  toggleTaskVisibility,
  toggleProductVisibility,
} from '../features/admin/services/adminService';
import { User, Task, Product } from '../types';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../theme/tokens';

type AdminTab = 'users' | 'tasks' | 'products';

const formatVnd = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
};

export default function AdminScreen() {
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAdminData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [usersData, tasksData, productsData] = await Promise.all([
        getAllUsers(),
        getAllTasks(),
        getAllProducts(),
      ]);
      setUsers(usersData);
      setTasks(tasksData);
      setProducts(productsData);
    } catch (err: any) {
      Alert.alert(
        'Lỗi tải dữ liệu',
        err?.message || 'Không thể tải danh sách quản trị.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const keyword = searchQuery.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!keyword) return users;
    return users.filter(
      (u) =>
        (u.displayName || '').toLowerCase().includes(keyword) ||
        (u.email || '').toLowerCase().includes(keyword) ||
        (u.phone || '').toLowerCase().includes(keyword)
    );
  }, [users, keyword]);

  const filteredTasks = useMemo(() => {
    if (!keyword) return tasks;
    return tasks.filter(
      (t) =>
        (t.title || '').toLowerCase().includes(keyword) ||
        (t.requesterName || '').toLowerCase().includes(keyword)
    );
  }, [tasks, keyword]);

  const filteredProducts = useMemo(() => {
    if (!keyword) return products;
    return products.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(keyword) ||
        (p.sellerName || '').toLowerCase().includes(keyword)
    );
  }, [products, keyword]);

  const handleToggleUser = (target: User) => {
    if (target.uid === currentUser?.uid) {
      Alert.alert('Không thể thực hiện', 'Bạn không thể tự khóa tài khoản của chính mình.');
      return;
    }

    const isBanned = target.status === 'banned';
    Alert.alert(
      isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
      isBanned
        ? `Cho phép "${target.displayName}" đăng nhập lại vào UniShare?`
        : `Khóa tài khoản "${target.displayName}" (${target.email})? Người dùng này sẽ bị chặn đăng nhập.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: isBanned ? 'Mở khóa' : 'Khóa ngay',
          style: isBanned ? 'default' : 'destructive',
          onPress: async () => {
            setProcessingId(target.uid);
            try {
              const nextStatus = await toggleUserBanStatus(
                target.uid,
                target.status || 'active'
              );
              setUsers((prev) =>
                prev.map((u) =>
                  u.uid === target.uid ? { ...u, status: nextStatus } : u
                )
              );
            } catch (err: any) {
              Alert.alert('Lỗi', err?.message || 'Cập nhật thất bại.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleToggleTask = (target: Task) => {
    const isHidden = target.status === 'hidden';
    Alert.alert(
      isHidden ? 'Hiện lại bài việc vặt' : 'Ẩn bài vi phạm',
      isHidden
        ? `Khôi phục hiển thị bài "${target.title}" lên Bảng tin?`
        : `Ẩn bài "${target.title}" khỏi Bảng tin của tất cả sinh viên?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: isHidden ? 'Khôi phục' : 'Ẩn bài',
          style: isHidden ? 'default' : 'destructive',
          onPress: async () => {
            setProcessingId(target.taskId);
            try {
              const nextStatus = await toggleTaskVisibility(
                target.taskId,
                target.status
              );
              setTasks((prev) =>
                prev.map((t) =>
                  t.taskId === target.taskId ? { ...t, status: nextStatus } : t
                )
              );
            } catch (err: any) {
              Alert.alert('Lỗi', err?.message || 'Cập nhật thất bại.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleToggleProduct = (target: Product) => {
    const isHidden = target.status === 'hidden';
    Alert.alert(
      isHidden ? 'Hiện lại sản phẩm' : 'Ẩn sản phẩm vi phạm',
      isHidden
        ? `Khôi phục hiển thị "${target.title}" trên Chợ đồ cũ?`
        : `Ẩn sản phẩm "${target.title}" khỏi Chợ đồ cũ?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: isHidden ? 'Khôi phục' : 'Ẩn bài',
          style: isHidden ? 'default' : 'destructive',
          onPress: async () => {
            setProcessingId(target.productId);
            try {
              const nextStatus = await toggleProductVisibility(
                target.productId,
                target.status
              );
              setProducts((prev) =>
                prev.map((p) =>
                  p.productId === target.productId
                    ? { ...p, status: nextStatus }
                    : p
                )
              );
            } catch (err: any) {
              Alert.alert('Lỗi', err?.message || 'Cập nhật thất bại.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  if (currentUser?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Feather name="shield-off" size={44} color={colors.semantic.danger.DEFAULT} />
          <Text style={styles.emptyTitle}>Không có quyền truy cập</Text>
          <Text style={styles.emptySub}>
            Khu vực này chỉ dành cho tài khoản quản trị viên UniShare.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderUserItem = ({ item }: { item: User }) => {
    const isBanned = item.status === 'banned';
    const isBusy = processingId === item.uid;
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.displayName || 'Chưa đặt tên'}
            </Text>
            <Text style={styles.cardSub} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isBanned ? styles.badgeDanger : styles.badgeSuccess,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isBanned ? styles.badgeTextDanger : styles.badgeTextSuccess,
              ]}
            >
              {isBanned ? 'BANNED' : 'ACTIVE'}
            </Text>
          </View>
        </View>

        <View style={styles.cardMetaRow}>
          <Text style={styles.metaText}>
            Vai trò: {item.role === 'admin' ? 'Admin' : 'Sinh viên'} • Uy tín:{' '}
            {(item.trustScore || 5).toFixed(1)}★
          </Text>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isBanned ? styles.actionBtnRestore : styles.actionBtnDanger,
            ]}
            disabled={isBusy || item.uid === currentUser?.uid}
            onPress={() => handleToggleUser(item)}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.actionBtnText}>
                {isBanned ? 'Mở khóa' : 'Khóa user'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const isHidden = item.status === 'hidden';
    const isBusy = processingId === item.taskId;
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardSub} numberOfLines={1}>
              Đăng bởi: {item.requesterName} • Thù lao: {formatVnd(item.bounty)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isHidden ? styles.badgeDanger : styles.badgeInfo,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isHidden ? styles.badgeTextDanger : styles.badgeTextInfo,
              ]}
            >
              {(item.status || 'open').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardMetaRow}>
          <Text style={styles.metaText} numberOfLines={1}>
            {item.pickupLocation?.address || 'Không có địa chỉ'}
          </Text>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isHidden ? styles.actionBtnRestore : styles.actionBtnDanger,
            ]}
            disabled={isBusy}
            onPress={() => handleToggleTask(item)}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.actionBtnText}>
                {isHidden ? 'Hiện bài' : 'Ẩn bài'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isHidden = item.status === 'hidden';
    const isBusy = processingId === item.productId;
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardSub} numberOfLines={1}>
              Người bán: {item.sellerName} •{' '}
              {item.isFree ? 'Miễn phí 0đ' : formatVnd(item.price)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isHidden ? styles.badgeDanger : styles.badgeInfo,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isHidden ? styles.badgeTextDanger : styles.badgeTextInfo,
              ]}
            >
              {(item.status || 'available').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardMetaRow}>
          <Text style={styles.metaText} numberOfLines={1}>
            {item.location?.address || 'Không có địa chỉ'}
          </Text>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isHidden ? styles.actionBtnRestore : styles.actionBtnDanger,
            ]}
            disabled={isBusy}
            onPress={() => handleToggleProduct(item)}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.actionBtnText}>
                {isHidden ? 'Hiện bài' : 'Ẩn bài'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Feather name="shield" size={22} color={colors.primary[600]} />
          <Text style={styles.headerTitle}>Bảng điều khiển Admin</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => fetchAdminData(true)}
        >
          <Feather name="refresh-cw" size={18} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.neutral.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm email, tên user hoặc tiêu đề bài đăng..."
            placeholderTextColor={colors.neutral.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={colors.neutral.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'users' && styles.tabBtnTextActive,
            ]}
          >
            User ({users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tasks' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'tasks' && styles.tabBtnTextActive,
            ]}
          >
            Việc vặt ({tasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
          onPress={() => setActiveTab('products')}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'products' && styles.tabBtnTextActive,
            ]}
          >
            Đồ cũ ({products.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.emptySub}>Đang tải dữ liệu Firestore...</Text>
        </View>
      ) : activeTab === 'users' ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAdminData(true)}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptySub}>Không có người dùng nào.</Text>
            </View>
          }
        />
      ) : activeTab === 'tasks' ? (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.taskId}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAdminData(true)}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptySub}>Chưa có bài việc vặt nào trên Firestore.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.productId}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAdminData(true)}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptySub}>Chưa có sản phẩm nào trên Firestore.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrap: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    height: 44,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textPrimary,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  tabBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textSecondary,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  cardSub: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeInfo: {
    backgroundColor: colors.primary[50],
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  badgeTextSuccess: {
    color: '#15803D',
  },
  badgeTextDanger: {
    color: '#B91C1C',
  },
  badgeTextInfo: {
    color: colors.primary[700],
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
    gap: spacing[2],
  },
  metaText: {
    flex: 1,
    fontSize: 11,
    color: colors.neutral.textMuted,
  },
  actionBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    minWidth: 84,
    alignItems: 'center',
  },
  actionBtnDanger: {
    backgroundColor: colors.semantic.danger.DEFAULT,
  },
  actionBtnRestore: {
    backgroundColor: colors.semantic.success.DEFAULT,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    gap: spacing[2],
  },
  emptyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  emptySub: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textMuted,
    textAlign: 'center',
  },
});