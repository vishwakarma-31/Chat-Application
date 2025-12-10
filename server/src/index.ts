import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import messagesRoutes from './routes/messagesRoutes';
import { initDatabaseConnections, closeDatabaseConnections } from './services/dbService';

// Don't load environment variables from .env file to avoid conflicts
// dotenv.config();

// Debug: Print the PORT environment variable
console.log('PORT environment variable:', process.env.PORT);
console.log('PORT type:', typeof process.env.PORT);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
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

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Use port 8001 and ignore environment variables to avoid conflicts
const PORT = 8001;
console.log('Final PORT value:', PORT);
console.log('Final PORT type:', typeof PORT);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await closeDatabaseConnections();
  process.exit(0);
});