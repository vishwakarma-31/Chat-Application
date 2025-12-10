import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import messagesRoutes from './routes/messagesRoutes';
import { initDatabaseConnections, closeDatabaseConnections } from './services/dbService';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Use a more restrictive CORS policy in production
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*", 
    methods: ["GET", "POST"]
  }
});

// Initialize database connections
initDatabaseConnections().catch(error => {
  console.warn('Failed to initialize database connections:', error);
  console.warn('Continuing without database connections for development purposes');
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('OmegaChat Server is running!');
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined room ${conversationId}`);
  });

  // Leave a specific conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left room ${conversationId}`);
  });

  // Handle typing events
  socket.on('typing', (conversationId) => {
    socket.to(conversationId).emit('typing-start', 'user-id', conversationId); // Replace 'user-id' with actual ID logic
  });

  socket.on('stop-typing', (conversationId) => {
    socket.to(conversationId).emit('typing-stop', 'user-id', conversationId);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await closeDatabaseConnections();
  process.exit(0);
});