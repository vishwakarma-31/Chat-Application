import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class SocketManager {
  private io: Server;
  private pubClient!: ReturnType<typeof createClient>;
  private subClient!: ReturnType<typeof createClient>;

  constructor(io: Server) {
    this.io = io;
    this.setupRedisAdapter();
    this.initializeEventHandlers();
  }

  private setupRedisAdapter(): void {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.pubClient = createClient({ url: redisUrl });
    this.subClient = this.pubClient.duplicate();

    Promise.all([
      this.pubClient.connect(),
      this.subClient.connect()
    ]).then(() => {
      // @ts-ignore - Type mismatch in older versions
      this.io.adapter(createAdapter(this.pubClient, this.subClient));
      console.log('Redis adapter connected');
    }).catch((err) => {
      console.error('Redis connection error:', err);
    });
  }

  private initializeEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('User connected:', socket.id);

      // Handle user joining a room
      socket.on('join_room', (data) => {
        const { userId, roomId } = data;
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        
        // Notify others in the room that a user has joined
        socket.to(roomId).emit('user_joined', { userId, roomId });
      });

      // Handle user leaving a room
      socket.on('leave_room', (data) => {
        const { userId, roomId } = data;
        socket.leave(roomId);
        console.log(`User ${userId} left room ${roomId}`);
        
        // Notify others in the room that a user has left
        socket.to(roomId).emit('user_left', { userId, roomId });
      });

      // Handle sending a message
      socket.on('send_message', (data) => {
        const { roomId, message } = data;
        console.log(`Message sent to room ${roomId}:`, message);
        
        // Broadcast message to all users in the room except sender
        socket.to(roomId).emit('receive_message', message);
      });

      // Handle typing indicator
      socket.on('typing', (data) => {
        const { roomId, userId, isTyping } = data;
        socket.to(roomId).emit('user_typing', { userId, isTyping });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Handle any cleanup needed when a user disconnects
      });
    });
  }

  public getIo(): Server {
    return this.io;
  }

  public async close(): Promise<void> {
    await this.pubClient.quit();
    await this.subClient.quit();
  }
}