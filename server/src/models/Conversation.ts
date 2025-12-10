import { Conversation as ConversationType, MessageEntity, Participant } from '../types/chatTypes';

export class Conversation implements ConversationType {
  conversationId: string;
  title?: string;
  isGroup?: boolean;
  participants: { items: Participant[] };
  messages: { items: MessageEntity[] };

  constructor(data: Omit<ConversationType, 'participants' | 'messages'>) {
    this.conversationId = data.conversationId;
    this.title = data.title;
    this.isGroup = data.isGroup;
    this.participants = { items: [] };
    this.messages = { items: [] };
  }

  // Add a participant to the conversation
  addParticipant(participant: Participant): void {
    this.participants.items.push(participant);
  }

  // Remove a participant from the conversation
  removeParticipant(userId: string): boolean {
    const index = this.participants.items.findIndex(p => p.userId === userId);
    if (index !== -1) {
      this.participants.items.splice(index, 1);
      return true;
    }
    return false;
  }

  // Add a message to the conversation
  addMessage(message: MessageEntity): void {
    this.messages.items.push(message);
  }

  // Remove a message from the conversation
  removeMessage(messageId: string): boolean {
    const index = this.messages.items.findIndex(m => m.messageId === messageId);
    if (index !== -1) {
      this.messages.items.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get messages sorted by timestamp
  getMessagesSorted(): MessageEntity[] {
    return [...this.messages.items].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  // Get the last message in the conversation
  getLastMessage(): MessageEntity | null {
    if (this.messages.items.length === 0) {
      return null;
    }
    
    return this.getMessagesSorted()[this.messages.items.length - 1];
  }

  // Check if user is a participant
  isParticipant(userId: string): boolean {
    return this.participants.items.some(p => p.userId === userId);
  }

  // Get participant count
  getParticipantCount(): number {
    return this.participants.items.length;
  }

  // Convert to plain object for serialization
  toJSON(): ConversationType {
    return {
      conversationId: this.conversationId,
      title: this.title,
      isGroup: this.isGroup,
      participants: this.participants,
      messages: this.messages
    };
  }
}