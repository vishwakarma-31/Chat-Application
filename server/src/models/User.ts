import { UserEntity, UserProfile, UserSettings } from '../types/chatTypes';

export class User implements UserEntity {
  userId: string;
  createdAt: Date;
  profile: UserProfile;
  settings?: UserSettings;

  constructor(data: Omit<UserEntity, 'createdAt'>) {
    this.userId = data.userId;
    this.createdAt = new Date();
    this.profile = data.profile;
    this.settings = data.settings;
  }

  // Get user's display name
  getDisplayName(): string {
    return this.profile.displayName;
  }

  // Get user's username
  getUsername(): string {
    return this.profile.username;
  }

  // Update user's profile
  updateProfile(profile: Partial<UserProfile>): void {
    this.profile = { ...this.profile, ...profile };
  }

  // Update user's settings
  updateSettings(settings: Partial<UserSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  // Check if user is online
  isOnline(): boolean {
    return this.profile.onlineStatus === 'Online';
  }

  // Set user's online status
  setOnlineStatus(status: 'Online' | 'Offline' | 'Away' | 'Busy' | 'Invisible' | 'Typing'): void {
    this.profile.onlineStatus = status;
  }

  // Convert to plain object for serialization
  toJSON(): UserEntity {
    return {
      userId: this.userId,
      createdAt: this.createdAt,
      profile: this.profile,
      settings: this.settings
    };
  }
}