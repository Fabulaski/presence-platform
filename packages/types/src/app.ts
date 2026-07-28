import { PlatformType } from './context.js';

export interface PresenceApp {
  id: string;
  name: string;
  platform: PlatformType;
  apiKey: string;
  status: 'active' | 'suspended' | 'revoked';
  allowedDomains: string[];
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  preferredTranslation: string; // e.g. "NVI"
  language: string;             // e.g. "es"
  timezone: string;
  consentGiven: boolean;
  createdAt: string;
}
