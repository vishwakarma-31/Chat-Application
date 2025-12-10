import { Client } from 'pg';
import { Client as CassandraClient } from 'cassandra-driver';
import { createClient } from 'redis';
import { dbConfig } from '../config/dbConfig';

// PostgreSQL client
export const postgresClient = new Client({
  host: dbConfig.postgres.host,
  port: dbConfig.postgres.port,
  database: dbConfig.postgres.database,
  user: dbConfig.postgres.username,
  password: dbConfig.postgres.password,
});

// Track connection status
let isCassandraConnected = false;
let isPostgresConnected = false;
let isRedisConnected = false;

// Getter functions for connection status
export const getConnectionStatus = () => ({
  cassandra: isCassandraConnected,
  postgres: isPostgresConnected,
  redis: isRedisConnected
});

// Enhanced Cassandra client with connection status tracking
export const cassandraClient = new CassandraClient({
  contactPoints: dbConfig.cassandra.hosts,
  localDataCenter: 'datacenter1', // This should be configured properly in production
  keyspace: dbConfig.cassandra.keyspace,
  // Add connection options to handle timeouts better
  pooling: {
    heartBeatInterval: 30000,
  },
  socketOptions: {
    connectTimeout: 5000,
    readTimeout: 10000,
  }
});

// Redis client
export const redisClient = createClient({
  url: dbConfig.redis.url,
});

// Retry mechanism for Cassandra connection
const connectToCassandraWithRetry = async (maxRetries = 3, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempting to connect to Cassandra (attempt ${i + 1}/${maxRetries})`);
      await cassandraClient.connect();
      isCassandraConnected = true;
      console.log('Connected to Cassandra');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Cassandra connection attempt ${i + 1} failed:`, errorMessage);
      if (i < maxRetries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  return false;
};

// Initialize database connections
export const initDatabaseConnections = async () => {
  try {
    // Connect to PostgreSQL
    await postgresClient.connect();
    isPostgresConnected = true;
    console.log('Connected to PostgreSQL');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Failed to connect to PostgreSQL:', errorMessage);
  }
  
  try {
    // Connect to Cassandra with retry mechanism
    const cassandraConnected = await connectToCassandraWithRetry(3, 2000);
    if (!cassandraConnected) {
      console.warn('Failed to connect to Cassandra after retries');
      console.warn('Cassandra features will be disabled');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Failed to connect to Cassandra:', errorMessage);
    console.warn('Cassandra features will be disabled');
  }
  
  try {
    // Connect to Redis
    await redisClient.connect();
    isRedisConnected = true;
    console.log('Connected to Redis');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Failed to connect to Redis:', errorMessage);
  }
};

// Close database connections
export const closeDatabaseConnections = async () => {
  try {
    await postgresClient.end();
    console.log('PostgreSQL connection closed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Error closing PostgreSQL connection:', errorMessage);
  }
  
  try {
    if (isCassandraConnected) {
      await cassandraClient.shutdown();
      console.log('Cassandra connection closed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Error closing Cassandra connection:', errorMessage);
  }
  
  try {
    if (isRedisConnected) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Error closing Redis connection:', errorMessage);
  }
};