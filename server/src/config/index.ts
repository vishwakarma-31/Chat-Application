import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment validation
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Configuration with fallback values
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '8000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3002',
  
  // Database configuration
  databaseUrl: process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://app_user:Av.51200743@localhost:5432/omegachat',
  
  // Redis configuration
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'fallback-jwt-secret-for-development-only',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  
  // Cassandra configuration (if needed)
  cassandraHosts: process.env.CASSANDRA_HOSTS ? process.env.CASSANDRA_HOSTS.split(',') : ['127.0.0.1'],
  cassandraKeyspace: process.env.CASSANDRA_KEYSPACE || 'omegachat',
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Log warnings for missing non-critical environment variables
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set, using default PostgreSQL connection string');
}

if (!process.env.REDIS_URL) {
  console.warn('REDIS_URL not set, using default Redis connection string');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-jwt-secret-for-development-only') {
  console.warn('JWT_SECRET not set properly, using fallback secret (NOT SECURE FOR PRODUCTION)');
}

export default config;