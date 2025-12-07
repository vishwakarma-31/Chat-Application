# OmegaChat Setup Guide

## Prerequisites

Before setting up OmegaChat, ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v8 or higher)
- PostgreSQL (v13 or higher)
- Cassandra (v4 or higher)
- Redis (v6 or higher)
- Elasticsearch (v8 or higher, optional for search features)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd omegachat
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
npm install
```

This will install dependencies for both the client and server due to the workspace configuration.

Alternatively, you can install them separately:

```bash
# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Database Setup

#### PostgreSQL Setup

1. Create a new database:
   ```sql
   CREATE DATABASE omegachat;
   ```

2. Create a user and grant privileges:
   ```sql
   CREATE USER omegachat_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE omegachat TO omegachat_user;
   ```

3. Run the migration scripts in the following order:
   - `server/src/migrations/01_create_users_table.sql`
   - `server/src/migrations/02_create_groups_table.sql`
   - `server/src/migrations/03_create_user_groups_table.sql`
   - `server/src/migrations/04_create_friendships_table.sql`

#### Cassandra Setup

1. Start Cassandra service

2. Run the schema file:
   ```bash
   cqlsh -f server/src/cassandra/01_messages_schema.cql
   ```

#### Redis Setup

1. Start Redis service:
   ```bash
   redis-server
   ```

### 4. Environment Configuration

#### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:3000

# Database connections
POSTGRES_URL=postgresql://omegachat_user:your_password@localhost:5432/omegachat
CASSANDRA_CONTACT_POINTS=localhost:9042
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

#### Client Environment Variables

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 5. Start Development Servers

#### Option 1: Using Concurrently (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both the client (on port 3000) and server (on port 8000) simultaneously.

#### Option 2: Separate Terminals

Terminal 1 - Start the server:
```bash
cd server
npm run dev
```

Terminal 2 - Start the client:
```bash
cd client
npm run dev
```

### 6. Access the Application

Open your browser and navigate to:
- Client: http://localhost:3000
- Server API: http://localhost:8000

## Production Deployment

### Building for Production

#### Build Client

```bash
cd client
npm run build
```

This creates an optimized production build in the `dist` folder.

#### Build Server

```bash
cd server
npm run build
```

This creates compiled JavaScript files in the `dist` folder.

### Running in Production

```bash
cd server
npm start
```

Ensure all environment variables are properly configured for production.

## Testing

### Running Tests

#### Client Tests

```bash
cd client
npm test
```

#### Server Tests

```bash
cd server
npm test
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Change the PORT in `.env` file
   - Ensure ports 3000 and 8000 are available

2. **Database Connection Errors**
   - Verify database services are running
   - Check connection URLs in `.env` file
   - Ensure database user has proper permissions

3. **Dependency Installation Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json` and reinstall

4. **TypeScript Compilation Errors**
   - Ensure TypeScript is installed globally: `npm install -g typescript`
   - Check tsconfig.json files for correct configuration

### Useful Commands

```bash
# Check running processes on specific ports
lsof -i :3000
lsof -i :8000

# Kill processes on specific ports (Linux/Mac)
kill $(lsof -t -i :3000)
kill $(lsof -t -i :8000)

# Kill processes on specific ports (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Architecture Overview

For detailed information about the architecture, refer to [ARCHITECTURE.md](ARCHITECTURE.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Commit your changes
6. Push to the branch
7. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.