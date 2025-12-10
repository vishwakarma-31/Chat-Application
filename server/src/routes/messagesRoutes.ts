import express from 'express';
import { sendMessage, getMessages, updateMessage } from '../controllers/messagesController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/messages - Send a new message
router.post('/', sendMessage);

// GET /api/messages/:conversationId - Get messages for a conversation
router.get('/:conversationId', getMessages);

// PUT /api/messages/:messageId - Update message status
router.put('/:messageId', updateMessage);

export default router;