import { Router } from 'express';
import { UserProfileController } from '../controllers/UserProfileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const userProfileController = new UserProfileController();

/**
 * @route GET /api/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/', authenticateToken, (req, res) => userProfileController.getProfile(req, res));

/**
 * @route PUT /api/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/', authenticateToken, (req, res) => userProfileController.updateProfile(req, res));

/**
 * @route PATCH /api/profile/status
 * @desc Update user status
 * @access Private
 */
router.patch('/status', authenticateToken, (req, res) => userProfileController.updateStatus(req, res));

export default router;