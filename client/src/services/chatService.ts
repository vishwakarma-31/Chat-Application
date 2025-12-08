import { Message, Conversation, LinkPreview } from '../types/chat';
import { 
  API_BASE_URL, 
  MESSAGE_LIMIT, 
  HTTP_POST,
  HTTP_GET
} from '../constants';

export class ChatService {
  /**
   * Fetch conversations for the current user
   */
  static async fetchConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations/${userId}`, {
        method: HTTP_GET,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Fetch messages for a conversation with pagination support
   * @param conversationId The ID of the conversation
   * @param limit Number of messages to fetch (default: 50)
   * @param offset Number of messages to skip (for pagination)
   */
  static async fetchMessages(
    conversationId: string, 
    limit: number = MESSAGE_LIMIT, 
    offset: number = 0
  ): Promise<Message[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${conversationId}?limit=${limit}&offset=${offset}`, {
        method: HTTP_GET,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: HTTP_POST,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(message),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
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
        method: HTTP_POST,
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