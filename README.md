# OmegaChat

A real-time chat application built with modern web technologies.

## Features

- Real-time messaging via WebSocket (Socket.IO)
- JWT-based authentication
- Link preview generation
- Group chat & user profiles
- Responsive UI with virtualized message lists
- End-to-end encryption (stubbed Signal Protocol implementation)

## Tech Stack

### Frontend
- React 19 (TypeScript)
- Zustand for state management
- Tailwind CSS for styling
- react-virtuoso for virtualized lists
- Socket.io-client for real-time communication

### Backend
- Node.js/Express
- Socket.io with Redis adapter for horizontal scaling
- PostgreSQL for user/group metadata
- Cassandra for message storage
- Redis for pub/sub
- Elasticsearch for search functionality

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL, Cassandra, Redis, Elasticsearch (via Docker)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the services:
   ```bash
   docker-compose up -d
   ```
4. Start the development servers:
   ```bash
   npm run dev
   ```

The client will be available at http://localhost:3002 and the server at http://localhost:8000.

## Project Structure

```
omegachat/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── utils/
│   └── ...
├── server/          # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── ...
└── docker-compose.yml
```

## Ports

- Client: 3002
- Server: 8000
- PostgreSQL: 5432
- Cassandra: 9042
- Redis: 6379
- Elasticsearch: 9200

## Running the Application

### Using Docker (Recommended)

1. Make sure Docker is installed and running
2. Start all services:
   ```bash
   docker-compose up -d
   ```
3. Access the application:
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:8000

### Manual Setup

1. Start the database services separately (PostgreSQL, Cassandra, Redis)
2. Update environment variables in `.env` files
3. Install dependencies:
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```
4. Start the development servers:
   ```bash
   # From the root directory
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh session

### Messages
- `POST /api/messages` - Send a new message
- `GET /api/messages/:conversationId` - Get messages for a conversation
- `PUT /api/messages/:messageId` - Update message status

## WebSocket Events

### Client to Server
- `send-message` - Send a new message
- `join-conversation` - Join a conversation room
- `leave-conversation` - Leave a conversation room
- `mark-as-read` - Mark a message as read
- `typing` - Indicate user is typing
- `stop-typing` - Indicate user stopped typing
- `login` - Authenticate user
- `logout` - Log out user

### Server to Client
- `user-connected` - Notify when a user connects
- `user-disconnected` - Notify when a user disconnects
- `receive-message` - Receive a new message
- `message-delivered` - Notify when a message is delivered
- `message-read` - Notify when a message is read
- `typing-start` - Notify when a user starts typing
- `typing-stop` - Notify when a user stops typing
- `conversation-created` - Notify when a new conversation is created
- `conversation-updated` - Notify when a conversation is updated
- `login-success` - Successful login response
- `login-error` - Login error response

## Development

### Folder Structure Guidelines

- `client/src/components` - Reusable UI components
- `client/src/hooks` - Custom React hooks
- `client/src/stores` - Zustand stores for state management
- `client/src/types` - TypeScript interfaces and types
- `server/src/controllers` - Request handlers
- `server/src/models` - Data models
- `server/src/routes` - API route definitions
- `server/src/services` - Business logic
- `server/src/middleware` - Express middleware
- `server/src/config` - Configuration files

### Environment Variables

#### Client (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket server URL

#### Server (.env)
- `PORT` - Server port
- `JWT_SECRET` - Secret key for JWT tokens
- `POSTGRES_*` - PostgreSQL connection details
- `CASSANDRA_*` - Cassandra connection details
- `REDIS_*` - Redis connection details
- `ELASTICSEARCH_*` - Elasticsearch connection details

## Testing

Run tests with:
```bash
# Run all tests
npm test

# Run client tests
npm run test --workspace=client

# Run server tests
npm run test --workspace=server
```

## Building for Production

```bash
# Build all packages
npm run build

# Build client only
npm run build --workspace=client

# Build server only
npm run build --workspace=server
```

## Deployment

The application can be deployed using Docker containers. The `docker-compose.yml` file includes all necessary services for production deployment.