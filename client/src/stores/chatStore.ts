import { create } from 'zustand';
import { UserEntity, Conversation, MessageEntity, UserProfile } from '../types/chatTypes';

interface ChatState {
  currentUser: UserEntity | null;
  conversations: Conversation[];
  activeConversationId: string | null;
  users: UserEntity[];
  
  // Actions
  setCurrentUser: (user: UserEntity | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setUsers: (users: UserEntity[]) => void;
  addMessage: (conversationId: string, message: MessageEntity) => void;
  updateMessage: (conversationId: string, messageId: string, message: Partial<MessageEntity>) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  updateUserProfile: (userId: string, profile: Partial<UserProfile>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentUser: null,
  conversations: [],
  activeConversationId: null,
  users: [],
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
  
  setUsers: (users) => set({ users }),
  
  addMessage: (conversationId, message) => set((state) => ({
    conversations: state.conversations.map(conv => 
      conv.conversationId === conversationId
        ? { ...conv, messages: { items: [...conv.messages.items, message] } }
        : conv
    )
  })),
  
  updateMessage: (conversationId, messageId, updates) => set((state) => ({
    conversations: state.conversations.map(conv => 
      conv.conversationId === conversationId
        ? {
            ...conv,
            messages: {
              items: conv.messages.items.map(msg => 
                msg.messageId === messageId ? { ...msg, ...updates } : msg
              )
            }
          }
        : conv
    )
  })),
  
  addConversation: (conversation) => set((state) => ({
    conversations: [...state.conversations, conversation]
  })),
  
  updateConversation: (conversationId, updates) => set((state) => ({
    conversations: state.conversations.map(conv => 
      conv.conversationId === conversationId ? { ...conv, ...updates } : conv
    )
  })),
  
  updateUserProfile: (userId, profile) => set((state) => ({
    users: state.users.map(user => 
      user.userId === userId 
        ? { ...user, profile: { ...user.profile, ...profile } } 
        : user
    ),
    // Also update in currentUser if it's the same user
    ...(state.currentUser && state.currentUser.userId === userId
      ? { currentUser: { ...state.currentUser, profile: { ...state.currentUser.profile, ...profile } } }
      : {})
  }))
}));