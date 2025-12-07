import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserCredentials, UserRegistrationData } from '../models/User';

export class AuthController {
  /**
   * Register a new user
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: UserRegistrationData = req.body;

      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
      }

      // Check if user already exists (simulated)
      const existingUser = await this.findUserByUsername(userData.username);
      if (existingUser) {
        res.status(409).json({ error: 'Username already exists' });
        return;
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user (simulated)
      const newUser: User = {
        id: Math.floor(Math.random() * 1000000),
        username: userData.username,
        email: userData.email,
        passwordHash: passwordHash,
        phoneNumber: userData.phoneNumber,
        displayName: userData.displayName || userData.username,
        status: 'online',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
        { expiresIn: '24h' }
      );

      // Return user data without password hash and with token
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Login user
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: UserCredentials = req.body;

      // Validate required fields
      if (!credentials.username || !credentials.password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      // Find user (simulated)
      const user = await this.findUserByUsername(credentials.username);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Update last seen
      user.lastSeen = new Date();
      user.status = 'online';

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
        { expiresIn: '24h' }
      );

      // Return user data without password hash and with token
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Simulate finding a user by username
   * In a real implementation, this would query the database
   */
  private async findUserByUsername(username: string): Promise<User | null> {
    // This is a simulated implementation
    // In reality, you would query your database here
    return null;
  }
}