import { Request, Response } from 'express';
import { Client } from 'cassandra-driver';
import { v4 as uuidv4, validate } from 'uuid';
import config from '../config';

// Initialize Cassandra client
const cassandraClient = new Client({
  contactPoints: config.cassandraHosts,
  localDataCenter: 'datacenter1',
  keyspace: config.cassandraKeyspace
});

export class MessagesController {
  /**
   * Fetch messages for a conversation with pagination support
   */
  public async fetchMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { limit = 50, pageState } = req.query;
      
      // Convert limit to number
      const limitNum = parseInt(limit as string, 10);
      
      // Validate UUID format for conversationId
      if (!conversationId || !isValidUUID(conversationId)) {
        res.status(400).json({ error: 'Valid conversation ID is required' });
        return;
      }
      
      // Query messages from Cassandra using cursor-based pagination
      const query = `
        SELECT * FROM messages 
        WHERE conversation_id = ?
      `;
      
      const params = [conversationId];
      
      // Execute query with page state for pagination
      const options: any = { 
        prepare: true, 
        fetchSize: limitNum 
      };
      
      // If pageState is provided, use it for pagination
      if (pageState) {
        options.pageState = pageState;
      }
      
      const result = await cassandraClient.execute(query, params, options);
      
      // Return messages with pagination info
      res.json({
        messages: result.rows,
        pageState: result.pageState
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Send a new message
   */
  public async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { 
        conversationId, 
        senderId, 
        recipientId, 
        content, 
        mediaUrls = [],
        messageType = 'text',
        status = 'sent'
      } = req.body;
      
      // Validate required fields
      if (!conversationId || !isValidUUID(conversationId)) {
        res.status(400).json({ error: 'Valid conversation ID is required' });
        return;
      }
      
      if (!senderId || !Number.isInteger(senderId)) {
        res.status(400).json({ error: 'Valid sender ID is required' });
        return;
      }
      
      if (!content || content.trim() === '') {
        res.status(400).json({ error: 'Message content is required' });
        return;
      }
      
      // Generate a new message ID
      const messageId = uuidv4();
      const timestamp = new Date();
      
      // Insert message into Cassandra
      const query = `
        INSERT INTO messages (
          conversation_id, 
          message_id, 
          sender_id, 
          recipient_id, 
          content, 
          media_urls, 
          message_type, 
          status, 
          timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        conversationId,
        messageId,
        senderId,
        recipientId,
        content,
        mediaUrls,
        messageType,
        status,
        timestamp
      ];
      
      await cassandraClient.execute(query, params, { prepare: true });
      
      // Return the created message
      const message = {
        conversation_id: conversationId,
        message_id: messageId,
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        media_urls: mediaUrls,
        message_type: messageType,
        status,
        timestamp
      };
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Fetch conversations for a user
   */
  public async fetchConversations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      // Validate user ID
      if (!userId || !Number.isInteger(parseInt(userId, 10))) {
        res.status(400).json({ error: 'Valid user ID is required' });
        return;
      }
      
      const userIdInt = parseInt(userId, 10);
      
      // Query user_conversations to get the list of conversation IDs first
      const userConversationsQuery = `SELECT conversation_id FROM user_conversations WHERE user_id = ?`;
      const userConversationsParams = [userIdInt];
      const userConversationsResult = await cassandraClient.execute(userConversationsQuery, userConversationsParams, { prepare: true });
      
      // Extract conversation IDs
      const conversationIds = userConversationsResult.rows.map(row => row.conversation_id);
      
      // If no conversations, return empty array
      if (conversationIds.length === 0) {
        res.json([]);
        return;
      }
      
      // Query conversations using the retrieved IDs
      const conversationsQuery = `SELECT * FROM conversations WHERE conversation_id IN ?`;
      const conversationsParams = [conversationIds];
      const result = await cassandraClient.execute(conversationsQuery, conversationsParams, { prepare: true });
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Validate UUID format using standard library
 */
function isValidUUID(uuid: string): boolean {
  return validate(uuid);
}