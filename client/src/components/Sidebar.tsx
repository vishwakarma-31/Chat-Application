import React, { useState } from 'react';
import { useChatStore } from '../stores/chatStore';

const Sidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { activeConversationId, conversations, setCurrentUser, currentUser } = useChatStore();
  
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

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Reset current user in store
    setCurrentUser(null);
    
    // Reload the page to redirect to login
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full bg-white" role="navigation" aria-label="Main navigation">
      {/* Header with profile and logout */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">OmegaChat</h1>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
            title="Logout"
            aria-label="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {currentUser && (
          <div className="flex items-center mt-3">
            <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-2" aria-hidden="true">
              <span className="font-bold text-white">
                {currentUser.profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium">{currentUser.profile.username}</span>
          </div>
        )}
      </div>
      
      {/* Search */}
      <div className="p-3 bg-gray-50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search chats"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Conversations/Users List */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Conversations">
        {conversationsWithPreviews.map(conversation => {
          // Get participant names
          const participantNames = conversation.participants.items
            .map(p => {
              // In a real app, you would look up the user by userId
              // For now, we'll just return a placeholder
              return 'User';
            })
            .join(', ');
            
          const displayName = conversation.isGroup 
            ? conversation.title 
            : participantNames || 'Unknown User';
            
          const isActive = activeConversationId === conversation.conversationId;
            
          return (
            <div 
              key={conversation.conversationId}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => {
                // In a real app, you would dispatch an action to set the active conversation
              }}
              role="listitem"
              tabIndex={0}
              aria-selected={isActive}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  // In a real app, you would dispatch an action to set the active conversation
                }
              }}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mr-3 shadow-md" aria-hidden="true">
                  {conversation.isGroup ? (
                    <span className="font-bold text-white">{conversation.title?.charAt(0)}</span>
                  ) : (
                    <span className="font-bold text-white">
                      {participantNames.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-semibold truncate">
                      {displayName}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {conversation.lastMessage.body}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Online status indicator */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2" aria-hidden="true"></div>
          <span className="text-sm text-gray-600">Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;