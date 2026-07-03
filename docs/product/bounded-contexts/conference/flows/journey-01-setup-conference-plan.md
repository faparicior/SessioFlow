# Journey 01: Setup Conference - Development Plan

* **Date:** 2026-07-03
* **Status:** 📋 **Planning Phase**
* **Flow:** journey-01-setup-conference.md
* **Context:** Conference Bounded Context (see [README](../README.md))

---

## 🎯 Overview

This document outlines the development plan for implementing **Journey 01: Setup Conference (C4P Configuration)**.

**Flow Description:** As a conference organizer, I want to create a new conference and configure its Call for Papers (CfP) settings so that I can share a submission link with potential speakers and start collecting proposals.

**Related Flow Documentation:** See `journey-01-setup-conference.md` for complete user journey details.

**Associated Features:**
| Feature | Description | Status |
|---------|-------------|--------|
| Conference Creation | Create new conference with basic details | 📋 Planned |
| CfP Configuration | Set up submission window and settings | 📋 Planned |
| Slug Generation | Auto-generate unique conference slug | 📋 Planned |
| Domain Events | Publish events for analytics and email | 📋 Planned |

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
*Based on ADR index review, the following ADRs apply to this implementation.*

| ADR # | Decision | Status | Impact on This Flow |
|-------|----------|--------|---------------------|
| ADR-002-01 | Supabase with DDD Abstraction | ✅ Approved | Database layer with repository pattern |
| ADR-004-01 | Auth0 with DDD Abstraction | ✅ Approved | Authentication via Auth0 with abstraction |
| ADR-006 | RESTful API Design | ✅ Approved | API endpoint structure |
| ADR-007 | Zod for Validation | ✅ Approved | Input validation strategy |
| ADR-009 | Domain-Driven Design Structure | ✅ Approved | DDD layer organization |
| ADR-015 | CQRS Pattern for Application Layer | ✅ Approved | Commands and queries separation |
| ADR-011-01 | Optional Email Abstraction | ✅ Optional | Welcome email via Resend |

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
│       │   │   ├── cfp-start-date.ts
│       │   │   ├── cfp-end-date.ts
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
│                       └── index.ts
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

---

## 🗺️ Entity Lifecycle Reference

**Source:** See [Journey 01 Documentation](./journey-01-setup-conference.md) for complete state machine diagrams.

**Key States for This Flow:**
| State | Description | Phase Created |
|-------|-------------|---------------|
| `DRAFT` | Conference created but not yet published | Phase 1 |
| `CFP_OPEN` | Conference is live and accepting submissions | Phase 1 |

**Key Transitions:**
| Transition | Method | Flow Steps |
|------------|--------|------------|
| NotCreated → Draft | `Conference.create()` | Steps 9-10 |
| Draft → CfpOpen | `Conference.publishCfp()` | Steps 11-12 |

---

## 📦 Implementation Phases

### Phase 0: Define E2E Contract (Outside-In)

**Goal:** Define the complete user journey as a failing E2E test.

#### Tasks

**Step 1: Write E2E Test**
- [ ] Write E2E test for complete flow: Journey 01 - Setup Conference
- [ ] Document acceptance criteria from flow documentation
- [ ] Identify key journey steps from journey-01-setup-conference.md
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
   - [ ] Test `ConferenceId` - UUID generation and validation
   - [ ] Test `ConferenceName` - Length constraints (3-100 chars), sanitization
   - [ ] Test `ConferenceSlug` - URL-safe generation, uniqueness validation
   - [ ] Test `ConferenceStatus` - Enum validation
   - [ ] Test `CfpStartDate` - Future date validation
   - [ ] Test `CfpEndDate` - Must be after start date
   - [ ] Test `CfpConfig` - Date validation, status management

2. **Entity Tests**
   - [ ] Test `Conference.create()` produces correct initial state (DRAFT)
   - [ ] Test `Conference.publishCfp()` transitions to CFP_OPEN
   - [ ] Test invalid state transitions throw errors
   - [ ] Test invariants are enforced (date order, slug uniqueness)

3. **Domain Service Tests**
   - [ ] Test `ConferenceValidationService.validateCfpDates()` - BR-001
   - [ ] Test `ConferenceValidationService.validateName()` - BR-002

**Step 2: Implement to Pass Tests**
1. **Value Objects**
   - [ ] Implement `ConferenceId` - UUIDv4 generation
   - [ ] Implement `ConferenceName` - Validation and sanitization
   - [ ] Implement `ConferenceSlug` - URL-safe slug generation
   - [ ] Implement `ConferenceStatus` - Status enum
   - [ ] Implement `CfpStartDate` - Future date validation
   - [ ] Implement `CfpEndDate` - Date comparison validation
   - [ ] Implement `CfpConfig` - Child entity with validation

2. **Entity: Conference**
   - [ ] Implement aggregate root with state machine
   - [ ] Implement `create()` method
   - [ ] Implement `publishCfp()` method
   - [ ] Implement domain events (ConferenceCreated, CfpOpened)

3. **Entity: Submission** (Stubs for future phases)
   - [ ] Create basic Submission entity structure

4. **Domain Services**
   - [ ] Implement `ConferenceValidationService`

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All tests pass
- [ ] Coverage ≥ 95% for domain layer

#### Deliverables
- [ ] `src/modules/conference/entities/conference.ts`
- [ ] `src/modules/conference/entities/submission.ts`
- [ ] `src/modules/conference/value-objects/conference-id.ts`
- [ ] `src/modules/conference/value-objects/conference-name.ts`
- [ ] `src/modules/conference/value-objects/conference-slug.ts`
- [ ] `src/modules/conference/value-objects/conference-status.ts`
- [ ] `src/modules/conference/value-objects/cfp-start-date.ts`
- [ ] `src/modules/conference/value-objects/cfp-end-date.ts`
- [ ] `src/modules/conference/value-objects/cfp-config.ts`
- [ ] `src/modules/conference/services/conference-validation-service.ts`
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
   - [ ] Test `findByOrganizerId()` returns organizer's conferences
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
   - [ ] Implement `DomainEventPublisher` interface

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
- [ ] `src/modules/conference/domain/repositories/conference-repository.ts`
- [ ] `src/modules/conference/domain/events/conference-created.ts`
- [ ] `src/modules/conference/domain/events/cfp-opened.ts`
- [ ] `src/modules/conference/domain/events/domain-event-publisher.ts`
- [ ] `src/modules/conference/domain/exceptions/*.ts` (5 error classes)
- [ ] `tests/unit/conference/repository-interface.test.ts`
- [ ] `tests/unit/conference/events.test.ts`

---

### Phase 3: Infrastructure & Application (CQRS Pattern)

**Goal:** Implement database layer and CQRS handlers using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Command Tests (Mocked Repository)**
   - [ ] Test `CreateConference` command happy path
   - [ ] Test `CreateConference` command error paths (validation, slug conflict, tier limit)
   - [ ] Test validation failures
   - [ ] Test domain event publishing

2. **Query Tests (Mocked Repository)**
   - [ ] Test `GetConference` query returns correct data
   - [ ] Test `ListConferences` query returns list
   - [ ] Test query error handling

3. **Repository Integration Tests**
   - [ ] Test `save()` persists correctly to Supabase
   - [ ] Test `findById()` retrieves correctly
   - [ ] Test `findBySlug()` checks uniqueness
   - [ ] Test transaction support

**Step 2: Implement to Pass Tests**
1. **Database Schema**
   - [ ] Create `conferences` table migration
   - [ ] Create `cfp_configs` table migration
   - [ ] Configure RLS policies for conferences
   - [ ] Configure RLS policies for cfp_configs

2. **Database Client Setup**
   - [ ] Implement Supabase database client
   - [ ] Configure authentication integration

3. **Repository Implementation**
   - [ ] Implement `ConferenceRepository` with all methods
   - [ ] Add transaction support for aggregate persistence

4. **CQRS Implementation**
   - [ ] Implement `CreateConferenceCommand` definition
   - [ ] Implement `CreateConferenceHandler` command handler
   - [ ] Implement `CreateConferenceDto` response DTO
   - [ ] Implement `GetConferenceQuery` definition
   - [ ] Implement `GetConferenceHandler` query handler
   - [ ] Implement `GetConferenceDto` response DTO

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All tests pass
- [ ] Integration tests pass

#### Deliverables
- [ ] Database migration files for `conferences` and `cfp_configs`
- [ ] RLS policies defined in migration
- [ ] `src/modules/conference/infrastructure/database/conference-repository.ts`
- [ ] `src/modules/conference/application/commands/create-conference/`
- [ ] `src/modules/conference/application/queries/get-conference/`
- [ ] `src/modules/conference/application/dto/conference-dto.ts`
- [ ] `src/shared/infrastructure/database/supabase-client.ts`
- [ ] `tests/integration/conference/repository.test.ts`
- [ ] `tests/unit/conference/commands/create-conference.test.ts`
- [ ] `tests/unit/conference/queries/get-conference.test.ts`

---

### Phase 4: RESTful API with CQRS Integration

**Goal:** Implement API endpoints that use CQRS handlers using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **API Endpoint Tests (Mocked CQRS Handlers)**
   - [ ] Test `POST /api/v1/conferences` creates conference via command
   - [ ] Test `GET /api/v1/conferences` returns list via query
   - [ ] Test `GET /api/v1/conferences/:id` returns conference via query
   - [ ] Test authentication errors (401)
   - [ ] Test validation errors (400)
   - [ ] Test slug conflict errors (409)
   - [ ] Test tier limit errors (403)
   - [ ] Test proper response DTOs returned

**Step 2: Implement to Pass Tests**
1. **API Structure**
   - [ ] Implement `POST /api/v1/conferences` - Create conference (command)
   - [ ] Implement `GET /api/v1/conferences` - List conferences (query)
   - [ ] Implement `GET /api/v1/conferences/:id` - Get conference (query)
   - [ ] Implement proper error response format
   - [ ] Integrate CQRS handlers into API controllers

2. **Authentication**
   - [ ] Verify user authorization via Auth0
   - [ ] Integrate with RLS policies

3. **Validation**
   - [ ] Implement `conferenceCreateSchema` Zod validation
   - [ ] Map request to Command/Query objects

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All API tests pass
- [ ] Response times <200ms (P95)

#### Deliverables
- [ ] API endpoints with proper status codes (201, 400, 401, 403, 409)
- [ ] Validation schemas for request/response
- [ ] `tests/api/conference/conferences.test.ts`
- [ ] API documentation (OpenAPI format)
- [ ] `src/modules/conference/interfaces/api/v1/conferences/index.ts`
- [ ] `src/modules/conference/application/dto/conference-dto.ts`

---

### Phase 5: User Interface

**Goal:** Implement user interface layer using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Component/View Tests**
   - [ ] Test `ConferenceCreationForm` renders correctly
   - [ ] Test form validation with Zod
   - [ ] Test form submission
   - [ ] Test error handling and display

2. **Page/View Tests**
   - [ ] Test `Dashboard` view renders conference list
   - [ ] Test `CreateConference` page renders form
   - [ ] Test success redirect after creation

**Step 2: Implement to Pass Tests**
1. **Resource List & Creation**
   - [ ] Implement `ConferenceList` - List conferences view
   - [ ] Implement `CreateConference` - Conference creation form
   - [ ] Implement form validation with Zod
   - [ ] Implement loading states

2. **Resource Dashboard**
   - [ ] Implement `ConferenceDetail` - Conference overview
   - [ ] Implement status display (DRAFT, CFP_OPEN, etc.)
   - [ ] Implement CfP link sharing

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All component tests pass
- [ ] Component coverage ≥ 80%

#### Deliverables
- [ ] UI pages/views for conference management
- [ ] Reusable form components
- [ ] Form validation integration
- [ ] `tests/components/conference/conference-creation.test.tsx`
- [ ] Component tests
- [ ] `src/modules/conference/interfaces/web/conference-creation-form.tsx`
- [ ] `src/modules/conference/interfaces/web/conference-list.tsx`

---

### Phase 6: Validate E2E & Refinement (Outside-In)

**Goal:** Validate complete flow with E2E test from Phase 0 and achieve comprehensive coverage.

#### Tasks

**Step 1: Run E2E Test (From Phase 0)**
1. **Execute E2E**
   - [ ] Run E2E test: Journey 01 - Setup Conference
   - [ ] Check if E2E PASSES
   - [ ] If FAILS, identify missing pieces

2. **Fix Remaining Issues**
   - [ ] Fix any failing E2E steps
   - [ ] Address edge cases not covered
   - [ ] Validate error scenarios

**Step 2: Integration Tests**
1. **Integration Tests**
   - [ ] Test complete Conference lifecycle: DRAFT → CFP_OPEN
   - [ ] Test state transition validation
   - [ ] Test error path coverage

**Step 3: Final Validation**
- [ ] Run E2E: `npm run test:e2e` - Should PASS
- [ ] Run tests: `npm test` - Should PASS
- [ ] Run lint: `npm run lint` - Should PASS
- [ ] Run typecheck: `npm run typecheck` - Should PASS
- [ ] All checks pass

#### Deliverables
- [ ] E2E test suite (`tests/e2e/journey-01-setup-conference.spec.ts`) - **NOW PASSING**
- [ ] Test coverage reports (≥80% overall)
- [ ] User testing feedback incorporated
- [ ] Final documentation

---

## 🚨 Key Constraints & Considerations

### From Project Guidelines
- **AGENTS.md**: Follow definition of done (tests, lint, typecheck all pass)
- **AGENTS.md**: Maximum 300 lines per file - split large files
- **AGENTS.md**: Use Zod for all input validation
- **AGENTS.md**: Follow DDD layer boundaries strictly
- **AGENTS.md**: Think before coding - plan and validate approach
- **AGENTS.md**: Search before creating - look for existing code first

### From Flow Documentation
- Flow steps must be implemented in order (Steps 1-17)
- Conference must be created in DRAFT state, then transition to CFP_OPEN
- Domain events must be published (ConferenceCreated, CfpOpened)
- E2E tests validate complete flow completion
- Multiple business rules must be enforced (BR-001 to BR-004)

### From Technical Architecture
*Based on ADR index review, list the technical architecture decisions that apply to this flow.*

- [Fill from ADR index - e.g., API design pattern, Database strategy, Authentication approach, etc.]
- [Fill from ADR index - e.g., Validation strategy, Data access pattern, etc.]
- [Fill from ADR index - e.g., Any other relevant technical decisions]

---

## 🎯 Success Criteria

### Functional
- [ ] Can create conference in DRAFT state
- [ ] Can transition to CFP_OPEN state via `publishCfp()`
- [ ] Can cancel conference (DRAFT or CFP_OPEN only)
- [ ] All domain invariants enforced (date order, slug uniqueness, tier limits)
- [ ] All flow steps completed successfully (17 steps)
- [ ] Domain events published correctly
- [ ] [Fill from ADR index - e.g., Architecture pattern compliance]

### Non-Functional
- [ ] 95%+ test coverage for domain layer
- [ ] 90%+ for application layer
- [ ] 80%+ overall coverage
- [ ] API response <200ms (P95)
- [ ] [Fill from ADR index - e.g., Architecture pattern compliance]
- [ ] [Fill from ADR index - e.g., Data access pattern compliance]
- [ ] Zero data corruption incidents
- [ ] Zero unauthorized access incidents
- [ ] All linting rules pass
- [ ] All type checks pass

---

## 🔗 Related Documentation

- [Conference Bounded Context README](../README.md)
- [Conference Entity Documentation](../entities/conference.md)
- [CfpConfig Entity Documentation](../entities/cfp-config.md)
- [Conference Value Objects](../value-objects/)
- **Flow Documentation:** [./journey-01-setup-conference.md](./journey-01-setup-conference.md)
- [Architecture Decision Records](../../adr/)
- [AGENTS.md](../../../../AGENTS.md) - Project conventions and quality standards

---

*This development plan is derived from the project's ADRs and domain specifications.*
*Last updated: 2026-07-03*