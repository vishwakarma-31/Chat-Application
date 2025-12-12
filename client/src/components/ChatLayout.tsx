import React from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

const ChatLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-200/30 blur-[100px]" />
      </div>

      <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200/60 bg-white/70 backdrop-blur-xl z-10">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col relative z-0">
        <ChatArea />
      </div>
    </div>
  );
};

export default ChatLayout;