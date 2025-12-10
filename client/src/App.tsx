import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatLayout from './components/ChatLayout';
import useChatConnection from './hooks/useChatConnection';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isConnected, isConnecting } = useChatConnection();
  
  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
  };
  
  if (!isLoggedIn) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleAuthSuccess} />} />
          <Route path="/signup" element={<Signup onSignupSuccess={handleAuthSuccess} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }
  
  return (
    <Router>
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
        <Routes>
          <Route path="*" element={<ChatLayout />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;