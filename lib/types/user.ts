export interface NotificationSettings {
  newPostScheduled: boolean;
  weeklyReport: boolean;
  creditAlert: boolean;
}

export interface LinkedInProfile {
  linkedinId: string;

  accessToken?: string;
  tokenExpiresAt?: Date;

  firstName?: string;
  lastName?: string;
  headline?: string;

  profilePictureUrl?: string;
  profileUrl?: string;

  isConnected: boolean;
}

export interface User {
  _id: string;

  name: string;
  email: string;

  profilePictureUrl?: string;
  bio?: string;

  credits: number;

  linkedin: LinkedInProfile;

  notifications: NotificationSettings;

  isEmailVerified: boolean;

  totalCreditsPurchased: number;
  totalCreditsUsed: number;

  postsGenerated: number;
  articlesGenerated: number;

  lastLoginAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}