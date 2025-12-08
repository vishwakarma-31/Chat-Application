import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/ChatStore';
import useSocket from './useSocket';
import { ChatService } from '../services/chatService';
import { AuthService } from '../services/authService';
import { Message } from '../types/chat';
import { 
  SERVER_URL, 
  MESSAGE_LIMIT 
} from '../constants';

/**
 * Custom hook for managing chat functionality
 * Encapsulates business logic for chat operations, separating it from UI components
 * 
 * @returns Object containing chat state and helper functions
 */
export const useChat = () => {
  const [messageInput, setMessageInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number>(1); // Will be set from auth
  const [activeRoomId, setActiveRoomId] = useState<string>('room1'); // Will be dynamic
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { messages, addMessage, setMessages } = useChatStore();
  const { isConnected, error, sendMessage: sendSocketMessage } = useSocket(SERVER_URL);
  
  /**
   * Load initial messages for the active room
   * Fetches messages from the backend service
   */
  const loadMessages = useCallback(async () => {
    setLoading(true);
    setInitialLoadError(null);
    try {
      const fetchedMessages = await ChatService.fetchMessages(activeRoomId, MESSAGE_LIMIT, 0);
      setMessages(activeRoomId, fetchedMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setInitialLoadError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [activeRoomId, setMessages]);
  
  /**
   * Effect to load messages when active room changes
   */
  useEffect(() => {
    loadMessages();
  }, [activeRoomId, loadMessages]);
  
  /**
   * Handle user logout
   * Clears authentication and navigates to login page
   */
  const handleLogout = useCallback(() => {
    AuthService.logout();
    navigate('/login');
  }, [navigate]);
  
  /**
   * Handle sending a new message
   * Sends message through both socket and backend service
   */
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !isConnected) return;
    
    const newMessage: Omit<Message, 'id' | 'timestamp' | 'status'> = {
      conversationId: activeRoomId,
      senderId: currentUserId,
      content: messageInput,
      messageType: 'text'
    };
    
    // Send through socket for real-time delivery
    const messageToSend: Message = {
      ...newMessage,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      status: 'sent'
    };
    
    sendSocketMessage(activeRoomId, messageToSend);
    
    // Also send through HTTP for persistence
    ChatService.sendMessage(newMessage).then((message) => {
      addMessage(activeRoomId, message);
    }).catch((err) => {
      console.error('Failed to send message:', err);
    });
    
    setMessageInput('');
  }, [messageInput, activeRoomId, currentUserId, sendSocketMessage, addMessage, isConnected]);
  
  /**
   * Handle key press events in the message input
   * Submits message on Enter key press
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return {
    // State
    messageInput,
    setMessageInput,
    currentUserId,
    setCurrentUserId,
    activeRoomId,
    setActiveRoomId,
    loading,
    initialLoadError,
    isConnected,
    error,
    
    // Messages
    messages: messages[activeRoomId] || [],
    
    // Functions
    handleLogout,
    handleSendMessage,
    handleKeyPress,
    loadMessages
  };
};