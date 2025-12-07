# OmegaChat

A real-time web chat application similar to WhatsApp Web, built with modern technologies for scalability and security.

## Features

- Real-time messaging with Socket.IO
- End-to-end encryption simulation with Signal Protocol
- User authentication with JWT
- Responsive UI with React and Tailwind CSS
- Scalable architecture with Node.js, Express, PostgreSQL, Cassandra, and Redis

## Tech Stack

### Frontend
- React 19 (Functional Components, Hooks)
- TypeScript
- Zustand (for global client state)
- Tailwind CSS (for styling)
- react-virtuoso (for efficient message list rendering)
- Socket.io Client
- Libsignal-protocol-javascript (Simulated interface for scaffolding)

### Backend
- Node.js
- Express
- TypeScript
- Socket.io (with Redis Adapter for scaling)
- PostgreSQL (Users, Relationships, Group Membership)
- Cassandra (Chat Logs - utilizing TimeUUID for ordering)
- Redis (Session Store, Pub/Sub, Presence Bitmaps)
- Elasticsearch (Interface definition for future implementation)

## Project Structure

This is a monorepo structure with client and server packages.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development servers:
   ```
   npm run dev
   ```

This will start both the client (port 3000) and server (port 8000).

## Architecture

The application follows a feature-based folder structure with clear separation of concerns:
- Container/Presentational pattern for UI components
- Service layers for API calls and WebSocket events
- Custom React hooks for complex logic
- Feature-based organization (chat, auth, etc.)

## Security

- JWT for stateless authentication
- Simulated Signal Protocol for end-to-end encryption