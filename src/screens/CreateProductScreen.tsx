import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ProductCategory, ProductCondition } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { createProduct } from '../features/market/services/productService';
import { chooseImageWithPrompt } from '../lib/image/imagePickerHelper';
import {
  CAMPUS_PRODUCT_PRESETS,
  CampusPreset,
  generateGeohash,
} from '../lib/location/locationService';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

const CATEGORIES: { id: ProductCategory; label: string; icon: any }[] = [
  { id: 'book', label: 'Giáo trình & Sách', icon: 'book' },
  { id: 'electronic', label: 'Đồ điện tử', icon: 'tv' },
  { id: 'furniture', label: 'Đồ dùng KTX', icon: 'home' },
  { id: 'clothing', label: 'Thời trang', icon: 'shopping-bag' },
  { id: 'other', label: 'Thể thao & Khác', icon: 'grid' },
];

const CONDITIONS: { id: ProductCondition; label: string }[] = [
  { id: 'new', label: 'Mới 100% (Chưa bóc)' },
  { id: 'like-new', label: 'Like New (99%)' },
  { id: 'used', label: 'Đã qua sử dụng' },
  { id: 'broken', label: 'Cần sửa chữa nhẹ' },
];

export default function CreateProductScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);

  const [isFree, setIsFree] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('book');
  const [condition, setCondition] = useState<ProductCondition>('like-new');
  const [price, setPrice] = useState('35000');
  const [locationAddress, setLocationAddress] = useState(CAMPUS_PRODUCT_PRESETS[0].address);
  const [locationCoords, setLocationCoords] = useState({
    latitude: CAMPUS_PRODUCT_PRESETS[0].latitude,
    longitude: CAMPUS_PRODUCT_PRESETS[0].longitude,
  });
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const locationGeohash = useMemo(
    () => generateGeohash(locationCoords.latitude, locationCoords.longitude),
    [locationCoords]
  );

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    return isNaN(num) ? '0' : new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleSelectLocationPreset = (preset: CampusPreset) => {
    setLocationAddress(preset.address);
    setLocationCoords({ latitude: preset.latitude, longitude: preset.longitude });
  };

  const handleAddPhoto = () => {
    if (images.length >= 4) {
      Alert.alert('Giới hạn', 'Bạn chỉ có thể thêm tối đa 4 ảnh cho 1 sản phẩm.');
      return;
    }
    chooseImageWithPrompt(
      'Thêm ảnh sản phẩm',
      'Chọn ảnh từ thư viện hoặc chụp ảnh món đồ cần thanh lý.',
      (uri) => {
        setImages((prev) => (prev.length < 4 ? [...prev, uri] : prev));
      }
    );
  };

  const handleRemovePhoto = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleReset = () => {
    setTitle('');
    setPrice('0');
    setDescription('');
    setImages([]);
    setLocationAddress(CAMPUS_PRODUCT_PRESETS[0].address);
    setLocationCoords({
      latitude: CAMPUS_PRODUCT_PRESETS[0].latitude,
      longitude: CAMPUS_PRODUCT_PRESETS[0].longitude,
    });
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản sinh viên trước khi đăng bán đồ.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation?.navigate('Login') },
        ]
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món đồ muốn thanh lý.');
      return;
    }

    const priceNum = isFree ? 0 : parseInt(price.replace(/\D/g, ''), 10);
    if (!isFree && (isNaN(priceNum) || priceNum <= 0)) {
      Alert.alert(
        'Giá không hợp lệ',
        'Vui lòng nhập giá bán hoặc chọn hình thức "Tặng miễn phí 0đ".'
      );
      return;
    }

    if (!locationAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn hoặc nhập địa điểm xem/lấy đồ.');
      return;
    }

    setLoading(true);
    try {
      await createProduct(
        {
          title: title.trim(),
          description: description.trim(),
          price: priceNum,
          isFree,
          category,
          condition,
          location: {
            latitude: locationCoords.latitude,
            longitude: locationCoords.longitude,
            address: locationAddress.trim(),
          },
          imageUrls: images,
        },
        user
      );

      Alert.alert(
        'Đăng bài thành công! 🎉',
        'Món đồ của bạn đã được đăng lên Chợ đồ cũ sinh viên UniShare.',
        [
          {
            text: 'Về Chợ đồ cũ',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Đăng bài thất bại',
        error?.message || 'Không thể đăng sản phẩm lên hệ thống. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="x" size={24} color={colors.neutral.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng bán / Cho tặng đồ cũ</Text>
        <TouchableOpacity onPress={handleReset} disabled={loading}>
          <Text style={styles.resetText}>Làm mới</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 2. LISTING TYPE TOGGLE (BÁN HOẶC TẶNG) */}
          <View style={styles.typeSwitcherCard}>
            <TouchableOpacity
              style={[styles.typeOption, !isFree && styles.typeOptionActive]}
              onPress={() => setIsFree(false)}
            >
              <Feather
                name="dollar-sign"
                size={18}
                color={!isFree ? colors.secondary[600] : colors.neutral.textSecondary}
              />
              <Text style={[styles.typeOptionText, !isFree && styles.typeOptionTextActive]}>
                Bán thanh lý
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeOption, isFree && styles.typeOptionFreeActive]}
              onPress={() => {
                setIsFree(true);
                setPrice('0');
              }}
            >
              <Feather
                name="gift"
                size={18}
                color={isFree ? '#15803D' : colors.neutral.textSecondary}
              />
              <Text style={[styles.typeOptionText, isFree && styles.typeOptionFreeTextActive]}>
                Tặng miễn phí (0đ)
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3. PHOTO UPLOAD SECTION */}
          <View style={styles.formSection}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.fieldLabel}>Ảnh chụp món đồ ({images.length}/4)</Text>
              <Text style={styles.fieldHint}>Tối đa 4 ảnh</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
              {images.map((url, i) => (
                <View key={i} style={styles.photoWrap}>
                  <Image source={{ uri: url }} style={styles.photoImg} />
                  {i === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>Ảnh bìa</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.deletePhotoBtn}
                    onPress={() => handleRemovePhoto(i)}
                  >
                    <Feather name="x" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 4 && (
                <TouchableOpacity style={styles.addPhotoSlot} onPress={handleAddPhoto}>
                  <Feather name="camera" size={24} color={colors.secondary[600]} />
                  <Text style={styles.addPhotoSlotText}>Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <Text style={styles.geoMetaText}>Ảnh sẽ được tải lên Firebase Storage khi đăng bài</Text>
          </View>

          {/* 4. PRODUCT TITLE */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Tên món đồ / Tiêu đề (*)</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="VD: Giáo trình Giải tích 1, Nồi cơm Lock&Lock mini..."
                placeholderTextColor={colors.neutral.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={80}
              />
            </View>
          </View>

          {/* 5. CATEGORY */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Danh mục sản phẩm (*)</Text>
            <View style={styles.categoryWrap}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Feather
                      name={cat.icon}
                      size={14}
                      color={isSelected ? '#FFFFFF' : colors.neutral.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.categoryPillText,
                        isSelected && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 6. CONDITION */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Tình trạng hiện tại (*)</Text>
            <View style={styles.conditionGrid}>
              {CONDITIONS.map((cond) => {
                const isSelected = condition === cond.id;
                return (
                  <TouchableOpacity
                    key={cond.id}
                    style={[styles.conditionBtn, isSelected && styles.conditionBtnActive]}
                    onPress={() => setCondition(cond.id)}
                  >
                    <Text
                      style={[
                        styles.conditionBtnText,
                        isSelected && styles.conditionBtnTextActive,
                      ]}
                    >
                      {cond.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 7. PRICE */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Giá thanh lý (*)</Text>
            {isFree ? (
              <View style={styles.freeBannerBox}>
                <Feather name="gift" size={20} color="#15803D" />
                <Text style={styles.freeBannerText}>
                  Món đồ này sẽ được tặng miễn phí (0 đ) cho bạn sinh viên
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.priceInputBox}>
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="numeric"
                    value={formatCurrency(price)}
                    onChangeText={(val) => setPrice(val.replace(/\D/g, ''))}
                  />
                  <Text style={styles.priceCurrency}>VNĐ</Text>
                </View>

                {/* Quick Price Pills */}
                <View style={styles.quickPriceRow}>
                  {[20000, 35000, 50000, 100000].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={styles.quickPriceChip}
                      onPress={() => setPrice(p.toString())}
                    >
                      <Text style={styles.quickPriceText}>
                        {new Intl.NumberFormat('vi-VN').format(p)}đ
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* 8. MEETUP LOCATION */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Địa điểm giao dịch / Xem đồ (*)</Text>
            <View style={styles.inputWrap}>
              <Feather name="map-pin" size={16} color={colors.secondary[600]} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="VD: Sảnh Tòa B3 KTX Khu B, Cổng ĐH CNTT..."
                placeholderTextColor={colors.neutral.textMuted}
                value={locationAddress}
                onChangeText={setLocationAddress}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {CAMPUS_PRODUCT_PRESETS.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.quickLocChip}
                  onPress={() => handleSelectLocationPreset(loc)}
                >
                  <Text style={styles.quickLocText}>{loc.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.geoMetaText}>
              Tọa độ: {locationCoords.latitude.toFixed(4)}, {locationCoords.longitude.toFixed(4)} • Geohash: {locationGeohash}
            </Text>
          </View>

          {/* 9. DESCRIPTION */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Mô tả chi tiết sản phẩm</Text>
            <View style={styles.textAreaWrap}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Ghi rõ tình trạng, phụ kiện đi kèm, bảo hành hoặc lý do pass đồ..."
                placeholderTextColor={colors.neutral.textMuted}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 10. SUBMIT BUTTON */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : (
            <Feather name="check" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.submitBtnText}>
            {loading
              ? 'Đang tải ảnh & đăng bài...'
              : isFree
              ? 'Đăng tặng đồ miễn phí ngay'
              : 'Đăng bán đồ ngay'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  resetText: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[4],
  },
  typeSwitcherCard: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: borderRadius.xl,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  typeOptionActive: {
    backgroundColor: colors.neutral.surface,
    ...shadows.sm,
  },
  typeOptionFreeActive: {
    backgroundColor: '#DCFCE7',
    ...shadows.sm,
  },
  typeOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.textSecondary,
  },
  typeOptionTextActive: {
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary[600],
  },
  typeOptionFreeTextActive: {
    fontWeight: typography.fontWeight.bold,
    color: '#15803D',
  },
  formSection: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[2],
  },
  fieldHint: {
    fontSize: 11,
    color: colors.neutral.textMuted,
  },
  photoList: {
    flexDirection: 'row',
  },
  photoWrap: {
    width: 86,
    height: 86,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing[3],
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  coverBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.semantic.danger.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoSlot: {
    width: 86,
    height: 86,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.secondary[300],
    borderStyle: 'dashed',
    backgroundColor: colors.secondary[50],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoSlotText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary[600],
  },
  geoMetaText: {
    fontSize: 10,
    color: colors.neutral.textMuted,
    marginTop: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: spacing[3],
    height: 48,
  },
  input: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textPrimary,
    flex: 1,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  categoryPillActive: {
    backgroundColor: colors.secondary[500],
    borderColor: colors.secondary[500],
  },
  categoryPillText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  conditionBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  conditionBtnActive: {
    backgroundColor: '#FFEDD5',
    borderColor: colors.secondary[500],
  },
  conditionBtnText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  conditionBtnTextActive: {
    color: colors.secondary[700],
    fontWeight: typography.fontWeight.bold,
  },
  freeBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    gap: 8,
  },
  freeBannerText: {
    fontSize: typography.fontSize.xs,
    color: '#15803D',
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  priceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    height: 52,
  },
  priceInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: '#EA580C',
  },
  priceCurrency: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#C2410C',
  },
  quickPriceRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  quickPriceChip: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  quickPriceText: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  quickLocChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing[2],
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    marginRight: 6,
  },
  quickLocText: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
  },
  textAreaWrap: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing[3],
  },
  textArea: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
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
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    ...shadows.bottomSheet,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary[500],
    paddingVertical: 14,
    borderRadius: borderRadius.xl,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
