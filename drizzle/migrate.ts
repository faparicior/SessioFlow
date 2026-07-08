import {migrate} from 'drizzle-orm/postgres-js/migrator';
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {schema} from '../src/modules/conference/infrastructure/database/drizzle-schema';

/**
 * Drizzle Migration Script
 *
 * Run this script to migrate the database schema using Drizzle ORM.
 *
 * Usage:
 *   npx tsx drizzle/migrate.ts
 */

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/sessioflow';

async function main() {
  console.log('Running Drizzle migrations...');

  const client = postgres(DATABASE_URL, {max: 1});
  const db = drizzle(client);

  await migrate(db, {migrationsFolder: './drizzle'});

  console.log('Migrations completed successfully!');

  await client.end();
  process.exit(0);
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
