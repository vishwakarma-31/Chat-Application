import React, { useState } from 'react';
import { useChatStore } from '../stores/chatStore';

const Sidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { activeConversationId, conversations } = useChatStore();
  
  // Get conversations with last message previews
  const conversationsWithPreviews = conversations.map(conversation => {
    const lastMessage = conversation.messages.items.length > 0 
      ? conversation.messages.items[conversation.messages.items.length - 1]
      : null;
      
    return {
      ...conversation,
      lastMessage,
      unreadCount: 0 // In a real app, this would come from state
    };
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Chats</h1>
      </div>
      
      {/* Search */}
      <div className="p-2">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Conversations/Users List */}
      <div className="flex-1 overflow-y-auto">
        {conversationsWithPreviews.map(conversation => (
          <div 
            key={conversation.conversationId}
            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              activeConversationId === conversation.conversationId ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                {conversation.isGroup ? (
                  <span className="font-bold">{conversation.title?.charAt(0)}</span>
                ) : (
                  <span className="font-bold">
                    {conversation.participants.items.length > 0 
                      ? conversation.participants.items[0].userId.charAt(0).toUpperCase()
                      : 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="font-semibold truncate">
                    {conversation.isGroup ? conversation.title : 'User Name'}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage.body}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;