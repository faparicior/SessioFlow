# Feature: Domain Services (Business Rules)

* **Parent Flow:** `journey-01-setup-conference.md`
* **Context:** Conference (Bounded Context)
* **Status:** 📋 Planned
* **Priority:** High
* **Plan Phase:** 1 — Core Domain

---

## 🎯 Overview

**Feature Description:** Implement domain-level business rule checks that the application layer delegates to. These services enforce cross-entity invariants and external constraints (like subscription tiers) without coupling the domain to infrastructure.

**User Value:** Ensures business rules are enforced at the domain level — the conference limit, slug uniqueness checks, and date validation all live where they belong: close to the data they govern.

**Flow Steps:** Steps 8, 10 of the journey (slug uniqueness check, free tier limit check).

---

## 📋 Requirements

### Functional Requirements
- [ ] `checkFreeTierLimit(organizerId, existingCount)` returns whether the organizer can create another conference
- [ ] `FreeTierLimitExceededError` is thrown when organizer exceeds 5 active conferences
- [ ] `slugExists(slug, repository)` delegates uniqueness check to the repository interface
- [ ] `SlugAlreadyExistsError` is thrown when a slug is already taken
- [ ] All services are pure — no side effects, no direct infrastructure calls
- [ ] Services accept repository interfaces (not implementations)

### Non-Functional Requirements
- [ ] Domain services have zero external dependencies
- [ ] Services accept abstractions (repository interfaces) for testability
- [ ] Free tier limit is configurable (not hardcoded magic number)

---

## 🏗️ Domain Model

### Services

**`ConferenceDomainService`**

Provides business rule validation methods that the domain layer can call without depending on infrastructure.

| Method | Purpose | Input | Output |
|--------|---------|-------|--------|
| `checkFreeTierLimit(organizerId, maxLimit, existingCount)` | Verify organizer hasn't exceeded conference limit | Organizer ID, max limit, current count | `boolean` (true = can create) |
| `isSlugAvailable(slug, repository)` | Delegate slug uniqueness to repository | Slug, repository interface | `boolean` (true = available) |

**`BusinessRuleResult`**

Utility type for returning validation results with context.

```typescript
type BusinessRuleResult = 
  | { success: true }
  | { success: false; error: DomainError };
```

---

## 📦 Implementation Scope

### Files to Create

**Services:**
- [ ] `src/domain/conference/services/conference-domain-service.ts`

**Exceptions (already in Phase 2 list, created here for completeness):**
- [ ] `src/domain/conference/exceptions/free-tier-limit-exceeded-error.ts`
- [ ] `src/domain/conference/exceptions/slug-already-exists-error.ts`

### File Dependencies
- Depends on repository interface: `ConferenceRepository` (from Phase 2)
- Depends on exceptions: `FreeTierLimitExceededError`, `SlugAlreadyExistsError` (from Phase 2)

---

## 🧪 Testing Strategy

### Unit Tests

**checkFreeTierLimit:**
- [ ] Returns true when count (3) is below limit (5)
- [ ] Returns false when count equals limit (5 of 5)
- [ ] Returns false when count exceeds limit (6 of 5)
- [ ] Custom limit works (e.g., limit=10, count=8)
- [ ] Returns true when count is 0

**isSlugAvailable (with mock repository):**
- [ ] Returns true when repository.findByName returns null
- [ ] Returns false when repository.findByName returns existing conference
- [ ] Calls repository.findBySlug with correct slug argument
- [ ] Does not modify repository (pure delegation)

### Test Coverage Target
- 100% (services are pure functions with minimal logic)

---

## 🔗 Dependencies

### Blocks
- [ ] Phase 3 — Use cases (CreateConference calls domain services)
- [ ] Phase 4 — API endpoints (error responses depend on domain exceptions)

### Blocked By
- [ ] `feature-conference-core.md` — ConferenceId (for organizing queries)
- [ ] Phase 2 — `ConferenceRepository` interface (dependency injection)

---

## ✅ Acceptance Criteria

**Given** an organizer with 3 active conferences and a free tier limit of 5
**When** I call `checkFreeTierLimit(organizerId, 5, 3)`
**Then** it returns `true` (can create another)

**Given** an organizer with 5 active conferences and a free tier limit of 5
**When** I call `checkFreeTierLimit(organizerId, 5, 5)`
**Then** it returns `false` (limit exceeded)

**Given** a slug that does not exist in the database
**When** I call `isSlugAvailable("my-conf", mockRepo)`
**Then** it returns `true`

**Given** a slug that already exists in the database
**When** I call `isSlugAvailable("taken-slug", mockRepo)`
**Then** it returns `false`

---

## 📝 Implementation Notes

- Free tier limit of 5 is defined in BR-004 but kept configurable in code to support different subscription tiers
- Services are stateless — they don't hold any internal state
- Repository is injected via dependency inversion (services accept the interface, not the implementation)
- `isSlugAvailable` is a thin delegation — it exists so the application layer doesn't need to know about repository method names
- Consider extracting a `BusinessRuleResult` generic type for consistency across services

---

## 🔗 Related Documentation

- [Parent Flow](../journey-01-setup-conference.md)
- [BR-003](../../business-rules/BR-003-slug-uniqueness.md) — Conference Slug Must Be Unique
- [BR-004](../../business-rules/BR-004-free-tier-conference-limit.md) — Free Tier Conference Creation Limit
- [INV-003](../../invariants/INV-003-slug-uniqueness.md) — Slug Uniqueness Across All Conferences
- [ADR-009](../../../../adr/009-adopt-domain-driven-design-structure.md) — DDD Structure

---

## 📊 Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| Service: ConferenceDomainService | 📋 | Business rule validation |
| Exceptions: 2 new errors | 📋 | Free tier + slug errors |
| Tests — Unit | 📋 | ~7 test cases |

---

*This feature spec is part of the [Journey 01: Setup Conference](../journey-01-setup-conference-plan.md) development plan.*