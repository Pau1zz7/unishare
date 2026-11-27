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
import { TaskCategory, TaskPaymentMethod } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { createTask } from '../features/tasks/services/taskService';
import { chooseImageWithPrompt } from '../lib/image/imagePickerHelper';
import {
  CAMPUS_DELIVERY_PRESETS,
  CAMPUS_PICKUP_PRESETS,
  CampusPreset,
  DEFAULT_CAMPUS_COORDS,
  generateGeohash,
} from '../lib/location/locationService';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

const CATEGORIES: { id: TaskCategory; label: string; icon: any }[] = [
  { id: 'delivery', label: 'Giao nhận hộ', icon: 'package' },
  { id: 'food', label: 'Mua đồ ăn', icon: 'coffee' },
  { id: 'print', label: 'In ấn photo', icon: 'file-text' },
  { id: 'study', label: 'Gia sư / Học tập', icon: 'book-open' },
  { id: 'other', label: 'Việc khác', icon: 'grid' },
];

const QUICK_BOUNTIES = [20000, 30000, 50000, 80000];

export default function CreateTaskScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);

  const [category, setCategory] = useState<TaskCategory>('delivery');
  const [title, setTitle] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState(DEFAULT_CAMPUS_COORDS);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState({
    latitude: 10.8812,
    longitude: 106.7828,
  });
  const [bounty, setBounty] = useState('25000');
  const [paymentMethod, setPaymentMethod] = useState<TaskPaymentMethod>('transfer');
  const [deadline, setDeadline] = useState('Trước 18h hôm nay');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickupGeohash = useMemo(
    () => generateGeohash(pickupCoords.latitude, pickupCoords.longitude),
    [pickupCoords]
  );
  const deliveryGeohash = useMemo(
    () => generateGeohash(deliveryCoords.latitude, deliveryCoords.longitude),
    [deliveryCoords]
  );

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    return isNaN(num) ? '0' : new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleSelectPickupPreset = (preset: CampusPreset) => {
    setPickupAddress(preset.address);
    setPickupCoords({ latitude: preset.latitude, longitude: preset.longitude });
  };

  const handleSelectDeliveryPreset = (preset: CampusPreset) => {
    setDeliveryAddress(preset.address);
    setDeliveryCoords({ latitude: preset.latitude, longitude: preset.longitude });
  };

  const handleAddImage = () => {
    if (images.length >= 3) {
      Alert.alert('Giới hạn', 'Bạn chỉ có thể tải lên tối đa 3 ảnh.');
      return;
    }
    chooseImageWithPrompt(
      'Tải ảnh lên',
      'Chọn ảnh từ thư viện hoặc chụp ảnh kiện hàng / hóa đơn minh họa.',
      (uri) => {
        setImages((prev) => (prev.length < 3 ? [...prev, uri] : prev));
      }
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setTitle('');
    setPickupAddress('');
    setPickupCoords(DEFAULT_CAMPUS_COORDS);
    setDeliveryAddress('');
    setDeliveryCoords({ latitude: 10.8812, longitude: 106.7828 });
    setBounty('25000');
    setDescription('');
    setImages([]);
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản sinh viên trước khi đăng việc.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation?.navigate('Login') },
        ]
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề việc cần nhờ.');
      return;
    }
    if (!pickupAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa điểm lấy đồ/hàng.');
      return;
    }
    if (!deliveryAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa điểm giao đến.');
      return;
    }
    const bountyNum = parseInt(bounty.replace(/\D/g, ''), 10);
    if (isNaN(bountyNum) || bountyNum < 10000) {
      Alert.alert('Thù lao không hợp lệ', 'Mức thù lao tối thiểu cho bạn sinh viên là 10.000 đ.');
      return;
    }

    setLoading(true);
    try {
      await createTask(
        {
          title: title.trim(),
          description: description.trim(),
          bounty: bountyNum,
          paymentMethod,
          category,
          deadline,
          pickupLocation: {
            latitude: pickupCoords.latitude,
            longitude: pickupCoords.longitude,
            address: pickupAddress.trim(),
          },
          deliveryLocation: {
            latitude: deliveryCoords.latitude,
            longitude: deliveryCoords.longitude,
            address: deliveryAddress.trim(),
          },
          imageUrls: images,
        },
        user
      );

      Alert.alert(
        'Đăng việc thành công! 🚀',
        'Công việc của bạn đã được lưu và hiển thị ngay trên Bảng tin sinh viên.',
        [
          {
            text: 'Về Bảng tin',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Đăng việc thất bại',
        error?.message || 'Không thể đăng công việc lên hệ thống. Vui lòng thử lại.'
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
        <Text style={styles.headerTitle}>Đăng việc vặt cần nhờ</Text>
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
          {/* 2. CATEGORY SELECTOR */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Danh mục công việc (*)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={cat.icon}
                      size={15}
                      color={isSelected ? '#FFFFFF' : colors.neutral.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 3. TASK TITLE */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Tiêu đề việc cần nhờ (*)</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="VD: Nhận hộ kiện hàng Shopee cổng 1 KTX B..."
                placeholderTextColor={colors.neutral.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={90}
              />
            </View>
            <Text style={styles.helperText}>Tiêu đề ngắn gọn, nêu rõ tên việc và địa điểm</Text>
          </View>

          {/* 4. PICKUP & DELIVERY LOCATIONS */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Lộ trình lấy & giao hàng (*)</Text>

            {/* Pickup */}
            <View style={styles.locationInputBox}>
              <View style={[styles.locIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Feather name="arrow-up-right" size={16} color="#0284C7" />
              </View>
              <TextInput
                style={styles.locInput}
                placeholder="Điểm lấy hàng (quán, cổng KTX...)"
                placeholderTextColor={colors.neutral.textMuted}
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
            </View>

            {/* Quick Pickup Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickLocScroll}>
              {CAMPUS_PICKUP_PRESETS.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.quickLocChip}
                  onPress={() => handleSelectPickupPreset(loc)}
                >
                  <Text style={styles.quickLocText}>{loc.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.geoMetaText}>
              Tọa độ lấy: {pickupCoords.latitude.toFixed(4)}, {pickupCoords.longitude.toFixed(4)} • Geohash: {pickupGeohash}
            </Text>

            <View style={{ height: 12 }} />

            {/* Delivery */}
            <View style={styles.locationInputBox}>
              <View style={[styles.locIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Feather name="map-pin" size={16} color="#16A34A" />
              </View>
              <TextInput
                style={styles.locInput}
                placeholder="Điểm giao đến (phòng KTX, tòa nhà...)"
                placeholderTextColor={colors.neutral.textMuted}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
            </View>

            {/* Quick Delivery Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickLocScroll}>
              {CAMPUS_DELIVERY_PRESETS.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.quickLocChip}
                  onPress={() => handleSelectDeliveryPreset(loc)}
                >
                  <Text style={styles.quickLocText}>{loc.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.geoMetaText}>
              Tọa độ giao: {deliveryCoords.latitude.toFixed(4)}, {deliveryCoords.longitude.toFixed(4)} • Geohash: {deliveryGeohash}
            </Text>
          </View>

          {/* 5. BOUNTY & PAYMENT METHOD */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Thù lao đề xuất (*)</Text>
            <View style={styles.bountyInputBox}>
              <TextInput
                style={styles.bountyInput}
                keyboardType="numeric"
                value={formatCurrency(bounty)}
                onChangeText={(val) => setBounty(val.replace(/\D/g, ''))}
              />
              <Text style={styles.currencySuffix}>VNĐ</Text>
            </View>

            {/* Quick Bounty Options */}
            <View style={styles.quickBountyRow}>
              {QUICK_BOUNTIES.map((amt) => {
                const isSelected = parseInt(bounty, 10) === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickBountyChip, isSelected && styles.quickBountyChipActive]}
                    onPress={() => setBounty(amt.toString())}
                  >
                    <Text
                      style={[
                        styles.quickBountyText,
                        isSelected && styles.quickBountyTextActive,
                      ]}
                    >
                      {new Intl.NumberFormat('vi-VN').format(amt)}đ
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Payment Method Radio */}
            <Text style={[styles.fieldLabel, { marginTop: spacing[3] }]}>
              Phương thức thanh toán
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioItem,
                  paymentMethod === 'transfer' && styles.radioItemActive,
                ]}
                onPress={() => setPaymentMethod('transfer')}
              >
                <Feather
                  name="credit-card"
                  size={16}
                  color={paymentMethod === 'transfer' ? colors.primary[600] : colors.neutral.textMuted}
                />
                <Text
                  style={[
                    styles.radioText,
                    paymentMethod === 'transfer' && styles.radioTextActive,
                  ]}
                >
                  Chuyển khoản (MoMo/Bank)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioItem,
                  paymentMethod === 'cash' && styles.radioItemActive,
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Feather
                  name="dollar-sign"
                  size={16}
                  color={paymentMethod === 'cash' ? colors.primary[600] : colors.neutral.textMuted}
                />
                <Text
                  style={[
                    styles.radioText,
                    paymentMethod === 'cash' && styles.radioTextActive,
                  ]}
                >
                  Tiền mặt khi giao
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 6. DEADLINE / TIME */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Thời gian hoàn thành</Text>
            <View style={styles.deadlineRow}>
              {['Gấp trong 1h', 'Trước 18h hôm nay', 'Tối nay', 'Linh hoạt'].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.deadlineChip, deadline === d && styles.deadlineChipActive]}
                  onPress={() => setDeadline(d)}
                >
                  <Text
                    style={[
                      styles.deadlineChipText,
                      deadline === d && styles.deadlineChipTextActive,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 7. IMAGES UPLOAD */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Ảnh đính kèm ({images.length}/3)</Text>
            <View style={styles.imagesRow}>
              {images.map((url, i) => (
                <View key={i} style={styles.imageThumbBox}>
                  <Image source={{ uri: url }} style={styles.imageThumb} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => handleRemoveImage(i)}
                  >
                    <Feather name="x" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 3 && (
                <TouchableOpacity style={styles.uploadBox} onPress={handleAddImage}>
                  <Feather name="camera" size={24} color={colors.primary[600]} />
                  <Text style={styles.uploadText}>+ Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.helperText}>Ảnh sẽ được tải lên Firebase Storage khi đăng bài</Text>
          </View>

          {/* 8. DESCRIPTION */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Mô tả chi tiết & Ghi chú</Text>
            <View style={styles.textAreaWrap}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Ghi chú thêm: Cân nặng kiện hàng, số phòng, liên hệ hoặc lưu ý khác..."
                placeholderTextColor={colors.neutral.textMuted}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 9. SUBMIT BUTTON */}
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
            {loading ? 'Đang tải ảnh & đăng tin...' : 'Đăng việc vặt ngay'}
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
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[4],
  },
  formSection: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[2],
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.background,
    marginRight: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  categoryChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  inputWrap: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: spacing[3],
    height: 48,
    justifyContent: 'center',
  },
  input: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textPrimary,
  },
  helperText: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 6,
  },
  locationInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: spacing[3],
    height: 48,
  },
  locIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  locInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textPrimary,
  },
  quickLocScroll: {
    marginTop: 6,
  },
  quickLocChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    marginRight: 6,
  },
  quickLocText: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
  },
  geoMetaText: {
    fontSize: 10,
    color: colors.neutral.textMuted,
    marginTop: 4,
  },
  bountyInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    height: 52,
  },
  bountyInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.dark,
  },
  currencySuffix: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.text,
  },
  quickBountyRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  quickBountyChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  quickBountyChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  quickBountyText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textSecondary,
  },
  quickBountyTextActive: {
    color: '#15803D',
    fontWeight: typography.fontWeight.bold,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  radioItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: 6,
  },
  radioItemActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  radioText: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  radioTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.bold,
  },
  deadlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  deadlineChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  deadlineChipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  deadlineChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
  },
  deadlineChipTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  uploadBox: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderStyle: 'dashed',
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  uploadText: {
    fontSize: 10,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.bold,
  },
  imageThumbBox: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.semantic.danger.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: colors.primary[600],
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
