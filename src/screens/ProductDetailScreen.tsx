import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Product } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

const DEFAULT_PRODUCT: Product = {
  productId: 'p1',
  title: 'Giáo trình Giải tích 1 & Đại số tuyến tính ĐHQG TP.HCM',
  description:
    'Sách do Nhà xuất bản ĐHQG ấn hành, còn mới 95%, không rách bìa hay viết bậy. Đã highlight các công thức quan trọng và phương pháp giải đề thi cuối kỳ. Tặng kèm tập photo đề thi mẫu có đáp án chi tiết các năm trước cho bạn nào nhiệt tình mua sớm.',
  price: 35000,
  isFree: false,
  category: 'book',
  condition: 'like-new',
  imageUrls: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80',
  ],
  sellerId: 'u10',
  sellerName: 'Vũ Thị Ngọc',
  sellerTrustScore: 4.9,
  location: {
    latitude: 10.88,
    longitude: 106.78,
    address: 'Sảnh Tòa BA4, KTX Khu B ĐHQG TP.HCM',
  },
  distanceKm: 0.6,
  status: 'available',
  createdAt: Date.now() - 35 * 60 * 1000,
};

export default function ProductDetailScreen({ route, navigation }: any) {
  const product: Product = route?.params?.product || DEFAULT_PRODUCT;
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'Mới 100% (Chưa dùng)';
      case 'like-new':
        return 'Like New (99%)';
      case 'used':
        return 'Đã qua sử dụng';
      case 'broken':
        return 'Cần sửa chữa nhẹ';
      default:
        return 'Tốt';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'book':
        return 'Giáo trình & Sách';
      case 'electronic':
        return 'Đồ điện tử';
      case 'furniture':
        return 'Đồ dùng KTX';
      case 'clothing':
        return 'Thời trang';
      default:
        return 'Khác';
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `[UniShare Chợ Cũ] ${product.title} - Giá: ${
          product.isFree ? 'Miễn phí' : formatCurrency(product.price)
        }. Xem ngay trên UniShare!`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleMakeOffer = () => {
    Alert.prompt
      ? Alert.prompt('Đề xuất giá mới', 'Nhập mức giá bạn muốn mặc cả (VNĐ):', [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Gửi đề xuất',
            onPress: (val) =>
              Alert.alert('Thành công', `Đã gửi đề xuất ${val}đ đến người bán!`),
          },
        ])
      : Alert.alert('Đề xuất giá', 'Chức năng gửi giá đề xuất nhanh đến người bán qua khung chat.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. TOP NAV OVERLAY */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={colors.neutral.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.navTitle} numberOfLines={1}>
          Chi tiết sản phẩm
        </Text>

        <View style={styles.navRightActions}>
          <TouchableOpacity
            style={[styles.navBtn, { marginRight: 8 }]}
            onPress={() => setIsBookmarked(!isBookmarked)}
          >
            <Feather
              name="bookmark"
              size={20}
              color={isBookmarked ? colors.secondary[500] : colors.neutral.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Feather name="share-2" size={20} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. IMAGE GALLERY HERO */}
        <View style={styles.galleryCard}>
          <Image
            source={{
              uri:
                product.imageUrls && product.imageUrls.length > 0
                  ? product.imageUrls[activeImgIndex]
                  : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Badges on image */}
          <View style={styles.imageOverlayBadges}>
            {product.isFree ? (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>TẶNG MIỄN PHÍ 0Đ</Text>
              </View>
            ) : (
              <View style={styles.conditionTag}>
                <Text style={styles.conditionTagText}>
                  {getConditionLabel(product.condition)}
                </Text>
              </View>
            )}

            {product.imageUrls && product.imageUrls.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {activeImgIndex + 1}/{product.imageUrls.length}
                </Text>
              </View>
            )}
          </View>

          {/* Thumbnails row if multiple */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <View style={styles.thumbnailRow}>
              {product.imageUrls.map((url, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.thumbnailWrap,
                    activeImgIndex === i && styles.thumbnailActive,
                  ]}
                  onPress={() => setActiveImgIndex(i)}
                >
                  <Image source={{ uri: url }} style={styles.thumbnailImg} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 3. PRODUCT INFO CARD */}
        <View style={styles.card}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{getCategoryLabel(product.category)}</Text>
            <Text style={styles.postTimeText}>30 phút trước</Text>
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>

          <View style={styles.priceRow}>
            {product.isFree ? (
              <Text style={styles.freePriceBig}>0 đ (Tặng miễn phí)</Text>
            ) : (
              <View style={styles.priceContainer}>
                <Text style={styles.priceBig}>{formatCurrency(product.price)}</Text>
                <View style={styles.dealBadge}>
                  <Text style={styles.dealBadgeText}>Giá sinh viên</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 4. SELLER INFO CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin người bán</Text>
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatarWrap}>
              {product.sellerAvatar ? (
                <Image source={{ uri: product.sellerAvatar }} style={styles.sellerAvatar} />
              ) : (
                <View style={styles.sellerAvatarFallback}>
                  <Text style={styles.sellerAvatarLetter}>
                    {product.sellerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.sellerMeta}>
              <View style={styles.sellerNameLine}>
                <Text style={styles.sellerName}>{product.sellerName}</Text>
                <Feather name="check-circle" size={14} color={colors.primary[600]} />
              </View>
              <View style={styles.sellerScoreLine}>
                <Feather name="star" size={12} color="#D97706" />
                <Text style={styles.sellerRating}>
                  {product.sellerTrustScore ? product.sellerTrustScore.toFixed(1) : '4.9'}
                </Text>
                <Text style={styles.sellerTrades}> (18 giao dịch uy tín)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewShopBtn}
              onPress={() => navigation?.navigate('Profile', { userId: product.sellerId })}
            >
              <Text style={styles.viewShopText}>Xem hồ sơ</Text>
              <Feather name="chevron-right" size={14} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. LOCATION & PICKUP POINT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Địa điểm giao dịch</Text>
          <View style={styles.locationBox}>
            <View style={styles.locationIconWrap}>
              <Feather name="map-pin" size={20} color={colors.secondary[600]} />
            </View>
            <View style={styles.locationTextCol}>
              <Text style={styles.locationAddress}>{product.location.address}</Text>
              <Text style={styles.locationDistance}>
                Cách bạn ~{product.distanceKm || 0.6} km • Giao dịch trực tiếp tại sảnh KTX
              </Text>
            </View>
          </View>
        </View>

        {/* 6. DESCRIPTION DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionBody}>{product.description}</Text>

          <View style={styles.studentTip}>
            <Feather name="info" size={16} color={colors.secondary[600]} />
            <Text style={styles.studentTipText}>
              UniShare khuyến khích bạn kiểm tra kỹ đồ dùng trực tiếp tại sảnh KTX hoặc quán cà phê trước khi chuyển khoản.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 7. FIXED BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        {!product.isFree && (
          <TouchableOpacity
            style={styles.offerBtn}
            onPress={handleMakeOffer}
            activeOpacity={0.8}
          >
            <Feather name="tag" size={18} color={colors.secondary[600]} />
            <Text style={styles.offerBtnText}>Trả giá</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.chatSellerBtn}
          onPress={() =>
            navigation?.navigate('ChatRoom', {
              partnerName: product.sellerName,
              productTitle: product.title,
              price: product.price,
            })
          }
          activeOpacity={0.85}
        >
          <Feather name="message-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.chatSellerBtnText}>Nhắn tin cho người bán</Text>
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
  navTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  galleryCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.card,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#F1F5F9',
  },
  imageOverlayBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freeBadge: {
    backgroundColor: colors.secondary[500],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
  },
  freeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  conditionTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
  },
  conditionTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
  },
  imageCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  thumbnailRow: {
    flexDirection: 'row',
    padding: spacing[3],
    gap: spacing[2],
  },
  thumbnailWrap: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: colors.primary[600],
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  categoryText: {
    fontSize: 11,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  postTimeText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textMuted,
  },
  productTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    lineHeight: 26,
    marginVertical: spacing[1],
  },
  priceRow: {
    marginTop: spacing[2],
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  priceBig: {
    fontSize: 26,
    fontWeight: typography.fontWeight.bold,
    color: '#EA580C',
  },
  dealBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  dealBadgeText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#C2410C',
  },
  freePriceBig: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.DEFAULT,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[3],
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
  },
  sellerAvatar: {
    width: '100%',
    height: '100%',
  },
  sellerAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarLetter: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary[700],
  },
  sellerMeta: {
    flex: 1,
    marginLeft: spacing[3],
  },
  sellerNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  sellerScoreLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  sellerRating: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: '#92400E',
    marginLeft: 2,
  },
  sellerTrades: {
    fontSize: 11,
    color: colors.neutral.textMuted,
  },
  viewShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewShopText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  locationTextCol: {
    flex: 1,
  },
  locationAddress: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
  },
  locationDistance: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  descriptionBody: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textSecondary,
    lineHeight: 22,
  },
  studentTip: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginTop: spacing[3],
    gap: 8,
  },
  studentTipText: {
    flex: 1,
    fontSize: 11,
    color: '#9A3412',
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
  offerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.secondary[50],
    borderWidth: 1,
    borderColor: colors.secondary[200],
    gap: 4,
  },
  offerBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary[600],
  },
  chatSellerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.secondary[500],
  },
  chatSellerBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
