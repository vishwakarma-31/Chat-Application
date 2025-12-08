import { Router } from 'express';
import { GroupsController } from '../controllers/GroupsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const groupsController = new GroupsController();

/**
 * @route POST /api/groups
 * @desc Create a new group
 * @access Private
 */
router.post('/', authenticateToken, (req, res) => groupsController.createGroup(req, res));

/**
 * @route GET /api/groups/:groupId
 * @desc Get group details
 * @access Private
 */
router.get('/:groupId', authenticateToken, (req, res) => groupsController.getGroup(req, res));

/**
 * @route POST /api/groups/:groupId/users
 * @desc Add a user to a group
 * @access Private
 */
router.post('/:groupId/users', authenticateToken, (req, res) => groupsController.addUserToGroup(req, res));

/**
 * @route DELETE /api/groups/:groupId/users
 * @desc Remove a user from a group
 * @access Private
 */
router.delete('/:groupId/users', authenticateToken, (req, res) => groupsController.removeUserFromGroup(req, res));

export default router;