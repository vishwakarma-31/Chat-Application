import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserEntity } from '../types/chatTypes';

// Extend the Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
    }
  }
}

// Secret key for JWT - should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    
    // In a real application, you would fetch the user from the database
    // For now, we'll just attach the decoded user info to the request
    req.user = decoded as UserEntity;
    next();
  });
};