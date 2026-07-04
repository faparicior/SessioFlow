import {pg} from 'drizzle-orm/pg-core';
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * PostgreSQL database client singleton.
 *
 * Uses DATABASE_URL environment variable for configuration.
 */
let db: ReturnType<typeof drizzle> | undefined = null;

export function getDb() {
  if (db) {
    return db;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL environment variable');
  }

  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  });

  db = drizzle(client);
  return db;
}

/**
 * Reset the client (useful for testing).
 */
export function resetDb(): void {
  db = undefined;
}