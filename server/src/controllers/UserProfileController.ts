import { Request, Response } from 'express';
import { User } from '../models/User';
import { query } from '../utils/db';
import { authenticateToken } from '../middleware/authMiddleware';

export class UserProfileController {
  /**
   * Get user profile
   * @param req Express Request object
   * @param res Express Response object
   */
  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from authenticated token
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      // Fetch user from database
      const userResult = await query(
        'SELECT id, username, email, phone_number, display_name, profile_picture_url, status, last_seen, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rowCount === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      const userRow = userResult.rows[0];
      
      // Map database row to User interface
      const user: User = {
        id: userRow.id,
        username: userRow.username,
        email: userRow.email,
        passwordHash: '', // Don't send password hash to client
        phoneNumber: userRow.phone_number || undefined,
        displayName: userRow.display_name || userRow.username,
        profilePictureUrl: userRow.profile_picture_url || undefined,
        status: userRow.status || 'offline',
        lastSeen: userRow.last_seen ? new Date(userRow.last_seen) : new Date(),
        createdAt: userRow.created_at ? new Date(userRow.created_at) : new Date(),
        updatedAt: userRow.updated_at ? new Date(userRow.updated_at) : new Date()
      };
      
      res.json({ user });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Update user profile
   * @param req Express Request object
   * @param res Express Response object
   */
  public async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from authenticated token
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      // Get update data from request body
      const { displayName, phoneNumber, profilePictureUrl } = req.body;
      
      // Build update query dynamically based on provided fields
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;
      
      if (displayName !== undefined) {
        updateFields.push(`display_name = $${paramIndex}`);
        updateValues.push(displayName);
        paramIndex++;
      }
      
      if (phoneNumber !== undefined) {
        updateFields.push(`phone_number = $${paramIndex}`);
        updateValues.push(phoneNumber);
        paramIndex++;
      }
      
      if (profilePictureUrl !== undefined) {
        updateFields.push(`profile_picture_url = $${paramIndex}`);
        updateValues.push(profilePictureUrl);
        paramIndex++;
      }
      
      // Always update the updated_at timestamp
      updateFields.push(`updated_at = NOW()`);
      
      // If no fields to update, return early
      if (updateFields.length === 1) { // Only updated_at would be present
        const userResult = await query(
          'SELECT id, username, email, phone_number, display_name, profile_picture_url, status, last_seen, created_at, updated_at FROM users WHERE id = $1',
          [userId]
        );
        
        if (userResult.rowCount === 0) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
        
        const userRow = userResult.rows[0];
        
        const user: User = {
          id: userRow.id,
          username: userRow.username,
          email: userRow.email,
          passwordHash: '',
          phoneNumber: userRow.phone_number || undefined,
          displayName: userRow.display_name || userRow.username,
          profilePictureUrl: userRow.profile_picture_url || undefined,
          status: userRow.status || 'offline',
          lastSeen: userRow.last_seen ? new Date(userRow.last_seen) : new Date(),
          createdAt: userRow.created_at ? new Date(userRow.created_at) : new Date(),
          updatedAt: userRow.updated_at ? new Date(userRow.updated_at) : new Date()
        };
        
        res.json({ user });
        return;
      }
      
      // Add userId to the values array for the WHERE clause
      updateValues.push(userId);
      
      // Construct the UPDATE query
      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${updateValues.length} 
        RETURNING id, username, email, phone_number, display_name, profile_picture_url, status, last_seen, created_at, updated_at
      `;
      
      // Execute the update query
      const updateUserResult = await query(updateQuery, updateValues);
      
      if (updateUserResult.rowCount === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      const updatedUserRow = updateUserResult.rows[0];
      
      // Map database row to User interface
      const updatedUser: User = {
        id: updatedUserRow.id,
        username: updatedUserRow.username,
        email: updatedUserRow.email,
        passwordHash: '', // Don't send password hash to client
        phoneNumber: updatedUserRow.phone_number || undefined,
        displayName: updatedUserRow.display_name || updatedUserRow.username,
        profilePictureUrl: updatedUserRow.profile_picture_url || undefined,
        status: updatedUserRow.status || 'offline',
        lastSeen: updatedUserRow.last_seen ? new Date(updatedUserRow.last_seen) : new Date(),
        createdAt: updatedUserRow.created_at ? new Date(updatedUserRow.created_at) : new Date(),
        updatedAt: updatedUserRow.updated_at ? new Date(updatedUserRow.updated_at) : new Date()
      };
      
      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Update user status
   * @param req Express Request object
   * @param res Express Response object
   */
  public async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from authenticated token
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      // Get status from request body
      const { status } = req.body;
      
      // Validate status
      if (!['online', 'offline', 'away'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be online, offline, or away.' });
        return;
      }
      
      // Update user status
      const updateResult = await query(
        'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, phone_number, display_name, profile_picture_url, status, last_seen, created_at, updated_at',
        [status, userId]
      );
      
      if (updateResult.rowCount === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      const userRow = updateResult.rows[0];
      
      // Map database row to User interface
      const user: User = {
        id: userRow.id,
        username: userRow.username,
        email: userRow.email,
        passwordHash: '',
        phoneNumber: userRow.phone_number || undefined,
        displayName: userRow.display_name || userRow.username,
        profilePictureUrl: userRow.profile_picture_url || undefined,
        status: userRow.status,
        lastSeen: userRow.last_seen ? new Date(userRow.last_seen) : new Date(),
        createdAt: userRow.created_at ? new Date(userRow.created_at) : new Date(),
        updatedAt: userRow.updated_at ? new Date(userRow.updated_at) : new Date()
      };
      
      res.json({ user });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}