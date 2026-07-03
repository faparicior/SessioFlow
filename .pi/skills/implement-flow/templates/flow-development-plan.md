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

## 📋 Prerequisites

*Note: Add relevant ADRs that apply to this flow/feature.*

| ADR | Decision | Status | Impact |
|-----|----------|--------|--------|
| [ADR-XXX] | [Decision name] | ✅ Approved | [Impact area] |
| [ADR-XXX] | [Decision name] | ✅ Approved | [Impact area] |
| [ADR-XXX] | [Decision name] | ✅ Approved | [Impact area] |

---

## 🏗️ DDD Structure - [Bounded Context]

### Project Layout (Technology-Agnostic)

```
src/
├── domain/                    # Business logic (vendor-agnostic)
│   └── [context]/
│       ├── entities/
│       │   ├── [entity].[ext]           # Entity name
│       │   └── [child-entity].[ext]     # Child entity
│       ├── value-objects/
│       │   ├── [vo1].[ext]              # Value object
│       │   └── [vo2].[ext]              # Value object
│       ├── services/
│       │   └── [domain-service].[ext]   # Business rules
│       └── repositories/
│           └── [entity]-repository.[ext]   # Interface
│
├── application/               # Use cases
│   └── [context]/
│       ├── use-cases/
│       │   └── [use-case].[ext]         # Business logic
│       └── dto/                      # Request/Response types
│           └── [resource]-dto.[ext]
│
├── infrastructure/            # External implementations
│   ├── external/              # Email, payments, etc.
│   └── database/              # Database implementations
│       └── [entity]-repository.[ext]    # Concrete implementation
│
└── interfaces/                # Entry points (API, UI, CLI, etc.)
    ├── api/                   # API endpoints
    │   └── v1/
    │       └── [resource]/
    │           └── [route-handler].[ext]
    └── web/                   # Web UI (technology TBD)
        └── [resource]/
            └── [view-component].[ext]
```

*Note: `[ext]` represents the language-specific file extension (e.g., `.ts`, `.kt`, `.java`)*

*Note: File extensions and specific technologies will be determined during implementation.*

---

## 🗺️ [Primary Entity] Lifecycle (State Machine)

[Include state machine diagram for the main entity in this flow]

---

## 📦 Implementation Phases

### Phase 1: Core Domain

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
- [ ] `domains/[context]/entities/[entity].[ext]`
- [ ] `domains/[context]/entities/[child-entity].[ext]`
- [ ] `domains/[context]/value-objects/*.`[ext] (8 files)
- [ ] `domains/[context]/services/[domain-service].[ext]`
- [ ] `tests/unit/[context]/value-objects/*.test.`[ext]
- [ ] `tests/unit/[context]/entities/*.test.`[ext]

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
- [ ] `domains/[context]/repositories/[entity]-repository.[ext]`
- [ ] `domains/[context]/events/*.`[ext] (8 event types)
- [ ] `domains/[context]/exceptions/*.`[ext] (6 error classes)
- [ ] `tests/unit/[context]/repository-interface.test.`[ext]
- [ ] `tests/unit/[context]/events.test.`[ext]

---

### Phase 3: Infrastructure & Application

**Goal:** Implement database layer and use cases using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Use Case Tests (Mocked Repository)**
   - [ ] Test `[CreateResource]` use case happy path
   - [ ] Test `[CreateResource]` use case error paths
   - [ ] Test `[UpdateResource]` use case
   - [ ] Test validation failures

2. **Repository Integration Tests**
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

4. **Use Cases**
   - [ ] Implement `[CreateResource]` use case
   - [ ] Implement `[UpdateResource]` use case

**Step 3: Verify**
- [ ] Run tests: `<test command>`
- [ ] All tests pass
- [ ] Integration tests pass

#### Deliverables
- [ ] Database migration files
- [ ] RLS policies defined
- [ ] `infrastructure/database/[entity]-repository.[ext]`
- [ ] `application/[context]/use-cases/*.`[ext] (6-8 use cases)
- [ ] `tests/integration/[context]/repository.test.`[ext]
- [ ] `tests/unit/[context]/use-cases/*.test.`[ext]

---

### Phase 4: RESTful API

**Goal:** Implement API endpoints using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **API Endpoint Tests (Mocked Use Cases)**
   - [ ] Test `GET /api/v1/[resource]s` returns list
   - [ ] Test `POST /api/v1/[resource]s` creates resource
   - [ ] Test `GET /api/v1/[resource]s/:id` returns resource
   - [ ] Test `PATCH /api/v1/[resource]s/:id` updates resource
   - [ ] Test `DELETE /api/v1/[resource]s/:id` deletes resource
   - [ ] Test authentication/authorization errors
   - [ ] Test validation errors

**Step 2: Implement to Pass Tests**
1. **API Structure**
   - [ ] Implement `/api/v1/[resource]s` - GET, POST
   - [ ] Implement `/api/v1/[resource]s/:id` - GET, PATCH, DELETE
   - [ ] Implement error response format

2. **Authentication**
   - [ ] Verify user authorization
   - [ ] RLS integration

**Step 3: Verify**
- [ ] Run tests: `<test command>`
- [ ] All API tests pass
- [ ] Response times <200ms (P95)

#### Deliverables
- [ ] API endpoints with proper status codes
- [ ] Validation schemas for request/response
- [ ] `tests/api/[context]/[resource].test.`[ext]
- [ ] API documentation (OpenAPI format)

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
- [ ] `tests/components/[context]/[resource].test.`[ext]
- [ ] Component tests

---

### Phase 6: E2E Testing & Refinement

**Goal:** Validate complete flow and achieve comprehensive coverage.

#### Tasks

**Step 1: Write E2E Tests First**
1. **Flow E2E Tests**
   - [ ] Test complete user journey: [Flow Name]
   - [ ] Test each journey step from flow documentation
   - [ ] Test error scenarios

2. **Integration Tests**
   - [ ] Test complete [entity] lifecycle: DRAFT → COMPLETED
   - [ ] Test state transition validation
   - [ ] Test error path coverage

**Step 2: Verify & Refine**
1. **Run E2E Tests**
   - [ ] All E2E tests pass
   - [ ] Fix any failing tests

2. **Refinement**
   - [ ] Performance optimization
   - [ ] Error handling polish
   - [ ] Documentation updates

**Step 3: Final Validation**
- [ ] Run tests: `<test command>`
- [ ] Run E2E: `<e2e command>`
- [ ] Run lint: `<lint command>`
- [ ] Run typecheck: `<typecheck command>`
- [ ] All checks pass

#### Deliverables
- [ ] Test coverage reports (≥80% overall)
- [ ] E2E test suite (`tests/e2e/[flow-name].spec.`[ext])
- [ ] User testing feedback incorporated
- [ ] Final documentation

---

## 🚨 Key Constraints & Considerations

### From ADR-009 (DDD)
- Domain entities use methods, not public setters
- Value objects encapsulate validation
- Repository pattern for infrastructure abstraction

### From ADR-007 (Validation)
- Client-side validation before API calls
- Server-side validation in API routes
- Validation schemas in `lib/validations/`

### From Flow Documentation
- Flow steps must be implemented in order
- Each step may create/update entities
- Flow validation ensures correct state transitions
- E2E tests validate complete flow completion
- Multiple features may contribute to a single flow

### From ADR-006 (REST)
- Resource-based URLs
- HTTP verbs for actions
- Standard status codes (200, 201, 400, 404, 409)

### From ADR-002 (Database)
- RLS for [context] isolation
- Database foreign keys for relationships
- Soft delete with `deleted_at` column

---

## 🎯 Success Criteria

### Functional
- [ ] Can create [resource] in [initial state] state
- [ ] Can transition through all states to [final state]
- [ ] Can [cancel/delete] [resource] ([allowed states] only)
- [ ] All domain invariants enforced
- [ ] All flow steps completed successfully

### Non-Functional
- [ ] 95%+ test coverage for domain
- [ ] 90%+ for use cases
- [ ] API response <200ms (P95)
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