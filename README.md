# OmegaChat

A real-time web chat application similar to WhatsApp Web, built with modern technologies for scalability and security.

![Chat Interface](https://placehold.co/800x400/png?text=OmegaChat+Interface) <!-- Placeholder image -->

## Features

- 🔥 Real-time messaging with Socket.IO
- 🔐 User authentication with JWT
- 📱 Responsive UI with React and Tailwind CSS
- ⚡ Virtualized message lists for optimal performance
- 🔄 Real-time connection status indicators
- 🏗️ Scalable architecture with Node.js, Express, and Redis

## Tech Stack

### Frontend
- React 19 (Functional Components, Hooks)
- TypeScript
- Zustand (for global client state)
- Tailwind CSS (for styling)
- react-virtuoso (for efficient message list rendering)
- Socket.io Client

### Backend
- Node.js
- Express
- TypeScript
- Socket.io (with Redis Adapter for scaling)
- Redis (Pub/Sub, Presence)

## Project Structure

This is a monorepo structure with client and server packages following a feature-based organization:

```
├── client/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature-based modules (auth, chat)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # Service layers for API/WebSocket calls
│   │   ├── stores/            # State management (Zustand)
│   │   └── types/             # TypeScript type definitions
│   └── ...
├── server/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Data models
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic layers
│   │   └── ...
│   └── ...
```

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Redis server (for real-time features)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Chat-Application
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   For workspace-specific installations:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Start Redis server:**
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis
   
   # Or start your local Redis instance
   redis-server
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3002 (or next available port)
   - Backend API: http://localhost:8000

## Development Workflow

### Frontend Development
- Built with Vite for fast development and hot module replacement
- Component-based architecture with clear separation of concerns
- TypeScript for type safety
- Tailwind CSS for responsive styling

### Backend Development
- RESTful API design
- Socket.IO for real-time communication
- Redis adapter for horizontal scaling
- Modular structure with controllers, services, and routes

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Link Previews
- `POST /api/preview` - Generate link preview

### WebSocket Events
- `connection` - New user connection
- `disconnect` - User disconnection
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - Typing indicator

## Environment Variables

Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:3002
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-here
```

## Deployment

### Build for Production
```bash
# Build client
cd client && npm run build

# Build server
cd ../server && npm run build
```

### Running in Production
```bash
# Start server
cd server && npm start
```

## Architecture Patterns

- **Feature-based structure**: Code is organized by features rather than file types
- **Container/Presentational pattern**: Separation of data logic and UI presentation
- **Service layers**: Dedicated layers for API calls and business logic
- **Custom hooks**: Encapsulated logic for reusable functionality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## Troubleshooting

### Common Issues

1. **Port already in use**: Kill the process using the port or change the port in environment variables
2. **Redis connection errors**: Ensure Redis server is running on localhost:6379
3. **Module not found errors**: Run `npm install` in both root and workspace directories

### Useful Commands
```bash
# Check port usage
netstat -ano | findstr :8000

# Kill process by PID
taskkill /F /PID <pid>

# Clear node_modules and reinstall
rm -rf node_modules && npm install
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped build this project
- Inspired by popular messaging applications like WhatsApp Web