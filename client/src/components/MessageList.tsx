import React, { memo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import MessageBubble from './MessageBubble';
import { Message } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: number; // Changed from string to number to match User.id
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserId
}) => {
  const renderItem = useCallback((_index: number, message: Message) => {
    const isOwnMessage = message.senderId === currentUserId;
    return (
      <MessageBubble
        key={message.id}
        message={message}
        isOwnMessage={isOwnMessage}
      />
    );
  }, [currentUserId]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Virtuoso
        data={messages}
        itemContent={renderItem}
        followOutput={'smooth'}
        components={{
          Footer: () => <div className="h-4" />
        }}
      />
    </div>
  );
};

export default memo(MessageList);