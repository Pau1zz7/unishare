import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfile } from '../features/reviews/hooks/useReviews';
import { submitReview } from '../features/reviews/services/reviewService';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

const QUICK_TAGS = [
  '⏱️ Đúng giờ',
  '😊 Thân thiện & Lịch sự',
  '📦 Giữ đồ cẩn thận',
  '⚡ Giao siêu nhanh',
  '🤝 Nhiệt tình hỗ trợ',
  '💯 Đúng thỏa thuận',
];

const RATING_LABELS: { [key: number]: { text: string; color: string } } = {
  1: { text: 'Rất không hài lòng 😞', color: '#DC2626' },
  2: { text: 'Chưa tốt, cần cải thiện 🙁', color: '#EA580C' },
  3: { text: 'Bình thường / Tạm ổn 😐', color: '#D97706' },
  4: { text: 'Hài lòng, dịch vụ tốt 😊', color: '#059669' },
  5: { text: 'Tuyệt vời! Rất uy tín & chuyên nghiệp 🎉', color: '#16A34A' },
};

export default function ReviewRatingScreen({ route, navigation }: any) {
  const reviewer = useAuthStore((state) => state.user);

  const targetUserId: string | undefined = route?.params?.targetUserId;
  const paramTargetName: string | undefined = route?.params?.targetUserName;
  const paramTargetAvatar: string | null = route?.params?.targetUserAvatar ?? null;
  const relatedType: 'task' | 'product' | 'tutor' = route?.params?.relatedType || 'task';
  const relatedId: string | undefined = route?.params?.relatedId;
  const relatedTitle: string = route?.params?.relatedTitle || 'Giao dịch trên UniShare';

  const { profile: targetProfile } = useUserProfile(targetUserId);

  const partnerName =
    targetProfile?.displayName || paramTargetName || 'Thành viên UniShare';
  const partnerAvatar = targetProfile?.avatarUrl ?? paramTargetAvatar;
  const partnerCampus = targetProfile?.university || 'Thành viên UniShare';

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⏱️ Đúng giờ',
    '😊 Thân thiện & Lịch sự',
  ]);
  const [comment, setComment] = useState('');
  const [isPublicIdentity, setIsPublicIdentity] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = async () => {
    if (!reviewer?.uid) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản sinh viên để gửi đánh giá.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation?.navigate('Login') },
        ]
      );
      return;
    }

    if (!targetUserId || !relatedId) {
      Alert.alert(
        'Thiếu thông tin giao dịch',
        'Không xác định được đối tác hoặc công việc cần đánh giá.'
      );
      return;
    }

    if (rating === 0) {
      Alert.alert('Chưa chọn sao', 'Vui lòng chọn mức độ hài lòng từ 1 đến 5 sao.');
      return;
    }

    setSubmitting(true);
    try {
      await submitReview(
        {
          targetUserId,
          targetUserName: partnerName,
          rating,
          comment,
          tags: selectedTags,
          relatedType,
          relatedTitle,
          relatedId,
        },
        reviewer,
        isPublicIdentity
      );

      Alert.alert(
        'Đánh giá thành công! 🌟',
        `Cảm ơn bạn! Đánh giá ${rating} sao đã được lưu và cập nhật vào điểm uy tín (Trust Score) của ${partnerName}.`,
        [
          {
            text: 'Xong',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Không thể gửi đánh giá',
        err?.message || 'Đã có lỗi xảy ra khi lưu đánh giá. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!targetUserId || !relatedId) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="x" size={24} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá giao dịch</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.invalidState}>
          <Feather name="alert-circle" size={48} color={colors.neutral.disabled} />
          <Text style={styles.invalidTitle}>Chưa có giao dịch để đánh giá</Text>
          <Text style={styles.invalidSub}>
            Vui lòng mở đánh giá từ một công việc đã hoàn thành (status: completed).
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. TOP HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="x" size={24} color={colors.neutral.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá giao dịch</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 2. PARTNER HERO CARD */}
          <View style={styles.partnerCard}>
            <View style={styles.partnerAvatarWrap}>
              {partnerAvatar ? (
                <Image source={{ uri: partnerAvatar }} style={styles.partnerAvatar} />
              ) : (
                <View style={styles.partnerAvatarFallback}>
                  <Text style={styles.partnerAvatarText}>
                    {partnerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.partnerName}>{partnerName}</Text>
            <Text style={styles.partnerCampus}>{partnerCampus}</Text>

            {/* Related task tag */}
            <View style={styles.transactionTag}>
              <Feather
                name={relatedType === 'product' ? 'shopping-bag' : 'package'}
                size={13}
                color={colors.primary[600]}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.transactionTitle} numberOfLines={1}>
                {relatedTitle}
              </Text>
            </View>
          </View>

          {/* 3. INTERACTIVE 5-STAR RATING BLOCK */}
          <View style={styles.ratingCard}>
            <Text style={styles.ratingPrompt}>Bạn thấy trải nghiệm thế nào?</Text>

            {/* Star icons */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={styles.starTouch}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="star"
                    size={38}
                    color={star <= rating ? '#F59E0B' : '#E2E8F0'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Dynamic Label */}
            <View style={styles.ratingLabelBox}>
              <Text
                style={[
                  styles.ratingLabelText,
                  { color: RATING_LABELS[rating]?.color || '#F59E0B' },
                ]}
              >
                {RATING_LABELS[rating]?.text}
              </Text>
            </View>
          </View>

          {/* 4. QUICK TAGS SELECTION */}
          <View style={styles.tagsCard}>
            <Text style={styles.sectionTitle}>Điểm bạn ấn tượng nhất:</Text>
            <View style={styles.tagGrid}>
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagPill, isSelected && styles.tagPillActive]}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tagPillText,
                        isSelected && styles.tagPillTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. COMMENT TEXT AREA */}
          <View style={styles.commentCard}>
            <View style={styles.commentHeaderRow}>
              <Text style={styles.sectionTitle}>Nhận xét thêm (tùy chọn):</Text>
              <Text style={styles.charCount}>{comment.length}/300</Text>
            </View>

            <View style={styles.textAreaWrap}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                maxLength={300}
                placeholder="Chia sẻ vài lời cảm nhận về bạn học này (VD: Bạn giao đồ rất cẩn thận, đúng giờ dù trời mưa to...)"
                placeholderTextColor={colors.neutral.textMuted}
                value={comment}
                onChangeText={setComment}
              />
            </View>
          </View>

          {/* 6. VERIFICATION & TRUST ADVISORY */}
          <View style={styles.advisoryCard}>
            <TouchableOpacity
              style={styles.identityRow}
              onPress={() => setIsPublicIdentity(!isPublicIdentity)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  isPublicIdentity && styles.checkboxActive,
                ]}
              >
                {isPublicIdentity && <Feather name="check" size={12} color="#FFFFFF" />}
              </View>
              <Text style={styles.identityText}>
                Hiển thị tên sinh viên của bạn cùng đánh giá
              </Text>
            </TouchableOpacity>

            <View style={styles.trustInfoRow}>
              <Feather name="shield" size={14} color={colors.primary[600]} style={{ marginTop: 2 }} />
              <Text style={styles.trustInfoText}>
                Đánh giá uy tín sinh viên được bảo vệ bởi UniShare. Đánh giá công tâm giúp xây dựng cộng đồng hỗ trợ an toàn và tin cậy.
              </Text>
            </View>
          </View>

          <View style={{ height: 90 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 7. FIXED BOTTOM SUBMIT BUTTON */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmitReview}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : (
            <Feather name="send" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.submitBtnText}>
            {submitting ? 'Đang gửi đánh giá...' : 'Gửi đánh giá uy tín'}
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
  invalidState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    gap: spacing[3],
  },
  invalidTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  invalidSub: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  backBtn: {
    marginTop: spacing[2],
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  partnerCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  partnerAvatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  partnerAvatar: {
    width: '100%',
    height: '100%',
  },
  partnerAvatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerAvatarText: {
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  partnerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  partnerCampus: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  transactionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginTop: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
    maxWidth: '95%',
  },
  transactionTitle: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
  },
  ratingCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  ratingPrompt: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.textSecondary,
    marginBottom: spacing[3],
  },
  starRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing[2],
  },
  starTouch: {
    padding: 2,
  },
  ratingLabelBox: {
    marginTop: spacing[2],
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  ratingLabelText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  tagsCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[3],
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tagPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  tagPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  tagPillText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  tagPillTextActive: {
    color: '#065F46',
    fontWeight: typography.fontWeight.bold,
  },
  commentCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  charCount: {
    fontSize: 11,
    color: colors.neutral.textMuted,
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
  advisoryCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: spacing[3],
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.neutral.disabled,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  identityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.textPrimary,
  },
  trustInfoRow: {
    flexDirection: 'row',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    gap: 8,
  },
  trustInfoText: {
    flex: 1,
    fontSize: 11,
    color: colors.primary[800],
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
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    ...shadows.bottomSheet,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
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
