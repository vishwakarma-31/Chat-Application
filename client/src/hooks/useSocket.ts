import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketState {
  isConnected: boolean;
  error: string | null;
}

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
    socketRef.current.on('connect', () => {
      setSocketState(prev => ({
        ...prev,
        isConnected: true,
        error: null
      }));
    });

    socketRef.current.on('disconnect', () => {
      setSocketState(prev => ({
        ...prev,
        isConnected: false
      }));
    });

    socketRef.current.on('connect_error', (error) => {
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

  const joinRoom = (roomId: string, userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', { roomId, userId });
    }
  };

  const leaveRoom = (roomId: string, userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', { roomId, userId });
    }
  };

  const sendMessage = (roomId: string, message: any) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', { roomId, message });
    }
  };

  const sendTyping = (roomId: string, userId: string, isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { roomId, userId, isTyping });
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