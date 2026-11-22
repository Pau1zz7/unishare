import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MapMarkerItem } from '../types';
import { colors, typography, borderRadius, shadows } from '../theme/tokens';

interface MapMarkerProps {
  item: MapMarkerItem;
  isSelected?: boolean;
  onPress: (item: MapMarkerItem) => void;
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  item,
  isSelected = false,
  onPress,
}) => {
  const formatShortPrice = (val?: number, isFree?: boolean) => {
    if (isFree) return '0đ';
    if (!val) return '';
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return `${val}đ`;
  };

  const getMarkerConfig = () => {
    switch (item.type) {
      case 'origin':
        return {
          bgColor: '#16A34A',
          borderColor: '#DCFCE7',
          icon: 'crosshair' as const,
          label: 'Điểm đi',
        };
      case 'destination':
        return {
          bgColor: '#DC2626',
          borderColor: '#FEE2E2',
          icon: 'map-pin' as const,
          label: 'Điểm đến',
        };
      case 'product':
        return {
          bgColor: item.isFree ? '#10B981' : colors.secondary[500],
          borderColor: '#FFFFFF',
          icon: 'shopping-bag' as const,
          label: formatShortPrice(item.bountyOrPrice, item.isFree),
        };
      case 'task':
      default:
        return {
          bgColor: colors.primary[600],
          borderColor: '#FFFFFF',
          icon: 'zap' as const,
          label: `+${formatShortPrice(item.bountyOrPrice)}`,
        };
    }
  };

  const config = getMarkerConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(item)}
      style={[styles.container, isSelected && styles.containerSelected]}
    >
      {/* Floating Tag (Bounty / Deviation Pill) */}
      <View
        style={[
          styles.pillBadge,
          isSelected && styles.pillBadgeSelected,
          item.type === 'origin' && styles.originBadge,
          item.type === 'destination' && styles.destBadge,
        ]}
      >
        {item.deviationMeters !== undefined && item.deviationMeters <= 300 && (
          <View style={styles.deviationMini}>
            <Text style={styles.deviationText}>🔥</Text>
          </View>
        )}
        <Text
          style={[
            styles.pillText,
            isSelected && styles.pillTextSelected,
            item.type === 'origin' && styles.originPillText,
            item.type === 'destination' && styles.destPillText,
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      </View>

      {/* Pin Body with Icon */}
      <View
        style={[
          styles.pinBody,
          { backgroundColor: config.bgColor, borderColor: config.borderColor },
          isSelected && styles.pinBodySelected,
        ]}
      >
        <Feather name={config.icon} size={14} color="#FFFFFF" />
      </View>

      {/* Pin Arrow Tip */}
      <View
        style={[
          styles.pinArrow,
          { borderTopColor: config.bgColor },
          isSelected && styles.pinArrowSelected,
        ]}
      />

      {/* Pulse Dot Underneath when selected */}
      {isSelected && <View style={styles.pulseShadow} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  containerSelected: {
    zIndex: 99,
    transform: [{ scale: 1.12 }],
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    marginBottom: 3,
    ...shadows.sm,
  },
  pillBadgeSelected: {
    backgroundColor: colors.neutral.textPrimary,
    borderColor: colors.neutral.textPrimary,
  },
  originBadge: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  destBadge: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  pillText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  originPillText: {
    color: '#15803D',
  },
  destPillText: {
    color: '#B91C1C',
  },
  deviationMini: {
    marginRight: 2,
  },
  deviationText: {
    fontSize: 9,
  },
  pinBody: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...shadows.md,
  },
  pinBodySelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  pinArrowSelected: {
    borderTopWidth: 7,
  },
  pulseShadow: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    marginTop: 2,
  },
});
