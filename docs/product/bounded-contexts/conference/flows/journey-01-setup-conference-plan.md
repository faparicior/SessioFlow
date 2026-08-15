# Journey 01: Setup Conference - Development Plan

* **Date:** 2026-07-04
* **Status:** 📋 **Planning Phase**
* **Flow:** `journey-01-setup-conference.md`
* **Context:** Conference Bounded Context

---

## 🎯 Overview

This document outlines the development plan for implementing **Journey 01: Setup Conference (C4P Configuration)**.

**Flow Description:** As a conference organizer, the user creates a new conference and configures its Call for Papers (CfP) settings to start collecting proposal submissions. This is the foundational MVP flow that enables speakers to submit talks.

**Related Flow Documentation:** See [journey-01-setup-conference.md](./journey-01-setup-conference.md) for complete user journey details.

**Associated Features:**
| Feature | Description | Status |
|---------|-------------|--------|
| [Feature: Conference Creation](./features/feature-conference-creation.md) | Create a new conference with CfP configuration | 📋 Planned |

---

## 📋 ADR Discovery & Prerequisites

### ADR Index Review
- [x] Read ADR README index to identify relevant decisions
- [x] Review Core Technology Stack ADRs
- [x] Review Architecture Decisions (DDD, CQRS, etc.)
- [x] Review Authentication & Storage strategies
- [x] Review Data Access patterns

### Relevant ADRs for This Flow

| ADR # | Decision | Status | Impact on This Flow |
|-------|----------|--------|---------------------|
| 001 | Use Next.js as Frontend Framework | ✅ Approved | Frontend UI uses Next.js App Router, React, server components |
| 002 | Use Supabase for Backend and Database | ✅ Superseded | Use Supabase PostgreSQL with DDD abstraction layer |
| 002-01 | Amendment: DDD Abstraction Layer | ✅ Approved | All Supabase interactions go through repository interfaces in domain layer |
| 002-03 | Authentication Strategy with DDD | ✅ Accepted | Conference creation requires authenticated organizer via DDD auth abstraction |
| 004 | Implement Magic Link Authentication | ⚠️ Superseded | Use Auth0 with DDD abstraction per latest amendment |
| 006 | Use RESTful API Design | ✅ Approved | API uses RESTful endpoints (`POST /api/v1/conferences`) |
| 007 | Use Zod for Validation | ✅ Approved | All input validation uses Zod schemas at API and UI layers |
| 007-01 | Amendment: Validation & Domain Purity | ✅ Approved | Decouples Zod from domain value objects; validates natively in domain, Zod at boundaries |
| 008 | Implement Comprehensive Testing Strategy | ✅ Approved | Hybrid TDD approach: E2E → domain → application → infrastructure → API → E2E |
| 009 | Adopt Domain-Driven Design Structure | ✅ Approved | Full DDD structure: domain → application → infrastructure → interfaces |
| 010 | Use Tailwind CSS for Styling | ✅ Approved | UI styling uses Tailwind CSS |
| 014 | Use shadcn-ui for Components | ✅ Approved | UI components use shadcn-ui primitives |
| 015 | Adopt CQRS Pattern | ✅ Approved | Application layer uses CQRS: `CreateConference` command, `GetConference` query |
| 016 | Dependency Injection Strategy | ⚠️ Proposed | DI container for Next.js (may need ADR approval before implementation) |
| 017 | Use Drizzle ORM | ⚠️ Proposed | Drizzle ORM for database access with DDD transaction support at application layer |
| 011 | Use Resend for Email | ⚠️ Superseded | Use optional Resend email abstraction (welcome email on creation) |
| 011-01 | Amendment: Optional Email Abstraction | ✅ Approved | Email is optional, best-effort (welcome email on success) |

---

## 🎯 Hybrid TDD Strategy

This plan follows a **hybrid TDD approach** combining outside-in and inside-out strategies:

### Phase 0: Define E2E Contract (Outside-In)
- Write E2E test that describes the complete user journey
- Document acceptance criteria from flow documentation
- **This test FAILS initially** - it defines the goal

### Phase 1-5: Build Inside-Out
- Implement domain → application → infrastructure → interfaces
- Each layer has its own tests
- E2E test still FAILS until all layers are complete

### Phase 6: Validate E2E (Outside-In)
- Run the E2E test from Phase 0
- Fix any remaining issues
- **E2E test PASSES** - goal achieved!

**Benefits:**
- ✅ E2E vision from the start
- ✅ Solid domain model (inside-out)
- ✅ Working feature at the end (outside-in validation)
- ✅ Clear progress tracking (E2E as the "North Star")

---

## 🏗️ Module-Based DDD Structure with CQRS - Conference

### Project Layout (Modular Architecture with CQRS)

```
packages/
├── modules/
│   └── conference/                    # @sessioflow/conference
│       └── src/
│           ├── domain/
│           │   ├── conference.ts              # Conference aggregate root
│           │   ├── conference-repository.interface.ts # Interface (root level)
│           │   ├── value-objects/
│           │   │   ├── conference-id.ts
│           │   │   ├── conference-name.ts
│           │   │   ├── conference-slug.ts
│           │   │   ├── conference-status.ts
│           │   │   ├── cfp-config.ts          # Composite Value Object
│           │   │   ├── cfp-start-date.ts
│           │   │   ├── cfp-end-date.ts
│           │   │   ├── cfp-status.ts
│           │   │   ├── max-submissions.ts
│           │   │   └── requires-approval.ts
│           │   ├── events/
│           │   │   ├── conference-created.ts
│           │   │   ├── cfp-opened.ts
│           │   │   ├── cfp-closed.ts
│           │   │   ├── review-started.ts
│           │   │   ├── selection-completed.ts
│           │   │   ├── schedule-published.ts
│           │   │   ├── conference-completed.ts
│           │   │   └── conference-cancelled.ts
│           │   └── exceptions/
│           │       ├── conference-name-too-short-error.ts
│           │       ├── conference-name-too-long-error.ts
│           │       ├── invalid-cfp-config-error.ts
│           │       ├── duplicate-slug-error.ts
│           │       ├── conference-free-tier-limit-error.ts
│           │       └── state-transition-error.ts
│           ├── application/
│           │   ├── commands/
│           │   │   └── create-conference/
│           │   │       ├── create-conference.command.ts
│           │   │       └── create-conference.handler.ts
│           │   ├── queries/
│           │   │   └── get-conference/
│           │   │       └── get-conference.handler.ts
│           │   └── dto/
│           │       └── conference-response.dto.ts
│           ├── infrastructure/
│           │   └── database/
│           │       └── conference.repository.ts   # Drizzle ORM implementation
│           └── container.ts                   # Composition Root / Factories
├── api-definitions/                   # @sessioflow/api-definitions
│   └── src/
│       ├── zod/
│       │   └── conference.ts                 # Validation schemas
│       └── types/
│           └── conference.ts                 # Data-only API response interfaces
└── shared/
    ├── database/                      # @sessioflow/shared-database
    └── logging/                       # @sessioflow/shared-logging

apps/
└── frontend/                          # Next.js web application
    └── src/
        └── app/
            └── api/v1/conferences/
                ├── route.ts                  # POST /api/v1/conferences
                └── [id]/route.ts             # GET /api/v1/conferences/:id
```

**CQRS Principles:**
- **Commands are verbs**: `CreateConference`, `UpdateConference`, `DeleteConference`
- **Queries are nouns**: `GetConference`, `ListConferences`, `SearchSubmissions`
- **Commands change state**: They have side effects and return success/failure
- **Queries read state**: They have no side effects and return data
- **Response DTOs**: Separate from domain entities, optimized for API needs
- **Handlers are single-responsibility**: One command/query per handler

---

## 🗺️ Entity Lifecycle Reference

**Source:** See [journey-01-setup-conference.md](./journey-01-setup-conference.md) for complete state machine diagrams.

**Key States for This Flow:**
| State | Description | Phase Created |
|-------|-------------|---------------|
| `DRAFT` | Conference created with basic details, CfP not yet live | Phase 1 (Domain) |
| `CFP_OPEN` | CfP is live and accepting submissions | Phase 1 (Domain - via `publishCfp()`) |

**Key Transitions:**
| Transition | Method | Flow Steps |
|------------|--------|------------|
| `DRAFT` → `CFP_OPEN` | `Conference.publishCfp()` | Steps 10-12 (Walkthrough) |
| `Conference.create()` | Creates in `DRAFT` with `CfpConfig` | Steps 9-10 (Walkthrough) |

---

## 📦 Implementation Phases

### Phase 0: Define E2E Contract (Outside-In)

**Goal:** Define the complete user journey as a failing E2E test.

#### Tasks

**Step 1: Write E2E Test**
- [x] Write E2E test for complete flow: Create conference with CfP configuration
- [x] Document acceptance criteria from flow documentation
- [x] Identify key journey steps from [journey-01-setup-conference.md](./journey-01-setup-conference.md)
- [x] Define success criteria (what makes E2E pass)

**Step 2: Run E2E (Expected to Fail)**
- [x] Run E2E test → Should FAIL (no implementation yet)
- [x] Document what's missing
- [x] Use this as the "North Star" for the project

#### Deliverables
- [x] `tests/e2e/conference-setup.spec.ts` - E2E test that defines the goal
- [x] E2E test documentation (acceptance criteria)
- [x] Initial failure report (what's missing)

---

### Phase 1: Core Domain (Inside-Out)

**Goal:** Implement domain model with entities, value objects, and domain services using TDD.

#### Tasks

**Step 1: Write Tests First**

1. **Value Object Tests**
   - [x] Test `ConferenceId.create()` generates valid UUIDv4
   - [x] Test `ConferenceName.create()` validates min/max length (3-100 chars)
   - [x] Test `ConferenceSlug.create()` generates URL-safe slug from name
   - [x] Test `ConferenceStatus` enum values and valid states
   - [x] Test `CfpStartDate.create()` rejects past dates
   - [x] Test `CfpEndDate.create()` validates after start date
   - [x] Test `MaxSubmissions.create()` validates positive integer or unlimited
   - [x] Test `CfpStatus` enum (ACTIVE, CLOSED, ARCHIVED)

2. **Entity Tests**
   - [x] Test `Conference.create()` produces correct initial `DRAFT` state
   - [x] Test `Conference.publishCfp()` transitions `DRAFT` → `CFP_OPEN`
   - [x] Test `Conference.publishCfp()` creates `CfpConfig` child entity
   - [x] Test `Conference.publishCfp()` fails if status is not `DRAFT`
   - [x] Test `Conference.publishCfp()` publishes domain events
   - [x] Test `CfpConfig.validateDates()` rejects end date before start date
   - [x] Test `CfpConfig.create()` sets `ACTIVE` status

3. **Domain Service Tests**
   - [~] Test `ConferenceValidationService.validateFreeTierLimit()` (Omitted per ADR-007-01: domain purity dictates native value object validation and API boundary checks)
   - [~] Test `ConferenceValidationService.validateSlugUniqueness()` (Omitted per ADR-007-01: slug uniqueness validated natively/by repository)

**Step 2: Implement to Pass Tests**
1. **Value Objects**
   - [x] Implement `ConferenceId` (UUIDv4)
   - [x] Implement `ConferenceName` (3-100 char validation)
   - [x] Implement `ConferenceSlug` (URL-safe generator)
   - [x] Implement `ConferenceStatus` (enum)
   - [x] Implement `CfpStartDate` (future date validation)
   - [x] Implement `CfpEndDate` (after start date validation)
   - [x] Implement `MaxSubmissions` (positive integer, optional)
   - [x] Implement `CfpStatus` (enum)
   - [x] Implement `RequiresApproval` (boolean default true)

2. **Entities**
   - [x] Implement `Conference` aggregate root with state machine
   - [x] Implement `Conference.create()` factory method
   - [x] Implement `Conference.publishCfp()` domain method
   - [x] Implement `Conference.closeCfp()` domain method (for future flows)
   - [x] Implement `CfpConfig` child entity
   - [x] Implement `CfpConfig.validateDates()` method

3. **Domain Services**
   - [~] Implement `ConferenceValidationService` (Omitted per ADR-007-01: domain purity dictates native value object validation, and API boundaries handle Zod schema parsing)

4. **Domain Events**
   - [x] Implement `ConferenceCreated` event
   - [x] Implement `CfpOpened` event

**Step 3: Verify**
- [x] Run tests: `npx vitest run`
- [x] All tests pass
- [x] Coverage ≥ 95% for domain layer

#### Deliverables
- [x] `src/modules/conference/domain/entities/conference.ts`
- [x] `src/modules/conference/domain/entities/cfp-config.ts`
- [x] `src/modules/conference/domain/value-objects/*` (9 files)
- [~] `src/modules/conference/domain/services/conference-validation-service.ts` (Omitted per ADR-007-01)
- [x] `src/modules/conference/domain/events/conference-created.ts`
- [x] `src/modules/conference/domain/events/cfp-opened.ts`
- [x] `src/modules/conference/domain/exceptions/` (6 error classes)
- [x] `tests/unit/conference/value-objects/*.test.ts`
- [x] `tests/unit/conference/entities/*.test.ts`

---

### Phase 2: Domain Interfaces

**Goal:** Implement repository interfaces and domain exception system using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Repository Interface Tests (Mocked)**
   - [x] Test `ConferenceRepository.findById()` returns correct entity
   - [x] Test `ConferenceRepository.findBySlug()` returns correct entity
   - [x] Test `ConferenceRepository.findByOrganizerId()` returns list
   - [x] Test `ConferenceRepository.save()` persists aggregate
   - [x] Test error handling (not found, etc.)

2. **Domain Event Tests**
   - [x] Test event types are correctly structured
   - [x] Test event publisher interface

3. **Exception Tests**
   - [x] Test `InvalidConferenceError` is thrown correctly
   - [x] Test `CfpDatesInvalidError` throws on invalid dates

**Step 2: Implement to Pass Tests**
1. **Repository Interface**
   - [x] Implement `ConferenceRepository` interface

2. **Domain Event System**
   - [x] Create domain event types
   - [x] Implement event publisher interface

3. **Domain Exception System**
   - [x] Implement custom error classes

**Step 3: Verify**
- [x] Run tests: `npx vitest run`
- [x] All tests pass
- [x] Coverage ≥ 90%

#### Deliverables
- [x] `src/modules/conference/domain/repositories/conference-repository.ts`
- [x] `src/modules/conference/domain/events/cfp-closed.ts`
- [x] `src/modules/conference/domain/events/review-started.ts`
- [x] `src/modules/conference/domain/events/selection-completed.ts`
- [x] `src/modules/conference/domain/events/schedule-published.ts`
- [x] `src/modules/conference/domain/events/conference-completed.ts`
- [x] `src/modules/conference/domain/events/conference-cancelled.ts`
- [x] `tests/unit/conference/repository-interface.test.ts`

---

### Phase 3: Infrastructure & Application (CQRS Pattern)

**Goal:** Implement database layer and CQRS handlers using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Command Tests (Mocked Repository)**
   - [x] Test `CreateConference` command happy path
   - [x] Test `CreateConference` command - validation error (short name)
   - [x] Test `CreateConference` command - CFP dates invalid
   - [x] Test `CreateConference` command - slug already exists
   - [x] Test `CreateConference` command - free tier limit exceeded
   - [x] Test `CreateConference` command - publishes domain events

2. **Query Tests (Mocked Repository)**
   - [x] Test `GetConference` query returns conference by ID
   - [x] Test `GetConference` query returns null for non-existent

3. **Repository Integration Tests**
   - [x] Test `save()` persists conference and CfpConfig
   - [x] Test `findById()` retrieves conference with CfpConfig
   - [x] Test `findBySlug()` retrieves conference

**Step 2: Implement to Pass Tests**
1. **Database Schema (Drizzle ORM)**
   - [x] Create `conferences` table schema with RLS
   - [x] Define columns: id (UUID PK), name, description, slug, status, organizer_id, cfp_config (JSONB or JSON), created_at, updated_at
   - [x] Unique constraint on `slug`

2. **Repository Implementation**
   - [x] Implement `ConferenceRepository` with Supabase/Drizzle
   - [x] Implement all repository methods
   - [x] Add transaction support for aggregate save

3. **CQRS Implementation**
   - [x] Implement `CreateConference` command definition
   - [x] Implement `CreateConference` command handler
   - [x] Implement `CreateConference` DTO
   - [x] Implement `GetConference` query definition
   - [x] Implement `GetConference` query handler
   - [x] Implement `GetConference` response DTO

4. **Shared Infrastructure**
   - [x] Implement database client setup (shared/infrastructure/database)
   - [x] Implement auth provider abstraction (shared/infrastructure/auth)
   - [x] Implement email provider abstraction (shared/infrastructure/email)

**Step 3: Verify**
- [x] Run tests: `npx vitest run`
- [x] All tests pass
- [x] Integration tests pass

#### Deliverables
- [x] `src/modules/conference/infrastructure/database/drizzle-schema.ts`
- [x] `src/modules/conference/infrastructure/database/conference-repository.ts`
- [x] `src/shared/infrastructure/database/db-client.ts`
- [x] `src/shared/infrastructure/auth/auth-provider.ts`
- [x] `src/shared/infrastructure/email/email-provider.ts`
- [x] `src/modules/conference/application/commands/create-conference/create-conference.command.ts`
- [x] `src/modules/conference/application/commands/create-conference/create-conference.handler.ts`
- [x] `src/modules/conference/application/commands/create-conference/create-conference.dto.ts`
- [x] `src/modules/conference/application/queries/get-conference/get-conference.query.ts`
- [x] `src/modules/conference/application/queries/get-conference/get-conference.handler.ts`
- [x] `src/modules/conference/application/queries/get-conference/get-conference.dto.ts`
- [x] `src/modules/conference/application/dto/conference-response.dto.ts`
- [x] `tests/integration/conference/repository.test.ts`
- [x] `tests/unit/conference/commands/create-conference.test.ts`
- [x] `tests/unit/conference/queries/get-conference.test.ts`

---

### Phase 4: RESTful API with CQRS Integration

**Goal:** Implement API endpoints that use CQRS handlers using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **API Endpoint Tests (Mocked CQRS Handlers)**
   - [x] Test `POST /api/v1/conferences` creates conference via command
   - [x] Test `POST /api/v1/conferences` returns 400 on validation errors
   - [x] Test `POST /api/v1/conferences` returns 409 on duplicate slug
   - [x] Test `POST /api/v1/conferences` returns 403 on free tier limit
   - [x] Test `GET /api/v1/conferences/:id` returns conference via query
   - [x] Test `GET /api/v1/conferences/:id` returns 404 if not found
   - [x] Test authentication via `GET /api/v1/auth/me`
   - [x] Test proper response DTOs returned

**Step 2: Implement to Pass Tests**
1. **API Structure (Next.js App Router)**
   - [x] Implement `POST /api/v1/conferences` - delegates to `CreateConference` command
   - [x] Implement `GET /api/v1/conferences/:id` - delegates to `GetConference` query
   - [x] Implement `GET /api/v1/auth/me` - delegates to auth provider
   - [x] Implement error response format (ZodError → 400, DomainError → appropriate status)

2. **Authentication**
   - [x] Verify user authorization via auth provider
   - [x] RLS integration with organizer_id

3. **Request Validation**
   - [x] Implement Zod validation schemas (`conference-create.schema.ts`)
   - [x] Map request body to `CreateConference` command

**Step 3: Verify**
- [x] Run tests: `npx vitest run`
- [x] All API tests pass
- [x] Response times <200ms (P95)

#### Deliverables
- [x] `apps/frontend/src/app/api/v1/conferences/route.ts` (POST)
- [x] `apps/frontend/src/app/api/v1/conferences/[id]/route.ts` (GET)
- [x] `apps/frontend/src/app/api/v1/auth/me/route.ts`
- [x] `packages/api-definitions/src/zod/conference.ts`
- [x] `packages/api-definitions/src/types/conference.ts`
- [x] `packages/modules/conference/src/interfaces/http/create-conference.controller.ts`
- [x] `tests/unit/modules/conference/interfaces/http/create-conference.controller.test.ts`
- [x] API documentation

---

### Phase 5: User Interface

**Goal:** Implement user interface layer (forms and pages) using React + shadcn-ui.

#### Tasks

**Step 1: Write Tests First**
1. **Component Tests**
   - [x] Test `ConferenceForm` renders with all fields
   - [x] Test form validation (name min length, dates, etc.)
   - [x] Test form submission calls API endpoint
   - [x] Test error display (validation errors, conflicts)
   - [x] Test loading state during submission

**Step 2: Implement to Pass Tests**
1. **Conference Creation Form**
   - [x] Implement `ConferenceForm` component with shadcn-ui
   - [x] Implement client-side Zod validation (mirrors server schema)
   - [x] Implement date picker for CfP start/end dates
   - [x] Implement conference name with slug preview
   - [x] Implement submit button with loading state
   - [x] Implement inline error display

2. **Dashboard Integration**
   - [x] Add "Create New Conference" button to dashboard
   - [x] Redirect to conference creation form
   - [x] Handle success redirect (with CfP link)

**Step 3: Verify**
- [x] Run tests: `npx vitest run`
- [x] All component tests pass
- [x] Component coverage ≥ 80%

#### Deliverables
- [x] `apps/frontend/src/app/conferences/create/page.tsx`
- [x] `apps/frontend/src/components/conference-form.tsx`
- [x] `tests/components/conference/conference-form.test.tsx`
- [x] Dashboard integration

---

### Phase 6: Validate E2E & Refinement (Outside-In)

**Goal:** Validate complete flow with E2E test from Phase 0 and achieve comprehensive coverage.

#### Tasks

**Step 1: Run E2E Test (From Phase 0)**
1. **Execute E2E**
   - [x] Run E2E test: Create conference with CfP
   - [x] Check if E2E PASSES
   - [x] If FAILS, identify missing pieces

2. **Fix Remaining Issues**
   - [x] Fix any failing E2E steps
   - [x] Address edge cases not covered
   - [x] Validate error scenarios

**Step 2: Integration Tests**
1. **Integration Tests**
   - [x] Test complete Conference lifecycle for this flow: create → publish CfP
   - [x] Test state transition validation
   - [x] Test error path coverage

**Step 3: Final Validation**
- [x] Run E2E: `npx playwright test` - Should PASS
- [x] Run tests: `npx vitest run`
- [x] Run lint: `npm run lint`
- [x] Run typecheck: `npm run typecheck`
- [x] All checks pass

#### Deliverables
- [x] E2E test suite (`tests/e2e/conference-setup.spec.ts`) - **NOW PASSING**
- [x] Test coverage reports (≥80% overall)
- [x] Final documentation

---

## 🚨 Key Constraints & Considerations

### From Project Guidelines
- **ADR-009 (DDD)**: All domain logic in `domain/` layer, no external dependencies
- **ADR-015 (CQRS)**: Application layer uses commands (commands/) and queries (queries/)
- **ADR-016 (DI)**: Dependency injection for Next.js (ADR is Proposed - may need approval)
- **ADR-017 (Drizzle)**: Drizzle ORM for database access (ADR is Proposed - may need approval)
- **AGENTS.md**: All files must be ≤ 300 lines, explicit TypeScript types, no `any`
- **AGENTS.md**: Zod validation for all input, repository pattern for data access
- **AGENTS.md**: Entity mutations use domain methods, not direct property setters

### From Flow Documentation
- Conference must transition `DRAFT` → `CFP_OPEN` in a single creation action
- `CfpConfig` is created as part of conference creation (not a separate step)
- Slug must be URL-safe and unique across all conferences
- Free tier limit: maximum 5 active conferences
- Welcome email is best-effort (don't fail on email service failure)

### From Technical Architecture
- **ADR-002**: Supabase PostgreSQL with DDD abstraction layer (repositories)
- **ADR-006**: RESTful API with proper status codes and response DTOs
- **ADR-007**: Zod validation at both API and UI layers
- **ADR-007-01**: Amendment: Validation & Domain Purity (native domain validation, decoupled Zod schemas)
- **ADR-011**: Optional email abstraction (Resend) - best-effort only
- **ADR-013**: TypeScript strict mode, no `any` types

---

## 🎯 Success Criteria

### Functional
- [x] Can create a conference with name, description, and CfP dates
- [x] Conference created in `DRAFT` state then transitions to `CFP_OPEN` via `publishCfp()`
- [x] `CfpConfig` child entity created with `ACTIVE` status
- [x] `ConferenceCreated` and `CfpOpened` domain events published
- [x] CfP URL generated: `{baseUrl}/cfp/{slug}`
- [x] All domain invariants enforced (date order, slug uniqueness, state transitions)
- [x] Free tier limit enforced (max 5 active conferences)
- [x] Slug uniqueness validated against existing conferences
- [x] API returns proper error codes (400, 403, 409)
- [x] E2E test passes for complete user journey

### Non-Functional
- [x] 95%+ test coverage for domain layer
- [x] 90%+ for application layer
- [x] API response <200ms (P95)
- [x] DDD architecture compliance (domain has no external deps)
- [x] CQRS compliance (commands/queries separated)
- [x] Repository pattern compliance (interfaces in domain, implementations in infrastructure)
- [x] Zero data corruption incidents
- [x] Zero unauthorized access incidents
- [x] TypeScript strict mode compliance (zero `any` types)

---

## 🔗 Related Documentation

- [Bounded Context README](../README.md)
- [Conference Entity Documentation](../entities/conference.md)
- [CfpConfig Entity Documentation](../entities/cfp-config.md)
- [Business Rules](../business-rules/)
- [Invariants](../invariants/)
- **Flow Documentation:** [./journey-01-setup-conference.md](./journey-01-setup-conference.md)
- [Architecture Decision Records](../../../adr/)
- [Feature Specification](./features/feature-conference-creation.md)

---

*This development plan is derived from the project's ADRs, flow documentation, and domain specifications.*
*Last updated: 2026-07-04*