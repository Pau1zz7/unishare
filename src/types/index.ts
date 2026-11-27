export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  trustScore: number;
  totalReviews: number;
  createdAt: number;
  updatedAt?: number;
  university?: string;
  studentIdVerified?: boolean;
  completedTasksCount?: number;
  postedTasksCount?: number;
  activeProductsCount?: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  phone: string;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  geohash?: string;
  address: string;
}

export type TaskPaymentMethod = 'cash' | 'transfer' | 'exchange';
export type TaskStatus = 'open' | 'matched' | 'completed' | 'cancelled' | 'hidden';
export type TaskCategory = 'delivery' | 'food' | 'print' | 'study' | 'other';

export interface Task {
  taskId: string;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string | null;
  requesterTrustScore?: number;
  bounty: number; // VNĐ
  paymentMethod: TaskPaymentMethod;
  pickupLocation: LocationPoint;
  deliveryLocation: LocationPoint;
  status: TaskStatus;
  category?: TaskCategory;
  estimatedTime?: number;
  distanceKm?: number;
  imageUrls?: string[];
  workerId?: string | null;
  workerName?: string | null;
  deadline?: string;
  createdAt: number;
  updatedAt?: number;
}

export type ProductCategory = 'book' | 'electronic' | 'furniture' | 'clothing' | 'other';
export type ProductCondition = 'new' | 'like-new' | 'used' | 'broken';
export type ProductStatus = 'available' | 'sold' | 'hidden';

export interface Product {
  productId: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  category: ProductCategory;
  condition: ProductCondition;
  imageUrls: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string | null;
  sellerTrustScore?: number;
  location: LocationPoint;
  distanceKm?: number;
  status: ProductStatus;
  createdAt: number;
  updatedAt?: number;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  category: ProductCategory;
  condition: ProductCondition;
  location: LocationPoint;
  imageUrls: string[];
}

export interface CreateTaskInput {
  title: string;
  description: string;
  bounty: number;
  paymentMethod: TaskPaymentMethod;
  category: TaskCategory;
  pickupLocation: LocationPoint;
  deliveryLocation: LocationPoint;
  estimatedTime?: number;
  deadline?: string;
  imageUrls?: string[];
}

export interface MapMarkerItem {
  id: string;
  type: 'task' | 'product' | 'origin' | 'destination';
  title: string;
  bountyOrPrice?: number;
  isFree?: boolean;
  category?: string;
  requesterOrSellerName?: string;
  trustScore?: number;
  address: string;
  deviationMeters?: number; // Độ lệch so với tuyến đường (VD: 80m, 150m)
  latitude: number;
  longitude: number;
  rawTask?: Task;
  rawProduct?: Product;
}

export interface RouteInfo {
  originName: string;
  originCoords: { latitude: number; longitude: number };
  destinationName: string;
  destinationCoords: { latitude: number; longitude: number };
  totalDistanceKm: number;
  estimatedDurationMins: number;
}

export interface Review {
  reviewId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string | null;
  targetUserId: string;
  rating: number; // 1 to 5
  comment: string;
  tags?: string[];
  relatedType: 'task' | 'product' | 'tutor';
  relatedTitle?: string;
  relatedId?: string;
  createdAt: number;
}

export interface CreateReviewInput {
  targetUserId: string;
  targetUserName?: string;
  rating: number;
  comment: string;
  tags: string[];
  relatedType: 'task' | 'product' | 'tutor';
  relatedTitle: string;
  relatedId: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ConversationParticipantInfo {
  displayName: string;
  avatarUrl: string | null;
}

export interface Conversation {
  conversationId: string;
  participantIds: string[];
  participants: Record<string, ConversationParticipantInfo>;
  lastMessage: string;
  lastMessageAt: number;
  lastSenderId?: string;
  relatedType?: 'task' | 'product';
  relatedId?: string;
  relatedTitle?: string;
  createdAt: number;
}

export interface Message {
  messageId: string;
  senderId: string;
  text: string;
  createdAt: number;
  isRead?: boolean;
}


