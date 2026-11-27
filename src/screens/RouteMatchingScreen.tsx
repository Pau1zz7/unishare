import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { MapMarkerItem, Coordinates } from '../types';
import { MapMarker } from '../components/MapMarker';
import { MarkerPopupCard } from '../components/MarkerPopupCard';
import {
  CAMPUS_PRESETS,
  CampusPreset,
  findRouteMatches,
} from '../features/map/services/mapService';
import { getCurrentLocation } from '../features/map/services/locationService';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../theme/tokens';

type FilterMode = 'matched' | 'allTasks' | 'allProducts';
type PickerTarget = 'origin' | 'destination' | null;

const MAX_DEVIATION_METERS = 300;

export default function RouteMatchingScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);

  const [origin, setOrigin] = useState<CampusPreset>(CAMPUS_PRESETS[0]);
  const [destination, setDestination] = useState<CampusPreset>(CAMPUS_PRESETS[1]);
  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [totalDistanceKm, setTotalDistanceKm] = useState<number>(0);
  const [estimatedDurationMins, setEstimatedDurationMins] = useState<number>(0);
  const [matchedTasks, setMatchedTasks] = useState<MapMarkerItem[]>([]);
  const [allTaskMarkers, setAllTaskMarkers] = useState<MapMarkerItem[]>([]);
  const [allProductMarkers, setAllProductMarkers] = useState<MapMarkerItem[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('matched');
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const fitMapToRoute = useCallback((coords: Coordinates[]) => {
    if (coords.length >= 2) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 60, right: 50, bottom: 90, left: 50 },
          animated: true,
        });
      }, 250);
    }
  }, []);

  const loadRouteAndMatches = useCallback(async () => {
    setLoadingRoute(true);
    setSelectedMarker(null);
    try {
      const result = await findRouteMatches(
        origin.coords,
        destination.coords,
        MAX_DEVIATION_METERS
      );
      setRouteCoords(result.route.coordinates);
      setTotalDistanceKm(result.route.totalDistanceKm);
      setEstimatedDurationMins(result.route.estimatedDurationMins);
      setMatchedTasks(result.matchedTasks);
      setAllTaskMarkers(result.allTaskMarkers);
      setAllProductMarkers(result.allProductMarkers);
      fitMapToRoute(result.route.coordinates);
    } catch (err: any) {
      Alert.alert(
        'Lỗi tải dữ liệu',
        err?.message || 'Không thể tải tuyến đường và danh sách công việc lúc này.'
      );
    } finally {
      setLoadingRoute(false);
    }
  }, [origin, destination, fitMapToRoute]);

  useEffect(() => {
    loadRouteAndMatches();
  }, [loadRouteAndMatches]);

  const originMarkerItem: MapMarkerItem = useMemo(
    () => ({
      id: 'origin',
      type: 'origin',
      title: `Điểm đi: ${origin.name}`,
      address: origin.address,
      latitude: origin.coords.latitude,
      longitude: origin.coords.longitude,
    }),
    [origin]
  );

  const destinationMarkerItem: MapMarkerItem = useMemo(
    () => ({
      id: 'destination',
      type: 'destination',
      title: `Điểm đến: ${destination.name}`,
      address: destination.address,
      latitude: destination.coords.latitude,
      longitude: destination.coords.longitude,
    }),
    [destination]
  );

  const displayedMarkers = useMemo(() => {
    if (filterMode === 'matched') {
      const matchedProducts = allProductMarkers.filter(
        (m) => (m.deviationMeters ?? Infinity) <= MAX_DEVIATION_METERS
      );
      return [...matchedTasks, ...matchedProducts];
    }
    if (filterMode === 'allTasks') {
      return allTaskMarkers;
    }
    return allProductMarkers;
  }, [filterMode, matchedTasks, allTaskMarkers, allProductMarkers]);

  const totalExtraBounty = useMemo(
    () =>
      matchedTasks.reduce((sum, cur) => sum + (cur.bountyOrPrice || 0), 0),
    [matchedTasks]
  );

  const handleSwapRoute = () => {
    const prevOrigin = origin;
    setOrigin(destination);
    setDestination(prevOrigin);
  };

  const handleLocateMe = async () => {
    const coords = await getCurrentLocation();
    if (!coords) {
      Alert.alert(
        'Chưa cấp quyền vị trí',
        'Vui lòng bật quyền truy cập GPS trong cài đặt điện thoại để định vị.'
      );
      return;
    }
    setOrigin({
      id: 'current-gps',
      name: 'Vị trí hiện tại của bạn',
      address: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
      coords,
    });
  };

  const handleSelectPreset = (preset: CampusPreset) => {
    if (pickerTarget === 'origin') {
      if (preset.id === destination.id) {
        handleSwapRoute();
      } else {
        setOrigin(preset);
      }
    } else if (pickerTarget === 'destination') {
      if (preset.id === origin.id) {
        handleSwapRoute();
      } else {
        setDestination(preset);
      }
    }
    setPickerTarget(null);
  };

  const handleViewDetail = (marker: MapMarkerItem) => {
    if (marker.type === 'task') {
      navigation?.navigate('TaskDetail', {
        taskId: marker.id,
        task: marker.rawTask,
      });
    } else if (marker.type === 'product') {
      navigation?.navigate('ProductDetail', {
        productId: marker.id,
        product: marker.rawProduct,
      });
    }
  };

  const handleQuickAction = (marker: MapMarkerItem) => {
    const partnerId =
      marker.type === 'task'
        ? marker.rawTask?.requesterId
        : marker.rawProduct?.sellerId;

    navigation?.navigate('ChatRoom', {
      partnerId,
      partnerName: marker.requesterOrSellerName || 'Sinh viên UniShare',
      relatedType: marker.type === 'product' ? 'product' : 'task',
      relatedId: marker.id,
      relatedTitle: marker.title,
      price: marker.bountyOrPrice,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.routeHeaderBox}>
        <View style={styles.routeTopRow}>
          <View style={styles.routeInputsCol}>
            <TouchableOpacity
              style={styles.routeInputItem}
              activeOpacity={0.7}
              onPress={() => setPickerTarget('origin')}
            >
              <View style={[styles.dotCircle, { backgroundColor: '#16A34A' }]} />
              <Text style={styles.routeLocationText} numberOfLines={1}>
                {origin.name}
              </Text>
              <Feather
                name="chevron-down"
                size={14}
                color={colors.neutral.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.routeDivider} />

            <TouchableOpacity
              style={styles.routeInputItem}
              activeOpacity={0.7}
              onPress={() => setPickerTarget('destination')}
            >
              <View style={[styles.dotCircle, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.routeLocationText} numberOfLines={1}>
                {destination.name}
              </Text>
              <Feather
                name="chevron-down"
                size={14}
                color={colors.neutral.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.swapBtn}
            onPress={handleSwapRoute}
            activeOpacity={0.7}
          >
            <Feather name="repeat" size={16} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.routeStatsRow}>
          <Text style={styles.routeStatText}>
            {loadingRoute
              ? 'Đang tìm tuyến đường...'
              : `Quãng đường ${totalDistanceKm} km • Khoảng ${estimatedDurationMins} phút`}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterChipsRow}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterMode === 'matched' && styles.filterChipActive,
            ]}
            onPress={() => setFilterMode('matched')}
          >
            <Text
              style={[
                styles.filterChipText,
                filterMode === 'matched' && styles.filterChipTextActive,
              ]}
            >
              Tiện đường ({matchedTasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterMode === 'allTasks' && styles.filterChipActive,
            ]}
            onPress={() => setFilterMode('allTasks')}
          >
            <Text
              style={[
                styles.filterChipText,
                filterMode === 'allTasks' && styles.filterChipTextActive,
              ]}
            >
              Việc vặt ({allTaskMarkers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterMode === 'allProducts' && styles.filterChipActive,
            ]}
            onPress={() => setFilterMode('allProducts')}
          >
            <Text
              style={[
                styles.filterChipText,
                filterMode === 'allProducts' && styles.filterChipTextActive,
              ]}
            >
              Chợ đồ cũ ({allProductMarkers.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.mapArea}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: 10.876,
            longitude: 106.794,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          showsUserLocation
          showsMyLocationButton={false}
          onPress={() => setSelectedMarker(null)}
        >
          {routeCoords.length >= 2 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={colors.primary[600]}
              strokeWidth={5}
            />
          )}

          <Marker
            coordinate={origin.coords}
            tracksViewChanges={false}
            onPress={() => setSelectedMarker(originMarkerItem)}
          >
            <MapMarker
              item={originMarkerItem}
              isSelected={selectedMarker?.id === 'origin'}
              onPress={() => setSelectedMarker(originMarkerItem)}
            />
          </Marker>

          <Marker
            coordinate={destination.coords}
            tracksViewChanges={false}
            onPress={() => setSelectedMarker(destinationMarkerItem)}
          >
            <MapMarker
              item={destinationMarkerItem}
              isSelected={selectedMarker?.id === 'destination'}
              onPress={() => setSelectedMarker(destinationMarkerItem)}
            />
          </Marker>

          {displayedMarkers.map((markerItem) => (
            <Marker
              key={`${markerItem.type}-${markerItem.id}`}
              coordinate={{
                latitude: markerItem.latitude,
                longitude: markerItem.longitude,
              }}
              tracksViewChanges={false}
              onPress={() => setSelectedMarker(markerItem)}
            >
              <MapMarker
                item={markerItem}
                isSelected={selectedMarker?.id === markerItem.id}
                onPress={() => setSelectedMarker(markerItem)}
              />
            </Marker>
          ))}
        </MapView>

        {loadingRoute && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary[600]} />
            <Text style={styles.loadingOverlayText}>Đang tải tuyến đường...</Text>
          </View>
        )}

        {selectedMarker &&
          selectedMarker.type !== 'origin' &&
          selectedMarker.type !== 'destination' && (
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
            onPress={handleLocateMe}
          >
            <Feather name="crosshair" size={18} color={colors.primary[600]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapControlBtn}
            onPress={() => fitMapToRoute(routeCoords)}
          >
            <Feather
              name="maximize-2"
              size={18}
              color={colors.neutral.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapControlBtn}
            onPress={loadRouteAndMatches}
          >
            <Feather name="refresh-cw" size={16} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.bottomSheet,
          sheetExpanded && styles.bottomSheetExpanded,
        ]}
      >
        <TouchableOpacity
          style={styles.sheetHandleWrap}
          activeOpacity={0.7}
          onPress={() => setSheetExpanded(!sheetExpanded)}
        >
          <View style={styles.sheetHandleBar} />
        </TouchableOpacity>

        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>
              {matchedTasks.length} việc tiện đường
            </Text>
            <Text style={styles.sheetSubtitle}>
              Trong phạm vi {MAX_DEVIATION_METERS}m dọc tuyến • Tổng thù lao +
              {new Intl.NumberFormat('vi-VN').format(totalExtraBounty)} đ
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
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {matchedTasks.length === 0 ? (
            <View style={styles.emptySheetBox}>
              <Text style={styles.emptySheetText}>
                Chưa có việc vặt nào nằm dọc theo tuyến đường này.
              </Text>
            </View>
          ) : (
            matchedTasks.map((taskItem) => {
              const isSelected = selectedMarker?.id === taskItem.id;
              return (
                <TouchableOpacity
                  key={taskItem.id}
                  style={[
                    styles.taskItemCard,
                    isSelected && styles.taskItemCardActive,
                  ]}
                  onPress={() => {
                    setSelectedMarker(taskItem);
                    mapRef.current?.animateToRegion(
                      {
                        latitude: taskItem.latitude,
                        longitude: taskItem.longitude,
                        latitudeDelta: 0.012,
                        longitudeDelta: 0.012,
                      },
                      350
                    );
                  }}
                  activeOpacity={0.8}
                >
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
                        {taskItem.address}
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
                      <Text style={styles.quickAcceptBtnText}>Nhắn tin</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      <Modal
        visible={pickerTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerTarget(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerTarget(null)}
        >
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>
              {pickerTarget === 'origin'
                ? 'Chọn điểm xuất phát'
                : 'Chọn điểm đến'}
            </Text>

            {pickerTarget === 'origin' && (
              <TouchableOpacity
                style={styles.presetRow}
                onPress={async () => {
                  setPickerTarget(null);
                  await handleLocateMe();
                }}
              >
                <Feather name="crosshair" size={18} color={colors.primary[600]} />
                <View style={styles.presetTextCol}>
                  <Text style={styles.presetName}>Vị trí hiện tại (GPS)</Text>
                  <Text style={styles.presetAddress}>
                    Lấy tọa độ trực tiếp từ điện thoại
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {CAMPUS_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={styles.presetRow}
                onPress={() => handleSelectPreset(preset)}
              >
                <Feather
                  name="map-pin"
                  size={18}
                  color={
                    pickerTarget === 'origin' ? '#16A34A' : '#DC2626'
                  }
                />
                <View style={styles.presetTextCol}>
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetAddress}>{preset.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
    paddingVertical: 2,
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
    marginTop: spacing[2],
  },
  routeStatText: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterChipsRow: {
    flexDirection: 'row',
    marginTop: spacing[2],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: 7,
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
  filterChipText: {
    fontSize: 12,
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
  },
  loadingOverlay: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 8,
    zIndex: 50,
    ...shadows.md,
  },
  loadingOverlayText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
  },
  floatingPopupAnchor: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    zIndex: 100,
    elevation: 10,
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
    maxHeight: 240,
    paddingHorizontal: spacing[4],
    ...shadows.bottomSheet,
    zIndex: 80,
  },
  bottomSheetExpanded: {
    maxHeight: 420,
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
  emptySheetBox: {
    paddingVertical: spacing[5],
    alignItems: 'center',
  },
  emptySheetText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textMuted,
    textAlign: 'center',
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
  taskItemTextCol: {
    flex: 1,
  },
  taskItemTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  taskItemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviationTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deviationTagText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#B45309',
  },
  taskItemAddress: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.neutral.surface,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing[5],
    paddingBottom: spacing[8],
  },
  pickerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[3],
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    gap: spacing[3],
  },
  presetTextCol: {
    flex: 1,
  },
  presetName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
  },
  presetAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
});