import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatService } from './chatService';
import { Message, Conversation, LinkPreview } from '../types/chat';

// Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ChatService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Set up localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  describe('fetchConversations', () => {
    it('should fetch conversations successfully', async () => {
      const mockConversations: Conversation[] = [
        {
          id: 'conv1',
          participants: [],
          type: 'private',
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConversations)
      });

      const result = await ChatService.fetchConversations('user123');
      
      expect(result).toEqual(mockConversations);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/messages/conversations/user123',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }
        }
      );
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(ChatService.fetchConversations('user123'))
        .rejects
        .toThrow('Failed to fetch conversations');
    });
  });

  describe('fetchMessages', () => {
    it('should fetch messages successfully', async () => {
      const mockMessages: Message[] = [
        {
          id: 'msg1',
          conversationId: 'conv1',
          senderId: 1,
          content: 'Hello',
          timestamp: new Date(),
          messageType: 'text',
          status: 'sent'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMessages)
      });

      const result = await ChatService.fetchMessages('conv1', 20, 0);
      
      expect(result).toEqual(mockMessages);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/messages/conv1?limit=20&offset=0',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }
        }
      );
    });

    it('should use default parameters when not provided', async () => {
      const mockMessages: Message[] = [];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMessages)
      });

      await ChatService.fetchMessages('conv1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/messages/conv1?limit=50&offset=0',
        expect.any(Object)
      );
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const newMessage = {
        conversationId: 'conv1',
        senderId: 1,
        content: 'Hello World',
        messageType: 'text' as const
      };

      const mockResponse: Message = {
        id: 'msg123',
        ...newMessage,
        timestamp: new Date(),
        status: 'sent'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await ChatService.sendMessage(newMessage);
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify(newMessage)
        }
      );
    });

    it('should throw error when send fails', async () => {
      const newMessage = {
        conversationId: 'conv1',
        senderId: 1,
        content: 'Hello World',
        messageType: 'text' as const
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(ChatService.sendMessage(newMessage))
        .rejects
        .toThrow('Failed to send message');
    });
  });

  describe('generateLinkPreview', () => {
    it('should generate link preview successfully', async () => {
      const mockPreview: LinkPreview = {
        url: 'https://example.com',
        title: 'Example',
        description: 'An example website',
        image: 'https://example.com/image.jpg',
        siteName: 'Example Site'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPreview)
      });

      const result = await ChatService.generateLinkPreview('https://example.com');
      
      expect(result).toEqual(mockPreview);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/preview',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: 'https://example.com' })
        }
      );
    });

    it('should return null when preview generation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await ChatService.generateLinkPreview('https://example.com');
      
      expect(result).toBeNull();
    });
  });
});