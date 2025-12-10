import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

interface ChatLayoutProps {
  theme?: 'light' | 'dark';
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ theme = 'light' }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar toggle button for mobile */}
      <button 
        className="md:hidden absolute top-4 left-4 z-10 p-2 rounded-lg bg-white shadow-md"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'block' : 'hidden'} md:block w-80 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
        <Sidebar />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <ChatArea />
      </div>
    </div>
  );
};

export default ChatLayout;