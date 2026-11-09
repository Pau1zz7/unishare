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