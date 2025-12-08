import { Pool, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Interface for database query results
export interface DatabaseResult<T extends QueryResultRow> {
  rows: T[];
  rowCount: number;
}

/**
 * Execute a database query
 * @param queryText - SQL query text
 * @param values - Query parameters
 * @returns Query result
 */
export async function query<T extends QueryResultRow>(queryText: string, values: any[] = []): Promise<DatabaseResult<T>> {
  const client = await pool.connect();
  try {
    const result: QueryResult<T> = await client.query(queryText, values);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0
    };
  } finally {
    client.release();
  }
}

/**
 * Execute a database transaction
 * @param queries - Array of queries to execute in transaction
 * @returns Transaction result
 */
export async function transaction<T extends QueryResultRow>(queries: Array<{ queryText: string, values: any[] }>): Promise<DatabaseResult<T>[]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results: DatabaseResult<T>[] = [];
    
    for (const { queryText, values } of queries) {
      const result: QueryResult<T> = await client.query(queryText, values);
      results.push({
        rows: result.rows,
        rowCount: result.rowCount || 0
      });
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default {
  query,
  transaction,
  pool
};