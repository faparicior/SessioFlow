import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/sessioflow';
const client = postgres(connectionString, {max: 10});

export const db = drizzle(client);
export type DatabaseClient = typeof db;
