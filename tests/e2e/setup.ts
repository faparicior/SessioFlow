import * as path from 'node:path';
import * as dotenv from 'dotenv';
import postgres from 'postgres';
import {migrate} from 'drizzle-orm/postgres-js/migrator';
import {drizzle} from 'drizzle-orm/postgres-js';

export default async function setup() {
  const rootDir = path.resolve(__dirname, '../..');
  // Load environment variables from .env.local
  dotenv.config({path: path.resolve(rootDir, '.env.local')});

  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sessioflow';

  // Poll database until connection is ready (up to 30 seconds)
  console.log('[E2E Setup] Waiting for database to be ready...');
  let retries = 30;
  let sql;
  /* eslint-disable no-await-in-loop */
  while (retries > 0) {
    try {
      sql = postgres(connectionString);
      // Run a simple query to verify connection
      await sql`SELECT 1`;
      await sql.end();
      console.log('[E2E Setup] Database is ready');
      break;
    } catch (error) {
      retries--;
      if (sql) {
        await sql.end();
      }

      if (retries === 0) {
        console.error('[E2E Setup] Database connection timed out');
        throw error;
      }

      // Wait 1 second before retrying
      await new Promise<void>(resolve => {
        setTimeout(resolve, 1000);
      });
    }
  }
  /* eslint-enable no-await-in-loop */

  // Run database migrations to ensure schema is ready
  try {
    const migrationClient = postgres(connectionString, {max: 1});
    const db = drizzle(migrationClient);
    await migrate(db, {
      migrationsFolder: path.resolve(rootDir, 'apps/backend/drizzle'),
    });
    await migrationClient.end();
    console.log('[E2E Setup] Database migrations applied successfully');
  } catch (error) {
    console.error('[E2E Setup] Failed to run database migrations:', error);
  }

  // Clean up test conferences to avoid hitting free tier limit
  try {
    const cleanSql = postgres(connectionString);
    await cleanSql`DELETE FROM conferences WHERE organizer_id = 'mock-user-id'`;
    await cleanSql.end();
    console.log('[E2E Setup] Cleaned up test conferences');
  } catch (error) {
    console.error('[E2E Setup] Failed to clean up databases:', error);
  }
}
