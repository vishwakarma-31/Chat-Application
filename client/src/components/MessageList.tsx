import React from 'react';
import { MessageEntity } from '../types/chatTypes';

interface MessageListProps {
  messages: MessageEntity[];
  conversationId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
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
  
  return (
    <div className="h-full overflow-y-auto p-4">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-4">
          {group.messages.map((message) => (
            <div 
              key={message.messageId}
              className={`flex mb-2 ${message.senderId === 'current-user-id' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === 'current-user-id' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p>{message.body}</p>
                <div className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MessageList;