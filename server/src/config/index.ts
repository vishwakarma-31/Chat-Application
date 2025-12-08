import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment validation
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Ensure critical config values are not undefined
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  throw new Error('Either DATABASE_URL or POSTGRES_URL environment variable is required');
}

// Configuration with fallback values
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '8000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3002',
  
  // Database configuration
  databaseUrl: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  
  // Redis configuration
  redisUrl: process.env.REDIS_URL,
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  
  // Cassandra configuration (if needed)
  cassandraHosts: process.env.CASSANDRA_HOSTS ? process.env.CASSANDRA_HOSTS.split(',') : ['127.0.0.1'],
  cassandraKeyspace: process.env.CASSANDRA_KEYSPACE || 'omegachat',
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Log warnings for missing non-critical environment variables
if (!process.env.REDIS_URL) {
  console.warn('REDIS_URL not set');
}

if (!process.env.CLIENT_URL) {
  console.warn('CLIENT_URL not set');
}

export default config;