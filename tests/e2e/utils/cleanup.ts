import dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';

/**
 * Clean up all test conferences from the database.
 * Used before each test to ensure a clean state.
 */
export async function deleteConferences(): Promise<void> {
  dotenv.config({path: path.resolve(process.cwd(), '.env.local')});

  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    try {
      const sql = postgres(connectionString);
      await sql`DELETE FROM conferences WHERE organizer_id = 'mock-user-id'`;
      await sql.end();
    } catch (error) {
      console.error('[Cleanup] Failed to delete conferences:', error);
    }
  }
}
