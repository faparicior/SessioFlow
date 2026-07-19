# 023-Superseed 009-01: Comprehensive Monorepo Structure Update

* **Status:** Proposed
* **Date:** 2026-07-25
* **Decision Makers:** Fernando (Lead Developer), Technical Team
* **Supersedes:** [ADR-009-01](./009-01-monorepo-backend-frontend-separation.md)
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow's monorepo structure (ADR-009-01) established an `apps/` layout separating frontend and backend. However, new architectural decisions (ADR-020, ADR-021, ADR-022) require a comprehensive update to the structure to support:

1. **API Schema Package** - Shared Swagger/OpenAPI documentation and validation schemas
2. **Domain Module Structure Convention** - Specific organization of domain objects
3. **Frontend-Backend Type Decoupling** - Strict separation of backend domain from frontend types

ADR-009-01 correctly separated `apps/` but did not define how to handle API schemas or the precise domain structure within backend modules.

**Current Decision (ADR-009-01):**
- Uses `apps/frontend/` and `apps/backend/`
- Backend contains DDD modules with domain/application/infrastructure/interfaces
- Frontend contains Next.js application and UI components
- Shared utilities in `packages/utils/`

**New Requirements:**
- Must add `packages/api-definitions/` for shared API schemas
- Must enforce domain structure: entities at root, grouped support objects
- Must prevent shared domain types between frontend and backend
- Must support future microservice extraction

## Considered Options

1. **Comprehensive Update (Recommended)**
2. **Keep 009-01 + Add Supplemental ADRs**
3. **Major Restructure (Radical Separation)**

## Decision Outcome

**Chosen Option:** "[Comprehensive Update]"

**Justification:**
This approach supersedes ADR-009-01 with a more complete structure that incorporates all new decisions. It provides a single, comprehensive architectural decision that covers the complete monorepo organization, including domain structure, API schemas, and type boundaries. Amending 009-01 would be less clear than creating a dedicated superseding decision that encompasses the full scope.

### Final Monorepo Structure

```
sessioflow/
├── apps/
│   ├── web/                # Frontend (Next.js app)
│   │   ├── src/
│   │   │   ├── app/        # Next.js App Router
│   │   │   ├── components/ # UI components (frontend-only types)
│   │   │   ├── hooks/      # Client-side hooks
│   │   │   └── queries/    # Frontend queries (data from API schema)
│   │   └── package.json
│   │
│   └── backend/            # Backend gateway/adapter
│       ├── src/
│       │   ├── gateway/    # API routes (Express/Fastify/NestJS)
│       │   ├── domain/     # (deprecated, moved to packages/modules/)
│       │   └── ...
│       └── drizzle.config.ts
│
├── packages/
│   ├── api-definitions/    # API Schema Package (shared periphery)
│   │   ├── openapi/        # OpenAPI 3.0 YAML files (Swagger docs)
│   │   ├── json-schema/    # JSON schemas for validation
│   │   ├── zod/            # Zod schemas for runtime validation
│   │   │   ├── conference.schema.ts
│   │   │   ├── submission.schema.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── ...
│   │   └── types/          # TypeScript interfaces (DATA ONLY)
│   │       ├── conference.response.ts
│   │       ├── submission.response.ts
│   │       └── ...
│   │
│   ├── modules/            # DDD Bounded Context Modules (backend only)
│   │   ├── conference/     # Conference module
│   │   │   ├── domain/
│   │   │   │   ├── conference.ts                  # ENTITY (root level)
│   │   │   │   ├── submission.ts                  # ENTITY (root level)
│   │   │   │   ├── conference-repository.interface.ts  # INTERFACE (root level)
│   │   │   │   ├── value-objects/                 # SUBFOLDER
│   │   │   │   │   ├── conference-id.ts
│   │   │   │   │   ├── conference-name.ts
│   │   │   │   │   ├── cfp-dates.ts
│   │   │   │   │   └── conference-status.ts
│   │   │   │   ├── exceptions/                    # SUBFOLDER
│   │   │   │   │   ├── conference-name-too-short-error.ts
│   │   │   │   │   ├── cfp-dates-invalid-error.ts
│   │   │   │   │   └── state-transition-error.ts
│   │   │   │   └── events/                        # SUBFOLDER
│   │   │   │       ├── conference-created.ts
│   │   │   │       └── cfp-opened.ts
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── create-conference/
│   │   │   │   │   └── ...
│   │   │   │   └── queries/
│   │   │   │       ├── get-conference/
│   │   │   │       └── ...
│   │   │   └── infrastructure/
│   │   │       ├── database/
│   │   │       │   ├── conference-repository.ts      # Implementation
│   │   │       │   └── drizzle-schema.ts
│   │   │       └── adapters/
│   │   │           ├── notification-adapter.ts
│   │   │           └── ...
│   │   ├── submission/
│   │   └── [other-modules]/
│   │
│   ├── shared/             # Backend Infrastructure (BE ONLY)
│   │   ├── database/       # Prisma/Drizzle client (connection pool)
│   │   ├── logging/        # Logger factory + OpenTelemetry
│   │   ├── cache/          # Redis client (optional)
│   │   └── utils/          # Utility functions (BE only)
│   │
│   └── frontend/           # Frontend Shared Logic (FE ONLY)
│       ├── components/     # Reusable UI components
│       ├── hooks/          # Custom hooks (client-side)
│       ├── queries/        # React Query hooks
│       └── ...
│
├── turbo.json
├── package.json (workspaces)
└── MIGRATION_TO_NEW_ARCHITECTURE.md
```

### Key Components Explained

#### 1. `packages/api-definitions/` (API Schema Package)
- **Purpose:** Shared validation and documentation (data shapes only)
- **Contents:**
  - `openapi/`: OpenAPI 3.0 YAML files for Swagger
  - `json-schema/`: JSON schemas for validation
  - `zod/`: Zod schemas for frontend/backend validation
  - `types/`: TypeScript interfaces (plain data, no methods)
- **Important:** Contains **only DATA**, not business logic

#### 2. `packages/modules/` (DDD Modules - Backend Only)
- **Purpose:** Reusable bounded contexts with full DDD implementation
- **Structure:**
  - `domain/`: Core business logic
    - **Entities** at root (conference.ts, submission.ts)
    - **Repository Interfaces** at root (interface.ts files)
    - **Support Objects** in subfolders (value-objects/, exceptions/, events/)
  - `application/`: Commands and queries (CQRS)
  - `infrastructure/`: Implementation (repositories, adapters)
- **Important:** Domain entities are **NOT** shared with frontend

#### 3. `packages/shared/` (Backend Infrastructure - BE Only)
- **Purpose:** Shared infrastructure services used by all backend modules
- **Contents:**
  - `database/`: PrismaClient instance, connection pool
  - `logging/`: Logger factory, request context
  - `cache/`: Redis client (optional)
  - `utils/`: BE utility functions

#### 4. `packages/frontend/` (Frontend Logic - FE Only)
- **Purpose:** Frontend-specific logic and components
- **Contents:**
  - `components/`: Reusable UI components (Lightweight)
  - `hooks/`: Custom hooks for client state
  - `queries/`: Server state management (React Query)

#### 5. `apps/web/` (Frontend App - Next.js)
- **Purpose:** The complete Next.js frontend application
- **Structure:**
  - `src/app/`: Next.js App Router (pages, layouts)
  - `src/components/`: Some UI components (if needed)

#### 6. `apps/backend/` (Backend Gateway)
- **Purpose:** API entry point for all frontend requests
- **Contents:**
  - `src/gateway/`: Express/Fastify/NestJS routes
  - Validates requests using `@sessioflow/api-definitions`
  - Routes to backend module handlers

### How Modules Map to Original Structure

| Original (`apps/backend/src/`) | New `packages/modules/` |
|-------------------------------|------------------------|
| `modules/conference/domain/` | `packages/modules/conference/domain/` (with renamed structure) |
| `modules/conference/application/` | `packages/modules/conference/application/` |
| `modules/conference/infrastructure/` | `packages/modules/conference/infrastructure/` |
| `shared/infrastructure/` | `packages/shared/` (database, logging, cache) |

### Frontend-Backend Type Flow

```typescript
// 1. Frontend: Uses API schema for validation
import { ConferenceSchema, type ConferenceApiResponse } from '@sessioflow/api-definitions/zod/conference.schema';

interface ConferenceRequest {
  name: string;
}

// Validate input
const input = ConferenceSchema.parse({ name: "Confluence 2026" });

// 2. Backend: Gateway receives HTTP request
app.post('/api/conferences', 
  validateRequest(ConferenceSchema),  // Validates JSON structure
  async (req, res) => {
  
  // 3. Backend: Module executes command handler
  const conference = await createConferenceHandler.execute(req.body);
  // Returns: Conference (domain entity with methods)
  
  // 4. Backend: Map domain entity to API response
  const apiResponse = mapToApiResponse(conference);  // Plain data
  // Returns: ConferenceApiResponse ( schema shape)
  
  res.json(apiResponse);  // Sends plain data to frontend
});

// 5. Frontend: Receives plain data
// (No need to validate - already validated by API schema)
const result = await createConference(input);
```

### Domain Structure Convention (Exercise Summary)

```typescript
packages/modules/conference/domain/
  ├── conference.ts                  ← ENTITY at root (important concepts)
  ├── submission.ts                  ← ENTITY at root
  ├── conference-repository.interface.ts  ← INTERFACE at root
  ├── value-objects/                 ← SUBFOLDER for supporting objects
  │   ├── conference-id.ts
  │   ├── conference-name.ts
  │   ├── cfp-dates.ts
  │   └── ...
  ├── exceptions/                    ← SUBFOLDER for errors
  │   ├── conference-name-too-short-error.ts
  │   └── ...
  └── events/                        ← SUBFOLDER for domain events
      ├── conference-created.ts
      └── ...
```

**Rule:** Entities and Repository interfaces go in `domain/` root. Value objects, exceptions, and events go in subfolders.

## Consequences

### Positive
- ✅ Provides complete monorepo architecture in one ADR
- ✅ Enforces strict frontend-backend decoupling (no shared domain types)
- ✅ Establishes clear domain module structure convention
- ✅ Enables microservice extraction (each module can be detached)
- ✅ Supports OpenAPI documentation and validation
- ✅ Consistent across all DDD modules

### Negative
- 🔧 Requires significant migration effort from `apps/backend/src/` structure
- 📦 More complex initial setup; need to understand all pieces
- 🔄 API schemas require maintenance alongside API changes

### Risks
- ⚠️ Developers may accidentally import domain entities into frontend (prevent with lint rules)
- ⚠️ API schema maintenance burden (mitigate with Zod + Auto generation)
- ⚠️ API schema versioning required (no breaking changes without major version)
- ⚠️ Domain structure convention must be followed consistently

## Migration Plan

See `MIGRATION_TO_NEW_ARCHITECTURE.md` for detailed guidance.

### Summary
1. **Phase 1:** Scaffolding (`packages/`, `turbo.json`, workspaces)
2. **Phase 2:** Shared Infrastructure (`packages/shared/`)
3. **Phase 3:** Module Refactoring (`packages/modules/` with new domain structure)
4. **Phase 3.5:** API Schema Package (`packages/api-definitions/`)
5. **Phase 4:** API Gateway & Integration
6. **Phase 5:** Frontend Integration
7. **Phase 6:** Testing & Validation

## Related ADRs

* [ADR-009-01: Monorepo with Backend/Frontend Separation](./009-01-monorepo-backend-frontend-separation.md) - **Superseded**
* [ADR-020: API Schema Package Pattern](./020-use-api-schema-package-pattern-for-contract-definition.md)
* [ADR-021: Domain Module Structure Convention](./021-adopt-domain-module-structure-convention.md)
* [ADR-022: Frontend-Backend Type Decoupling Strategy](./022-accept-frontend-backend-type-decoupling-strategy.md)

## Links

* [Migration Guide](../../MIGRATION_TO_NEW_ARCHITECTURE.md)
* [ADR-015: CQRS Pattern](./015-adopt-cqrs-pattern.md)
* [ADR-007: Use Zod for Validation](./007-use-zod-for-validation.md)

---

**Status:** ✅ **PROPOSED** (Supersedes ADR-009-01)

**Decision:** Adopt comprehensive monorepo structure with API Schema Package, DDD module structure convention, and strict frontend-backend type decoupling. This supersedes ADR-009-01.

**Implementation Date:** Upon approval
**Owner:** Technical Team
**Migration Guide:** MIGRATION_TO_NEW_ARCHITECTURE.md
