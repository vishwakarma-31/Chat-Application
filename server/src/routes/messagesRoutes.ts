import { Router } from 'express';
import { MessagesController } from '../controllers/MessagesController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const messagesController = new MessagesController();

/**
 * @route GET /api/messages/conversations/:userId
 * @desc Fetch conversations for a user
 * @access Private
 */
router.get('/conversations/:userId', authenticateToken, (req, res) => messagesController.fetchConversations(req, res));

/**
 * @route GET /api/messages/:conversationId
 * @desc Fetch messages for a conversation
 * @access Private
 */
router.get('/:conversationId', authenticateToken, (req, res) => messagesController.fetchMessages(req, res));

/**
 * @route POST /api/messages
 * @desc Send a new message
 * @access Private
 */
router.post('/', authenticateToken, (req, res) => messagesController.sendMessage(req, res));

export default router;