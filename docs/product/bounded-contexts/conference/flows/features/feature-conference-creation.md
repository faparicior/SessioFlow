# Feature: Conference Creation

* **Parent Flow:** [journey-01-setup-conference.md](../journey-01-setup-conference.md)
* **Context:** Conference Bounded Context
* **Status:** 📋 Planned
* **Priority:** High

---

## 🎯 Overview

**Feature Description:** Enable conference organizers to create a new conference and configure its Call for Papers (CfP) settings in a single action. The conference is created in `DRAFT` state and immediately transitions to `CFP_OPEN` via `Conference.publishCfp()`, allowing speakers to submit proposals.

**User Value:** Organizers can quickly set up a conference with a public CfP submission link that can be shared with potential speakers.

**Flow Steps:** Steps 1-17 of [journey-01-setup-conference.md](../journey-01-setup-conference.md)

---

## 📋 Requirements

### Functional Requirements
- [ ] Create conference with name, description, logo URL, and CfP dates
- [ ] Conference must be created in `DRAFT` state then transition to `CFP_OPEN`
- [ ] Generate URL-safe unique slug from conference name
- [ ] Create `CfpConfig` child entity with submission window dates and settings
- [ ] Validate CfP start date is not in the past
- [ ] Validate CfP end date is after start date
- [ ] Enforce free tier conference limit (max 5 active conferences)
- [ ] Enforce slug uniqueness across all conferences
- [ ] Publish `ConferenceCreated` and `CfpOpened` domain events
- [ ] Send welcome email (best-effort, async)
- [ ] Generate CfP URL: `{baseUrl}/cfp/{slug}`
- [ ] Return 201 Created with conference details and CfP URL

### Non-Functional Requirements
- **Performance:** API response <200ms (P95)
- **Security:** RLS policies prevent cross-organizer access; organizerId from auth token
- **Validation:** Zod schemas at both API and UI layers

---

## 🏗️ Domain Model

### Entities Affected
| Entity | Role | Changes |
|--------|------|---------|
| `Conference` | Aggregate Root | Create via `Conference.create()` factory, transition to `CFP_OPEN` via `publishCfp()` |
| `CfpConfig` | Child Entity (Embedded) | Created as part of conference creation with `ACTIVE` status |

### Value Objects
| Value Object | Purpose | Validation |
|--------------|---------|------------|
| `ConferenceId` | Unique identifier | UUIDv4 generation |
| `ConferenceName` | Conference title | 3-100 characters |
| `ConferenceSlug` | URL-safe identifier | Generated from name, URL-safe |
| `ConferenceStatus` | State enum | `DRAFT` → `CFP_OPEN` |
| `CfpStartDate` | CfP window start | Must be in future |
| `CfpEndDate` | CfP window end | Must be after start date |
| `MaxSubmissions` | Max submission limit (optional) | Positive integer |
| `RequiresApproval` | Require organizer approval | Boolean (default: true) |
| `CfpStatus` | CfP active status | `ACTIVE` |

### Domain Events
| Event | Triggered By | Side Effects |
|-------|--------------|--------------|
| `ConferenceCreated` | `Conference.create()` | Log conference creation, initialize analytics |
| `CfpOpened` | `Conference.publishCfp()` | Send welcome email to organizer, notify subscribers |

---

## 📦 Implementation Scope

### Files to Create/Modify

**Domain Layer:**
- [x] `packages/modules/conference/src/domain/conference.ts` - Conference aggregate root
- [x] `packages/modules/conference/src/domain/cfp-config.ts` - CfpConfig child entity
- [x] `packages/modules/conference/src/domain/value-objects/conference-id.ts`
- [x] `packages/modules/conference/src/domain/value-objects/conference-name.ts`
- [x] `packages/modules/conference/src/domain/value-objects/conference-slug.ts`
- [x] `packages/modules/conference/src/domain/value-objects/conference-status.ts`
- [x] `packages/modules/conference/src/domain/value-objects/cfp-start-date.ts`
- [x] `packages/modules/conference/src/domain/value-objects/cfp-end-date.ts`
- [x] `packages/modules/conference/src/domain/value-objects/max-submissions.ts`
- [x] `packages/modules/conference/src/domain/value-objects/requires-approval.ts`
- [x] `packages/modules/conference/src/domain/value-objects/cfp-status.ts`
- [x] `packages/modules/conference/src/domain/events/conference-created.ts`
- [x] `packages/modules/conference/src/domain/events/cfp-opened.ts`
- [x] `packages/modules/conference/src/domain/exceptions/` (6 error classes)
- [x] `packages/modules/conference/src/domain/conference-repository.interface.ts` - Interface

**Application Layer (CQRS):**
- [x] `packages/modules/conference/src/application/commands/create-conference/create-conference.command.ts`
- [x] `packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts`
- [x] `packages/modules/conference/src/application/queries/get-conference/get-conference.query.ts`
- [x] `packages/modules/conference/src/application/queries/get-conference/get-conference.handler.ts`
- [x] `packages/modules/conference/src/application/dto/conference-response.dto.ts`
- [x] `packages/modules/conference/src/container.ts` - Module Composition Root / Factories

**Infrastructure Layer:**
- [x] `packages/shared/database/src/schema/conferences.ts` - Drizzle ORM Database schema
- [x] `packages/modules/conference/src/infrastructure/database/conference.repository.ts` - Drizzle ORM implementation
- [x] `packages/shared/database/src/client.ts` - Shared database client
- [x] `packages/shared/logging/src/logger.ts` - Shared Pino logger

**Interface & Contract Layer:**
- [x] `apps/frontend/src/app/api/v1/conferences/route.ts` - POST endpoint
- [x] `apps/frontend/src/app/api/v1/conferences/[id]/route.ts` - GET endpoint
- [x] `packages/api-definitions/src/zod/conference.ts` - Zod validation schema
- [x] `packages/api-definitions/src/types/conference.ts` - Data-only API response interface

**Tests:**
- [ ] `tests/unit/conference/value-objects/*.test.ts` (9 test files)
- [ ] `tests/unit/conference/entities/conference.test.ts`
- [ ] `tests/unit/conference/entities/cfp-config.test.ts`
- [ ] `tests/unit/conference/commands/create-conference.test.ts`
- [ ] `tests/unit/conference/queries/get-conference.test.ts`
- [ ] `tests/unit/conference/repository-interface.test.ts`
- [ ] `tests/integration/conference/repository.test.ts`
- [ ] `tests/api/conference/conferences.test.ts`
- [ ] `tests/components/conference/conference-form.test.tsx`
- [ ] `tests/e2e/conference-setup.spec.ts`

---

## 🧪 Hybrid TDD Implementation

### Phase 0: Define E2E Contract (Outside-In)

**Step 1: Write E2E Test**
- [ ] Write E2E test for complete flow: Create conference with CfP
- [ ] Document acceptance criteria from flow documentation
- [ ] **Expected to FAIL initially** - defines the goal

**E2E Test Sketch:**
```typescript
// tests/e2e/conference-setup.spec.ts
describe('Conference Setup E2E', () => {
  it('should create a conference with CfP configuration', async () => {
    // 1. Authenticate user
    // 2. Submit conference creation form (name, dates)
    // 3. Verify 201 Created response with CfP URL
    // 4. Verify ConferenceCreated and CfpOpened events were published
    // 5. Verify CfpConfig is in ACTIVE state
    // 6. Redirect to conference dashboard with CfP link
  });

  it('should reject conference with invalid CfP dates', async () => {
    // Submit with end date before start date
    // Verify 400 Bad Request with validation error
  });

  it('should reject duplicate slug', async () => {
    // Create conference, then try to create another with same name
    // Verify 409 Conflict
  });

  it('should reject free tier limit exceeded', async () => {
    // Create 5 conferences, then try a 6th
    // Verify 403 Forbidden with upgrade prompt
  });
});
```

### Phase 1-3: Build Inside-Out

**Step 2: Write Tests First (Domain Layer)**

**Unit Tests - Value Objects:**
```typescript
// tests/unit/conference/value-objects/conference-name.test.ts
describe('ConferenceName', () => {
  it('creates valid name with 3-100 characters');
  it('rejects names shorter than 3 characters');
  it('rejects names longer than 100 characters');
  it('trims whitespace');
});

// tests/unit/conference/value-objects/cfp-start-date.test.ts
describe('CfpStartDate', () => {
  it('creates valid future date');
  it('rejects past date');
  it('accepts today as start date');
});

// tests/unit/conference/value-objects/cfp-end-date.test.ts
describe('CfpEndDate', () => {
  it('creates valid date after start date');
  it('rejects date equal to or before start date');
});
```

**Unit Tests - Conference Entity:**
```typescript
// tests/unit/conference/entities/conference.test.ts
describe('Conference', () => {
  it('create() produces DRAFT state');
  it('create() generates unique slug from name');
  it('create() creates CfpConfig child entity');
  it('publishCfp() transitions DRAFT → CFP_OPEN');
  it('publishCfp() fails if status is not DRAFT');
  it('publishCfp() publishes ConferenceCreated event');
  it('publishCfp() publishes CfpOpened event');
  it('cancel() transitions DRAFT → DELETED');
});

// tests/unit/conference/entities/cfp-config.test.ts
describe('CfpConfig', () => {
  it('create() sets ACTIVE status');
  it('validateDates() rejects end date before start date');
  it('validateDates() accepts valid date range');
});
```

**Unit Tests - Application Layer:**
```typescript
// tests/unit/conference/commands/create-conference.test.ts
describe('CreateConference Command', () => {
  it('creates conference in happy path');
  it('returns validation error for short name');
  it('returns validation error for invalid CfP dates');
  it('returns conflict error for duplicate slug');
  it('returns forbidden error for free tier limit');
  it('publishes domain events on success');
  it('sends welcome email (best-effort)');
});
```

**Integration Tests:**
```typescript
// tests/integration/conference/repository.test.ts
describe('ConferenceRepository', () => {
  it('save() persists conference and CfpConfig');
  it('findById() retrieves conference with CfpConfig');
  it('findBySlug() retrieves conference');
  it('findByOrganizerId() returns organizer conferences');
});
```

**Step 3: Implement to Pass Tests**
- [ ] Implement all value objects with validation
- [ ] Implement Conference entity with state machine
- [ ] Implement CfpConfig child entity
- [ ] Implement domain events
- [ ] Implement repository interface
- [ ] Implement CQRS handlers (command + query)
- [ ] Implement Drizzle schema and repository
- [ ] Implement API routes

**Step 4: Refactor**
- [ ] Clean up code
- [ ] Maintain test coverage ≥95% for domain
- [ ] Document behavior

### Phase 4: Validate E2E (Outside-In)

**Step 5: Run E2E Test**
- [ ] Run E2E test from Phase 0
- [ ] **Expected to PASS** - goal achieved!
- [ ] Fix any remaining issues

---

## 🔗 Dependencies

### Blocks
- [ ] This feature must be complete before: Conference submission flows (journey-02)
- [ ] This feature must be complete before: Any submission-related features

### Blocked By
- [ ] Shared infrastructure: `shared/infrastructure/database/db-client.ts`
- [ ] Shared infrastructure: `shared/infrastructure/auth/auth-provider.ts`
- [ ] ADR-016 (DI Strategy) - may be needed for Next.js integration
- [ ] ADR-017 (Drizzle ORM) - may be needed for database access
- [ ] Auth0 setup for magic link authentication

---

## ✅ Acceptance Criteria

**Given** the organizer is authenticated
**When** they submit a valid conference creation form with name, dates, and optional description
**Then** the system creates a `Conference` in `DRAFT` state
**And** transitions to `CFP_OPEN` via `publishCfp()`
**And** creates a `CfpConfig` child entity in `ACTIVE` state
**And** publishes `ConferenceCreated` and `CfpOpened` domain events
**And** returns 201 Created with CfP URL

### Test Scenarios
1. **Happy Path:** Valid conference creation → 201 Created + CfP URL + domain events
2. **Validation Error:** Invalid CfP dates → 400 Bad Request with field-level errors
3. **Conflict:** Duplicate slug → 409 Conflict with suggested alternative
4. **Business Rule:** Free tier limit exceeded → 403 Forbidden with upgrade prompt
5. **Authorization:** Unauthenticated user → 401 Unauthorized
6. **Minimal Setup:** Only required fields → conference created with defaults
7. **Slug Generation:** Special characters in name → URL-safe slug generated
8. **Past Date:** CfP start date in the past → 400 Bad Request
9. **Edge Case:** CfP window >180 days → Warning but allowed with confirmation
10. **Email Failure:** Welcome email service fails → conference still created (best-effort)

---

## 📝 Implementation Notes

### Domain Design Decisions
- **Conference is the aggregate root**: It manages the consistency boundary for CfpConfig
- **CfpConfig is embedded (not separate entity)**: It has no identity outside the Conference aggregate
- **State transitions are domain methods**: `publishCfp()`, `closeCfp()`, etc. - not setters
- **Domain events are published by the entity**: The aggregate root publishes events on state changes
- **Validation is at the value object level**: Each VO validates its own invariants

### CQRS Design Decisions
- **`CreateConference` command**: Creates conference, publishes CfP, handles all side effects
- **`GetConference` query**: Returns conference by ID (read-only)
- **Response DTOs are separate from entities**: Optimized for API consumption
- **Commands return `Result` type**: `Result.ok(data)` or `Result.fail(error)`

### Infrastructure Design Decisions
- **Repository interface in domain**: No external dependencies in domain layer
- **Supabase implementation in infrastructure**: Uses Drizzle ORM for type-safe queries
- **Slug uniqueness checked at application layer**: Uses repository `findBySlug()` before domain creation
- **Free tier limit checked at application layer**: Uses repository `findByOrganizerId()` with status filter
- **Email is best-effort**: Never fails the command if email service is down

### API Design Decisions
- **RESTful endpoints**: `POST /api/v1/conferences` for creation, `GET /api/v1/conferences/:id` for retrieval
- **Response includes CfP URL**: `{baseUrl}/cfp/{slug}` in response body
- **Status codes**: 201 Created, 400 Bad Request, 403 Forbidden, 409 Conflict, 401 Unauthorized
- **Error format**: Standardized `{ error: { message, details? } }` response

---

## 🔗 Related Documentation

- [Parent Flow Documentation](../journey-01-setup-conference.md)
- [Development Plan](../journey-01-setup-conference-plan.md)
- [Conference Entity Documentation](../entities/conference.md)
- [CfpConfig Entity Documentation](../entities/cfp-config.md)
- [Business Rules](../business-rules/)
- [Invariants](../invariants/)
- [Architecture Decision Records](../../../adr/)

---

## 📊 Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: E2E Contract | 📋 Planned | Write failing E2E test first |
| Phase 1: Core Domain | 📋 Planned | Value objects, entities, domain services |
| Phase 2: Domain Interfaces | 📋 Planned | Repository interface, exceptions, events |
| Phase 3: Infrastructure & Application | 📋 Planned | CQRS handlers, database layer, Drizzle schema |
| Phase 4: RESTful API | 📋 Planned | API routes with CQRS integration |
| Phase 5: User Interface | 📋 Planned | Conference creation form (next phase) |
| Phase 6: E2E Validation | 📋 Planned | Run E2E - should PASS |

---

*This feature specification is part of the [Journey 01: Setup Conference](../journey-01-setup-conference-plan.md) development plan and follows Hybrid TDD (Outside-In + Inside-Out).*
*Last updated: 2026-07-04*