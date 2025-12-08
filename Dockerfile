# Multi-stage Dockerfile for OmegaChat

# Stage 1: Build the client
FROM node:18-alpine AS client-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci

# Copy client source
COPY client/ ./client/

# Build client
WORKDIR /app/client
RUN npm run build

# Stage 2: Build the server
FROM node:18-alpine AS server-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci

# Copy server source
COPY server/ ./server/

# Build server
WORKDIR /app/server
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies only
RUN npm ci --only=production

# Copy built client and server
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=server-builder /app/server/dist ./server/dist

# Copy server source (needed for runtime)
COPY server/ ./server/

# Expose port
EXPOSE 8000

# Start server
CMD ["node", "server/dist/server.js"]