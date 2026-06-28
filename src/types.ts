/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TabId = 'gigs' | 'seekers' | 'chat' | 'market';

export type MenuFeatureId = 'userpro' | 'identity_verification' | 'wallet' | 'settings' | 'logout' | 'notifications' | 'referral' | 'admin';

export interface UserProfile {
  name: string;
  email: string;
  title: string;
  bio: string;
  skills: string[];
  avatar: string;
  completedGigs: number;
  rating: number;
  privacy?: 'public' | 'private';
}

export interface IdentityVerification {
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  fullName: string;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  documentNumber: string;
  submittedAt?: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'rejected';
  proofUrl?: string;
}

export interface Wallet {
  balance: number;
  currency: string;
  transactions: Transaction[];
  referredUsers?: string[]; // Array of referred person names/emails
}

export interface AppSettings {
  notificationsEnabled: boolean;
  emailAlerts: boolean;
  twoFactorAuth: boolean;
  profilePublic: boolean;
  theme: 'light' | 'dark';
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[]; // Base64 data or URLs
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  category?: string;
  status: 'active' | 'in_progress' | 'completed';
}

export interface SeekerProfile {
  id: string;
  name: string;
  professionalTitle: string;
  location: string;
  website?: string;
  bio: string;
  avatar: string;
  rating: number;
  hourlyRate: number;
  activeJobsCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  liked?: boolean;
  reaction?: string;
  edited?: boolean;
}

export interface ChatThread {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  participantBio?: string;
  participantLocation?: string;
  participantRating?: number;
  participantSkills?: string[];
  participantCompletedJobs?: number;
  lastMessage: string;
  lastActive: string;
  messages: ChatMessage[];
  online?: boolean;
}

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'UI Kit' | 'Code Template' | 'Design Asset' | 'Contract template' | 'Other';
  images: string[];
  sellerName: string;
  sellerAvatar: string;
  createdAt: string;
}

export interface NotificationMsg {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'gig' | 'seeker' | 'market' | 'promotion' | 'message' | 'wallet';
}

