import { Message, Conversation, LinkPreview } from '../types/chat';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export class ChatService {
  /**
   * Fetch conversations for the current user
   */
  static async fetchConversations(userId: string): Promise<Conversation[]> {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/conversations/${userId}`);
      // return response.json();
      
      // Mock implementation for now
      return [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Fetch messages for a conversation
   */
  static async fetchMessages(conversationId: string): Promise<Message[]> {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`);
      // return response.json();
      
      // Mock implementation for now
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a new message
   */
  static async sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'>): Promise<Message> {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(message),
      // });
      // return response.json();
      
      // Mock implementation for now
      return {
        ...message,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        status: 'sent'
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Generate link preview
   */
  static async generateLinkPreview(url: string): Promise<LinkPreview | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        return null;
      }
      
      return response.json();
    } catch (error) {
      console.error('Error generating link preview:', error);
      return null;
    }
  }
}