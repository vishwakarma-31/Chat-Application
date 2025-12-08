import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate, userRegistrationSchema, userLoginSchema } from '../middleware/validationMiddleware';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validate(userRegistrationSchema), (req, res) => authController.register(req, res));

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', validate(userLoginSchema), (req, res) => authController.login(req, res));

export default router;