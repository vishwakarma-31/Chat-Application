import { Request, Response } from 'express';
import { AuthController } from './AuthController';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../utils/db';

// Mock the external dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../utils/db');

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    authController = new AuthController();
    
    // Setup mock response methods
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User'
        }
      };
    });

    it('should register a new user successfully', async () => {
      // Mock database query to return no existing user
      (query as jest.Mock).mockResolvedValueOnce({ rowCount: 0 });
      
      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
      
      // Mock database insert
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          phone_number: null,
          display_name: 'Test User',
          status: 'online',
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      });
      
      // Mock JWT sign
      (jwt.sign as jest.Mock).mockReturnValueOnce('mockToken');

      await authController.register(mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalled();
      expect(query).toHaveBeenCalledTimes(2);
    });

    it('should return 409 if username or email already exists', async () => {
      // Mock database query to return existing user
      (query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

      await authController.register(mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Username or email already exists' });
    });

    it('should return 500 if there is a database error', async () => {
      // Mock database query to throw an error
      (query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await authController.register(mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          username: 'testuser',
          password: 'password123'
        }
      };
    });

    it('should login user successfully', async () => {
      // Mock database query to return user
      (query as jest.Mock).mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password_hash: 'hashedPassword',
          phone_number: null,
          display_name: 'Test User',
          profile_picture_url: null,
          status: 'online',
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      });
      
      // Mock bcrypt compare
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      
      // Mock database update
      (query as jest.Mock).mockResolvedValueOnce({});
      
      // Mock JWT sign
      (jwt.sign as jest.Mock).mockReturnValueOnce('mockToken');

      await authController.login(mockRequest as Request, mockResponse as Response);
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockJson).toHaveBeenCalled();
    });

    it('should return 401 if user does not exist', async () => {
      // Mock database query to return no user
      (query as jest.Mock).mockResolvedValueOnce({ rowCount: 0 });

      await authController.login(mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 if password is invalid', async () => {
      // Mock database query to return user
      (query as jest.Mock).mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password_hash: 'hashedPassword'
        }]
      });
      
      // Mock bcrypt compare to return false
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await authController.login(mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 500 if there is a database error', async () => {
      // Mock database query to throw an error
      (query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await authController.login(mockRequest as Request, mockResponse as Response);
      
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});