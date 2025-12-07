import { User } from '../types/chat';

const API_BASE_URL = 'http://localhost:8000/api';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: { 
    username: string; 
    email: string; 
    password: string;
    phoneNumber?: string;
    displayName?: string;
  }): Promise<{ user: User; token: string } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      return response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(credentials: { 
    username: string; 
    password: string 
  }): Promise<{ user: User; token: string } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      return response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    // Clear token from localStorage or sessionStorage
    localStorage.removeItem('authToken');
    // Additional cleanup if needed
  }

  /**
   * Get current user from token
   */
  static getCurrentUser(): User | null {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      // Decode JWT token to get user info
      // This is a simplified example - in practice, you'd use a JWT library
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        username: payload.username,
        displayName: payload.username,
        status: 'online'
      } as User;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Set authentication token
   */
  static setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Get authentication token
   */
  static getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}