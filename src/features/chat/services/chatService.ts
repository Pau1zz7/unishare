import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { Conversation, Message } from '../../../types';

export interface ChatUserBrief {
  uid: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface ChatRelatedContext {
  relatedType?: 'task' | 'product';
  relatedId?: string;
  relatedTitle?: string;
}

export const buildConversationId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join('_');
};

export const getOrCreateConversation = async (
  currentUser: ChatUserBrief,
  partner: ChatUserBrief,
  relatedContext?: ChatRelatedContext
): Promise<Conversation> => {
  const conversationId = buildConversationId(currentUser.uid, partner.uid);
  const convRef = doc(db, 'conversations', conversationId);
  const snapshot = await getDoc(convRef);

  if (snapshot.exists()) {
    const existing = snapshot.data() as Conversation;
    if (relatedContext?.relatedTitle && relatedContext.relatedTitle !== existing.relatedTitle) {
      const updatedFields: Partial<Conversation> = {
        relatedType: relatedContext.relatedType,
        relatedId: relatedContext.relatedId,
        relatedTitle: relatedContext.relatedTitle,
      };
      await setDoc(convRef, updatedFields, { merge: true });
      return { ...existing, ...updatedFields };
    }
    return existing;
  }

  const now = Date.now();
  const newConversation: Conversation = {
    conversationId,
    participantIds: [currentUser.uid, partner.uid].sort(),
    participants: {
      [currentUser.uid]: {
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl ?? null,
      },
      [partner.uid]: {
        displayName: partner.displayName,
        avatarUrl: partner.avatarUrl ?? null,
      },
    },
    lastMessage: '',
    lastMessageAt: now,
    createdAt: now,
    ...(relatedContext?.relatedType ? { relatedType: relatedContext.relatedType } : {}),
    ...(relatedContext?.relatedId ? { relatedId: relatedContext.relatedId } : {}),
    ...(relatedContext?.relatedTitle ? { relatedTitle: relatedContext.relatedTitle } : {}),
  };

  await setDoc(convRef, newConversation);
  return newConversation;
};

export const subscribeConversations = (
  userId: string,
  onUpdate: (conversations: Conversation[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Conversation[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Conversation),
        conversationId: docSnap.id,
      }));
      items.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
      onUpdate(items);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    }
  );
};

export const subscribeMessages = (
  conversationId: string,
  onUpdate: (messages: Message[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Message[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Message),
        messageId: docSnap.id,
      }));
      onUpdate(items);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    }
  );
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string
): Promise<Message> => {
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Nội dung tin nhắn không được để trống.');
  }

  const now = Date.now();
  const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
  const newMessageRef = doc(messagesColRef);
  const convRef = doc(db, 'conversations', conversationId);

  const newMessage: Message = {
    messageId: newMessageRef.id,
    senderId,
    text: trimmedText,
    createdAt: now,
    isRead: false,
  };

  const batch = writeBatch(db);
  batch.set(newMessageRef, newMessage);
  batch.update(convRef, {
    lastMessage: trimmedText,
    lastMessageAt: now,
    lastSenderId: senderId,
  });

  await batch.commit();
  return newMessage;
};