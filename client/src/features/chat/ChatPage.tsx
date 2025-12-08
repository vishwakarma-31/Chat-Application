import React from 'react';
import MessageList from '../../components/MessageList';
import { useChat } from '../../hooks/useChat';

/**
 * ChatPage component for the main chat interface
 * Handles message display, sending, and real-time communication
 * Manages user authentication state and socket connections
 */
const ChatPage: React.FC = () => {
  const {
    // State
    messageInput,
    setMessageInput,
    loading,
    initialLoadError,
    isConnected,
    
    // Messages
    messages,
    
    // Functions
    handleLogout,
    handleSendMessage,
    handleKeyPress
  } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Chat App</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : initialLoadError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{initialLoadError}</div>
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            currentUserId={1} // This should come from auth context
          />
        )}
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={1}
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !isConnected}
            className="ml-2 bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;