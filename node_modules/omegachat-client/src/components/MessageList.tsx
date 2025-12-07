import React, { memo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import MessageBubble from './MessageBubble';
import { Message } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onMessageAction?: (action: string, messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserId,
  onMessageAction 
}) => {
  const handleMessageAction = useCallback((action: string, messageId: string) => {
    if (onMessageAction) {
      onMessageAction(action, messageId);
    }
  }, [onMessageAction]);

  const renderItem = useCallback((index: number, message: Message) => {
    const isOwnMessage = message.senderId === currentUserId;
    return (
      <MessageBubble
        key={message.id}
        message={message}
        isOwnMessage={isOwnMessage}
        onAction={handleMessageAction}
      />
    );
  }, [currentUserId, handleMessageAction]);

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