import express from 'express';
import { login, logout, refreshSession } from '../controllers/authController';

const router = express.Router();

// POST /api/auth/login - User login
router.post('/login', login);

// POST /api/auth/logout - User logout
router.post('/logout', logout);

// POST /api/auth/refresh - Refresh session
router.post('/refresh', refreshSession);

export default router;