import React, { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '../../stores/ChatStore';
import useSocket from '../../hooks/useSocket';
import MessageList from '../../components/MessageList';
import { ChatService } from '../../services/chatService';
import { Message } from '../../types/chat';

const SERVER_URL = 'http://localhost:8000';

const ChatPage: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const [currentUserId] = useState('user1'); // In a real app, this would come from auth
  const [activeRoomId] = useState('room1'); // In a real app, this would be dynamic
  
  const { messages, addMessage, setMessages } = useChatStore();
  const { isConnected, error, sendMessage: sendSocketMessage } = useSocket(SERVER_URL);
  
  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await ChatService.fetchMessages(activeRoomId);
        setMessages(activeRoomId, fetchedMessages);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    
    loadMessages();
  }, [activeRoomId, setMessages]);
  
  // Listen for incoming messages
  useEffect(() => {
    // In a real implementation, you would listen to socket events here
    // For now, we'll simulate receiving a message
  }, []);
  
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim()) return;
    
    const newMessage: Omit<Message, 'id' | 'timestamp' | 'status'> = {
      conversationId: activeRoomId,
      senderId: currentUserId,
      content: messageInput,
      messageType: 'text'
    };
    
    // Send via socket
    sendSocketMessage(activeRoomId, {
      ...newMessage,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'sent'
    });
    
    // Add to local store
    ChatService.sendMessage(newMessage).then((message) => {
      addMessage(activeRoomId, message);
    }).catch((err) => {
      console.error('Failed to send message:', err);
    });
    
    setMessageInput('');
  }, [messageInput, activeRoomId, currentUserId, sendSocketMessage, addMessage]);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">Chat App</h1>
          <div className="ml-4 flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages[activeRoomId] || []} 
          currentUserId={currentUserId}
        />
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {error && (
          <div className="text-red-500 text-sm mb-2">
            Connection error: {error}
          </div>
        )}
        <div className="flex">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !isConnected}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;