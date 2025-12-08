import { User } from '../types/chat';
import { API_BASE_URL, HTTP_GET, HTTP_PUT, HTTP_PATCH } from '../constants';

/**
 * Service for managing user profile operations
 * Handles fetching, updating, and managing user profile data
 */
export class UserProfileService {
  /**
   * Get user profile
   * @returns Promise resolving to user profile data
   */
  static async getProfile(): Promise<User> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: HTTP_GET,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   * @param profileData - Partial user profile data to update
   * @returns Promise resolving to updated user profile
   */
  static async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: HTTP_PUT,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user status
   * @param status - New status for the user
   * @returns Promise resolving to updated user profile
   */
  static async updateStatus(status: 'online' | 'offline' | 'away'): Promise<User> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/profile/status`, {
        method: HTTP_PATCH,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
}