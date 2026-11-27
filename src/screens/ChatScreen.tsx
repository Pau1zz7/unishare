import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useChatMessages, useOpenConversation } from '../features/chat/hooks/useChat';
import { Message } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';

const QUICK_REPLIES = [
  'Chào bạn, bài này còn không?',
  'Mình nhận hỗ trợ đơn này nhé!',
  'Mình gặp nhau ở đâu tiện cho bạn?',
];

const formatMessageTime = (timestamp: number): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
};

const createFallbackPartnerId = (name: string): string => {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `partner_${normalized || 'guest'}`;
};

export default function ChatScreen({ route, navigation }: any) {
  const params = route?.params || {};
  const initialConversationId: string | null = params.conversationId || null;
  const partnerName: string = params.partnerName || 'Sinh viên UniShare';
  const partnerAvatar: string | null = params.partnerAvatar || null;
  const partnerIdParam: string | undefined = params.partnerId;
  const contextTitle: string =
    params.relatedTitle || params.taskTitle || params.productTitle || '';
  const contextType: 'task' | 'product' | undefined =
    params.relatedType ||
    (params.taskTitle ? 'task' : params.productTitle ? 'product' : undefined);
  const contextId: string | undefined = params.relatedId;
  const contextPrice: number | undefined = params.price;

  const { user } = useAuthStore();
  const { openConversation, opening, error: openError } = useOpenConversation();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId
  );
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);

  const {
    messages,
    loading: loadingMessages,
    sending,
    error: chatError,
    sendMessage,
  } = useChatMessages(activeConversationId);

  useEffect(() => {
    let isMounted = true;

    const initConversation = async () => {
      if (activeConversationId || !user?.uid) {
        return;
      }

      const resolvedPartnerId =
        partnerIdParam || createFallbackPartnerId(partnerName);

      const conversation = await openConversation(
        {
          uid: user.uid,
          displayName: user.displayName || user.email || 'Sinh viên',
          avatarUrl: user.avatarUrl || null,
        },
        {
          uid: resolvedPartnerId,
          displayName: partnerName,
          avatarUrl: partnerAvatar,
        },
        contextTitle
          ? {
              relatedType: contextType,
              relatedId: contextId,
              relatedTitle: contextTitle,
            }
          : undefined
      );

      if (isMounted && conversation) {
        setActiveConversationId(conversation.conversationId);
      }
    };

    initConversation();

    return () => {
      isMounted = false;
    };
  }, [
    activeConversationId,
    user?.uid,
    partnerIdParam,
    partnerName,
    partnerAvatar,
    contextTitle,
    contextType,
    contextId,
    openConversation,
  ]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async (customText?: string) => {
    const content = (customText ?? inputText).trim();
    if (!content || sending) return;

    if (!user?.uid) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập lại để gửi tin nhắn.');
      return;
    }

    if (!activeConversationId) {
      Alert.alert('Đang kết nối', 'Phòng chat đang được khởi tạo, vui lòng thử lại sau giây lát.');
      return;
    }

    if (!customText) {
      setInputText('');
    }

    const ok = await sendMessage(user.uid, content);
    if (!ok && !customText) {
      setInputText(content);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMine = item.senderId === user?.uid;

    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.messageRowMine : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.bubbleMine : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine ? styles.messageTextMine : styles.messageTextOther,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMine ? styles.messageTimeMine : styles.messageTimeOther,
            ]}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const displayError = openError || chatError;
  const isInitializing = opening || (Boolean(activeConversationId) && loadingMessages);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={colors.neutral.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerAvatarWrap}>
          {partnerAvatar ? (
            <Image source={{ uri: partnerAvatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarLetter}>
                {partnerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {partnerName}
          </Text>
          <Text style={styles.headerStatus}>Trò chuyện trực tiếp • UniShare</Text>
        </View>
      </View>

      {contextTitle ? (
        <View style={styles.contextBanner}>
          <View
            style={[
              styles.contextIconBox,
              {
                backgroundColor:
                  contextType === 'product'
                    ? colors.secondary[50]
                    : colors.primary[50],
              },
            ]}
          >
            <Feather
              name={contextType === 'product' ? 'shopping-bag' : 'zap'}
              size={16}
              color={
                contextType === 'product'
                  ? colors.secondary[600]
                  : colors.primary[600]
              }
            />
          </View>
          <View style={styles.contextInfo}>
            <Text style={styles.contextLabel}>
              {contextType === 'product' ? 'Đang trao đổi sản phẩm' : 'Đang trao đổi việc vặt'}
            </Text>
            <Text style={styles.contextTitle} numberOfLines={1}>
              {contextTitle}
            </Text>
          </View>
          {typeof contextPrice === 'number' && contextPrice > 0 ? (
            <Text style={styles.contextPrice}>
              {new Intl.NumberFormat('vi-VN').format(contextPrice)}đ
            </Text>
          ) : null}
        </View>
      ) : null}

      {displayError ? (
        <View style={styles.errorBanner}>
          <Feather name="alert-circle" size={16} color={colors.semantic.danger.DEFAULT} />
          <Text style={styles.errorBannerText}>{displayError}</Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {isInitializing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.messageId}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChatBox}>
                <Feather name="message-square" size={32} color={colors.neutral.disabled} />
                <Text style={styles.emptyChatTitle}>Hãy gửi lời chào đầu tiên!</Text>
                <Text style={styles.emptyChatSub}>
                  Tin nhắn được đồng bộ tức thời qua Cloud Firestore.
                </Text>
                <View style={styles.quickReplyList}>
                  {QUICK_REPLIES.map((reply) => (
                    <TouchableOpacity
                      key={reply}
                      style={styles.quickReplyChip}
                      onPress={() => handleSend(reply)}
                    >
                      <Text style={styles.quickReplyText}>{reply}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={colors.neutral.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || sending || !activeConversationId) &&
                styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || sending || !activeConversationId}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  headerAvatarWrap: {
    marginRight: spacing[3],
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarLetter: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  headerStatus: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    gap: spacing[2],
  },
  contextIconBox: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextInfo: {
    flex: 1,
  },
  contextLabel: {
    fontSize: 10,
    color: colors.neutral.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  contextTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
  },
  contextPrice: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary[600],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  errorBannerText: {
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
  messagesContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
  },
  bubbleMine: {
    backgroundColor: colors.primary[600],
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.neutral.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.sm,
  },
  messageText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  messageTextMine: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: colors.neutral.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMine: {
    color: 'rgba(255, 255, 255, 0.78)',
  },
  messageTimeOther: {
    color: colors.neutral.textMuted,
  },
  emptyChatBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing[4],
  },
  emptyChatTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.textPrimary,
    marginTop: spacing[3],
  },
  emptyChatSub: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing[4],
  },
  quickReplyList: {
    width: '100%',
    gap: spacing[2],
    alignItems: 'center',
  },
  quickReplyChip: {
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.primary[200],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  quickReplyText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    gap: spacing[2],
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.textPrimary,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});