# 022-Accept Frontend-Backend Type Decoupling Strategy

* **Status:** Accepted
* **Date:** 2026-07-25
* **Decision Makers:** Fernando (Lead Developer), Technical Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow's monorepo structure will separate frontend (`apps/frontend/`) and backend (`apps/backend/`) into distinct applications. A critical architectural decision is how to handle shared types between these domains. The current approach of potentially sharing types risks creating tight coupling between frontend and backend, reducing microservice readiness and violating DDD principles.

**Current Challenge:**
- Frontend needs types to shape API calls and handle responses
- Backend has domain entities, value objects, and DTOs
- Should backend domain types be shared with frontend?
- Need to balance type safety with decoupling goals

**Decision Drivers:**
* **Frontend-Backend Decoupling** — Frontend should NOT depend on backend domain types
* **Microservice Readiness** — Each service should be independently swappable
* **Type Safety** — Both sides need meaningful types for runtime validation
* **Avoid API Cycles** — Backend should not import from frontend packages
* **Support API Schema** — Use dedicated API schemas for shared definitions (ADR-020)

## Considered Options

1. **Strict Decoupling (API Schemas Only) (Recommended)**
2. **Shared Domain Types**
3. **Shared DTOs (Transfer Objects)**
4. **No Shared Types (Each Owns Everything)**

## Decision Outcome

**Chosen Option:** "[Strict Decoupling (API Schemas Only)]"

**Justification:**
This approach allows frontend and backend to share ONLY API schemas for validation, documentation, and type inference. Backend domain logic (entities, value objects, business rules) remains PRIVATE to backend. Unlike shared domain types, this prevents frontend from depending on backend implementation details. Unlike no shared types, it provides shared validation and documentation via API schemas (ADR-020).

### Package Structure

```
packages/
  api-definitions/           # Shared - API contract (Data only)
    ├── openapi/
    ├── json-schema/
    ├── zod/
    │   └── conference.schema.ts
    └── types/
        ├── conference.response.ts  # Plain data interface
        └── submission.request.ts

  modules/conference/        # Backend ONLY
    ├── domain/              # Domain entities (conferences, submissions)
    │   ├── conference.ts    # Contains `isCfpOpen()` method
    │   └── value-objects/
    └── application/

  frontend/                 # Frontend ONLY
    ├── components/         # UI components
    ├── queries/            # API calls
    └── types/              # Frontend types from API schema (data only)
```

### Type Independence

**Frontend Types (from API schema):**
```typescript
// packages/frontend/queries/conferences.ts
interface Conference {  // Frontend type - DATA ONLY
  id: string;
  name: string;
  cfp: {
    isOpen: boolean;
    startDate: string;
    endDate: string;
  };
}

export const createConference = async (data: ConferenceCreateInput) => {
  const response = await fetch('/api/conferences', {
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result as Conference;  // Type is plain data
};
```

**Backend Domain Types:**
```typescript
// packages/modules/conference/domain/conference.ts
class Conference {
  constructor(
    public readonly id: ConferenceId,
    public readonly name: ConferenceName,
    public readonly cfp: CfpConfig
  ) {}
  // Domain methods and business logic
  isCfpOpen(): boolean { ... }  // ← NOT visible to frontend
  closeCfp(): void { ... }      // ←Behavior, NOT data
  toPrisma(): Prisma.Input { ... }
}
```

### API Schema as Shared Boundary

```typescript
// packages/api-definitions/
export const ConferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  cfp: z.object({
    isOpen: z.boolean(),
    startDate: z.string(),
    endDate: z.string(),
  }),
});

// Frontend uses for validation
import { ConferenceSchema } from '@sessioflow/api-definitions/zod/conference.schema';
const input = ConferenceSchema.parse(data);

// Backend uses for validation
import { ConferenceSchema } from '@sessioflow/api-definitions/zod/conference.schema';
app.post('/api/conferences', validateRequest(ConferenceSchema), handler);
```

## Consequences

### Positive
- ✅ True decoupling: frontend cannot depend on backend domain structure
- ✅ Microservice-ready: backend can be completely rewritten (Go, Rust, etc.) with same API
- ✅ No circular dependencies: frontend doesn't import backend modules
- ✅ API schema provides type safety and validation for both sides
- ✅ DDD boundaries strictly maintained

### Negative
- 🔧 Need mapping layer: domain entity → API response shape
- 🔄 API changes require updating API schemas (not just domain)
- 📦 Frontend must maintain its own types (but can use API schema for inference)

### Risks
- ⚠️ Developers may accidentally import domain entities into frontend (prevent with lint rules)
- ⚠️ API schema drift between frontend and backend (mitigate with Zod + CI)
- ⚠️ Mapping errors: manual domain → API conversion may introduce bugs

## Pros and Cons of the Options

### Strict Decoupling (API Schemas Only)

**Good, because:**
*   Provides true frontend-backend decoupling; each can evolve independently
*   Supports microservice extraction; API contract stays consistent
*   Frontend types are plain data, no domain dependencies
*   Enables OpenAPI/Swagger documentation and validation
*   Prevents circular dependencies and API anchors

**Bad, because:**
*   Requires mapping layer in backend (domain → API data)
*   API schemas must be kept in sync with actual API responses
*   Slightly more code to maintain mapping functions

### Shared Domain Types

**Good, because:**
*   No mapping layer needed; use same types everywhere
*   Simplifies type definitions

**Bad, because:**
*   Frontend depends on backend domain structure (tight coupling)
*   Violates DDD boundaries; frontend sees internal backend details
*   Breaking backend changes break frontend
*   Prevents backend stack swappability
*   Creates circular dependency risk

### Shared DTOs (Transfer Objects)

**Good, because:**
*   Explicitly defined transfer objects
*   Can be updated independently

**Bad, because:**
*   Still creates dependency between frontend and backend
*   DTOs often become tightly coupled to domain
*   Requires separate API schema lifecycle management

### No Shared Types

**Good, because:**
*   Maximum decoupling; each owns its types completely
*   No shared maintenance burden

**Bad, because:**
*   No type safety; must build custom JSON parsers
*   No validation; API errors appear late
*   No Swagger docs; manual documentation
*   Duplication of type logic

## Links

*   [ADR-020: API Schema Package Pattern](./020-use-api-schema-package-pattern-for-contract-definition.md)
*   [ADR-009-01: Monorepo with Backend/Frontend Separation](./009-01-monorepo-backend-frontend-separation.md)
*   [ADR-015: CQRS Pattern](./015-adopt-cqrs-pattern.md)
*   [ADR-023: Comprehensive Monorepo Structure Update](./023-comprehensive-monorepo-structure-update.md)

---

**Status:** ✅ **PROPOSED** (Approve to establish type decoupling strategy)

**Decision:** Accept strict frontend-backend type decoupling with shared API schemas only. Backend domain logic must remain private; API schemas provide shared validation and documentation.

**Implementation Date:** Upon approval
**Owner:** Technical Team
**Related:** Migration Guide (MIGRATION_TO_NEW_ARCHITECTURE.md)
