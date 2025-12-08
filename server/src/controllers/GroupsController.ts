import { Request, Response } from 'express';
import { Client } from 'cassandra-driver';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

// Initialize Cassandra client
const cassandraClient = new Client({
  contactPoints: config.cassandraHosts,
  localDataCenter: 'datacenter1',
  keyspace: config.cassandraKeyspace
});

export class GroupsController {
  /**
   * Create a new group
   */
  public async createGroup(req: Request, res: Response): Promise<void> {
    try {
      const { name, participants, avatarUrl } = req.body;
      const creatorId = req.user?.userId;
      
      if (!creatorId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      if (!name || !participants || !Array.isArray(participants) || participants.length === 0) {
        res.status(400).json({ error: 'Group name and participants are required' });
        return;
      }
      
      // Validate that creator is in participants
      if (!participants.includes(creatorId)) {
        participants.push(creatorId);
      }
      
      // Generate a new group ID
      const groupId = uuidv4();
      const createdAt = new Date();
      const updatedAt = new Date();
      
      // Insert group into Cassandra
      const groupQuery = `
        INSERT INTO conversations (
          conversation_id, 
          participants, 
          conversation_type, 
          name, 
          avatar_url, 
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const groupParams = [
        groupId,
        participants,
        'group',
        name,
        avatarUrl || null,
        createdAt,
        updatedAt
      ];
      
      await cassandraClient.execute(groupQuery, groupParams, { prepare: true });
      
      // Insert user_conversations records for all participants
      const userConvQuery = `
        INSERT INTO user_conversations (
          user_id, 
          conversation_id, 
          unread_count, 
          muted, 
          archived, 
          pinned
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      // Create promises for all user_conversations inserts
      const userConvPromises = participants.map(userId => {
        const userConvParams = [
          userId,
          groupId,
          0, // unread_count
          false, // muted
          false, // archived
          false  // pinned
        ];
        return cassandraClient.execute(userConvQuery, userConvParams, { prepare: true });
      });
      
      // Execute all user_conversations inserts
      await Promise.all(userConvPromises);
      
      // Return the created group
      const group = {
        conversation_id: groupId,
        participants: participants,
        conversation_type: 'group',
        name,
        avatar_url: avatarUrl || null,
        created_at: createdAt,
        updated_at: updatedAt
      };
      
      res.status(201).json({ group });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Get group details
   */
  public async getGroup(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      // Validate UUID format for groupId
      if (!groupId || !this.isValidUUID(groupId)) {
        res.status(400).json({ error: 'Valid group ID is required' });
        return;
      }
      
      // Query group from Cassandra
      const query = `
        SELECT conversation_id, participants, conversation_type, name, avatar_url, created_at, updated_at
        FROM conversations 
        WHERE conversation_id = ?
      `;
      
      const params = [groupId];
      const result = await cassandraClient.execute(query, params, { prepare: true });
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }
      
      const groupRow = result.rows[0];
      
      // Check if user is a participant of the group
      if (!groupRow.participants.includes(userId)) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      // Return the group
      const group = {
        id: groupRow.conversation_id,
        participants: groupRow.participants,
        type: groupRow.conversation_type,
        name: groupRow.name,
        avatarUrl: groupRow.avatar_url,
        createdAt: groupRow.created_at,
        updatedAt: groupRow.updated_at
      };
      
      res.json({ group });
    } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Add a user to a group
   */
  public async addUserToGroup(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      const requesterId = req.user?.userId;
      
      if (!requesterId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      // Validate UUID format for groupId
      if (!groupId || !this.isValidUUID(groupId)) {
        res.status(400).json({ error: 'Valid group ID is required' });
        return;
      }
      
      // Validate userId
      if (!userId || !Number.isInteger(userId)) {
        res.status(400).json({ error: 'Valid user ID is required' });
        return;
      }
      
      // Query group from Cassandra
      const groupQuery = `
        SELECT conversation_id, participants
        FROM conversations 
        WHERE conversation_id = ?
      `;
      
      const groupParams = [groupId];
      const groupResult = await cassandraClient.execute(groupQuery, groupParams, { prepare: true });
      
      if (groupResult.rows.length === 0) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }
      
      const groupRow = groupResult.rows[0];
      
      // Check if requester is a participant of the group (admins can add users)
      if (!groupRow.participants.includes(requesterId)) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      // Check if user is already in the group
      if (groupRow.participants.includes(userId)) {
        res.status(400).json({ error: 'User is already in the group' });
        return;
      }
      
      // Update participants list
      const updatedParticipants = [...groupRow.participants, userId];
      
      // Update group participants in Cassandra
      const updateGroupQuery = `
        UPDATE conversations 
        SET participants = ?, updated_at = ?
        WHERE conversation_id = ?
      `;
      
      const updateGroupParams = [
        updatedParticipants,
        new Date(),
        groupId
      ];
      
      await cassandraClient.execute(updateGroupQuery, updateGroupParams, { prepare: true });
      
      // Insert user_conversation record for the new user
      const userConvQuery = `
        INSERT INTO user_conversations (
          user_id, 
          conversation_id, 
          unread_count, 
          muted, 
          archived, 
          pinned
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const userConvParams = [
        userId,
        groupId,
        0, // unread_count
        false, // muted
        false, // archived
        false  // pinned
      ];
      
      await cassandraClient.execute(userConvQuery, userConvParams, { prepare: true });
      
      res.json({ message: 'User added to group successfully' });
    } catch (error) {
      console.error('Error adding user to group:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Remove a user from a group
   */
  public async removeUserFromGroup(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      const requesterId = req.user?.userId;
      
      if (!requesterId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      // Validate UUID format for groupId
      if (!groupId || !this.isValidUUID(groupId)) {
        res.status(400).json({ error: 'Valid group ID is required' });
        return;
      }
      
      // Validate userId
      if (!userId || !Number.isInteger(userId)) {
        res.status(400).json({ error: 'Valid user ID is required' });
        return;
      }
      
      // Query group from Cassandra
      const groupQuery = `
        SELECT conversation_id, participants
        FROM conversations 
        WHERE conversation_id = ?
      `;
      
      const groupParams = [groupId];
      const groupResult = await cassandraClient.execute(groupQuery, groupParams, { prepare: true });
      
      if (groupResult.rows.length === 0) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }
      
      const groupRow = groupResult.rows[0];
      
      // Check if requester is a participant of the group (admins can remove users)
      if (!groupRow.participants.includes(requesterId)) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      // Check if user is in the group
      if (!groupRow.participants.includes(userId)) {
        res.status(400).json({ error: 'User is not in the group' });
        return;
      }
      
      // Prevent users from removing themselves unless they're the last participant
      if (requesterId === userId && groupRow.participants.length > 1) {
        res.status(400).json({ error: 'You cannot remove yourself from the group' });
        return;
      }
      
      // Update participants list
      const updatedParticipants = groupRow.participants.filter((id: number) => id !== userId);
      
      // Update group participants in Cassandra
      const updateGroupQuery = `
        UPDATE conversations 
        SET participants = ?, updated_at = ?
        WHERE conversation_id = ?
      `;
      
      const updateGroupParams = [
        updatedParticipants,
        new Date(),
        groupId
      ];
      
      await cassandraClient.execute(updateGroupQuery, updateGroupParams, { prepare: true });
      
      // Delete user_conversation record for the removed user
      const deleteUserConvQuery = `
        DELETE FROM user_conversations 
        WHERE user_id = ? AND conversation_id = ?
      `;
      
      const deleteUserConvParams = [userId, groupId];
      
      await cassandraClient.execute(deleteUserConvQuery, deleteUserConvParams, { prepare: true });
      
      res.json({ message: 'User removed from group successfully' });
    } catch (error) {
      console.error('Error removing user from group:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}