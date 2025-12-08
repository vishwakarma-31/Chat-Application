import { Request, Response } from 'express';
import { Client } from 'cassandra-driver';
import { v4 as uuidv4 } from 'uuid';
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
      const { limit = 50, offset = 0 } = req.query;
      
      // Convert limit and offset to numbers
      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);
      
      // Validate UUID format for conversationId
      if (!conversationId || !isValidUUID(conversationId)) {
        res.status(400).json({ error: 'Valid conversation ID is required' });
        return;
      }
      
      // Query messages from Cassandra
      // Using LIMIT and OFFSET for pagination (note: this is not the most efficient way in Cassandra)
      const query = `
        SELECT * FROM messages 
        WHERE conversation_id = ? 
        LIMIT ?
      `;
      
      const params = [conversationId, limitNum + offsetNum];
      const result = await cassandraClient.execute(query, params, { prepare: true });
      
      // Apply offset on the application side since Cassandra doesn't support OFFSET directly
      const messages = result.rows.slice(offsetNum);
      
      res.json(messages);
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
      
      // Query conversations from Cassandra where user is a participant
      const query = `
        SELECT * FROM conversations 
        WHERE conversation_id IN (
          SELECT conversation_id FROM user_conversations WHERE user_id = ?
        )
      `;
      
      const params = [userIdInt];
      const result = await cassandraClient.execute(query, params, { prepare: true });
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}