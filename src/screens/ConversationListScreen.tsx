import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useConversations } from '../features/chat/hooks/useChat';
import { Conversation } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

const formatConversationTime = (timestamp: number): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút`;

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

export default function ConversationListScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { conversations, loading, error } = useConversations(user?.uid);
  const [searchQuery, setSearchQuery] = useState('');

  const getPartnerDetails = (conversation: Conversation) => {
    const partnerId =
      conversation.participantIds.find((id) => id !== user?.uid) ||
      conversation.participantIds[0] ||
      '';
    const info = conversation.participants?.[partnerId];
    return {
      partnerId,
      partnerName: info?.displayName || 'Sinh viên UniShare',
      partnerAvatar: info?.avatarUrl || null,
    };
  };

  const filteredConversations = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((conv) => {
      const { partnerName } = getPartnerDetails(conv);
      return (
        partnerName.toLowerCase().includes(keyword) ||
        (conv.lastMessage || '').toLowerCase().includes(keyword) ||
        (conv.relatedTitle || '').toLowerCase().includes(keyword)
      );
    });
  }, [conversations, searchQuery, user?.uid]);

  const handleOpenChat = (conversation: Conversation) => {
    const { partnerId, partnerName, partnerAvatar } = getPartnerDetails(conversation);
    navigation.navigate('ChatRoom', {
      conversationId: conversation.conversationId,
      partnerId,
      partnerName,
      partnerAvatar,
      relatedType: conversation.relatedType,
      relatedId: conversation.relatedId,
      relatedTitle: conversation.relatedTitle,
    });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const { partnerName, partnerAvatar } = getPartnerDetails(item);
    const isMyLastMessage = item.lastSenderId === user?.uid;
    const previewText = item.lastMessage
      ? `${isMyLastMessage ? 'Bạn: ' : ''}${item.lastMessage}`
      : 'Bắt đầu cuộc trò chuyện...';

    return (
      <TouchableOpacity
        style={styles.itemCard}
        activeOpacity={0.75}
        onPress={() => handleOpenChat(item)}
      >
        <View style={styles.avatarWrap}>
          {partnerAvatar ? (
            <Image source={{ uri: partnerAvatar }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>
                {partnerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.itemBody}>
          <View style={styles.itemTopRow}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {partnerName}
            </Text>
            <Text style={styles.timeText}>
              {formatConversationTime(item.lastMessageAt)}
            </Text>
          </View>

          {item.relatedTitle ? (
            <View style={styles.contextPill}>
              <Feather
                name={item.relatedType === 'product' ? 'shopping-bag' : 'zap'}
                size={11}
                color={
                  item.relatedType === 'product'
                    ? colors.secondary[600]
                    : colors.primary[600]
                }
              />
              <Text style={styles.contextText} numberOfLines={1}>
                {item.relatedTitle}
              </Text>
            </View>
          ) : null}

          <Text style={styles.lastMessage} numberOfLines={1}>
            {previewText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{conversations.length}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.neutral.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên hoặc tiêu đề bài đăng..."
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

      {error ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={16} color={colors.semantic.danger.DEFAULT} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Đang đồng bộ tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.conversationId}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Feather name="message-circle" size={36} color={colors.primary[600]} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={styles.emptySubtitle}>
                Bấm "Nhắn tin" trong bài đăng Việc vặt hoặc Chợ đồ cũ để trao đổi trực tiếp với sinh viên khác.
              </Text>
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
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    gap: spacing[2],
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  countBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  searchWrap: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: spacing[4],
    marginBottom: spacing[2],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.semantic.danger.DEFAULT,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
    flexGrow: 1,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  avatarWrap: {
    marginRight: spacing[3],
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  itemBody: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  partnerName: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginRight: spacing[2],
  },
  timeText: {
    fontSize: 11,
    color: colors.neutral.textMuted,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
    marginBottom: 4,
    gap: 4,
    maxWidth: '100%',
  },
  contextText: {
    fontSize: 11,
    color: colors.neutral.textSecondary,
    fontWeight: typography.fontWeight.medium,
    flexShrink: 1,
  },
  lastMessage: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: 64,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  emptyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[1],
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});