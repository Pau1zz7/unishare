import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MapMarkerItem, RouteInfo } from '../types';
import { MapMarker } from '../components/MapMarker';
import { MarkerPopupCard } from '../components/MarkerPopupCard';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOCK_ROUTE: RouteInfo = {
  originName: 'ĐH Công Nghệ Thông Tin (UIT)',
  originCoords: { latitude: 10.87, longitude: 106.8 },
  destinationName: 'KTX Khu B ĐHQG TP.HCM',
  destinationCoords: { latitude: 10.882, longitude: 106.782 },
  totalDistanceKm: 2.4,
  estimatedDurationMins: 7,
};

const MOCK_MARKERS: MapMarkerItem[] = [
  {
    id: 'origin',
    type: 'origin',
    title: 'Điểm xuất phát: ĐH CNTT (UIT)',
    address: 'Khu phố 6, P. Linh Trung, TP. Thủ Đức',
    latitude: 10.87,
    longitude: 106.8,
  },
  {
    id: 'destination',
    type: 'destination',
    title: 'Điểm đến: KTX Khu B ĐHQG',
    address: 'Tô Vĩnh Diện, Đông Hòa, Dĩ An',
    latitude: 10.882,
    longitude: 106.782,
  },
  {
    id: 'task-1',
    type: 'task',
    title: 'Nhận hộ đồ Shopee tại Cổng 1 KTX B',
    bountyOrPrice: 25000,
    category: 'delivery',
    requesterOrSellerName: 'Nguyễn Văn An',
    trustScore: 4.9,
    address: 'Cổng 1 KTX Khu B ĐHQG',
    deviationMeters: 80,
    latitude: 10.881,
    longitude: 106.781,
  },
  {
    id: 'task-2',
    type: 'task',
    title: 'In & bấm ghim tập tài liệu Giải tích 1',
    bountyOrPrice: 30000,
    category: 'print',
    requesterOrSellerName: 'Trần Thị Mai',
    trustScore: 5.0,
    address: 'Quán Photo Cổng ĐH KHTN',
    deviationMeters: 120,
    latitude: 10.873,
    longitude: 106.792,
  },
  {
    id: 'task-3',
    type: 'task',
    title: 'Mua hộ 2 phần cơm gà xối mỡ & 1 trà tắc',
    bountyOrPrice: 35000,
    category: 'food',
    requesterOrSellerName: 'Lê Hoàng Long',
    trustScore: 4.8,
    address: 'Quán Cơm Sinh Viên - Ngã 3 621',
    deviationMeters: 190,
    latitude: 10.876,
    longitude: 106.795,
  },
  {
    id: 'prod-1',
    type: 'product',
    title: 'Giáo trình Giải tích 1 & ĐSTT ĐHQG',
    bountyOrPrice: 35000,
    isFree: false,
    category: 'book',
    requesterOrSellerName: 'Vũ Thị Ngọc',
    trustScore: 4.9,
    address: 'Sảnh Tòa BA4, KTX Khu B',
    deviationMeters: 150,
    latitude: 10.88,
    longitude: 106.78,
  },
  {
    id: 'prod-2',
    type: 'product',
    title: 'Bàn học gấp gọn chân chữ U',
    bountyOrPrice: 0,
    isFree: true,
    category: 'furniture',
    requesterOrSellerName: 'Lê Minh Quân',
    trustScore: 5.0,
    address: 'Tòa C1, KTX Khu B',
    deviationMeters: 220,
    latitude: 10.882,
    longitude: 106.779,
  },
];

type FilterMode = 'matched' | 'allTasks' | 'allProducts';

export default function RouteMatchingScreen({ navigation }: any) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(MOCK_MARKERS[2]);
  const [filterMode, setFilterMode] = useState<FilterMode>('matched');
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const displayedMarkers = MOCK_MARKERS.filter((m) => {
    if (m.type === 'origin' || m.type === 'destination') return true;
    if (filterMode === 'matched') {
      return m.deviationMeters !== undefined && m.deviationMeters <= 300;
    }
    if (filterMode === 'allTasks') return m.type === 'task';
    if (filterMode === 'allProducts') return m.type === 'product';
    return true;
  });

  const matchedTasks = MOCK_MARKERS.filter(
    (m) => m.type === 'task' && m.deviationMeters !== undefined && m.deviationMeters <= 300
  );

  const totalExtraBounty = matchedTasks.reduce(
    (sum, cur) => sum + (cur.bountyOrPrice || 0),
    0
  );

  const handleSelectMarker = (marker: MapMarkerItem) => {
    setSelectedMarker(marker);
  };

  const handleViewDetail = (marker: MapMarkerItem) => {
    if (marker.type === 'task') {
      navigation?.navigate('TaskDetail', { taskId: marker.id });
    } else if (marker.type === 'product') {
      navigation?.navigate('ProductDetail', { productId: marker.id });
    }
  };

  const handleQuickAction = (marker: MapMarkerItem) => {
    if (marker.type === 'task') {
      Alert.alert(
        'Nhận việc tiện đường! ',
        `Bạn đã đăng ký nhận việc "${marker.title}" (Lệch ${marker.deviationMeters}m). Hãy trao đổi ngay với bạn ${marker.requesterOrSellerName}!`,
        [
          {
            text: 'Nhắn tin',
            onPress: () =>
              navigation?.navigate('ChatRoom', {
                partnerName: marker.requesterOrSellerName,
                taskTitle: marker.title,
              }),
          },
          { text: 'Đóng' },
        ]
      );
    } else {
      navigation?.navigate('ChatRoom', {
        partnerName: marker.requesterOrSellerName,
        productTitle: marker.title,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.routeHeaderBox}>
        <View style={styles.routeTopRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={colors.neutral.textPrimary} />
          </TouchableOpacity>

          <View style={styles.routeInputsCol}>
            <View style={styles.routeInputItem}>
              <View style={[styles.dotCircle, { backgroundColor: '#16A34A' }]} />
              <Text style={styles.routeLocationText} numberOfLines={1}>
                {MOCK_ROUTE.originName}
              </Text>
            </View>

            <View style={styles.routeDivider} />

            <View style={styles.routeInputItem}>
              <View style={[styles.dotCircle, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.routeLocationText} numberOfLines={1}>
                {MOCK_ROUTE.destinationName}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.swapBtn}
            onPress={() => Alert.alert('Đảo chiều lộ trình', 'Đã chuyển chiều đi từ KTX về ĐH CNTT.')}
          >
            <Feather name="repeat" size={16} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.routeStatsRow}>
          <View style={styles.routeStatBadge}>
            <Feather name="navigation" size={12} color={colors.primary[600]} />
            <Text style={styles.routeStatText}>
              Lộ trình {MOCK_ROUTE.totalDistanceKm} km • ~{MOCK_ROUTE.estimatedDurationMins} phút đi xe
            </Text>
          </View>

          <View style={styles.algorithmBadge}>
            <Text style={styles.algorithmBadgeText}>Thuật toán Point-to-Segment</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterMode === 'matched' && styles.filterChipActive]}
            onPress={() => setFilterMode('matched')}
          >
            <Text style={styles.fireEmoji}>🔥</Text>
            <Text style={[styles.filterChipText, filterMode === 'matched' && styles.filterChipTextActive]}>
              Tiện đường (Lệch ≤ 300m)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterMode === 'allTasks' && styles.filterChipActive]}
            onPress={() => setFilterMode('allTasks')}
          >
            <Feather name="zap" size={12} color={filterMode === 'allTasks' ? '#FFF' : colors.primary[600]} style={{ marginRight: 4 }} />
            <Text style={[styles.filterChipText, filterMode === 'allTasks' && styles.filterChipTextActive]}>
              Tất cả việc vặt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterMode === 'allProducts' && styles.filterChipActive]}
            onPress={() => setFilterMode('allProducts')}
          >
            <Feather name="shopping-bag" size={12} color={filterMode === 'allProducts' ? '#FFF' : colors.secondary[600]} style={{ marginRight: 4 }} />
            <Text style={[styles.filterChipText, filterMode === 'allProducts' && styles.filterChipTextActive]}>
              Chợ đồ cũ
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.mapArea}>
        <View style={styles.mapBackground}>
          <View style={styles.mapGridRow} />
          <View style={styles.mapGridRow} />
          <View style={styles.mapGridRow} />
          <View style={styles.mapRoadHorizontal1} />
          <View style={styles.mapRoadHorizontal2} />
          <View style={styles.mapRoadDiagonal} />
          <View style={styles.mapParkArea}>
            <Text style={styles.mapLabel}>Hồ Đá ĐHQG TP.HCM</Text>
          </View>
          <View style={styles.mapCampusArea}>
            <Text style={styles.mapLabelCampus}>Khu đô thị ĐHQG</Text>
          </View>
        </View>

        <View style={styles.polylineContainer}>
          <View style={styles.polylineRoadMain} />
          <View style={styles.polylineRoadCore} />
        </View>

        <View style={styles.deviationGuide1} />
        <View style={styles.deviationGuide2} />

        <View style={[styles.markerAbsolute, { top: '68%', left: '16%' }]}>
          <MapMarker
            item={MOCK_MARKERS[0]}
            isSelected={selectedMarker?.id === 'origin'}
            onPress={handleSelectMarker}
          />
        </View>

        <View style={[styles.markerAbsolute, { top: '18%', right: '18%' }]}>
          <MapMarker
            item={MOCK_MARKERS[1]}
            isSelected={selectedMarker?.id === 'destination'}
            onPress={handleSelectMarker}
          />
        </View>

        {displayedMarkers.some((m) => m.id === 'task-1') && (
          <View style={[styles.markerAbsolute, { top: '27%', right: '28%' }]}>
            <MapMarker
              item={MOCK_MARKERS[2]}
              isSelected={selectedMarker?.id === 'task-1'}
              onPress={handleSelectMarker}
            />
          </View>
        )}

        {displayedMarkers.some((m) => m.id === 'task-2') && (
          <View style={[styles.markerAbsolute, { top: '50%', left: '40%' }]}>
            <MapMarker
              item={MOCK_MARKERS[3]}
              isSelected={selectedMarker?.id === 'task-2'}
              onPress={handleSelectMarker}
            />
          </View>
        )}

        {displayedMarkers.some((m) => m.id === 'task-3') && (
          <View style={[styles.markerAbsolute, { top: '38%', left: '52%' }]}>
            <MapMarker
              item={MOCK_MARKERS[4]}
              isSelected={selectedMarker?.id === 'task-3'}
              onPress={handleSelectMarker}
            />
          </View>
        )}

        {displayedMarkers.some((m) => m.id === 'prod-1') && (
          <View style={[styles.markerAbsolute, { top: '22%', right: '45%' }]}>
            <MapMarker
              item={MOCK_MARKERS[5]}
              isSelected={selectedMarker?.id === 'prod-1'}
              onPress={handleSelectMarker}
            />
          </View>
        )}

        {selectedMarker && selectedMarker.type !== 'origin' && selectedMarker.type !== 'destination' && (
          <View style={styles.floatingPopupAnchor}>
            <MarkerPopupCard
              marker={selectedMarker}
              onClose={() => setSelectedMarker(null)}
              onViewDetail={handleViewDetail}
              onQuickAction={handleQuickAction}
            />
          </View>
        )}

        <View style={styles.mapControlsCol}>
          <TouchableOpacity
            style={styles.mapControlBtn}
            onPress={() => Alert.alert('Định vị', 'Đang cập nhật vị trí hiện tại của bạn.')}
          >
            <Feather name="crosshair" size={18} color={colors.primary[600]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapControlBtn}
            onPress={() => setSelectedMarker(MOCK_MARKERS[2])}
          >
            <Feather name="maximize-2" size={18} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.bottomSheet, sheetExpanded && styles.bottomSheetExpanded]}>
        <TouchableOpacity
          style={styles.sheetHandleWrap}
          activeOpacity={0.7}
          onPress={() => setSheetExpanded(!sheetExpanded)}
        >
          <View style={styles.sheetHandleBar} />
        </TouchableOpacity>

        <View style={styles.sheetHeader}>
          <View>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>
                🔥 {matchedTasks.length} việc tiện đường đi của bạn
              </Text>
            </View>
            <Text style={styles.sheetSubtitle}>
              Lệch tối đa 300m • Kiếm thêm +{new Intl.NumberFormat('vi-VN').format(totalExtraBounty)} đ
            </Text>
          </View>

          <TouchableOpacity
            style={styles.toggleExpandBtn}
            onPress={() => setSheetExpanded(!sheetExpanded)}
          >
            <Feather
              name={sheetExpanded ? 'chevron-down' : 'chevron-up'}
              size={20}
              color={colors.neutral.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.sheetScrollList}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {matchedTasks.map((taskItem) => {
            const isSelected = selectedMarker?.id === taskItem.id;
            return (
              <TouchableOpacity
                key={taskItem.id}
                style={[styles.taskItemCard, isSelected && styles.taskItemCardActive]}
                onPress={() => setSelectedMarker(taskItem)}
                activeOpacity={0.8}
              >
                <View style={styles.taskItemIconBox}>
                  <Feather
                    name={taskItem.category === 'food' ? 'coffee' : taskItem.category === 'print' ? 'file-text' : 'package'}
                    size={18}
                    color={colors.primary[600]}
                  />
                </View>

                <View style={styles.taskItemTextCol}>
                  <Text style={styles.taskItemTitle} numberOfLines={1}>
                    {taskItem.title}
                  </Text>
                  <View style={styles.taskItemMetaRow}>
                    <View style={styles.deviationTag}>
                      <Text style={styles.deviationTagText}>
                        Lệch {taskItem.deviationMeters}m
                      </Text>
                    </View>
                    <Text style={styles.taskItemAddress} numberOfLines={1}>
                      • {taskItem.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.taskItemPriceCol}>
                  <Text style={styles.taskItemPrice}>
                    +{new Intl.NumberFormat('vi-VN').format(taskItem.bountyOrPrice || 0)}đ
                  </Text>
                  <TouchableOpacity
                    style={styles.quickAcceptBtn}
                    onPress={() => handleQuickAction(taskItem)}
                  >
                    <Text style={styles.quickAcceptBtnText}>Nhận</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  routeHeaderBox: {
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
    zIndex: 20,
    ...shadows.card,
  },
  routeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  routeInputsCol: {
    flex: 1,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  routeInputItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing[2],
  },
  routeLocationText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
    flex: 1,
  },
  routeDivider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: 4,
    marginLeft: 18,
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  routeStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[2],
  },
  routeStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeStatText: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  algorithmBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
  },
  algorithmBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  filterChipsRow: {
    flexDirection: 'row',
    marginTop: spacing[2],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginRight: spacing[2],
  },
  filterChipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  fireEmoji: {
    fontSize: 11,
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  mapBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E2E8F0',
  },
  mapGridRow: {
    height: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    opacity: 0.5,
  },
  mapRoadHorizontal1: {
    position: 'absolute',
    top: '32%',
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
  },
  mapRoadHorizontal2: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
  },
  mapRoadDiagonal: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: '85%',
    height: 20,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-28deg' }],
    borderColor: '#CBD5E1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  mapParkArea: {
    position: 'absolute',
    top: '40%',
    left: '8%',
    width: 140,
    height: 90,
    backgroundColor: '#BAE6FD',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7DD3FC',
  },
  mapCampusArea: {
    position: 'absolute',
    top: '12%',
    left: '45%',
    width: 150,
    height: 60,
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#0369A1',
  },
  mapLabelCampus: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#15803D',
  },
  polylineContainer: {
    ...StyleSheet.absoluteFill,
  },
  polylineRoadMain: {
    position: 'absolute',
    top: '22%',
    left: '20%',
    width: '68%',
    height: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.4)',
    borderRadius: 5,
    transform: [{ rotate: '-28deg' }],
  },
  polylineRoadCore: {
    position: 'absolute',
    top: '22%',
    left: '20%',
    width: '68%',
    height: 6,
    backgroundColor: colors.primary[600],
    borderRadius: 3,
    transform: [{ rotate: '-28deg' }],
  },
  deviationGuide1: {
    position: 'absolute',
    top: '32%',
    right: '32%',
    width: 28,
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.semantic.warning.DEFAULT,
  },
  deviationGuide2: {
    position: 'absolute',
    top: '52%',
    left: '42%',
    width: 24,
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.semantic.warning.DEFAULT,
  },
  markerAbsolute: {
    position: 'absolute',
  },
  floatingPopupAnchor: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 90,
  },
  mapControlsCol: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: spacing[2],
    zIndex: 30,
  },
  mapControlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  bottomSheet: {
    backgroundColor: colors.neutral.surface,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: 280,
    paddingHorizontal: spacing[4],
    ...shadows.bottomSheet,
    zIndex: 80,
  },
  bottomSheetExpanded: {
    maxHeight: 460,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  sheetHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.disabled,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  toggleExpandBtn: {
    padding: 6,
  },
  sheetScrollList: {
    marginTop: spacing[2],
  },
  taskItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  taskItemCardActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  taskItemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  taskItemTextCol: {
    flex: 1,
  },
  taskItemTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: 2,
  },
  taskItemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviationTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  deviationTagText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#B45309',
  },
  taskItemAddress: {
    fontSize: 10,
    color: colors.neutral.textMuted,
    flex: 1,
    marginLeft: 4,
  },
  taskItemPriceCol: {
    alignItems: 'flex-end',
    marginLeft: spacing[2],
  },
  taskItemPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.dark,
    marginBottom: 4,
  },
  quickAcceptBtn: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  quickAcceptBtnText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});