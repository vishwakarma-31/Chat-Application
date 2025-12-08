import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Message } from '../types/chat';
import {
  SOCKET_CONNECT,
  SOCKET_DISCONNECT,
  SOCKET_CONNECT_ERROR,
  SOCKET_JOIN_ROOM,
  SOCKET_LEAVE_ROOM,
  SOCKET_SEND_MESSAGE,
  SOCKET_TYPING
} from '../constants';

interface SocketState {
  isConnected: boolean;
  error: string | null;
}

// SocketData interface removed as it was unused

/**
 * Custom hook for managing Socket.IO connections and events
 * Provides a simple interface for connecting to the chat server and handling real-time communication
 * 
 * @param serverUrl - The URL of the Socket.IO server to connect to
 * @returns An object containing the socket instance, connection state, and helper functions
 */
const useSocket = (serverUrl: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    error: null
  });

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    // Event listeners
    socketRef.current.on(SOCKET_CONNECT, () => {
      setSocketState(prev => ({
        ...prev,
        isConnected: true,
        error: null
      }));
    });

    socketRef.current.on(SOCKET_DISCONNECT, () => {
      setSocketState(prev => ({
        ...prev,
        isConnected: false
      }));
    });

    socketRef.current.on(SOCKET_CONNECT_ERROR, (error) => {
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        error: error.message
      }));
    });

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  /**
   * Join a chat room
   * @param roomId - The ID of the room to join
   * @param userId - The ID of the user joining the room
   */
  const joinRoom = (roomId: string, userId: number) => {
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_JOIN_ROOM, { roomId, userId });
    }
  };

  /**
   * Leave a chat room
   * @param roomId - The ID of the room to leave
   * @param userId - The ID of the user leaving the room
   */
  const leaveRoom = (roomId: string, userId: number) => {
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_LEAVE_ROOM, { roomId, userId });
    }
  };

  /**
   * Send a message to a chat room
   * @param roomId - The ID of the room to send the message to
   * @param message - The message to send
   */
  const sendMessage = (roomId: string, message: Message) => {
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_SEND_MESSAGE, { roomId, message });
    }
  };

  /**
   * Send typing indicator to a chat room
   * @param roomId - The ID of the room to send the typing indicator to
   * @param userId - The ID of the user who is typing
   * @param isTyping - Whether the user is currently typing
   */
  const sendTyping = (roomId: string, userId: number, isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_TYPING, { roomId, userId, isTyping });
    }
  };

  return {
    socket: socketRef.current,
    isConnected: socketState.isConnected,
    error: socketState.error,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping
  };
};

export default useSocket;