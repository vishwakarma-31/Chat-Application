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

// Define event types (keeping interfaces same as original)
interface ServerToClientEvents {
  'user-connected': (user: UserEntity) => void;
  'user-disconnected': (userId: string) => void;
  'receive-message': (message: MessageEntity & { conversationId: string }) => void;
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

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

const useChatConnection = () => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Destructure actions from the store
  const { 
    addMessage, 
    addConversation,
    setCurrentUser
  } = useChatStore();

  useEffect(() => {
    const initializeSocket = () => {
      if (!socketRef.current) {
        setIsConnecting(true);
        
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
        
        socket.on('connect', () => {
          console.log('Connected to server');
          setIsConnected(true);
          setIsConnecting(false);
        });
        
        socket.on('disconnect', () => {
          console.log('Disconnected from server');
          setIsConnected(false);
        });
        
        // --- Implemented Event Handlers ---

        socket.on('receive-message', (message) => {
          console.log('Received message:', message);
          // Assuming the message object from server includes conversationId
          if (message.conversationId) {
             addMessage(message.conversationId, message);
          }
        });
        
        socket.on('conversation-created', (conversation) => {
          console.log('Conversation created:', conversation);
          addConversation(conversation);
        });
        
        socket.on('login-success', (response) => {
          console.log('Login successful:', response);
          setCurrentUser(response.userProfile);
          // In a real app, you might fetch initial conversations here via REST API
          // or expect them in the socket payload
        });

        // Error handling
        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          setIsConnecting(false);
        });
      }
    };
    
    initializeSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [addMessage, addConversation, setCurrentUser]);
  
  // --- Emitters ---

  const sendMessage = (conversationId: string, message: Omit<MessageEntity, 'messageId' | 'timestamp' | 'status' | 'conversationId'>) => {
    if (socketRef.current && isConnected) {
      // Optimistically add message to UI
      const tempMessage: MessageEntity = {
        ...message,
        messageId: `temp-${Date.now()}`,
        timestamp: new Date(),
        status: 'Sending',
      };
      addMessage(conversationId, tempMessage);

      // Emit to server
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
  
  return {
    isConnected,
    isConnecting,
    sendMessage,
    joinConversation,
    leaveConversation,
    typing,
    stopTyping
  };
};

export default useChatConnection;