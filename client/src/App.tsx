import React, { useState } from 'react';
import ChatLayout from './components/ChatLayout';
import useChatConnection from './hooks/useChatConnection';
import Login from './components/auth/Login';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isConnected, isConnecting } = useChatConnection();
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };
  
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {isConnecting && (
        <div className="bg-yellow-500 text-white text-center py-2">
          Connecting to server...
        </div>
      )}
      {!isConnected && !isConnecting && (
        <div className="bg-red-500 text-white text-center py-2">
          Disconnected from server. Attempting to reconnect...
        </div>
      )}
      <ChatLayout />
    </div>
  );
};

export default App;