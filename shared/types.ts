export interface User {
  id: number; // Changed from string to number to match server
  username: string;
  email: string;
  displayName: string;
  profilePictureUrl?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: number; // Changed from string to number to match User.id
  content: string;
  timestamp: Date; // Keep as Date for client, server will convert from string
  messageType: 'text' | 'image' | 'video' | 'document' | 'audio';
  status: 'sent' | 'delivered' | 'read';
  mediaUrls?: string[];
  edited?: boolean;
  replyTo?: string; // message ID this message is replying to
}

export interface Conversation {
  id: string;
  name?: string; // For group chats
  participants: User[];
  type: 'private' | 'group';
  avatarUrl?: string;
  unreadCount: number;
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  displayName?: string;
}