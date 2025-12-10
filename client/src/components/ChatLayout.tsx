import React from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

interface ChatLayoutProps {
  theme?: 'light' | 'dark';
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ theme = 'light' }) => {
  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatArea />
      </div>
    </div>
  );
};

export default ChatLayout;