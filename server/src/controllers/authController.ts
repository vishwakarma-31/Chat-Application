import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserEntity, Session, LoginResponse, AuthStatus } from '../types/chatTypes';

// Mock user data - in a real application, this would come from a database
const mockUsers: UserEntity[] = [
  {
    userId: 'user-1',
    createdAt: new Date(),
    profile: {
      displayName: 'John Doe',
      username: 'johndoe',
      avatarUrl: 'https://example.com/avatar1.jpg',
      onlineStatus: 'Online'
    },
    settings: {
      notificationsEnabled: true,
      readReceiptsEnabled: true
    }
  },
  {
    userId: 'user-2',
    createdAt: new Date(),
    profile: {
      displayName: 'Jane Smith',
      username: 'janesmith',
      avatarUrl: 'https://example.com/avatar2.jpg',
      onlineStatus: 'Away'
    },
    settings: {
      notificationsEnabled: true,
      readReceiptsEnabled: true
    }
  }
];

// Secret key for JWT - should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      res.status(400).json({
        error: 'Username and password are required'
      });
      return;
    }
    
    // Find user by username (in a real app, this would be a database query)
    const user = mockUsers.find(u => u.profile.username === username);
    
    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }
    
    // In a real application, you would verify the password with bcrypt
    // For this example, we'll assume the password is correct
    
    // Create JWT tokens
    const token = jwt.sign(
      { userId: user.userId, username: user.profile.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.userId, username: user.profile.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Create session object
    const session: Session = {
      token,
      refreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      issuedAt: new Date()
    };
    
    // Create login response
    const loginResponse: LoginResponse = {
      status: 'Success' as AuthStatus,
      session,
      userProfile: user
    };
    
    // Return successful response
    res.status(200).json(loginResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real application, you would invalidate the token
    // For this example, we'll just return a success response
    
    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

export const refreshSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        error: 'Refresh token is required'
      });
      return;
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      res.status(401).json({
        error: 'Invalid refresh token'
      });
      return;
    }
    
    // Find user by userId from token
    const user = mockUsers.find(u => u.userId === (decoded as any).userId);
    
    if (!user) {
      res.status(401).json({
        error: 'User not found'
      });
      return;
    }
    
    // Create new JWT tokens
    const newToken = jwt.sign(
      { userId: user.userId, username: user.profile.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const newRefreshToken = jwt.sign(
      { userId: user.userId, username: user.profile.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Create session object
    const session: Session = {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      issuedAt: new Date()
    };
    
    // Create login response
    const loginResponse: LoginResponse = {
      status: 'Success' as AuthStatus,
      session,
      userProfile: user
    };
    
    // Return successful response
    res.status(200).json(loginResponse);
  } catch (error) {
    console.error('Refresh session error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};