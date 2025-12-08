import { create } from 'zustand';
import { Message, Conversation } from '../types/chat';

/**
 * Interface defining the shape of the chat store state
 * Manages conversations, messages, and UI state for the chat application
 */
interface ChatState {
  /**
   * List of all conversations
   */
  conversations: Conversation[];
  
  /**
   * ID of the currently active conversation
   */
  activeConversationId: string | null;
  
  /**
   * Map of messages organized by conversation ID
   * Key: conversationId, Value: array of messages
   */
  messages: Record<string, Message[]>;
  
  /**
   * Loading state indicator
   */
  isLoading: boolean;
  
  /**
   * Error message if any
   */
  error: string | null;
  
  // Actions
  
  /**
   * Set the active conversation
   * @param conversationId - ID of the conversation to set as active
   */
  setActiveConversation: (conversationId: string | null) => void;
  
  /**
   * Add a new message to a conversation
   * @param conversationId - ID of the conversation to add the message to
   * @param message - The message to add
   */
  addMessage: (conversationId: string, message: Message) => void;
  
  /**
   * Set messages for a conversation (replaces existing messages)
   * @param conversationId - ID of the conversation to set messages for
   * @param messages - Array of messages to set
   */
  setMessages: (conversationId: string, messages: Message[]) => void;
  
  /**
   * Add a new conversation
   * @param conversation - The conversation to add
   */
  addConversation: (conversation: Conversation) => void;
  
  /**
   * Update an existing conversation
   * @param conversationId - ID of the conversation to update
   * @param updates - Partial updates to apply to the conversation
   */
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  
  /**
   * Remove a conversation
   * @param conversationId - ID of the conversation to remove
   */
  removeConversation: (conversationId: string) => void;
  
  /**
   * Set the loading state
   * @param loading - Boolean indicating if the app is loading
   */
  setLoading: (loading: boolean) => void;
  
  /**
   * Set an error message
   * @param error - Error message to set, or null to clear
   */
  setError: (error: string | null) => void;
  
  /**
   * Clear all messages for a conversation
   * @param conversationId - ID of the conversation to clear messages for
   */
  clearMessages: (conversationId: string) => void;
}

/**
 * Zustand store for managing chat application state
 * Provides a centralized state management solution for conversations and messages
 */
export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoading: false,
  error: null,
  
  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
  
  addMessage: (conversationId, message) => set((state) => {
    const currentMessages = state.messages[conversationId] || [];
    return {
      messages: {
        ...state.messages,
        [conversationId]: [...currentMessages, message]
      }
    };
  }),
  
  setMessages: (conversationId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: messages
    }
  })),
  
  addConversation: (conversation) => set((state) => ({
    conversations: [...state.conversations, conversation]
  })),
  
  updateConversation: (conversationId, updates) => set((state) => ({
    conversations: state.conversations.map(conv => 
      conv.id === conversationId ? { ...conv, ...updates } : conv
    )
  })),
  
  removeConversation: (conversationId) => set((state) => ({
    conversations: state.conversations.filter(conv => conv.id !== conversationId)
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearMessages: (conversationId) => set((state) => {
    const newMessages = { ...state.messages };
    delete newMessages[conversationId];
    return { messages: newMessages };
  })
}));