# Journey 01: Setup Conference - Development Plan

* **Date:** 2026-07-03
* **Status:** 📋 **Planning Phase**
* **Flow:** `journey-01-setup-conference.md`
* **Context:** Conference Bounded Context (see [README](./README.md))

---

## 🎯 Overview

This document outlines the development plan for implementing **Journey 01: Setup Conference (C4P Configuration)**.

**Flow Description:** As a conference organizer, I want to create a new conference and configure its Call for Papers (CfP) settings so that I can share a submission link with potential speakers and start collecting proposals.

**Related Flow Documentation:** See `flows/journey-01-setup-conference.md` for complete user journey details.

**Associated Features:**
| Feature | Description | Status |
|---------|-------------|--------|
| Conference Creation | Create new conference with basic details | 📋 Planned |
| CfP Configuration | Set up submission window and settings | 📋 Planned |
| Domain Event Publishing | Publish events for analytics and email | 📋 Planned |

---

## 📋 ADR Discovery & Prerequisites

**Important:** Before listing ADRs, read `docs/adr/README.md` to understand the complete ADR landscape and identify which decisions apply to this flow.

### ADR Index Review
- [x] Read ADR README index to identify relevant decisions
- [x] Review Core Technology Stack ADRs
- [x] Review Architecture Decisions (DDD, CQRS, etc.)
- [x] Review Authentication & Storage strategies
- [x] Review Data Access patterns

### Relevant ADRs for This Flow
*Based on ADR index review, list the specific ADRs that apply to this implementation.*

| ADR # | Decision | Status | Impact on This Flow |
|-------|----------|--------|---------------------|
| **001** | Use Next.js as Frontend Framework | ✅ Approved | API routes and UI components in Next.js |
| **002-00** | Use Supabase for Backend and Database | ⚠️ Superseded | Supabase PostgreSQL with RLS |
| **002-01** | **Amendment: DDD Abstraction Layer** | ✅ **Approved** | DDD pattern with repository abstraction |
| **006** | Use RESTful API Design | ✅ Approved | RESTful endpoints for conference CRUD |
| **007** | Use Zod for Validation | ✅ Approved | Schema validation for all inputs |
| **008** | Implement Comprehensive Testing Strategy | ✅ Approved | Unit, integration, and E2E tests |
| **009** | Adopt Domain-Driven Design Structure | ✅ **Approved** | DDD layering: Domain, Application, Infrastructure, Interfaces |
| **013** | Adopt TypeScript with Strict Mode | ✅ Approved | Strict TypeScript configuration |
| **015** | Adopt CQRS Pattern for Application Layer | ✅ **Approved** | Commands for writes, Queries for reads |
| **017** | Use Drizzle ORM with DDD Transactions | ⚠️ Proposed | Database ORM with transaction support |

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
src/
├── modules/                    # Feature modules (bounded contexts)
│   └── conference/             # Conference bounded context
│       ├── domain/             # Domain layer for this module
│       │   ├── entities/
│       │   │   ├── conference.ts
│       │   │   └── submission.ts
│       │   ├── value-objects/
│       │   │   ├── conference-id.ts
│       │   │   ├── conference-name.ts
│       │   │   ├── conference-slug.ts
│       │   │   ├── conference-status.ts
│       │   │   └── cfp-config.ts
│       │   ├── services/
│       │   │   └── conference-validation-service.ts
│       │   └── repositories/
│       │       └── conference-repository.ts   # Interface
│       ├── application/        # Application layer with CQRS
│       │   ├── commands/       # Write operations
│       │   │   └── create-conference/
│       │   │       ├── create-conference.command.ts
│       │   │       ├── create-conference.handler.ts
│       │   │       └── create-conference.dto.ts
│       │   ├── queries/        # Read operations
│       │   │   └── get-conference/
│       │   │       ├── get-conference.query.ts
│       │   │       ├── get-conference.handler.ts
│       │   │       └── get-conference.dto.ts
│       │   └── dto/            # Shared DTOs
│       │       └── conference-dto.ts
│       ├── infrastructure/     # Implementations for this module
│       │   └── database/
│       │       └── conference-repository.ts   # Concrete impl
│       └── interfaces/         # API/UI for this module
│           └── api/
│               └── v1/
│                   └── conferences/
│                       └── conferences.controller.ts
│
└── shared/                     # Cross-cutting concerns
    ├── domain/                 # Shared VOs, exceptions
    └── infrastructure/         # Shared database client, etc.
```

**CQRS Principles:**
- **Commands are verbs**: `CreateConference`, `UpdateConference`, `DeleteConference`
- **Queries are nouns**: `GetConference`, `ListConferences`, `SearchSubmissions`
- **Commands change state**: They have side effects and return success/failure
- **Queries read state**: They have no side effects and return data
- **Response DTOs**: Separate from domain entities, optimized for API needs
- **Handlers are single-responsibility**: One command/query per handler

**Advantages of Module-Based Organization:**
- ✅ High cohesion - all code for a feature is together
- ✅ Independent modules - change one feature without affecting others
- ✅ Easier navigation - find all conference code in one place
- ✅ Better for scaling - add features without touching existing code
- ✅ Clear boundaries - no accidental dependencies between features

---

## 🗺️ Entity Lifecycle Reference

**Source:** See [Journey 01 Flow Documentation](./journey-01-setup-conference.md) for complete state machine diagrams.

**Key States for This Flow:**
| State | Description | Phase Created |
|-------|-------------|---------------|
| `DRAFT` | Conference created but not yet published | Phase 1 (Domain) |
| `CFP_OPEN` | Conference is live and accepting submissions | Phase 1 (Domain) |

**Key Transitions:**
| Transition | Method | Flow Steps |
|------------|--------|------------|
| Create Conference | `Conference.create()` | Steps 9-10 |
| Publish CfP | `Conference.publishCfp()` | Steps 11-12 |

---

## 📦 Implementation Phases

### Phase 0: Define E2E Contract (Outside-In)

**Goal:** Define the complete user journey as a failing E2E test.

#### Tasks

**Step 1: Write E2E Test**
- [ ] Write E2E test for complete flow: Setup Conference
- [ ] Document acceptance criteria from flow documentation
- [ ] Identify key journey steps from `journey-01-setup-conference.md`
- [ ] Define success criteria (what makes E2E pass)

**Step 2: Run E2E (Expected to Fail)**
- [ ] Run E2E test → Should FAIL (no implementation yet)
- [ ] Document what's missing
- [ ] Use this as the "North Star" for the project

#### Deliverables
- [ ] `tests/e2e/journey-01-setup-conference.spec.ts` - E2E test that defines the goal
- [ ] E2E test documentation (acceptance criteria)
- [ ] Initial failure report (what's missing)

---

### Phase 1: Core Domain (Inside-Out)

**Goal:** Implement domain model with entities, value objects, and domain services using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Value Object Tests**
   - [ ] Test `ConferenceId` - UUIDv4 generation and validation
   - [ ] Test `ConferenceName` - 3-100 character validation, sanitization
   - [ ] Test `ConferenceSlug` - URL-safe generation, uniqueness
   - [ ] Test `ConferenceStatus` - Enum validation
   - [ ] Test `CfpConfig` - Date validation, duration limits
   - [ ] Test edge cases (invalid inputs, boundary conditions)

2. **Entity Tests**
   - [ ] Test `create()` produces correct initial state (DRAFT)
   - [ ] Test `publishCfp()` transitions to CFP_OPEN
   - [ ] Test invalid state transitions throw errors
   - [ ] Test invariants are enforced (date order, slug uniqueness)

3. **Domain Service Tests**
   - [ ] Test `ConferenceValidationService.validateCfpDates()` 
   - [ ] Test `ConferenceValidationService.checkFreeTierLimit()`

**Step 2: Implement to Pass Tests**
1. **Value Objects**
   - [ ] Implement `ConferenceId` (UUIDv4)
   - [ ] Implement `ConferenceName` (3-100 chars, sanitization)
   - [ ] Implement `ConferenceSlug` (URL-safe generator)
   - [ ] Implement `ConferenceStatus` (enum)
   - [ ] Implement `CfpConfig` (dates, status)

2. **Entity: Conference**
   - [ ] Implement aggregate root with state machine
   - [ ] Implement `create()` method
   - [ ] Implement `publishCfp()` method
   - [ ] Implement `closeCfp()` method
   - [ ] Implement domain events (`ConferenceCreated`, `CfpOpened`)

3. **Entity: Submission** (Child Entity)
   - [ ] Implement child entity structure
   - [ ] Implement basic methods

4. **Domain Services**
   - [ ] Implement `ConferenceValidationService`

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All tests pass
- [ ] Coverage ≥ 95% for domain layer

#### Deliverables
- [ ] `modules/conference/domain/entities/conference.ts`
- [ ] `modules/conference/domain/entities/submission.ts`
- [ ] `modules/conference/domain/value-objects/conference-id.ts`
- [ ] `modules/conference/domain/value-objects/conference-name.ts`
- [ ] `modules/conference/domain/value-objects/conference-slug.ts`
- [ ] `modules/conference/domain/value-objects/conference-status.ts`
- [ ] `modules/conference/domain/value-objects/cfp-config.ts`
- [ ] `modules/conference/domain/services/conference-validation-service.ts`
- [ ] `tests/unit/conference/value-objects/*.test.ts`
- [ ] `tests/unit/conference/entities/*.test.ts`

---

### Phase 2: Domain Interfaces

**Goal:** Implement repository interfaces and domain event system using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Repository Interface Tests (Mocked)**
   - [ ] Test `findById()` returns correct entity
   - [ ] Test `findBySlug()` returns correct entity
   - [ ] Test `findByOrganizerId()` returns list
   - [ ] Test `save()` persists aggregate
   - [ ] Test error handling (not found, etc.)

2. **Domain Event Tests**
   - [ ] Test `ConferenceCreated` event structure
   - [ ] Test `CfpOpened` event structure
   - [ ] Test event publisher interface

3. **Exception Tests**
   - [ ] Test `InvalidConferenceError` is thrown correctly
   - [ ] Test `InvalidCfpConfigError` is thrown correctly
   - [ ] Test `SlugAlreadyExistsError` is thrown correctly
   - [ ] Test `FreeTierLimitExceededError` is thrown correctly

**Step 2: Implement to Pass Tests**
1. **Repository Interface**
   - [ ] Implement `ConferenceRepository` interface

2. **Domain Event System**
   - [ ] Create `ConferenceCreated` event type
   - [ ] Create `CfpOpened` event type
   - [ ] Implement `IDomainEventPublisher` interface

3. **Domain Exception System**
   - [ ] Implement `DomainError` base class
   - [ ] Implement `InvalidConferenceError`
   - [ ] Implement `InvalidCfpConfigError`
   - [ ] Implement `SlugAlreadyExistsError`
   - [ ] Implement `FreeTierLimitExceededError`

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All tests pass
- [ ] Coverage ≥ 90%

#### Deliverables
- [ ] `modules/conference/domain/repositories/conference-repository.ts`
- [ ] `modules/conference/domain/events/conference-created.ts`
- [ ] `modules/conference/domain/events/cfp-opened.ts`
- [ ] `modules/conference/domain/events/domain-event-publisher.ts`
- [ ] `modules/conference/domain/exceptions/*.ts` (5 error classes)
- [ ] `tests/unit/conference/repository-interface.test.ts`
- [ ] `tests/unit/conference/events.test.ts`

---

### Phase 3: Infrastructure & Application (CQRS Pattern)

**Goal:** Implement database layer and CQRS handlers using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Command Tests (Mocked Repository)**
   - [ ] Test `CreateConference` command happy path
   - [ ] Test `CreateConference` command error paths (validation, conflicts, etc.)
   - [ ] Test validation failures
   - [ ] Test domain event publishing

2. **Query Tests (Mocked Repository)**
   - [ ] Test `GetConference` query returns correct data
   - [ ] Test `ListConferences` query returns list
   - [ ] Test query error handling

3. **Repository Integration Tests**
   - [ ] Test `save()` persists correctly
   - [ ] Test `findById()` retrieves correctly
   - [ ] Test `findBySlug()` checks uniqueness
   - [ ] Test transaction support

**Step 2: Implement to Pass Tests**
1. **Database Schema**
   - [ ] Create `conferences` table with RLS
   - [ ] Create `cfp_configs` table with foreign keys
   - [ ] Add indexes for common queries

2. **Database Client Setup**
   - [ ] Implement Supabase client
   - [ ] Configure connection pooling

3. **Repository Implementation**
   - [ ] Implement `ConferenceRepository` with Drizzle ORM
   - [ ] Add transaction support
   - [ ] Implement all repository methods

4. **CQRS Implementation**
   - [ ] Implement `CreateConference` command definition
   - [ ] Implement `CreateConference` command handler
   - [ ] Implement `CreateConference` response DTO
   - [ ] Implement `GetConference` query definition
   - [ ] Implement `GetConference` query handler
   - [ ] Implement `GetConference` response DTO
   - [ ] Implement `ListConferences` query definition
   - [ ] Implement `ListConferences` query handler

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All tests pass
- [ ] Integration tests pass

#### Deliverables
- [ ] Database migration files (SQL or Drizzle migrations)
- [ ] RLS policies defined
- [ ] `modules/conference/infrastructure/database/conference-repository.ts`
- [ ] `modules/conference/application/commands/create-conference/` (command, handler, DTO)
- [ ] `modules/conference/application/queries/get-conference/` (query, handler, DTO)
- [ ] `modules/conference/application/queries/list-conferences/` (query, handler, DTO)
- [ ] `modules/conference/application/dto/conference-dto.ts`
- [ ] `tests/integration/conference/repository.test.ts`
- [ ] `tests/unit/conference/commands/create-conference.test.ts`
- [ ] `tests/unit/conference/queries/*.test.ts`

---

### Phase 4: RESTful API with CQRS Integration

**Goal:** Implement API endpoints that use CQRS handlers using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **API Endpoint Tests (Mocked CQRS Handlers)**
   - [ ] Test `POST /api/v1/conferences` creates conference via command
   - [ ] Test `GET /api/v1/conferences` returns list via query
   - [ ] Test `GET /api/v1/conferences/:id` returns conference via query
   - [ ] Test authentication/authorization errors
   - [ ] Test validation errors (Zod)
   - [ ] Test proper response DTOs returned
   - [ ] Test 409 Conflict for duplicate slug
   - [ ] Test 403 Forbidden for free tier limit

**Step 2: Implement to Pass Tests**
1. **API Structure**
   - [ ] Implement `/api/v1/conferences` - POST (command), GET (query)
   - [ ] Implement `/api/v1/conferences/:id` - GET (query)
   - [ ] Implement error response format
   - [ ] Integrate CQRS handlers into API controllers

2. **Authentication**
   - [ ] Verify user authorization via Auth0
   - [ ] RLS integration with Supabase

3. **Request Validation**
   - [ ] Implement Zod validation schema (`conferenceCreateSchema`)
   - [ ] Map request to `CreateConference` command object
   - [ ] Validate dates, name, slug uniqueness

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All API tests pass
- [ ] Response times <200ms (P95)

#### Deliverables
- [ ] API endpoints with proper status codes (201, 400, 403, 409)
- [ ] Validation schemas for request/response
- [ ] `tests/api/conference/conferences.test.ts`
- [ ] API documentation (OpenAPI format)
- [ ] `modules/conference/interfaces/api/v1/conferences/conferences.controller.ts`

---

### Phase 5: User Interface

**Goal:** Implement user interface layer using TDD (Next.js with shadcn-ui).

#### Tasks

**Step 1: Write Tests First**
1. **Component/View Tests**
   - [ ] Test `ConferenceCreationForm` renders correctly
   - [ ] Test form validation (client-side Zod)
   - [ ] Test form submission
   - [ ] Test error handling and inline errors

2. **Page/View Tests**
   - [ ] Test `CreateConference` page renders form
   - [ ] Test `ConferenceDashboard` view renders details
   - [ ] Test CfP link display

**Step 2: Implement to Pass Tests**
1. **Conference Creation**
   - [ ] Implement `ConferenceCreationForm` component
   - [ ] Implement date picker for CfP dates
   - [ ] Implement form validation with Zod
   - [ ] Implement error display

2. **Conference Dashboard**
   - [ ] Implement `ConferenceDashboard` component
   - [ ] Implement CfP link display and copy functionality
   - [ ] Implement status indicators

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All component tests pass
- [ ] Component coverage ≥ 80%

#### Deliverables
- [ ] `modules/conference/interfaces/web/components/conference-creation-form.tsx`
- [ ] `modules/conference/interfaces/web/components/conference-dashboard.tsx`
- [ ] `modules/conference/interfaces/web/pages/create-conference.tsx`
- [ ] `tests/components/conference/conference-creation-form.test.tsx`
- [ ] `tests/components/conference/conference-dashboard.test.tsx`

---

### Phase 6: Validate E2E & Refinement (Outside-In)

**Goal:** Validate complete flow with E2E test from Phase 0 and achieve comprehensive coverage.

#### Tasks

**Step 1: Run E2E Test (From Phase 0)**
1. **Execute E2E**
   - [ ] Run E2E test: Setup Conference
   - [ ] Check if E2E PASSES
   - [ ] If FAILS, identify missing pieces

2. **Fix Remaining Issues**
   - [ ] Fix any failing E2E steps
   - [ ] Address edge cases not covered
   - [ ] Validate error scenarios

**Step 2: Integration Tests**
1. **Integration Tests**
   - [ ] Test complete conference lifecycle: DRAFT → CFP_OPEN
   - [ ] Test state transition validation
   - [ ] Test error path coverage

**Step 3: Final Validation**
- [ ] Run E2E: `npm run test:e2e` - Should PASS
- [ ] Run tests: `npm test`
- [ ] Run lint: `npm run lint`
- [ ] Run typecheck: `npm run typecheck`
- [ ] All checks pass

#### Deliverables
- [ ] E2E test suite (`tests/e2e/journey-01-setup-conference.spec.ts`) - **NOW PASSING**
- [ ] Test coverage reports (≥80% overall)
- [ ] User testing feedback incorporated
- [ ] Final documentation

---

## 🚨 Key Constraints & Considerations

### From Project Guidelines
- **AGENTS.md Definition of Done**: All tests pass, lint passes, typecheck passes, coverage ≥80%
- **Karpathy Principle #1**: Think before coding - this plan represents that thinking
- **Karpathy Principle #2**: Simplicity first - no speculative features
- **Karpathy Principle #5**: DRY & Reusability - search before creating
- **File Size Limit**: Maximum 300 lines per file

### From Flow Documentation
- Flow steps must be implemented in order (1-17)
- Each step may create/update entities
- Domain events must be published (`ConferenceCreated`, `CfpOpened`)
- E2E tests validate complete flow completion
- Multiple error paths must be handled (validation, duplicate slug, free tier limit)

### From Technical Architecture
- **ADR-009**: DDD pattern with strict layering
- **ADR-015**: CQRS pattern for application layer
- **ADR-007**: Zod validation for all inputs
- **ADR-002-01**: Supabase with DDD abstraction
- **ADR-006**: RESTful API design

---

## 🎯 Success Criteria

### Functional
- [ ] Can create conference in DRAFT state
- [ ] Can transition to CFP_OPEN via `publishCfp()`
- [ ] Can validate CfP dates (end after start, future dates)
- [ ] Can validate conference name (3-100 chars)
- [ ] Can generate unique slug
- [ ] Can publish domain events
- [ ] All flow steps completed successfully
- [ ] DDD architecture pattern compliance
- [ ] CQRS pattern compliance

### Non-Functional
- [ ] 95%+ test coverage for domain
- [ ] 90%+ for application layer
- [ ] 80%+ overall coverage
- [ ] API response <200ms (P95)
- [ ] DDD layering compliance
- [ ] CQRS pattern compliance
- [ ] Zero data corruption incidents
- [ ] Zero unauthorized access incidents

---

## 🔗 Related Documentation

- [Conference Entity](../entities/conference.md)
- [CfpConfig Entity](../entities/cfp-config.md)
- [Conference Value Objects](../value-objects/)
- **Flow Documentation:** [./journey-01-setup-conference.md](./journey-01-setup-conference.md)
- [Architecture Decision Records](../../../adr/)
- [AGENTS.md](../../../../AGENTS.md)

---

*This development plan is derived from the project's ADRs and domain specifications.*
*Last updated: 2026-07-03*