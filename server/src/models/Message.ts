import { MessageEntity, Attachment, Reaction } from '../types/chatTypes';

export class Message implements MessageEntity {
  messageId: string;
  senderId: string;
  timestamp: Date;
  status?: 'Sending' | 'Sent' | 'Delivered' | 'Read' | 'Failed';
  isEdited?: boolean;
  body: string;
  attachments?: Attachment[];
  reactions?: Reaction[];

  constructor(data: Omit<MessageEntity, 'messageId' | 'timestamp'>) {
    this.messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    this.senderId = data.senderId;
    this.timestamp = new Date();
    this.status = data.status || 'Sent';
    this.isEdited = data.isEdited || false;
    this.body = data.body;
    this.attachments = data.attachments || [];
    this.reactions = data.reactions || [];
  }

  // Edit the message
  edit(newBody: string): void {
    this.body = newBody;
    this.isEdited = true;
  }

  // Add an attachment
  addAttachment(attachment: Attachment): void {
    if (!this.attachments) {
      this.attachments = [];
    }
    this.attachments.push(attachment);
  }

  // Remove an attachment
  removeAttachment(url: string): boolean {
    if (!this.attachments) {
      return false;
    }
    
    const index = this.attachments.findIndex(a => a.url === url);
    if (index !== -1) {
      this.attachments.splice(index, 1);
      return true;
    }
    return false;
  }

  // Add a reaction
  addReaction(reaction: Reaction): void {
    if (!this.reactions) {
      this.reactions = [];
    }
    
    // Check if user already reacted with this emoji
    const existingIndex = this.reactions.findIndex(r => 
      r.userId === reaction.userId && r.emoji === reaction.emoji
    );
    
    if (existingIndex === -1) {
      this.reactions.push(reaction);
    }
  }

  // Remove a reaction
  removeReaction(userId: string, emoji: string): boolean {
    if (!this.reactions) {
      return false;
    }
    
    const index = this.reactions.findIndex(r => 
      r.userId === userId && r.emoji === emoji
    );
    
    if (index !== -1) {
      this.reactions.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get reactions grouped by emoji
  getReactionsByEmoji(): Record<string, Reaction[]> {
    if (!this.reactions) {
      return {};
    }
    
    const grouped: Record<string, Reaction[]> = {};
    
    this.reactions.forEach(reaction => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = [];
      }
      grouped[reaction.emoji].push(reaction);
    });
    
    return grouped;
  }

  // Mark message as delivered
  markAsDelivered(): void {
    this.status = 'Delivered';
  }

  // Mark message as read
  markAsRead(): void {
    this.status = 'Read';
  }

  // Convert to plain object for serialization
  toJSON(): MessageEntity {
    return {
      messageId: this.messageId,
      senderId: this.senderId,
      timestamp: this.timestamp,
      status: this.status,
      isEdited: this.isEdited,
      body: this.body,
      attachments: this.attachments,
      reactions: this.reactions
    };
  }
}