import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * PostgreSQL database client singleton.
 *
 * Uses DATABASE_URL environment variable for configuration.
 */
export type PostgresDb = ReturnType<typeof drizzle>;

let db: PostgresDb | undefined;

export function getDb(): PostgresDb {
  if (db) {
    return db;
  }

  const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/sessioflow';

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
