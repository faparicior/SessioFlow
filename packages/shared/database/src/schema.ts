import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * Drizzle ORM Schema for the conferences table.
 * Shared across backend infrastructure and modules.
 */
export const conferencesTable = pgTable(
  'conferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 1000 }).default(''),
    slug: varchar('slug', { length: 200 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
    organizerId: varchar('organizer_id', { length: 255 }).notNull(),
    cfpConfig: jsonb('cfp_config').notNull().$type<{
      startDate: string;
      endDate: string;
      maxSubmissions: number | undefined;
      requiresApproval: boolean;
      status: string;
    }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [
    uniqueIndex('conferences_slug_unique').on(table.slug),
    index('idx_conferences_organizer_id').on(table.organizerId),
    index('idx_conferences_status').on(table.status),
  ]
);

export const schema = {
  conferences: conferencesTable,
};
