export interface User {
  id: string;
  username: string;
  displayName: string;
  profilePictureUrl?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
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