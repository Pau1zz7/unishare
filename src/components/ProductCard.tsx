import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Product } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onBookmark?: (product: Product) => void;
  isBookmarked?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onBookmark,
  isBookmarked = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'Mới 100%';
      case 'like-new':
        return 'Like New (99%)';
      case 'used':
        return 'Đã qua sử dụng';
      case 'broken':
        return 'Cần sửa chữa';
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

  const primaryImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(product)}
      style={styles.card}
    >
      {/* Product Image & Badges */}
      <View style={styles.imageContainer}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="image" size={32} color={colors.neutral.disabled} />
          </View>
        )}

        {/* Free Badge */}
        {product.isFree ? (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>TẶNG 0Đ</Text>
          </View>
        ) : (
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{getConditionLabel(product.condition)}</Text>
          </View>
        )}

        {/* Bookmark Button */}
        {onBookmark && (
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => onBookmark(product)}
            activeOpacity={0.7}
          >
            <Feather
              name="bookmark"
              size={14}
              color={isBookmarked ? colors.secondary[500] : colors.neutral.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.category}>{getCategoryLabel(product.category)}</Text>
        
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Price */}
        <View style={styles.priceRow}>
          {product.isFree ? (
            <Text style={styles.freePrice}>Miễn phí</Text>
          ) : (
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          )}
        </View>

        {/* Location & Seller */}
        <View style={styles.footerRow}>
          <View style={styles.locationContainer}>
            <Feather name="map-pin" size={11} color={colors.neutral.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {product.location.address}
              {product.distanceKm !== undefined ? ` • ${product.distanceKm}km` : ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    margin: spacing[1],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
  },
  freeBadge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    backgroundColor: colors.secondary[500],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
  },
  freeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  conditionBadge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
  },
  conditionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: typography.fontWeight.medium,
  },
  bookmarkButton: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing[3],
    flex: 1,
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 11,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textPrimary,
    lineHeight: 18,
    minHeight: 36,
  },
  priceRow: {
    marginVertical: spacing[1],
  },
  price: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#EA580C',
  },
  freePrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.semantic.success.DEFAULT,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    flex: 1,
  },
});
