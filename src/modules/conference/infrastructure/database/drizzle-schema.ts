import {
  pgTable, uuid, varchar, timestamp, jsonb, boolean, integer,
} from 'drizzle-orm/pg-core';

/**
 * Drizzle ORM Schema for the conferences table.
 *
 * Maps to the Conference aggregate root.
 * CfpConfig is stored as JSONB for simplicity (embedded child entity).
 */
export const conferencesTable = pgTable('conferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', {length: 100}).notNull(),
  description: varchar('description', {length: 1000}).default(''),
  slug: varchar('slug', {length: 200}).notNull().unique(),
  status: varchar('status', {length: 20}).notNull().default('DRAFT'),
  organizerId: uuid('organizer_id').notNull(),
  cfpConfig: jsonb('cfp_config').notNull().$type<{
    startDate: string;
    endDate: string;
    maxSubmissions: number | undefined;
    requiresApproval: boolean;
    status: string;
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Drizzle schema export for use with drizzle-kit and Supabase.
 */
export const schema = {
  conferences: conferencesTable,
};
