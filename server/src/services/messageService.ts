import { MessageEntity, Conversation } from '../types/chatTypes';
import { getConnectionStatus } from './dbService';

// Mock data - in a real application, this would interact with a database
let conversations: Conversation[] = [];

// Check if Cassandra is available
const isCassandraAvailable = (): boolean => {
  const connectionStatus = getConnectionStatus();
  return connectionStatus.cassandra;
};

export const createMessage = async (conversationId: string, messageData: Omit<MessageEntity, 'messageId' | 'timestamp' | 'conversationId'>): Promise<MessageEntity> => {
  // In a real application, this would save to Cassandra if available
  if (isCassandraAvailable()) {
    console.log('Cassandra is available - would save message to Cassandra in production');
    // TODO: Implement actual Cassandra storage
  } else {
    console.log('Cassandra is not available - using in-memory storage');
  }

  const message: MessageEntity = {
    messageId: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    ...messageData
  };
  
  // Find the conversation or create a new one if it doesn't exist
  let conversation = conversations.find(c => c.conversationId === conversationId);
  
  if (!conversation) {
    conversation = {
      conversationId: conversationId,
      participants: {
        items: []
      },
      messages: {
        items: []
      }
    };
    conversations.push(conversation);
  }
  
  // Add the message to the conversation
  conversation.messages.items.push(message);
  
  return message;
};

export const getMessagesByConversationId = async (conversationId: string): Promise<MessageEntity[]> => {
  // In a real application, this would fetch from Cassandra if available
  if (isCassandraAvailable()) {
    console.log('Cassandra is available - would fetch messages from Cassandra in production');
    // TODO: Implement actual Cassandra retrieval
  } else {
    console.log('Cassandra is not available - using in-memory storage');
  }

  const conversation = conversations.find(c => c.conversationId === conversationId);
  return conversation ? conversation.messages.items : [];
};

export const updateMessageStatus = async (messageId: string, status: MessageEntity['status']): Promise<boolean> => {
  // In a real application, this would update in Cassandra if available
  if (isCassandraAvailable()) {
    console.log('Cassandra is available - would update message status in Cassandra in production');
    // TODO: Implement actual Cassandra update
  } else {
    console.log('Cassandra is not available - using in-memory storage');
  }

  for (const conversation of conversations) {
    const messageIndex = conversation.messages.items.findIndex(m => m.messageId === messageId);
    if (messageIndex !== -1) {
      conversation.messages.items[messageIndex].status = status;
      return true;
    }
  }
  return false;
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  // In a real application, this would delete from Cassandra if available
  if (isCassandraAvailable()) {
    console.log('Cassandra is available - would delete message from Cassandra in production');
    // TODO: Implement actual Cassandra deletion
  } else {
    console.log('Cassandra is not available - using in-memory storage');
  }

  for (const conversation of conversations) {
    const messageIndex = conversation.messages.items.findIndex(m => m.messageId === messageId);
    if (messageIndex !== -1) {
      conversation.messages.items.splice(messageIndex, 1);
      return true;
    }
  }
  return false;
};