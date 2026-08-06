# [Flow Name] - Development Plan

* **Date:** YYYY-MM-DD
* **Status:** 📋 **Planning Phase**
* **Flow:** [Flow filename] (e.g., `journey-01-setup-event.md`)
* **Context:** [Bounded Context] (see [README](./README.md))

---

## 🎯 Overview

This document outlines the development plan for implementing **[Flow Name]**.

**Flow Description:** [Brief description of the user journey or flow]

**Related Flow Documentation:** See `flows/[flow-filename].md` for complete user journey details.

**Associated Features:**
| Feature | Description | Status |
|---------|-------------|--------|
| [Feature 1] | [Brief description] | 📋 Planned |
| [Feature 2] | [Brief description] | 📋 Planned |
| ... | ... | ... |

---

## 📋 ADR Discovery & Prerequisites

**Important:** Before listing ADRs, read `docs/adr/README.md` to understand the complete ADR landscape and identify which decisions apply to this flow.

### ADR Index Review
- [ ] Read ADR README index to identify relevant decisions
- [ ] Review Core Technology Stack ADRs
- [ ] Review Architecture Decisions (DDD, CQRS, etc.)
- [ ] Review Authentication & Storage strategies
- [ ] Review Data Access patterns

### Relevant ADRs for This Flow
*Based on ADR index review, list the specific ADRs that apply to this implementation.*

| ADR # | Decision | Status | Impact on This Flow |
|-------|----------|--------|---------------------|
| [Fill from index] | [Decision name] | ✅ Approved | [How it affects this flow] |
| [Fill from index] | [Decision name] | ✅ Approved | [How it affects this flow] |
| [Fill from index] | [Decision name] | ✅ Approved | [How it affects this flow] |

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

## 🏗️ Module-Based DDD Structure with CQRS - [Bounded Context]

### Project Layout (Modular Architecture with CQRS)

```
src/
├── modules/                    # Feature modules (bounded contexts)
│   └── [context]/              # e.g., conference, event, submission
│       ├── domain/             # Domain layer for this module
│       │   ├── entities/
│       │   │   ├── [entity].[ext]
│       │   │   └── [child-entity].[ext]
│       │   ├── value-objects/
│       │   │   └── [vo].[ext]
│       │   ├── services/
│       │   │   └── [domain-service].[ext]
│       │   └── repositories/
│       │       └── [entity]-repository.[ext]   # Interface
│       ├── application/        # Application layer with CQRS
│       │   ├── commands/       # Write operations
│       │   │   └── [command-name]/
│       │   │       ├── [command-name].command.ts
│       │   │       ├── [command-name].handler.ts
│       │   │       └── [command-name].dto.ts
│       │   ├── queries/        # Read operations
│       │   │   └── [query-name]/
│       │   │       ├── [query-name].query.ts
│       │   │       ├── [query-name].handler.ts
│       │   │       └── [query-name].dto.ts
│       │   └── dto/            # Shared DTOs
│       │       └── [resource]-dto.[ext]
│       ├── infrastructure/     # Implementations for this module
│       │   └── database/
│       │       └── [entity]-repository.[ext]   # Concrete impl
│       └── interfaces/         # API/UI for this module
│           └── api/
│               └── v1/
│                   └── [resource]/
│                       └── [controller].[ext]
│
└── shared/                     # Cross-cutting concerns
    ├── domain/                 # Shared VOs, exceptions
    └── infrastructure/         # Shared database client, etc.
```

*Note: `[ext]` represents the language-specific file extension (e.g., `.ts`, `.kt`, `.java`)*

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

**Source:** See [Flow Documentation](./[flow-filename].md) for complete state machine diagrams.

**Key States for This Flow:**
| State | Description | Phase Created |
|-------|-------------|---------------|
| [State 1] | [Brief description] | Phase [X] |
| [State 2] | [Brief description] | Phase [X] |

**Key Transitions:**
| Transition | Method | Flow Steps |
|------------|--------|------------|
| [Transition 1] | `[method1]()` | Steps [X-Y] |
| [Transition 2] | `[method2]()` | Steps [Y-Z] |

---

## 📦 Implementation Phases

### Phase 0: Define E2E Contract (Outside-In)

**Goal:** Define the complete user journey as a failing E2E test.

#### Tasks

**Step 1: Write E2E Test**
- [ ] Write E2E test for complete flow: [Flow Name]
- [ ] Document acceptance criteria from flow documentation
- [ ] Identify key journey steps from [journey-XX-[name].md]
- [ ] Define success criteria (what makes E2E pass)

**Step 2: Run E2E (Expected to Fail)**
- [ ] Run E2E test → Should FAIL (no implementation yet)
- [ ] Document what's missing
- [ ] Use this as the "North Star" for the project

#### Deliverables
- [ ] `tests/e2e/[flow-name].spec.[ext]` - E2E test that defines the goal
- [ ] E2E test documentation (acceptance criteria)
- [ ] Initial failure report (what's missing)

---

### Phase 1: Core Domain (Inside-Out)

**Goal:** Implement domain model with entities, value objects, and domain services using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Value Object Tests**
   - [ ] Test `[ValueObject1]` - [specific behavior]
   - [ ] Test `[ValueObject2]` - [specific behavior]
   - [ ] Test `[ValueObject3]` - [specific behavior]
   - [ ] Test edge cases (invalid inputs, boundary conditions)

2. **Entity Tests**
   - [ ] Test `create()` produces correct initial state
   - [ ] Test state transitions (method1, method2, etc.)
   - [ ] Test invalid state transitions throw errors
   - [ ] Test invariants are enforced

3. **Domain Service Tests**
   - [ ] Test [business rule] validation
   - [ ] Test [business rule] validation

**Step 2: Implement to Pass Tests**
1. **Value Objects**
   - [ ] Implement `[ValueObject1]`
   - [ ] Implement `[ValueObject2]`
   - [ ] Implement `[ValueObject3]`

2. **Entity: [EntityName]**
   - [ ] Implement aggregate root with state machine
   - [ ] Implement domain methods
   - [ ] Implement domain events

3. **Entity: [ChildEntityName]**
   - [ ] Implement child entity
   - [ ] Implement methods

4. **Domain Services**
   - [ ] Implement `[DomainService]`

**Step 3: Verify**
- [ ] Run tests: `<test command>`
- [ ] All tests pass
- [ ] Coverage ≥ 95% for domain layer

#### Deliverables
- [ ] `modules/[context]/entities/[entity].[ext]`
- [ ] `modules/[context]/entities/[child-entity].[ext]`
- [ ] `modules/[context]/value-objects/*.[ext]` (8 files)
- [ ] `modules/[context]/services/[domain-service].[ext]`
- [ ] `tests/unit/[context]/value-objects/*.test.[ext]`
- [ ] `tests/unit/[context]/entities/*.test.[ext]`

---

### Phase 2: Domain Interfaces

**Goal:** Implement repository interfaces and domain event system using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Repository Interface Tests (Mocked)**
   - [ ] Test `findById()` returns correct entity
   - [ ] Test `findBySlug()` returns correct entity
   - [ ] Test `save()` persists aggregate
   - [ ] Test error handling (not found, etc.)

2. **Domain Event Tests**
   - [ ] Test event types are correctly structured
   - [ ] Test event publisher interface

3. **Exception Tests**
   - [ ] Test `Invalid[Entity]Error` is thrown correctly
   - [ ] Test other custom errors

**Step 2: Implement to Pass Tests**
1. **Repository Interface**
   - [ ] Implement `[Entity]Repository` interface

2. **Domain Event System**
   - [ ] Create domain event types
   - [ ] Implement event publisher interface

3. **Domain Exception System**
   - [ ] Implement custom error classes

**Step 3: Verify**
- [ ] Run tests: `<test command>`
- [ ] All tests pass
- [ ] Coverage ≥ 90%

#### Deliverables
- [ ] `modules/[context]/repositories/[entity]-repository.[ext]`
- [ ] `modules/[context]/events/*.[ext]` (8 event types)
- [ ] `modules/[context]/exceptions/*.[ext]` (6 error classes)
- [ ] `tests/unit/[context]/repository-interface.test.[ext]`
- [ ] `tests/unit/[context]/events.test.[ext]`

---

### Phase 3: Infrastructure & Application (CQRS Pattern)

**Goal:** Implement database layer and CQRS handlers using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Command Tests (Mocked Repository)**
   - [ ] Test `[CreateResource]` command happy path
   - [ ] Test `[CreateResource]` command error paths (validation, conflicts, etc.)
   - [ ] Test `[UpdateResource]` command
   - [ ] Test validation failures
   - [ ] Test domain event publishing

2. **Query Tests (Mocked Repository)**
   - [ ] Test `[GetResource]` query returns correct data
   - [ ] Test `[ListResources]` query returns list
   - [ ] Test query error handling

3. **Repository Integration Tests**
   - [ ] Test `save()` persists correctly
   - [ ] Test `findById()` retrieves correctly
   - [ ] Test transaction support

**Step 2: Implement to Pass Tests**
1. **Database Schema**
   - [ ] Create `[resources]` table with RLS
   - [ ] Create `[child-table]` table with foreign keys

2. **Database Client Setup**
   - [ ] Implement database client
   - [ ] Configure access policies

3. **Repository Implementation**
   - [ ] Implement `[Entity]Repository` with all methods
   - [ ] Add transaction support

4. **CQRS Implementation**
   - [ ] Implement `[CreateResource]` command definition
   - [ ] Implement `[CreateResource]` command handler
   - [ ] Implement `[CreateResource]` response DTO
   - [ ] Implement `[GetResource]` query definition
   - [ ] Implement `[GetResource]` query handler
   - [ ] Implement `[GetResource]` response DTO
   - [ ] Implement additional commands/queries as needed

**Step 3: Verify**
- [ ] Run tests: `<test command>`
- [ ] All tests pass
- [ ] Integration tests pass

#### Deliverables
- [ ] Database migration files
- [ ] RLS policies defined
- [ ] `modules/[context]/infrastructure/database/[entity]-repository.[ext]`
- [ ] `modules/[context]/application/commands/[command-name]/` (command, handler, DTO)
- [ ] `modules/[context]/application/queries/[query-name]/` (query, handler, DTO)
- [ ] `modules/[context]/application/dto/` (shared DTOs)
- [ ] `tests/integration/[context]/repository.test.[ext]`
- [ ] `tests/unit/[context]/commands/*.test.[ext]`
- [ ] `tests/unit/[context]/queries/*.test.[ext]`

---

### Phase 4: RESTful API with CQRS Integration

**Goal:** Implement API endpoints that use CQRS handlers using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **API Endpoint Tests (Mocked CQRS Handlers)**
   - [ ] Test `POST /api/v1/[resource]s` creates resource via command
   - [ ] Test `GET /api/v1/[resource]s` returns list via query
   - [ ] Test `GET /api/v1/[resource]s/:id` returns resource via query
   - [ ] Test `PATCH /api/v1/[resource]s/:id` updates via command
   - [ ] Test `DELETE /api/v1/[resource]s/:id` deletes via command
   - [ ] Test authentication/authorization errors
   - [ ] Test validation errors
   - [ ] Test proper response DTOs returned

**Step 2: Implement to Pass Tests**
1. **API Structure**
   - [ ] Implement `/api/v1/[resource]s` - POST (command), GET (query)
   - [ ] Implement `/api/v1/[resource]s/:id` - GET (query), PATCH (command), DELETE (command)
   - [ ] Implement error response format
   - [ ] Integrate CQRS handlers into API controllers

2. **Authentication**
   - [ ] Verify user authorization
   - [ ] RLS integration

3. **Request Validation**
   - [ ] Implement Zod validation schemas
   - [ ] Map request to Command/Query objects

**Step 3: Verify**
- [ ] Run tests: `<test command>`
- [ ] All API tests pass
- [ ] Response times <200ms (P95)

#### Deliverables
- [ ] API endpoints with proper status codes
- [ ] Validation schemas for request/response
- [ ] `tests/api/[context]/[resource].test.[ext]`
- [ ] API documentation (OpenAPI format)
- [ ] `modules/[context]/interfaces/api/v1/[resource]/[controller].ts`

---

### Phase 5: User Interface

**Goal:** Implement user interface layer using TDD (technology to be determined).

#### Tasks

**Step 1: Write Tests First**
1. **Component/View Tests**
   - [ ] Test `[Resource]CreationForm` renders correctly
   - [ ] Test form validation
   - [ ] Test form submission
   - [ ] Test error handling

2. **Page/View Tests**
   - [ ] Test `[Resource]List` view renders list
   - [ ] Test `[Resource]Creation` view renders form
   - [ ] Test `[Resource]Detail` view renders details

**Step 2: Implement to Pass Tests**
1. **Resource List & Creation**
   - [ ] Implement `[Resource]List` - List resources view
   - [ ] Implement `[Resource]Creation` - Resource creation form
   - [ ] Implement resource list with status indicators
   - [ ] Implement form validation

2. **Resource Dashboard**
   - [ ] Implement `[Resource]Detail` - Resource overview
   - [ ] Implement resource status display
   - [ ] Implement quick actions

**Step 3: Verify**
- [ ] Run tests: `<test command>`
- [ ] All component tests pass
- [ ] Component coverage ≥ 80%

#### Deliverables
- [ ] UI pages/views
- [ ] Reusable components
- [ ] Form validation
- [ ] `tests/components/[context]/[resource].test.[ext]`
- [ ] Component tests
- [ ] `modules/[context]/interfaces/web/[resource]/[view-component].[ext]`

---

### Phase 6: Validate E2E & Refinement (Outside-In)

**Goal:** Validate complete flow with E2E test from Phase 0 and achieve comprehensive coverage.

#### Tasks

**Step 1: Run E2E Test (From Phase 0)**
1. **Execute E2E**
   - [ ] Run E2E test: [Flow Name]
   - [ ] Check if E2E PASSES
   - [ ] If FAILS, identify missing pieces

2. **Fix Remaining Issues**
   - [ ] Fix any failing E2E steps
   - [ ] Address edge cases not covered
   - [ ] Validate error scenarios

**Step 2: Integration Tests**
1. **Integration Tests**
   - [ ] Test complete [entity] lifecycle: DRAFT → COMPLETED
   - [ ] Test state transition validation
   - [ ] Test error path coverage

**Step 3: Final Validation**
- [ ] Run E2E: `<e2e command>` - Should PASS
- [ ] Run tests: `<test command>`
- [ ] Run lint: `<lint command>`
- [ ] Run typecheck: `<typecheck command>`
- [ ] All checks pass

#### Deliverables
- [ ] E2E test suite (`tests/e2e/[flow-name].spec.[ext]`) - **NOW PASSING**
- [ ] Test coverage reports (≥80% overall)
- [ ] User testing feedback incorporated
- [ ] Final documentation

---

## 🚨 Key Constraints & Considerations

### From Project Guidelines
- [Fill in relevant constraints from AGENTS.md or project documentation]
- [Example: [ADR-[XXX]] Specific constraint description]
- [Example: [ADR-[XXX]] Specific constraint description]

### From Flow Documentation
- Flow steps must be implemented in order
- Each step may create/update entities
- Flow validation ensures correct state transitions
- E2E tests validate complete flow completion
- Multiple features may contribute to a single flow

### From Technical Architecture
*Based on ADR index review, list the technical architecture decisions that apply to this flow.*

- [Fill from ADR index - e.g., API design pattern, Database strategy, Authentication approach, etc.]
- [Fill from ADR index - e.g., Validation strategy, Data access pattern, etc.]
- [Fill from ADR index - e.g., Any other relevant technical decisions]

---

## 🎯 Success Criteria

### Functional
- [ ] Can create [resource] in [initial state] state
- [ ] Can transition through all states to [final state]
- [ ] Can [cancel/delete] [resource] ([allowed states] only)
- [ ] All domain invariants enforced
- [ ] All flow steps completed successfully
- [ ] [Fill from ADR index - e.g., Architecture pattern compliance]

### Non-Functional
- [ ] 95%+ test coverage for domain
- [ ] 90%+ for application layer
- [ ] API response <200ms (P95)
- [ ] [Fill from ADR index - e.g., Architecture pattern compliance]
- [ ] [Fill from ADR index - e.g., Data access pattern compliance]
- [ ] Zero data corruption incidents
- [ ] Zero unauthorized access incidents

---

## 🔗 Related Documentation

- [Bounded Context README](./README.md)
- [Entity Documentation](./entities/[entity].md)
- [Child Entity Documentation](./entities/[child-entity].md)
- **Flow Documentation:** [./flows/[flow-filename].md](./flows/[flow-filename].md)
- [Architecture Decision Records](../../adr/)

---

*This development plan is derived from the project's ADRs and domain specifications.*
*Last updated: [Date]*