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
  createdAt: number;
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


