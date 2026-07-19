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
  ├── database/       # Prisma client, connection pooling, migrations
  ├── logging/        # Logger factory, request context
  ├── cache/          # Redis client
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

### 5. API Gateway (`apps/backend/`)
- Enterprise Layer (Express, Fastify, NestJS)
- Receives HTTP requests
- Routes to appropriate modules
- Validates input using `@sessioflow/api-definitions` schemas
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
```

**Step 1.2: Configure Turborepo**
Create `turbo.json`:
```json
{
  "tasks": {
    "dev": {
      "dependsOn": ["^dev"],
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["^test"]
    }
  }
}
```

**Step 1.3: Update Workspaces**
Verify `package.json`:
```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

### Phase 2: Shared Infrastructure (Week 2-3)

**Step 2.1: Extract Database Layer**
- Move `apps/backend/src/shared/infrastructure/database/` → `packages/shared/database/`
- Create Drizzle/Prisma client factory
- Implement connection pooling
- Add Zod validation for database config

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

**Step 3.1: Create Module Package**
```typescript
packages/modules/conference/
package.json:
{
  "name": "@sessioflow/conf-module",
  "main": "src/index.ts"
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

**Step 3.4: Implement Infrastructure**
```typescript
// packages/modules/conference/infrastructure/database/conference.repository.ts
import { ConferenceRepository } from '../domain/repository.interface';
import { prisma } from '@sessioflow/shared-database';

export class PrismaConferenceRepository implements ConferenceRepository {
  async findById(id: string): Promise<Conference | null> {
    const data = await prisma.conference.findUnique({ where: { id } });
    return data ? Conference.fromPrisma(data) : null;
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

**Step 4.2: Implement Request Validation Middleware**
```typescript
// apps/backend/src/middlewares/validate-request.ts
import { ConferenceSchema } from '@sessioflow/api-definitions/zod/conference.schema';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    next();
  };
};

app.post('/api/conferences', validateRequest(ConferenceSchema),...);
```

**Step 4.3: Create Gateway Layer**
```typescript
apps/backend/src/gateway/routes/conferences.ts
import { GetConferenceHandler } from '@sessioflow/conf-module/application/queries/get-conference';
import { CreateConferenceHandler } from '@sessioflow/conf-module/application/commands/create-conference';

export const conferencesRouter = Router();

conferencesRouter.get('/', async (req, res) => {
  const handler = new GetConferenceHandler();
  const result = await handler.execute();
  
  // Map domain entity to API response (data only)
  const responseMap = mapToApiResponse(result.conference);
  res.json(responseMap);
});

conferencesRouter.post('/', 
  validateRequest(ConferenceSchema),  // Validate input structure
  async (req, res) => {
  const handler = new CreateConferenceHandler();
  const conference = await handler.execute(req.body);
  res.json(mapAsApiResponse(conference));  // Returns API schema shape
});
```

**Step 4.4: Map Domain to API**
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

### Shared Infrastructure Pattern

```typescript
// packages/shared/database/src/index.ts
import { PrismaClient } from '@prisma/client';

class DatabaseInstance {
  private static instance: PrismaClient | null = null;

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient();
      console.log('✅ Database instance created');
    }
    return this.instance;
  }
}

export const db = DatabaseInstance.getInstance();
```

**Usage in Module**:
```typescript
// packages/modules/conference/infrastructure/database/conference.repository.ts
import { db } from '@sessioflow/shared-database';

export class ConferenceRepository implements ConferenceRepository {
  async save(conference: Conference): Promise<void> {
    await db.conference.create({ data: conference.toPrisma() });
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
  toPrisma(): Prisma.CreateInput { ... }
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
