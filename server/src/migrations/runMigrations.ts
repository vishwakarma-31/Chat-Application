import { query } from '../utils/db';
import fs from 'fs';
import path from 'path';

async function runMigration(filePath: string): Promise<void> {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running migration: ${path.basename(filePath)}`);
    
    // Split the SQL file by semicolons to execute each statement separately
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    for (const statement of statements) {
      if (statement.trim() !== '') {
        await query(statement.trim());
        console.log(`Executed: ${statement.trim().substring(0, 50)}...`);
      }
    }
    
    console.log(`Migration ${path.basename(filePath)} completed successfully`);
  } catch (error) {
    console.error(`Error running migration ${path.basename(filePath)}:`, error);
    throw error;
  }
}

async function runAllMigrations(): Promise<void> {
  try {
    console.log('Starting database migrations...');
    
    const migrationsDir = path.join(__dirname);
    const migrationFiles = [
      '01_create_users_table.sql',
      '02_create_groups_table.sql',
      '03_create_user_groups_table.sql',
      '04_create_friendships_table.sql'
    ];
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      await runMigration(filePath);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

// Run the migrations
runAllMigrations().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});