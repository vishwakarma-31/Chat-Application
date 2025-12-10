import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import MessageList from './MessageList';
import useChatConnection from '../hooks/useChatConnection';

const ChatArea: React.FC = () => {
  const [message, setMessage] = useState('');
  const { activeConversationId, conversations } = useChatStore();
  const { isConnected, sendMessage, typing, stopTyping } = useChatConnection();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Find the active conversation
  const activeConversation = conversations.find(
    conv => conv.conversationId === activeConversationId
  );
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim() && activeConversationId && isConnected) {
      sendMessage(activeConversationId, {
        senderId: 'current-user-id', // This should come from the current user context
        body: message,
        attachments: [],
        reactions: []
      });
      
      setMessage('');
      
      // Clear typing timeout and send stop typing event
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      stopTyping(activeConversationId);
    }
  };
  
  // Handle typing events
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Send typing event if we have an active conversation
    if (activeConversationId) {
      typing(activeConversationId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to send stop typing event after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeConversationId);
        typingTimeoutRef.current = null;
      }, 1000);
    }
  };
  
  // Handle Enter key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        {activeConversation ? (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              <span className="font-bold">
                {activeConversation.isGroup 
                  ? activeConversation.title?.charAt(0) 
                  : 'U'}
              </span>
            </div>
            <div>
              <h2 className="font-semibold">
                {activeConversation.isGroup 
                  ? activeConversation.title 
                  : 'User Name'}
              </h2>
              <p className="text-xs text-gray-500">
                {activeConversation.isGroup 
                  ? `${activeConversation.participants.items.length} members` 
                  : 'Online'}
              </p>
            </div>
          </>
        ) : (
          <h2 className="font-semibold">Select a conversation</h2>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {activeConversation ? (
          <MessageList 
            messages={activeConversation.messages.items} 
            conversationId={activeConversationId || ''}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>No conversation selected</p>
          </div>
        )}
      </div>
      
      {/* Message Input */}
      {activeConversation && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end">
            <textarea
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
              rows={1}
              disabled={!isConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected}
              className="ml-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;