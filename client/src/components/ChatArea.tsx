import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import MessageList from './MessageList';
import useChatConnection from '../hooks/useChatConnection';

const ChatArea: React.FC = () => {
  const [message, setMessage] = useState('');
  const { activeConversationId, conversations, currentUser } = useChatStore();
  const { isConnected, sendMessage, typing, stopTyping } = useChatConnection();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Find the active conversation
  const activeConversation = conversations.find(
    conv => conv.conversationId === activeConversationId
  );
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim() && activeConversationId && isConnected && currentUser) {
      sendMessage(activeConversationId, {
        senderId: currentUser.userId, 
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
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
    
    // Send typing event if we have an active conversation
    if (activeConversationId) {
      typing(activeConversationId);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeConversationId);
        typingTimeoutRef.current = null;
      }, 1000);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        {activeConversation ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mr-3 shadow-md">
                <span className="font-bold text-white text-lg">
                  {activeConversation.isGroup 
                    ? activeConversation.title?.charAt(0) 
                    : 'U'}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {activeConversation.isGroup 
                    ? activeConversation.title 
                    : 'User Name'}
                </h2>
                <p className="text-xs text-gray-500 flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {activeConversation.isGroup 
                    ? `${activeConversation.participants.items.length} members` 
                    : isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                </svg>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <h2 className="font-semibold text-lg">Select a conversation</h2>
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
          <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Welcome to OmegaChat</h3>
            <p className="text-gray-500 max-w-md text-center">
              Select a conversation from the sidebar or start a new chat to begin messaging.
            </p>
          </div>
        )}
      </div>
      
      {/* Message Input */}
      {activeConversation && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end">
            <div className="flex space-x-2 mr-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 shadow-sm"
              rows={1}
              disabled={!isConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected}
              className={`ml-2 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                message.trim() && isConnected 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-400'
              }`}
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