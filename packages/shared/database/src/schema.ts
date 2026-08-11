import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  text,
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

/**
 * Drizzle ORM Schema for the Transactional Outbox pattern.
 * Stores pending and processed domain events atomically within DB transactions.
 */
export const outboxMessagesTable = pgTable(
  'outbox_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    aggregateType: varchar('aggregate_type', { length: 100 }).notNull(),
    aggregateId: varchar('aggregate_id', { length: 255 }).notNull(),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('PENDING'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    processedAt: timestamp('processed_at'),
    error: text('error'),
  },
  table => [
    index('idx_outbox_status_created').on(table.status, table.createdAt),
    index('idx_outbox_aggregate').on(table.aggregateType, table.aggregateId),
  ]
);

export const schema = {
  conferences: conferencesTable,
  outboxMessages: outboxMessagesTable,
};
