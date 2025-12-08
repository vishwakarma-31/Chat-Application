import { Conversation } from '../types/chat';
import { API_BASE_URL, HTTP_GET, HTTP_POST, HTTP_DELETE } from '../constants';

/**
 * Service for managing group chat operations
 * Handles creating, updating, and managing group conversations
 */
export class GroupService {
  /**
   * Create a new group
   * @param name - Group name
   * @param participants - Array of user IDs to include in the group
   * @param avatarUrl - Optional avatar URL for the group
   * @returns Promise resolving to the created group
   */
  static async createGroup(
    name: string, 
    participants: number[], 
    avatarUrl?: string
  ): Promise<Conversation> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: HTTP_POST,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, participants, avatarUrl })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create group');
      }
      
      const data = await response.json();
      return data.group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }
  
  /**
   * Get group details
   * @param groupId - ID of the group to fetch
   * @returns Promise resolving to the group details
   */
  static async getGroup(groupId: string): Promise<Conversation> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: HTTP_GET,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch group');
      }
      
      const data = await response.json();
      return data.group;
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }
  
  /**
   * Add a user to a group
   * @param groupId - ID of the group
   * @param userId - ID of the user to add
   * @returns Promise resolving to success message
   */
  static async addUserToGroup(groupId: string, userId: number): Promise<string> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/users`, {
        method: HTTP_POST,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add user to group');
      }
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error adding user to group:', error);
      throw error;
    }
  }
  
  /**
   * Remove a user from a group
   * @param groupId - ID of the group
   * @param userId - ID of the user to remove
   * @returns Promise resolving to success message
   */
  static async removeUserFromGroup(groupId: string, userId: number): Promise<string> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/users`, {
        method: HTTP_DELETE,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove user from group');
      }
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error removing user from group:', error);
      throw error;
    }
  }
}