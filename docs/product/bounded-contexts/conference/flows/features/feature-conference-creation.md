# Conference Creation - Feature Specification

* **Parent Flow:** `journey-01-setup-conference.md`
* **Context:** Conference Bounded Context
* **Status:** 📋 Planned
* **Priority:** High

---

## 🎯 Overview

**Feature Description:** Allows organizers to create a new conference with basic details including name, description, logo, and automatically generates a unique slug.

**User Value:** Enables organizers to quickly set up a conference and get started with CfP management.

**Flow Step:** Steps 1-10 in Journey 01 (from form fill to conference creation in DRAFT state)

---

## 📋 Requirements

### Functional Requirements
- [ ] Organizer can enter conference name (3-100 characters)
- [ ] Organizer can enter optional description (max 1000 characters)
- [ ] Organizer can enter optional logo URL (valid URL format)
- [ ] System generates unique URL-safe slug from conference name
- [ ] System validates conference name meets requirements (BR-002)
- [ ] System checks slug uniqueness (BR-003)
- [ ] System validates organizer subscription tier (BR-004)
- [ ] Conference created in DRAFT state initially
- [ ] System publishes `ConferenceCreated` domain event

### Non-Functional Requirements
- [ ] Performance: API response <200ms (P95)
- [ ] Security: RLS policy ensures organizer can only create for their account
- [ ] Validation: All inputs validated with Zod schema
- [ ] Error Handling: Clear error messages for validation failures

---

## 🏗️ Domain Model

### Entities Affected
| Entity | Role | Changes |
|--------|------|---------|
| `Conference` | Primary | Create new aggregate in DRAFT state |
| `CfpConfig` | Child | Create with initial configuration |

### Value Objects
- `ConferenceId` - UUIDv4 unique identifier
- `ConferenceName` - Validated conference title (3-100 chars)
- `ConferenceSlug` - URL-safe generated identifier
- `ConferenceStatus` - Initial state: DRAFT
- `Description` - Optional conference description
- `LogoUrl` - Optional logo URL (validated)

### Domain Events (if any)
- `ConferenceCreated` - Triggered when conference is successfully created

---

## 📦 Implementation Scope

### Files to Create/Modify

**Domain Layer:**
- [ ] `modules/conference/domain/entities/conference.ts`
- [ ] `modules/conference/domain/value-objects/conference-id.ts`
- [ ] `modules/conference/domain/value-objects/conference-name.ts`
- [ ] `modules/conference/domain/value-objects/conference-slug.ts`
- [ ] `modules/conference/domain/value-objects/conference-status.ts`
- [ ] `modules/conference/domain/value-objects/description.ts`
- [ ] `modules/conference/domain/value-objects/logo-url.ts`
- [ ] `modules/conference/domain/events/conference-created.ts`
- [ ] `modules/conference/domain/exceptions/invalid-conference-error.ts`
- [ ] `modules/conference/domain/exceptions/slug-already-exists-error.ts`

**Application Layer:**
- [ ] `modules/conference/application/commands/create-conference/create-conference.command.ts`
- [ ] `modules/conference/application/commands/create-conference/create-conference.handler.ts`
- [ ] `modules/conference/application/commands/create-conference/create-conference.dto.ts`
- [ ] `modules/conference/application/dto/conference-dto.ts`

**Infrastructure Layer:**
- [ ] `modules/conference/infrastructure/database/conference-repository.ts`
- [ ] Database migration for `conferences` table
- [ ] Database migration for `cfp_configs` table
- [ ] RLS policies for conferences table

**Interface Layer:**
- [ ] `modules/conference/interfaces/api/v1/conferences/conferences.controller.ts`
- [ ] Zod validation schema for conference creation

---

## 🧪 Hybrid TDD Implementation

### Phase 0: Define E2E Contract (Outside-In)

**Step 1: Write E2E Test**
- [ ] Write E2E test for conference creation flow
- [ ] Document acceptance criteria from journey-01
- [ ] **Expected to FAIL initially** - defines the goal

### Phase 1-3: Build Inside-Out

**Step 2: Write Tests First**

**Unit Tests:**
- [ ] Test `ConferenceName` creates valid names (3-100 chars)
- [ ] Test `ConferenceName` rejects invalid names (<3 or >100 chars)
- [ ] Test `ConferenceSlug` generates URL-safe slugs
- [ ] Test `Conference.create()` produces DRAFT state
- [ ] Test `Conference` publishes `ConferenceCreated` event
- [ ] Test edge cases (special characters, max length)

**Integration Tests:**
- [ ] Test `CreateConference` command with mocked repository
- [ ] Test slug uniqueness validation
- [ ] Test free tier limit validation
- [ ] Test repository `save()` persists correctly

**Step 3: Implement to Pass Tests**
- [ ] Implement value objects (ConferenceId, Name, Slug, Status)
- [ ] Implement Conference entity with create() method
- [ ] Implement CreateConference command and handler
- [ ] Implement ConferenceRepository
- [ ] Make all tests pass

**Step 4: Refactor**
- [ ] Clean up code
- [ ] Maintain test coverage ≥95% for domain
- [ ] Document behaviors

### Phase 4: Validate E2E (Outside-In)

**Step 5: Run E2E Test**
- [ ] Run E2E test from Phase 0
- [ ] **Expected to PASS** - goal achieved!
- [ ] Fix any remaining issues

---

## 🔗 Dependencies

### Blocks
- [ ] This feature must be complete before: CfP Configuration feature
- [ ] This feature must be complete before: Journey 01 E2E validation

### Blocked By
- [ ] This feature requires: Database schema and migrations
- [ ] This feature requires: Auth0 authentication setup

---

## ✅ Acceptance Criteria

**Given** the organizer is authenticated on the dashboard
**When** they enter conference name, description, and logo URL
**Then** the system creates a Conference in DRAFT state
**And** publishes ConferenceCreated domain event
**And** returns the conference with generated slug

### Test Scenarios
1. **Happy Path:** Valid conference name creates conference successfully
2. **Name Too Short:** Name <3 characters shows validation error
3. **Name Too Long:** Name >100 characters shows validation error
4. **Duplicate Slug:** Existing slug shows conflict error with suggestion
5. **Free Tier Limit:** Exceeding 5 conferences shows upgrade prompt
6. **Invalid Logo URL:** Malformed URL shows validation error

---

## 📝 Implementation Notes

- **Slug Generation:** Convert to lowercase, replace spaces with hyphens, remove special characters
- **Slug Uniqueness:** Check database before creation, append numeric suffix if duplicate
- **Free Tier Limit:** Check organizer's active conference count before creation
- **Transaction:** Create conference and CfpConfig in same transaction
- **Domain Events:** Use event publisher interface (not direct email calls)

---

## 🔗 Related Documentation

- [Parent Flow Documentation](./journey-01-setup-conference.md)
- [Development Plan](./journey-01-setup-conference-plan.md)
- [Conference Entity Documentation](../entities/conference.md)
- [ConferenceId Value Object](../value-objects/conference-id.md)
- [ConferenceName Value Object](../value-objects/conference-name.md)
- [ConferenceSlug Value Object](../value-objects/conference-slug.md)
- [ADR-009: DDD Structure](../../../adr/009-adopt-domain-driven-design-structure.md)
- [ADR-007: Zod Validation](../../../adr/007-use-zod-for-validation.md)

---

## 📊 Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| E2E Contract | 📋 | Write failing E2E test (Phase 0) |
| Tests Written | 📋 | Write unit/integration tests |
| Implementation | 📋 | Implement to pass tests |
| Refactoring | 📋 | Clean up while tests pass |
| E2E Validation | 📋 | Run E2E - should PASS |

---

*This feature spec is part of the Journey 01 development plan and follows Hybrid TDD (Outside-In + Inside-Out).*