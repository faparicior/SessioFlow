import * as path from 'node:path';
import dotenv from 'dotenv';
import postgres from 'postgres';

// Integration tests talk to the same local PostgreSQL used by E2E. The
// shared-database client reads DATABASE_URL at import time, so this module
// (imported first by every integration test) loads .env.local eagerly.
dotenv.config({path: path.resolve(process.cwd(), '.env.local')});

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sessioflow';

/**
 * Raw postgres client for fixture creation/assertions that must bypass the
 * repository layer (e.g. forcing a DELETED status, rollback inspection).
 */
export const testSql = postgres(connectionString, {max: 5});

/**
 * Removes all conference and outbox fixtures so each test starts clean.
 * Integration tests own the whole tables (dedicated local database).
 */
export async function cleanTables(): Promise<void> {
  await testSql`DELETE FROM outbox_messages`;
  await testSql`DELETE FROM conferences`;
}

/** Current row counts, used for atomicity/rollback assertions. */
export async function rowCount(table: 'conferences' | 'outbox_messages'): Promise<number> {
  const [row] = await testSql`SELECT COUNT(*)::int AS count FROM ${testSql(table)}`;
  return row.count;
}
