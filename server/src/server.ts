import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import our new components
import config from './config';
import { SocketManager } from './services/SocketManager';
import linkPreviewRoutes from './routes/linkPreviewRoutes';
import authRoutes from './routes/authRoutes';
import messagesRoutes from './routes/messagesRoutes';
import userProfileRoutes from './routes/userProfileRoutes';
import groupsRoutes from './routes/groupsRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure Express middleware
app.use(express.json());
app.use(cors());

// Configure API routes
app.use('/api/preview', linkPreviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/groups', groupsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('OmegaChat Server is running!');
});

// Configure Socket.IO with Redis adapter
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ["GET", "POST"]
  }
});

// Initialize SocketManager
const socketManager = new SocketManager(io);

// Socket connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start server
server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});