import React, { useEffect, useRef } from 'react';
import { MessageEntity } from '../types/chatTypes';
import { useChatStore } from '../stores/chatStore';

interface MessageListProps {
  messages: MessageEntity[];
  conversationId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { currentUser } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce((groups, message) => {
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup.senderId === message.senderId) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        senderId: message.senderId,
        messages: [message]
      });
    }
    
    return groups;
  }, [] as { senderId: string; messages: MessageEntity[] }[]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="h-full overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-4">
          {group.messages.map((message, messageIndex) => {
            const isCurrentUser = message.senderId === currentUser?.userId;
            const showAvatar = messageIndex === group.messages.length - 1;
            const isFirstInGroup = messageIndex === 0;
            
            return (
              <div 
                key={message.messageId}
                className={`flex mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isCurrentUser && showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <span className="font-bold text-white text-xs">U</span>
                  </div>
                )}
                
                <div className="flex flex-col">
                  {isFirstInGroup && !isCurrentUser && (
                    <div className="text-xs text-gray-500 ml-2 mb-1">
                      User Name
                    </div>
                  )}
                  
                  <div 
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <p>{message.body}</p>
                    {messageIndex === group.messages.length - 1 && (
                      <div className={`text-xs mt-1 flex justify-end ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
                
                {isCurrentUser && showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                    <span className="font-bold text-white text-xs">
                      {currentUser?.profile?.username?.charAt(0).toUpperCase() || 'Y'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;