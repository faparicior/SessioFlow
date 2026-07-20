# SessioFlow Architecture Migration Guide

## Executive Summary

This document outlines the migration from the current monolith structure to a fully decoupled, DDD-based monorepo architecture with clear separation between frontend and backend, microservice-ready modules, and shared backend infrastructure.

## 🎯 Goals

1. **Modular Monolith → Microservices Ready**: Each DDD module can be extracted independently
2. **Clear Frontend/Backend Boundaries**: No shared types, contracts, or business logic
3. **DDD Compliance**: Proper bounded contexts with domain/application/infrastructure layers
4. **Scalability**: Efficient resource usage, shared infrastructure connections
5. **Clean CQRS**: Commands and queries properly separated
6. **API Schema Standardization**: Shared validation schemas and OpenAPI docs (not business logic)

## 📊 Current vs Target

### Current Structure
```
apps/
├── frontend/
└── backend/
    src/
      modules/conference/
        domain/
          entities/conference.ts
          value-objects/conference-id.ts
          repository/conference-repository.interface.ts
    shared/
      infrastructure/
```

### Target Structure
```
apps/
├── web/              # Frontend (Next.js)
└── backend/          # Backend gateway

packages/
├── api-definitions/   # API schemas, OpenAPI/OAS specs (shared periphery)
│   ├── openapi/       # OpenAPI/Swagger docs
│   ├── json-schema/   # JSON schemas
│   ├── zod/           # Zod schemas for validation
│   └── types/         # TypeScript interfaces (data only)
│
├── modules/conference/    # DDD module (backend only)
│   domain/
│   │   ├── conference.ts                        # Entity (root)
│   │   ├── repository.interface.ts              # Interface (root)
│   │   ├── value-objects/                       # Grouped
│   │   ├── exceptions/                          # Grouped
│   │   └── events/                              # Grouped
│   application/
│   infrastructure/
│
├── shared/            # Backend infrastructure (prisma, logging, cache)
└── frontend/          # Frontend only (UI, hooks, queries)
```

## 🗂️ Detailed Structure

### 1. Frontend Package (`packages/frontend/`)
```typescript
packages/frontend/
  ├── components/     # UI components (React, Vue, etc.)
  ├── hooks/          # Custom hooks for client-side state
  ├── queries/        # Server state management (React Query)
  └── types/          # Frontend-specific types (api response shapes)
```

**Key Point**: Frontend types are **derived from API responses, not backend domain models**.

### 2. Backend Module Package (`packages/modules/conference/`)
```typescript
packages/modules/conference/
  ├── domain/          # Core business logic
  │   ├── conference.ts              # Entity (root)
  │   ├── conference-repository.interface.ts  # Interface (root)
  │   ├── value-objects/             # Grouped IV value-domain objects
  │   ├── exceptions/                # Grouped domain exceptions
  │   └── events/                    # Grouped domain events
  ├── application/                   # API layer (commands/queries)
  │   ├── commands/                  # CreateConferenceHandler, etc.
  │   └── queries/                   # GetConferenceHandler, etc.
  └── infrastructure/                # Technical implementation
      ├── database/                  # Prisma/Drizzle repositories
      └── adapters/                  # External service clients
```

### 3. Shared Infrastructure (`packages/shared/`)
```typescript
packages/shared/
  ├── database/       # Drizzle ORM client, connection pooling, migrations schema
  ├── logging/        # Logger factory (Pino), request context (AsyncLocalStorage)
  ├── cache/          # Redis client / cache adapters
  └── utils/          # Utility functions (BE only)
```

**Key Point**: All backend modules use shared infrastructure via dependency injection.

### 4. API Schema Package (`packages/api-definitions/`) (Phase 3.5)
- **OpenAPI/Swagger specifications** (OpenAPI 3.0 schema)
- **JSON Schema definitions** (for validation)
- **Zod schemas** (frontend/backend validation)
- **TypeScript interfaces** (data-only, consistent with API responses)
- **Key principle**: Contains only DATA SHAPES, NOT business logic
- **Stores**: `openapi/`, `json-schema/`, `zod/`, `types/`

### 5. API Gateway (`apps/backend/`) (Next.js API Routes)
- Next.js API routes (serverless functions)
- Receives HTTP requests
- Routes to appropriate modules
- Validates input using `@sessioflow/api-definitions` schemas (Zod)
- Returns JSON responses mapped from domain entities to API schemata
- Converts domain entities → API data objects (not domain objects)

### 6. Frontend App (`apps/web/`)
- Next.js application
- UI components + client-side logic
- Mobile-responsive design
- Calls backend API endpoints
- Uses shared API schemas for validation
- Imports types from API schemas (data shapes only)

## 🔄 Migration Plan

### Phase 1: Scaffolding (Week 1-2)

**Step 1.1: Create Package Structure**
```bash
mkdir -p packages/shared/{database,logging,cache}
mkdir -p packages/frontend/{components,hooks,queries}
mkdir -p packages/modules/{conference}
mkdir -p packages/config/{tsconfig,eslint-config}
```

**Step 1.2: Configure Turborepo**
Install `turbo` as a root dev dependency and create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

Update root `package.json` scripts to delegate build/dev/lint/test commands to Turborepo:
```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test"
  }
}
```

**Step 1.3: Update Workspaces & Shared Tooling Packages**
Create shared TypeScript config package (`packages/config/tsconfig/`) to avoid duplicate TS configs:
```json
// packages/config/tsconfig/package.json
{
  "name": "@sessioflow/tsconfig",
  "version": "0.1.0",
  "private": true,
  "exports": {
    "./base.json": "./base.json"
  }
}
```

Verify root `package.json` workspaces:
```json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "packages/shared/*",
    "packages/modules/*",
    "packages/config/*"
  ]
}
```

**Note on Package TSConfigs**: Packages extend `base.json` via relative paths (e.g. `"extends": "../config/tsconfig/base.json"`) so IDE language servers resolve base configs instantly without relying on un-indexed node_modules caches.

### Phase 2: Shared Infrastructure (Week 2-3)

**Step 2.1: Extract Database Layer (Drizzle ORM)**
- Move database connection and Drizzle schema definition to `packages/shared/database/`
- Export Drizzle client factory with PostgreSQL connection pooling (`postgres.js` / Supabase driver)
- Keep domain entities decoupled from DB persistence schemas (mapping functions in infrastructure layer)
- Add Zod validation for database connection variables (`DATABASE_URL`, `DIRECT_URL`)

**Step 2.2: Extract Logging Layer**
- Move `apps/backend/src/shared/infrastructure/logging/` → `packages/shared/logging/`
- Create logger factory
- Implement request context propagation
- Add OpenTelemetry integration (optional)

**Step 2.3: Add Cache Layer (Optional)**
- Create `packages/shared/cache/`
- Redis client factory
- Cache key patterns
- TTL management

### Phase 3: Module Refactoring (Week 3-5)

**Step 3.1: Create Module Package (No Barrel Exports)**
Avoid `index.ts` barrel exports. Instead, configure package subpath exports in `package.json` so consumers import specific modules explicitly:
```json
{
  "name": "@sessioflow/conf-module",
  "exports": {
    "./domain/*": "./src/domain/*.ts",
    "./application/*": "./src/application/*.ts",
    "./infrastructure/*": "./src/infrastructure/*.ts"
  }
}
```

**Step 3.2: Reorganize Domain**
Move files from `apps/backend/src/modules/conference/`:
```
apps/backend/src/modules/conference/
  ├── domain/
  │   ├── entities/conference.ts              ← packages/modules/conference/domain/conference.ts
  │   ├── value-objects/conference-id.ts      ← packages/modules/conference/domain/value-objects/conference-id.ts
  │   ├── exceptions/conference-name-too-short-error.ts → packages/modules/conference/domain/exceptions/conference-name-too-short-error.ts
  │   ├── events/conference-created.ts        ← packages/modules/conference/domain/events/conference-created.ts
  │   └── repository/conference-repository.interface.ts → packages/modules/conference/domain/repository.interface.ts
```

**Step 3.3: Update Module Imports**
```typescript
// packages/modules/conference/domain/conference.ts
import { ConferenceId } from './value-objects/conference-id';
import { ConferenceName } from './value-objects/conference-name';
import { CfpDates } from './value-objects/cfp-dates';
```

**Step 3.4: Implement Infrastructure with Drizzle ORM**
```typescript
// packages/modules/conference/infrastructure/database/conference.repository.ts
import { eq } from 'drizzle-orm';
import { db } from '@sessioflow/shared-database/client';
import { conferencesTable } from '@sessioflow/shared-database/schema';
import { ConferenceRepository } from '../../domain/repository.interface';
import { Conference } from '../../domain/conference';

export class DrizzleConferenceRepository implements ConferenceRepository {
  async findById(id: string): Promise<Conference | null> {
    const [row] = await db.select().from(conferencesTable).where(eq(conferencesTable.id, id));
    return row ? Conference.fromPersistence(row) : null;
  }
}
```

### Phase 4: API Schemas & Gateway (Week 5-6)

**Step 4.1: Create API Schema Package** (`packages/api-definitions/`)
- Define OpenAPI/OAS specs (OpenAPI 3.0)
- Create JSON Schemas for validation
- Generate Zod schemas (`ConferenceSchema`, `SubmissionSchema`, etc.)
- Export TypeScript interfaces (data-only)
- Place in `packages/api-definitions/`

**Step 4.2: Implement Next.js API Gateway Routes & Auth Context Propagation**
```typescript
// apps/backend/src/app/api/v1/conferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GetConferenceHandler } from '@sessioflow/conf-module/application/queries/get-conference';
import { CreateConferenceHandler } from '@sessioflow/conf-module/application/commands/create-conference';
import { ConferenceSchema } from '@sessioflow/api-definitions/zod/conference.schema';
import { getAuthenticatedUser } from '@/infrastructure/auth/get-authenticated-user';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request); // Propagate user session context
    const handler = new GetConferenceHandler();
    const result = await handler.execute({ userId: user?.id });
    const responseMap = mapToApiResponse(result.conference);
    return NextResponse.json(responseMap);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ConferenceSchema.parse(body);  // Step 1: Validate
    const handler = new CreateConferenceHandler();
    const conference = await handler.execute(validated);  // Step 2: Execute
    return NextResponse.json(conference, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Map domain entity to API response (data only)
 */
function mapToApiResponse(conference: Conference): ConferenceApiResponse {
  return {
    id: conference.id.value,
    name: conference.name.value,
    cfp: {
      isOpen: conference.isCfpOpen(),  // Domain method call
      startDate: conference.cfp.startDate.value,
      endDate: conference.cfp.endDate.value,
    },
  };
}
```

### Phase 5: Frontend Integration (Week 6-7)
```typescript
function mapToApiResponse(conference: Conference): ConferenceApiResponse {
  return {
    id: conference.id.value,
    name: conference.name.value,
    cfp: {
      isOpen: conference.isCfpOpen(),  // Call domain method to compute data
    },
  };
}
```

### Phase 5: Frontend Integration (Week 6-7)

**Step 5.1: Consume API Schemas**
```typescript
// packages/frontend/queries/conferences.ts
import { ConferenceSchema, type ConferenceApiResponse } from '@sessioflow/api-definitions/zod/conference.schema';

export const createConference = async (data: ConferenceCreateInput) => {
  const validated = ConferenceSchema.parse(data);  // Shared validation
  const response = await fetch('/api/conferences', {
    method: 'POST',
    body: JSON.stringify(validated),
  });
  const result = await response.json();
  return result;  // ConferenceApiResponse
};
```

**Step 5.2: Create Frontend Components**
```typescript
packages/frontend/
  ├── components/
  │   └── ui/
  ├── hooks/
  │   └── use-conferences.ts
  ├── queries/
  │   └── conferences.ts
  └── types/  // Uses API schema types
```

### Phase 6: Testing & Validation (Week 7-8)

**Step 6.1: Run Architecture Tests**
```bash
npm run test:architecture
```

**Step 6.2: Verify DDD Boundaries**
- Check that `domain/` has no infrastructure imports
- Check that `application/` has no domain implementation access
- Check that `infrastructure/` uses shared packages correctly

**Step 6.3: Verify API Boundaries**
- Check that frontend imports only API schemas (data), not backend domain
- Check that backend uses API schemas for validation but domain entities separately
- Check that no domain entities leak into frontend

**Step 6.4: CI/CD Pipeline**
- Add tests to GitHub Actions
- Verify build pipeline
- Add dependency checks

## 🔧 Technical Details

### Domain Object Focus

**Entities at Root** (conceptually important entities):
```typescript
domain/
  ├── conference.ts              // Core entity with state + behavior
  ├── submission.ts              // Core entity
  ├── conference-repository.interface.ts  // Contract
  └── submission-repository.interface.ts  // Contract
```

**Grouped Support Objects** (conceptually supporting layers):
```typescript
domain/
  ├── value-objects/             // CFP dates, statuses, IDs
  ├── exceptions/                // Domain failures
  └── events/                    // Business events
```

### Shared Infrastructure Pattern (No Barrel Exports, Drizzle ORM)

```typescript
// packages/shared/database/src/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client);
```

**Usage in Module** (Import direct path or subpath export, NOT barrel `index.ts`):
```typescript
// packages/modules/conference/infrastructure/database/conference.repository.ts
import { db } from '@sessioflow/shared-database/client';
import { conferencesTable } from '@sessioflow/shared-database/schema';
import { Conference } from '../../domain/conference';

export class DrizzleConferenceRepository implements ConferenceRepository {
  async save(conference: Conference): Promise<void> {
    await db.insert(conferencesTable).values(conference.toPersistence());
  }
}
```

### API Schema & Frontend-Backend Decoupling

**Key Distinction**:
- **API Schemas** (packages/api-definitions/): Data shapes ONLY - validation, documentation, frontend types
- **Domain Entities** (packages/modules/conference/domain/): Business logic with methods, state, behavior

**No Shared Business Logic**:
```typescript
// Frontend uses API schemas (data only)
interface Conference {
  id: string;
  name: string;
  cfp: {
    isOpen: boolean;
    startDate: string;
    endDate: string;
  };
}

// Backend domain entity (rich with methods)
class Conference {
  constructor(
    public readonly id: ConferenceId,
    public readonly name: ConferenceName,
    public readonly cfp: CfpConfig,
    private readonly status: ConferenceStatus  // ← Internal
  ) {}

  isCfpOpen(): boolean { ... }  // ← Method
  closeCfp(): void { ... }      // ← Behavior
  toPersistence(): ConferenceRow { ... }  // Mapping to Drizzle row structure
}
```

**Mapping Domain to API**:
```typescript
function mapToApiResponse(conference: Conference): ConferenceApiResponse {
  return {
    id: conference.id.value,
    name: conference.name.value,
    cfp: {
      isOpen: conference.isCfpOpen(),  // Domain method call, not direct field access
      startDate: conference.cfp.startDate.value,
    },
  };
}

// Gateway route
gateway.post('/api/conferences', (req, res) => {
  const conference = await createConferenceHandler.execute(req.body);  // Returns domain entity
  res.json(mapToApiResponse(conference));  // Converts to API data shape
});
```

**Zod Schema for Validation (Shared but NOT for Business Logic)**:
```typescript
// packages/api-definitions/zod/conference.schema.ts
export const ConferenceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  cfp: z.object({
    isOpen: z.boolean(),
    startDate: z.string(),
    endDate: z.string(),
  }),
});

// frontend uses it for validation
import { ConferenceSchema } from '@sessioflow/api-definitions/zod/conference.schema';
const validated = ConferenceSchema.parse(input);

// backend uses it for validation
import { ConferenceSchema } from '@sessioflow/api-definitions/zod/conference.schema';
if (!ConferenceSchema.safeParse(req.body).success) handle400();
```

**OpenAPI Documentation**:
```yaml
# packages/api-definitions/openapi/openapi.yaml
openapi: 3.0.3
paths:
  /conferences:
    post:
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Conference'
```

This approach ensures:
- ✅ Validation and documentation are shared
- ✅ Domain business logic stays hidden
- ✅ Frontend-backend contract is clear
- ✅ Microservices can produce consistent API
- ✅ Swagger docs stay up-to-date
- ✅ **No Barrel Exports**: Prevents circular dependencies, improves tree-shaking, and accelerates Turborepo builds and type checking by using explicit subpath exports (`@sessioflow/pkg/subpath`) instead of `index.ts` re-export files.

## 📋 Migration Checklist

### Phase 1: Scaffolding
- [ ] Create `packages/` structure
- [ ] Configure `turbo.json`
- [ ] Update `package.json` workspaces
- [ ] Initialize all packages with `package.json`

### Phase 2: Shared Infrastructure
- [ ] Extract database layer
- [ ] Extract logging layer
- [ ] Create cache layer (optional)
- [ ] Update all imports to use shared packages

### Phase 3: Module Refactoring
- [ ] Create `packages/modules/conference/`
- [ ] Move domain files to proper locations
- [ ] Reorganize domain (entities/interfaces at root)
- [ ] Update imports within module
- [ ] Update infrastructure to use shared packages

### Phase 3.5: API Schema Package
- [ ] Create `packages/api-definitions/` structure
- [ ] Define OpenAPI/OAS specs
- [ ] Create JSON schemas
- [ ] Generate Zod schemas for validation
- [ ] Export TypeScript interfaces (data-only)
- [ ] Document API endpoints in OpenAPI

### Phase 4: API Gateway & Integration
- [ ] Create gateway routes (Express/Fastify)
- [ ] Implement request validation middleware with API schemas
- [ ] Add handlers in application layer
- [ ] Map domain entities → API data objects
- [ ] Test API endpoints (must pass schema validation)

### Phase 5: Frontend Integration
- [ ] Create `packages/frontend/` structure
- [ ] Move UI components
- [ ] Update queries/hooks to use API schemas
- [ ] Add frontend types (from API schemas)
- [ ] Test client-side validation
- [ ] Test all flows

### Phase 6: Testing & Validation
- [ ] Run architecture tests
- [ ] Verify DDD boundaries (no domain -> infra imports)
- [ ] Verify API boundaries (no domain entities in frontend)
- [ ] Update CI/CD pipeline
- [ ] Clean up old structure

## 🎯 Success Criteria

1. **All tests pass** (`npm run test`)
2. **Architecture tests pass** (`npm run test:architecture`)
3. **Linting and type checking** pass (`npm run lint`, `npm run typecheck`)
4. **Frontend loads and functions** without backend type dependencies
5. **Backend modules independent** (can be extracted as microservices)
6. **Shared infrastructure** is truly shared (no duplicates)

## 🧪 Testing Strategy

### Unit Tests
- Domain entities and value objects
- Application handlers (commands/queries)
- Repository implementations (with mocks)

### Integration Tests
- API endpoints (with test database)
- Infrastructure adapters (with test containers)

### Architecture Tests
```typescript
// tests/backend/unit/architecture/ddd-boundaries.test.ts
describe('DDD Boundaries', () => {
  it('domain layer should not import infrastructure', async () => {
    const domainImported = await checkImports('packages/modules/conference/domain');
    const infrastructureImported = domainImported.some(path => 
      path.includes('packages/shared')
    );
    expect(infrastructureImported).toBe(false);
  });

  it('frontend should not import backend modules', async () => {
    const frontendImports = await checkImports('packages/frontend');
    const backendModuleImports = frontendImports.filter(path => 
      path.includes('@sessioflow/modules-')
    );
    expect(backendModuleImports).toHaveLength(0);
  });
});
```

## 🔑 Environment Variables & Configuration Management

- **Centralized Validation**: Each app (`apps/web`, `apps/backend`) defines a `src/env.ts` file using Zod schema validation to parse and validate runtime environment variables (`DATABASE_URL`, `SUPABASE_URL`, `AUTH0_*`, etc.) at startup.
- **Shared Package Configs**: Shared packages accept configuration via factory initialization options or standard `process.env` references validated by host applications.

## 🚀 Ready to Start?

This migration will give you:
- ✅ Microservice-ready architecture
- ✅ Clear DDD boundaries
- ✅ Frontend/backend decoupling
- ✅ Scalable infrastructure
- ✅ Maintainable code organization

**Next Steps**:
1. Review this document with your team
2. Set up the scaffolding (Phase 1)
3. Extract shared infrastructure (Phase 2)
4. Refactor one module as proof of concept (Phase 3)

---

*Last Updated: 2025-07-25*
*Author: SessioFlow Architecture Team*
