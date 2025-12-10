import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../stores/chatStore';
import { 
  MessageEntity, 
  UserEntity, 
  Conversation, 
  LoginRequest, 
  LoginResponse 
} from '../types/chatTypes';

// Define event types
interface ServerToClientEvents {
  'user-connected': (user: UserEntity) => void;
  'user-disconnected': (userId: string) => void;
  'receive-message': (message: MessageEntity) => void;
  'message-delivered': (messageId: string) => void;
  'message-read': (messageId: string) => void;
  'typing-start': (userId: string, conversationId: string) => void;
  'typing-stop': (userId: string, conversationId: string) => void;
  'conversation-created': (conversation: Conversation) => void;
  'conversation-updated': (conversation: Conversation) => void;
  'login-success': (response: LoginResponse) => void;
  'login-error': (error: string) => void;
}

interface ClientToServerEvents {
  'send-message': (message: Omit<MessageEntity, 'messageId' | 'timestamp' | 'status' | 'conversationId'> & { conversationId: string }) => void;
  'join-conversation': (conversationId: string) => void;
  'leave-conversation': (conversationId: string) => void;
  'mark-as-read': (messageId: string) => void;
  'typing': (conversationId: string) => void;
  'stop-typing': (conversationId: string) => void;
  'login': (credentials: LoginRequest) => void;
  'logout': () => void;
}

const SOCKET_URL = process.env.VITE_SOCKET_URL || 'http://localhost:8000';

const useChatConnection = () => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const {} = useChatStore();

  useEffect(() => {
    // Initialize socket connection
    const initializeSocket = () => {
      if (!socketRef.current) {
        setIsConnecting(true);
        
        // Connect to the server
        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
          SOCKET_URL,
          {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          }
        );
        
        socketRef.current = socket;
        
        // Event listeners
        socket.on('connect', () => {
          console.log('Connected to server');
          setIsConnected(true);
          setIsConnecting(false);
        });
        
        socket.on('disconnect', () => {
          console.log('Disconnected from server');
          setIsConnected(false);
        });
        
        socket.on('user-connected', (user) => {
          console.log('User connected:', user);
          // Handle user connected event
        });
        
        socket.on('user-disconnected', (userId) => {
          console.log('User disconnected:', userId);
          // Handle user disconnected event
        });
        
        socket.on('receive-message', (message) => {
          console.log('Received message:', message);
          // Add message to the appropriate conversation
          // This assumes you have the conversationId in the message or can derive it
          // addMessage(message.conversationId, message);
        });
        
        socket.on('message-delivered', (messageId) => {
          console.log('Message delivered:', messageId);
          // Update message status to delivered
          // updateMessage(conversationId, messageId, { status: 'Delivered' });
        });
        
        socket.on('message-read', (messageId) => {
          console.log('Message read:', messageId);
          // Update message status to read
          // updateMessage(conversationId, messageId, { status: 'Read' });
        });
        
        socket.on('typing-start', (userId, conversationId) => {
          console.log('User typing:', userId, conversationId);
          // Show typing indicator for user in conversation
        });
        
        socket.on('typing-stop', (userId, conversationId) => {
          console.log('User stopped typing:', userId, conversationId);
          // Hide typing indicator for user in conversation
        });
        
        socket.on('conversation-created', (conversation) => {
          console.log('Conversation created:', conversation);
          // addConversation(conversation);
        });
        
        socket.on('conversation-updated', (conversation) => {
          console.log('Conversation updated:', conversation);
          // updateConversation(conversation.conversationId, conversation);
        });
        
        socket.on('login-success', (response) => {
          console.log('Login successful:', response);
          // setCurrentUser(response.userProfile);
          // Set conversations and users from response if provided
        });
        
        socket.on('login-error', (error) => {
          console.error('Login error:', error);
          // Handle login error
        });
        
        // Handle connection errors
        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          setIsConnecting(false);
        });
      }
    };
    
    initializeSocket();
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);
  
  // Functions to emit events to the server
  const sendMessage = (conversationId: string, message: Omit<MessageEntity, 'messageId' | 'timestamp' | 'status' | 'conversationId'>) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', { ...message, conversationId });
    }
  };
  
  const joinConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-conversation', conversationId);
    }
  };
  
  const leaveConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-conversation', conversationId);
    }
  };
  
  const markAsRead = (messageId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark-as-read', messageId);
    }
  };
  
  const typing = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', conversationId);
    }
  };
  
  const stopTyping = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('stop-typing', conversationId);
    }
  };
  
  const login = (credentials: LoginRequest) => {
    if (socketRef.current) {
      socketRef.current.emit('login', credentials);
    }
  };
  
  const logout = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('logout');
    }
  };
  
  return {
    isConnected,
    isConnecting,
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    typing,
    stopTyping,
    login,
    logout
  };
};

export default useChatConnection;