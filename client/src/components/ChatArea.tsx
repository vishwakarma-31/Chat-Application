import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import MessageList from './MessageList';
import useChatConnection from '../hooks/useChatConnection';

const ChatArea: React.FC = () => {
  const [message, setMessage] = useState('');
  const { activeConversationId, conversations, currentUser } = useChatStore();
  const { isConnected, sendMessage, typing, stopTyping } = useChatConnection();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const activeConversation = conversations.find(
    conv => conv.conversationId === activeConversationId
  );
  
  const handleSendMessage = () => {
    if (message.trim() && activeConversationId && isConnected && currentUser) {
      sendMessage(activeConversationId, {
        senderId: currentUser.userId, 
        body: message,
        attachments: [],
        reactions: []
      });
      setMessage('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      stopTyping(activeConversationId);
    }
  };
  
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (activeConversationId) {
      typing(activeConversationId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeConversationId);
        typingTimeoutRef.current = null;
      }, 1000);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  if (!activeConversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50/50">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-700">Welcome to OmegaChat</h2>
        <p className="text-slate-500 mt-2">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm">
      {/* Glassmorphism Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center mr-4 text-white shadow-md shadow-indigo-200">
          <span className="font-bold text-sm">
            {activeConversation.isGroup ? activeConversation.title?.charAt(0) : 'U'}
          </span>
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-sm">
            {activeConversation.isGroup ? activeConversation.title : 'User Name'}
          </h2>
          <div className="flex items-center mt-0.5">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <p className="text-xs text-slate-500 font-medium">Online</p>
          </div>
        </div>
        <div className="ml-auto flex space-x-3 text-slate-400">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
        <MessageList 
          messages={activeConversation.messages.items} 
          conversationId={activeConversation.conversationId}
        />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full py-3 px-5 bg-slate-100 rounded-full text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all shadow-inner"
              disabled={!isConnected}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <button className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected}
            className="p-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;