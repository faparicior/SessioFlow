# 021-Adopt Domain Module Structure Convention

* **Status:** Proposed
* **Date:** 2026-07-25
* **Decision Makers:** Fernando (Lead Developer), Technical Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow's DDD module structure needs a clear convention for organizing domain objects. The current structure places all domain files in root or scattered subfolders, which leads to inconsistency and makes it harder to navigate. A consistent convention will establish which files belong directly in `domain/` vs. subfolders, supporting both human navigation and future tooling.

**Current State:**
- Entities, repositories, and various objects are mixed in domain folder
- No clear pattern for when to use subfolders vs. root level
- Different modules use different conventions
- Makes it hard to see core domain vs. supporting objects

**Decision Drivers:**
* **Clear Domain Structure** — Must establish explicit convention for domain file organization
* **Core Object Visibility** — Entities and repository interfaces should be easily locatable
* **Grouping Related Objects** — Value objects, exceptions, and events should be grouped logically
* **Microservice Readiness** — Each extracted module must follow same structure
* **Code Navigation** — Developers should quickly understand domain without deep reading

## Considered Options

1. **Entities/Interfaces at Root + Grouped Support Objects (Recommended)**
2. **All in Subfolders (`entities/`, `value-objects/`, etc.)**
3. **Flat Structure (All in Root)**
4. **Domain-Driven Structure (Nested Bounded Contexts)**

## Decision Outcome

**Chosen Option:** "[Entities/Interfaces at Root + Grouped Support Objects]"

**Justification:**
This convention provides maximum visibility for core domain concepts (entities, repository interfaces) while grouping supporting objects logically. It differs from the "all in subfolders" approach by recognizing that entities and interfaces are the heart of the domain and should be immediately visible. It also differs from flat structure by grouping related objects, improving maintainability.

### Module Structure

```
packages/modules/conference/
  ├── domain/
  │   ├── conference.ts                  ← ENTITY (root)
  │   ├── submission.ts                  ← ENTITY (root)
  │   ├── conference-repository.interface.ts  ← INTERFACE (root)
  │   ├── submission-repository.interface.ts  ← INTERFACE (root)
  │   │
  │   ├── value-objects/                 ← Grouped support objects
  │   │   ├── conference-id.ts
  │   │   ├── conference-name.ts
  │   │   ├── cfp-dates.ts
  │   │   └── conference-status.ts
  │   │
  │   ├── exceptions/                    ← Grouped domain exceptions
  │   │   ├── conference-name-too-short-error.ts
  │   │   ├── cfp-dates-invalid-error.ts
  │   │   └── state-transition-error.ts
  │   │
  │   └── events/                        ← Grouped domain events
  │       ├── conference-created.ts
  │       └── cfp-opened.ts
  │
  ├── application/
  │   ├── commands/
  │   └── queries/
  │
  └── infrastructure/
      ├── database/
      └── adapters/
```

### Folder Organization Rationale

| Location | Contents | Why Here? |
|----------|----------|-----------|
| `domain/` (root) | `*.ts` files only: **Entities + Repository Interface files** | Core domain concepts; frequently accessed; defines module contract |
| `domain/value-objects/` | Value objects: IDs, dates, names, statuses | Supporting layer; grouped by type; less frequently accessed |
| `domain/exceptions/` | Domain error classes | Supporting layer; grouped by category; rare during routine coding |
| `domain/events/` | Domain event classes | Supporting layer; grouped; event-driven code |

### Module Examples

**Conference Module:**
```
domain/conference.ts           # Main entity
domain/submission.ts           # Secondary entity (if exists)
domain/conference-repository.interface.ts  # Contract
```

**Submission Module:**
```
domain/submission.ts           # Main entity
domain/submission-repository.interface.ts  # Contract
```

### Use Case: New Domain Module

When adding a new module (e.g., `review/`):

```
packages/modules/review/domain/
  ├── review.ts              # Entity
  ├── review-repository.interface.ts  # Interface
  ├── value-objects/
  │   ├── rating.ts
  │   └── review-text.ts
  ├── exceptions/
  │   ├── invalid-review-error.ts
  │   └── review-approvers-limit-error.ts
  └── events/
      ├── review-created.ts
      └── review-flagged.ts
```

## Consequences

### Positive
- ✅ Core entities and repository interfaces are immediately visible
- ✅ Grouped support objects reduce folder clutter while maintaining context
- ✅ Consistent across all modules (conference, submission, review, etc.)
- ✅ Enables easy module extraction to microservices (same structure)
- ✅ Reduces navigation time for developers reading domain code

### Negative
- 🔧 Requires discipline to follow convention consistently
- 📝 Need documentation for new developers to understand structure
- 🔄 Slight cognitive overhead: need to remember what goes where

### Risks
- ⚠️ Module will copy structure without understanding rationale (mitigate with docs)
- ⚠️ Grouping may become too nested (keep subfolders shallow, e.g., `value-objects/` only)
- ⚠️ Developers may put entities in subfolders anyway (enforce with lint rules)

## Pros and Cons of the Options

### Entities/Interfaces at Root + Grouped Support Objects

**Good, because:**
*   Core domain concepts are immediately visible at root level
*   Follows intuitive hierarchy: important things at root, supporting things grouped
*   Works well for both small and medium-sized modules
*   Enables easy module extraction; structure is microservice-ready
*   Reduces root folder clutter while maintaining organization

**Bad, because:**
*   Requires developers to remember what goes in root vs. subfolder
*   May need more frequent updates to migration guidelines when module grows

### All in Subfolders

**Good, because:**
*   Extremely consistent; every file has folder context
*   Easy to search with `find`

**Bad, because:**
*   Entities buried in subfolders; less visible
*   More click navigation to find `Conference.ts`
*   Creates deeper folder hierarchy

### Flat Structure (All in Root)

**Good, because:**
*   All files in one place
*   No folders to manage

**Bad, because:**
*   Hard to maintain as module grows
*   Root becomes cluttered with 20+ files
*   Scrambles entities, value objects, exceptions together

### Domain-Driven Structure

**Good, because:**
*   Mimics real-world object organization

**Bad, because:**
*   Overly complex for code organization
*   Doesn't map well to file system
*   Creates unnecessary nesting in domain layer

## Links

*   [ADR-009: Domain-Driven Design Structure](./009-adopt-domain-driven-design-structure.md)
*   [ADR-020: API Schema Package Pattern](./020-use-api-schema-package-pattern-for-contract-definition.md)
*   [ADR-023: Comprehensive Monorepo Structure Update](./023-superseat-009-01-comprehensive-monorepo-structure-update.md)

---

**Status:** ✅ **PROPOSED** (Approve to establish domain structure convention)

**Decision:** Adopt entities and repository interfaces at `domain/` root level, with value objects, exceptions, and events in grouped subfolders, to maximize visibility and consistency across all DDD modules.

**Implementation Date:** Upon approval
**Owner:** Technical Team
**Related:** Migration Guide (MIGRATION_TO_NEW_ARCHITECTURE.md)
