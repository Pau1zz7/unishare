import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '../../../types';
import {
  subscribeConversations,
  subscribeMessages,
  sendMessage as sendMessageService,
  getOrCreateConversation,
  ChatUserBrief,
  ChatRelatedContext,
} from '../services/chatService';

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeConversations(
      userId,
      (items) => {
        setConversations(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Không thể tải danh sách cuộc trò chuyện.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return {
    conversations,
    loading,
    error,
  };
};

export const useChatMessages = (conversationId: string | null | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeMessages(
      conversationId,
      (items) => {
        setMessages(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Không thể tải tin nhắn.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (senderId: string, text: string): Promise<boolean> => {
      if (!conversationId || !text.trim()) {
        return false;
      }

      setSending(true);
      setError(null);
      try {
        await sendMessageService(conversationId, senderId, text);
        return true;
      } catch (err: any) {
        setError(err.message || 'Gửi tin nhắn thất bại.');
        return false;
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
  };
};

export const useOpenConversation = () => {
  const [opening, setOpening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const openConversation = useCallback(
    async (
      currentUser: ChatUserBrief,
      partner: ChatUserBrief,
      relatedContext?: ChatRelatedContext
    ): Promise<Conversation | null> => {
      setOpening(true);
      setError(null);
      try {
        return await getOrCreateConversation(currentUser, partner, relatedContext);
      } catch (err: any) {
        setError(err.message || 'Không thể khởi tạo phòng chat.');
        return null;
      } finally {
        setOpening(false);
      }
    },
    []
  );

  return {
    opening,
    error,
    openConversation,
  };
};