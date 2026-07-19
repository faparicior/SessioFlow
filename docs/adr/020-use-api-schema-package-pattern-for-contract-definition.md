# 020-Use API Schema Package Pattern for Contract Definition

* **Status:** Proposed
* **Date:** 2026-07-25
* **Decision Makers:** Fernando (Lead Developer), Technical Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow needs to define a clear contract between frontend and backend for API communication. The current approach lacks explicit separation between **API data shapes** and **business domain logic**, which risks coupling frontend to backend domain models and reduces microservice readiness.

**Current Challenge:**
- Frontend and backend need shared data structures for HTTP requests/responses
- Backend contains rich domain entities with methods and business logic
- Existing ADR-009-01 separates apps but doesn't define API contract strategy
- Should avoid sharing frontend/backend business logic or domain objects

**Decision Drivers:**
* **API Schema Standardization** — Must define how API schemas, OpenAPI docs, and validation schemas are shared
* **Frontend-Backend Decoupling** — API schemas can be shared but domain logic cannot
* **Microservice Readiness** — Each module should produce consistent API contracts
* **Swagger/OAS Documentation** — Must enable automatic documentation generation
* **No Domain Leakage** — API schemas must contain only DATA, not business methods

## Considered Options

1. **API Schema Package Pattern (Recommended)**
2. **Full Type Sharing (Shared Domain Types)**
3. **No Shared Contracts (Separate Type Definitions)**
4. **DTO Wrapper Approach**

## Decision Outcome

**Chosen Option:** "[API Schema Package Pattern]"

**Justification:**
This pattern enables shared validation and documentation while keeping domain logic separate. Unlike full type sharing, it enforces that API schemas are data-only shapes used for JSON validation and Swagger docs. Backend domain entities with business methods remain private. Unlike no shared contracts, it provides consistent API definitions across frontend, backend, and microservices.

### Project Structure

```
packages/
  api-definitions/           # Shared periphery - NOT business logic
    ├── openapi/             # OpenAPI 3.0 YAML files (docs)
    ├── json-schema/         # JSON schemas for validation
    ├── zod/                 # Zod schemas for runtime validation
    │   ├── conference.schema.ts
    │   └── submission.schema.ts
    └── types/               # TypeScript interfaces (data-only)
        ├── conference.response.ts
        └── submission.response.ts
```

### Key Distinctions

| Component | Purpose | Shared? | Contains |
|-----------|---------|---------|----------|
| API Schemas (api-definitions/) | Validation, Docs, Types | ✅ YES | Plain data shapes, no methods |
| Domain Entities (backend modules/) | Business Logic | ❌ NO | Methods, behavior, rich state |

### Mapping Domain to API

```typescript
// Backend: Domain entity (rich with methods)
class Conference {
  constructor(
    public readonly id: ConferenceId,
    public readonly name: ConferenceName,
    public readonly cfp: CfpConfig
  ) {}
  isCfpOpen(): boolean { ... }  // ← Domain method, NOT in API
  closeCfp(): void { ... }      // ← Behavior, NOT in API
}

// Backend: API Gateway
function mapToApiResponse(conference: Conference): ConferenceApiResponse {
  return {
    id: conference.id.value,
    name: conference.name.value,
    cfp: {
      isOpen: conference.isCfpOpen(),  // Call domain method
    },
  };
}

// Frontend: Uses API schema for validation
import { ConferenceSchema } from '@sessioflow/api-definitions/zod/conference.schema';
const validated = ConferenceSchema.parse(input);  // Data only
```

## Consequences

### Positive
- ✅ Validation and documentation are shared (Zod schemas, OpenAPI)
- ✅ Domain business logic stays hidden in backend only
- ✅ Frontend-backend contract is explicit and testable
- ✅ Microservices can produce consistent APIs from same schema
- ✅ Swagger docs stay up-to-date from OpenAPI spec

### Negative
- 🔧 Requires mapping layer (domain → API data) in each backend endpoint
- 📦 API schema changes require thinking about versioning (cannot break frontend)
- 🔄 Additional package (`api-definitions`) must be managed and published

### Risks
- ⚠️ Accidental domain logic leak into API schemas (prevent with lint rules)
- ⚠️ API schema drift between frontend and backend (mitigate with Zod)
- ⚠️ Duplication between Zod schema and TypeScript interface (keep coupled)

## Pros and Cons of the Options

### API Schema Package Pattern

**Good, because:**
*   Creates clear separation between API data and domain business logic
*   Enables shared validation via Zod schemas for both frontend and backend
*   Supports OpenAPI/Swagger documentation from same source
*   Works well with microservice extraction (schema stays consistent)
*   Allows frontend to use API types without depending on backend modules

**Bad, because:**
*   Requires manual mapping from domain entities to API response shapes
*   Changes to domain may require updating both domain and API types
*   Adds one more package to manage in the monorepo structure

### Full Type Sharing

**Good, because:**
*   No mapping needed; uses same types throughout
*   Simpler at first glance

**Bad, because:**
*   Exposes backend domain structure (entities, methods) to frontend
*   Creates tight coupling; frontend depends on backend implementation
*   Violates DDD boundaries and microservice readiness
*   Backend changes break frontend

### No Shared Contracts

**Good, because:**
*   Maximum decoupling; each side owns its types completely

**Bad, because:**
*   No validation; must build custom parsers in each place
*   API documentation is manual or out of sync
*   Won't catch runtime type errors until API call

### DTO Wrapper Approach

**Good, because:**
*   Explicit transfer objects

**Bad, because:**
*   More boilerplate than API schema pattern
*   Still requires separate types for frontend (no reuse)

## Links

*   [ADR-009-01: Monorepo with Backend/Frontend Separation](./009-01-monorepo-backend-frontend-separation.md)
*   [ADR-015: CQRS Pattern](./015-adopt-cqrs-pattern.md)
*   [ADR-007: Use Zod for Validation](./007-use-zod-for-validation.md)
*   [ADR-021: Adopt Domain Module Structure Convention](./021-adopt-domain-module-structure-convention.md)

---

**Status:** ✅ **PROPOSED** (Approve to establish API schema pattern)

**Decision:** Adopt API Schema Package Pattern to provide shared validation schemas and OpenAPI documentation while maintaining strict separation between API data and backend domain logic.

**Implementation Date:** Upon approval
**Owner:** Technical Team
**Related:** Migration Guide (MIGRATION_TO_NEW_ARCHITECTURE.md)
