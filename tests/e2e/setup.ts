import * as path from 'node:path';
import * as dotenv from 'dotenv';
import postgres from 'postgres';

export default async function setup() {
  // Load environment variables from .env.local
  dotenv.config({path: path.resolve(process.cwd(), '.env.local')});

  // Clean up test conferences to avoid hitting free tier limit
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    try {
      const sql = postgres(connectionString);
      await sql`DELETE FROM conferences WHERE organizer_id = 'mock-user-id'`;
      await sql.end();
      console.log('[E2E Setup] Cleaned up test conferences');
    } catch (error) {
      console.error('[E2E Setup] Failed to clean up databases:', error);
    }
  }
}
