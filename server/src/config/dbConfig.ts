// Database configuration
export const dbConfig = {
  // PostgreSQL configuration
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'omegachat_db',
    username: process.env.POSTGRES_USER || 'omegachat',
    password: process.env.POSTGRES_PASSWORD || 'omegachat_password',
  },
  
  // Cassandra configuration
  cassandra: {
    hosts: process.env.CASSANDRA_HOSTS?.split(',') || ['localhost'],
    port: parseInt(process.env.CASSANDRA_PORT || '9042'),
    keyspace: process.env.CASSANDRA_KEYSPACE || 'omegachat',
  },
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // Elasticsearch configuration
  elasticsearch: {
    node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200',
  }
};