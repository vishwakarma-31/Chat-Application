import { Request, Response } from 'express';
import { createMessage, getMessagesByConversationId, updateMessageStatus } from '../services/messageService';
import { MessageEntity } from '../types/chatTypes';
import { authenticateToken } from '../middleware/authMiddleware';

// Send a new message
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId, body, attachments, reactions } = req.body;
    
    // Validate input
    if (!conversationId || !body) {
      res.status(400).json({
        error: 'Conversation ID and message body are required'
      });
      return;
    }
    
    // In a real application, you would get the senderId from the authenticated user
    const senderId = req.user?.userId || 'anonymous';
    
    // Create the message
    const message = await createMessage(conversationId, {
      senderId,
      body,
      attachments: attachments || [],
      reactions: reactions || []
    });
    
    // Return the created message
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      res.status(400).json({
        error: 'Conversation ID is required'
      });
      return;
    }
    
    const messages = await getMessagesByConversationId(conversationId);
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Update message status (e.g., mark as delivered/read)
export const updateMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    if (!messageId || !status) {
      res.status(400).json({
        error: 'Message ID and status are required'
      });
      return;
    }
    
    const success = await updateMessageStatus(messageId, status);
    
    if (success) {
      res.status(200).json({
        message: 'Message status updated successfully'
      });
    } else {
      res.status(404).json({
        error: 'Message not found'
      });
    }
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};