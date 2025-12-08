import { User } from '../types/chat';
import { jwtDecode } from 'jwt-decode';
import { 
  API_BASE_URL, 
  AUTH_TOKEN_KEY, 
  HTTP_POST 
} from '../constants';

interface JwtPayload {
  userId: number;
  username: string;
  exp: number;
  iat: number;
}

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
        method: HTTP_POST,
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
        method: HTTP_POST,
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
    localStorage.removeItem(AUTH_TOKEN_KEY);
    // Additional cleanup if needed
  }

  /**
   * Get current user from token
   */
  static getCurrentUser(): User | null {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;

    try {
      // Decode JWT token to get user info using jwt-decode library
      const payload: JwtPayload = jwtDecode(token);
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        // Token expired, remove it
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return null;
      }
      
      return {
        id: payload.userId,
        username: payload.username,
        email: '', // Email is not in the token, would need to fetch from API
        displayName: payload.username,
        status: 'online'
      } as User;
    } catch (error) {
      console.error('Error decoding token:', error);
      // Invalid token, remove it
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }
  }

  /**
   * Set authentication token
   */
  static setAuthToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Get authentication token
   */
  static getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;
    
    try {
      const payload: JwtPayload = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      // Invalid token
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return false;
    }
  }
}