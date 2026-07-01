# Use Drizzle ORM with Transaction Support at Application Layer

* **Status:** Proposed
* **Date:** 2026-07-01
* **Decision Makers:** Technical Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow requires a data persistence layer that:
1. Supports PostgreSQL (via Supabase)
2. Maintains DDD layer boundaries (domain layer must be framework-agnostic)
3. Enables transaction support at the application/use-case level
4. Provides type safety and migration capabilities
5. Allows for easy provider swapping (Supabase → Neon, PlanetScale, AWS RDS)

The challenge is to select an ORM/data access pattern that:
- Respects DDD repository pattern (interfaces in domain, implementations in infrastructure)
- Supports multi-step transactions for complex use cases (e.g., create conference + initial settings)
- Maintains type safety across the stack
- Avoids leaking ORM-specific code into the domain layer

**Decision Drivers:**
* Must support PostgreSQL with Supabase
* Must enable transaction boundaries at application layer (use case level)
* Must maintain DDD separation of concerns
* Must provide type safety with minimal boilerplate
* Must allow easy migration away from Supabase if needed

## Considered Options

1. **Drizzle ORM** - TypeScript-first ORM with excellent transaction support
2. **Prisma** - Popular full-featured ORM
3. **Kysely** - Type-safe SQL query builder
4. **pg (raw SQL)** - Direct PostgreSQL client with manual query building
5. **Supabase JS Client** - Native Supabase client without ORM abstraction

## Decision Outcome

**Chosen Option:** "Drizzle ORM"

**Justification:**
Drizzle ORM provides the best balance of:
- **Transaction support**: Native support for multi-step transactions at application layer
- **Type safety**: Full TypeScript inference without code generation
- **DDD compatibility**: Clean separation between domain interfaces and infrastructure implementation
- **Migration ease**: Lightweight, SQL-close, easy to swap providers
- **Performance**: Minimal overhead compared to Prisma
- **Developer experience**: Excellent TypeScript support and migration tooling

### Consequences

* **Positive:**
  - Type-safe queries with full IDE support
  - Transaction support enables complex use cases (e.g., create conference with initial settings in one transaction)
  - Migration files are readable SQL, easy to review
  - Lightweight bundle size (~20KB vs Prisma's 50MB+)
  - Can easily switch from Supabase to any PostgreSQL provider
  - Maintains DDD boundaries - repository implementations use Drizzle, domain remains pure

* **Negative:**
  - Requires learning Drizzle's query syntax
  - Less mature than Prisma (fewer community resources)
    - No automatic migrations (requires drizzle-kit)

* **Risks:**
  - Relatively new compared to Prisma (potential breaking changes)
  - Smaller community means fewer Stack Overflow answers
  - Migration tooling (drizzle-kit) is separate from core library

## Pros and Cons of the Options

### Drizzle ORM

* **Good**, because:
  - Excellent TypeScript support with full type inference
  - Native transaction support: `db.transaction(async (tx) => { ... })`
  - Lightweight (~20KB) with minimal runtime overhead
  - SQL-close design makes queries readable and debuggable
  - Migration files are plain SQL, easy to review and version
  - Easy to swap database providers (Supabase → Neon, PlanetScale, etc.)
  - Works well with DDD repository pattern
  - No code generation required (types inferred from schema)

* **Bad**, because:
  - Younger ecosystem compared to Prisma
  - Fewer third-party integrations and community resources
  - Requires separate tool (drizzle-kit) for migrations
  - Learning curve for Drizzle-specific query syntax

### Prisma

* **Good**, because:
  - Most popular Node.js ORM with large community
  - Excellent migration tooling (prisma migrate)
  - Prisma Client provides great IDE experience
  - Extensive documentation and community resources
  - Built-in migration UI (Prisma Studio)

* **Bad**, because:
  - Heavy runtime (~50MB+) with code generation step
  - Transaction support limited to Prisma's query engine
  - Vendor lock-in risk (Prisma query engine is proprietary)
  - Harder to swap database providers
  - Code generation creates tight coupling to Prisma
  - Difficult to maintain DDD boundaries (Prisma schema becomes central)

### Kysely

* **Good**, because:
  - Type-safe SQL query builder
  - Very lightweight and framework-agnostic
  - No ORM overhead, closer to raw SQL
  - Excellent TypeScript support
  - Easy to swap database clients

* **Bad**, because:
  - No built-in transaction management (requires manual handling)
  - No entity mapping (returns raw query results)
  - More boilerplate for complex queries
  - No migration tooling built-in
  - Requires more manual work for DDD entity mapping

### pg (Raw SQL)

* **Good**, because:
  - Maximum control and flexibility
  - No ORM overhead
  - Direct SQL gives best performance
  - Full transparency of queries

* **Bad**, because:
  - No type safety without manual annotations
  - High risk of SQL injection if not careful
  - No built-in transaction support (manual handling)
  - Significant boilerplate for result mapping
  - Harder to maintain and refactor

### Supabase JS Client

* **Good**, because:
  - Native Supabase integration
  - Zero configuration for Supabase projects
  - Good TypeScript support
  - Built-in RLS (Row Level Security) support

* **Bad**, because:
  - Tightly coupled to Supabase ecosystem
  - Limited transaction support (requires RPC calls)
  - Difficult to migrate away from Supabase
  - Doesn't work well with DDD repository pattern
  - Less flexible for complex queries

## Implementation Pattern

### Domain Layer (Repository Interface)
```typescript
// src/domain/conference/repositories/conference-repository.ts
import { Conference } from '../conference';
import { ConferenceId } from '../value-objects/conference-id';
import { ConferenceSlug } from '../value-objects/conference-slug';

export interface ConferenceRepository {
  findById(id: ConferenceId): Promise<Conference | null>;
  findBySlug(slug: ConferenceSlug): Promise<Conference | null>;
  save(conference: Conference): Promise<void>;
  delete(id: ConferenceId): Promise<void>;
}
```

### Infrastructure Layer (Drizzle Implementation)
```typescript
// src/infrastructure/database/conference-repository.ts
import { DrizzleDatabase } from './drizzle-client';
import { ConferenceRepository } from '@/domain/conference/repositories/conference-repository';
import { Conference } from '@/domain/conference/conference';
import { ConferenceId } from '@/domain/conference/value-objects/conference-id';
import { conferences } from './schema';

export class DrizzleConferenceRepository implements ConferenceRepository {
  constructor(private db: DrizzleDatabase) {}

  async findById(id: ConferenceId): Promise<Conference | null> {
    const result = await this.db
      .select()
      .from(conferences)
      .where(eq(conferences.id, id.getValue()))
      .limit(1);

    return result[0] ? this.toDomain(result[0]) : null;
  }

  async save(conference: Conference): Promise<void> {
    await this.db
      .insert(conferences)
      .values(this.toPersistence(conference))
      .onConflictDoUpdate({
        target: conferences.id,
        set: this.toPersistence(conference),
      });
  }

  private toDomain(row: typeof conferences.$inferSelect): Conference {
    // Map database row to domain entity
    return new Conference({
      id: new ConferenceId(row.id),
      name: ConferenceName.create(row.name).unwrap(),
      // ... other mappings
    });
  }

  private toPersistence(conference: Conference) {
    // Map domain entity to database row
    return {
      id: conference.id.getValue(),
      name: conference.name.getValue(),
      // ... other mappings
    };
  }
}
```

### Application Layer (Transaction Support)
```typescript
// src/application/conference/create-conference.ts
import { DrizzleDatabase } from '@/infrastructure/database/drizzle-client';
import { ConferenceRepository } from '@/domain/conference/repositories/conference-repository';
import { ConferenceSettingsRepository } from '@/domain/conference/repositories/conference-settings-repository';
import { Result } from '@/shared/result';

export class CreateConference {
  constructor(
    private db: DrizzleDatabase,
    private conferenceRepo: ConferenceRepository,
    private settingsRepo: ConferenceSettingsRepository
  ) {}

  async execute(input: CreateConferenceInput): Promise<Result<Conference>> {
    // Transaction at application layer
    return this.db.transaction(async (tx) => {
      // Create conference
      const conferenceResult = Conference.create(input);
      if (conferenceResult.isFailure) {
        throw new Error(conferenceResult.error);
      }
      const conference = conferenceResult.value;

      // Save conference
      await this.conferenceRepo.save(conference);

      // Create initial settings
      const settings = ConferenceSettings.create({
        conferenceId: conference.id,
        maxSubmissions: input.maxSubmissions,
        allowReviews: true,
      });
      await this.settingsRepo.save(settings);

      return Result.ok(conference);
    });
  }
}
```

### Database Schema (Drizzle)
```typescript
// src/infrastructure/database/schema.ts
import { pgTable, uuid, varchar, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const conferences = pgTable('conferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  maxSubmissions: integer('max_submissions').notNull().default(3),
  cfpStartDate: timestamp('cfp_start_date', { withTimezone: true }).notNull(),
  cfpEndDate: timestamp('cfp_end_date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const conferenceSettings = pgTable('conference_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  conferenceId: uuid('conference_id')
    .notNull()
    .references(() => conferences.id, { onDelete: 'cascade' }),
  allowReviews: boolean('allow_reviews').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

## Migration Strategy

### Setup Steps
1. Install Drizzle ORM and dependencies:
   ```bash
   npm install drizzle-orm pg
   npm install -D drizzle-kit @types/pg
   ```

2. Create `drizzle.config.ts`:
   ```typescript
   import type { DrizzleKitConfig } from 'drizzle-kit';
   
   const config: DrizzleKitConfig = {
     schema: './src/infrastructure/database/schema.ts',
     out: './drizzle/migrations',
     dialect: 'postgresql',
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
   };
   
   export default config;
   ```

3. Generate migrations:
   ```bash
   npx drizzle-kit generate
   ```

4. Apply migrations:
   ```bash
   npx drizzle-kit migrate
   ```

### Provider Swapping

To switch from Supabase to another PostgreSQL provider:

1. Update `.env`:
   ```bash
   # From Supabase
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   
   # To Neon (example)
   DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.neon.tech/dbname
   ```

2. Update `DrizzleDatabase` client initialization
3. No changes needed to domain or application layers

## Monitoring and Observability

- **Query logging**: Enable Drizzle query logging in development
- **Performance**: Monitor slow queries using PostgreSQL query analysis
- **Migration tracking**: Drizzle maintains migration history in database

## Related ADRs

- [ADR-002-01](002-01-use-supabase-amendment-ddd-abstraction.md) - Supabase with DDD Abstraction
- [ADR-009](009-adopt-domain-driven-design-structure.md) - DDD Architecture
- [ADR-015](015-adopt-cqrs-pattern.md) - CQRS Pattern for Application Layer

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit - Migration Tool](https://orm.drizzle.team/kit-docs/overview)
- [TypeScript Support](https://orm.drizzle.team/docs/get-started#typescript-support)
