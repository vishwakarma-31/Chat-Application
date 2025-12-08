import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserCredentials, UserRegistrationData } from '../models/User';
import config from '../config';
import { query } from '../utils/db';

export class AuthController {
  /**
   * Register a new user
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: UserRegistrationData = req.body;

      // Check if user already exists
      const existingUserResult = await query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [userData.username, userData.email]
      );
      
      if (existingUserResult.rowCount > 0) {
        res.status(409).json({ error: 'Username or email already exists' });
        return;
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user in database
      const createUserResult = await query(
        `INSERT INTO users 
         (username, email, password_hash, phone_number, display_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, username, email, phone_number, display_name, status, last_seen, created_at, updated_at`,
        [
          userData.username,
          userData.email,
          passwordHash,
          userData.phoneNumber || null,
          userData.displayName || userData.username
        ]
      );

      const newUser = createUserResult.rows[0];
      
      // Ensure proper typing for the user object
      const userWithCorrectTypes: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        passwordHash: '', // We don't send this to the client
        phoneNumber: newUser.phone_number,
        displayName: newUser.display_name,
        profilePictureUrl: undefined,
        status: newUser.status || 'online',
        lastSeen: new Date(newUser.last_seen),
        createdAt: new Date(newUser.created_at),
        updatedAt: new Date(newUser.updated_at)
      };

      // Generate JWT token
      const payload = { userId: userWithCorrectTypes.id, username: userWithCorrectTypes.username };
      // Simple approach without explicit options typing
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });

      // Return user data without password hash and with token
      const { passwordHash: _, ...userWithoutPassword } = userWithCorrectTypes;
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

      // Find user in database
      const userResult = await query(
        'SELECT id, username, email, password_hash, phone_number, display_name, profile_picture_url, status, last_seen, created_at, updated_at FROM users WHERE username = $1',
        [credentials.username]
      );
      
      if (userResult.rowCount === 0) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const userRow = userResult.rows[0];
      
      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, userRow.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Update last seen
      await query(
        'UPDATE users SET last_seen = NOW(), status = $1 WHERE id = $2',
        ['online', userRow.id]
      );

      // Ensure proper typing for the user object
      const user: User = {
        id: userRow.id,
        username: userRow.username,
        email: userRow.email,
        passwordHash: '', // We don't send this to the client
        phoneNumber: userRow.phone_number,
        displayName: userRow.display_name,
        profilePictureUrl: userRow.profile_picture_url || undefined,
        status: userRow.status || 'online',
        lastSeen: new Date(userRow.last_seen),
        createdAt: new Date(userRow.created_at),
        updatedAt: new Date(userRow.updated_at)
      };

      // Generate JWT token
      const payload = { userId: user.id, username: user.username };
      // Simple approach without explicit options typing
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });

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
}