import process from 'node:process';
import {migrate} from 'drizzle-orm/postgres-js/migrator';
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Drizzle Migration Script
 *
 * Run this script to migrate the database schema using Drizzle ORM.
 *
 * Usage:
 *   npx tsx drizzle/migrate.mts
 */

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/sessioflow';

const client = postgres(databaseUrl, {max: 1});
const db = drizzle(client);

console.log('Running Drizzle migrations...');

try {
  await migrate(db, {migrationsFolder: './drizzle'});
  console.log('Migrations completed successfully!');
} finally {
  await client.end();
}
