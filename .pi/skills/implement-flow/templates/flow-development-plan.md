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

### Project Layout

```
src/
├── domains/
│   └── [context]/
│       ├── entities/
│       │   ├── [entity].ts           # Entity name
│       │   └── [child-entity].ts     # Child entity
│       ├── value-objects/
│       │   ├── [vo1].ts              # Value object
│       │   ├── [vo2].ts              # Value object
│       │   └── ...                   # More value objects
│       ├── services/
│       │   └── [domain-service].ts   # Business rules
│       └── repositories/
│           └── [entity]-repository.ts   # Interface
│
├── application/
│   └── [context]/
│       ├── use-cases/
│       │   ├── [use-case].ts         # POST /api/v1/[resource]
│       │   └── ...                   # More use cases
│       └── dto/                      # Request/Response types
│           ├── [resource]-dto.ts
│           └── ...
│
├── infrastructure/
│   └── database/
│       └── [entity]-repository.ts    # Supabase implementation
│
└── interfaces/
    └── web/
        └── (dashboard)/
            ├── [resource]/
            │   ├── new/
            │   │   └── page.tsx      # Creation form
            │   └── [id]/
            │       ├── page.tsx      # Details page
            │       └── ...           # Sub-pages
        └── api/
            └── v1/
                └── [resource]s/
                    ├── route.ts      # List & create
                    └── [id]/
                        └── route.ts  # Read, update, delete
```

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
- [ ] Run tests: `npm test`
- [ ] All tests pass
- [ ] Coverage ≥ 95% for domain layer

#### Deliverables
- [ ] `domains/[context]/entities/[entity].ts`
- [ ] `domains/[context]/entities/[child-entity].ts`
- [ ] `domains/[context]/value-objects/*.ts` (8 files)
- [ ] `domains/[context]/services/[domain-service].ts`
- [ ] `tests/unit/[context]/value-objects/*.test.ts`
- [ ] `tests/unit/[context]/entities/*.test.ts`

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
- [ ] Run tests: `npm test`
- [ ] All tests pass
- [ ] Coverage ≥ 90%

#### Deliverables
- [ ] `domains/[context]/repositories/[entity]-repository.ts`
- [ ] `domains/[context]/events/*.ts` (8 event types)
- [ ] `domains/[context]/exceptions/*.ts` (6 error classes)
- [ ] `tests/unit/[context]/repository-interface.test.ts`
- [ ] `tests/unit/[context]/events.test.ts`

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

2. **Supabase Client Setup**
   - [ ] Implement `infrastructure/database/supabase-client.ts`
   - [ ] Configure RLS policies

3. **Repository Implementation**
   - [ ] Implement `[Entity]Repository` with all methods
   - [ ] Add transaction support

4. **Use Cases**
   - [ ] Implement `[CreateResource]` use case
   - [ ] Implement `[UpdateResource]` use case

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All tests pass
- [ ] Integration tests pass

#### Deliverables
- [ ] Database migration files
- [ ] RLS policies defined
- [ ] `infrastructure/database/[entity]-repository.ts`
- [ ] `application/[context]/use-cases/*.ts` (6-8 use cases)
- [ ] `tests/integration/[context]/repository.test.ts`
- [ ] `tests/unit/[context]/use-cases/*.test.ts`

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
- [ ] Run tests: `npm test`
- [ ] All API tests pass
- [ ] Response times <200ms (P95)

#### Deliverables
- [ ] API endpoints with proper status codes
- [ ] Zod schemas for request/response
- [ ] `tests/api/[context]/[resource].test.ts`
- [ ] API documentation (OpenAPI format)

---

### Phase 5: Frontend

**Goal:** Implement Next.js pages and components using TDD.

#### Tasks

**Step 1: Write Tests First**
1. **Component Tests**
   - [ ] Test `[Resource]CreationForm` renders correctly
   - [ ] Test form validation with Zod
   - [ ] Test form submission
   - [ ] Test error handling

2. **Page Tests**
   - [ ] Test `/dashboard/[resource]s` renders list
   - [ ] Test `/dashboard/[resource]s/new` renders form
   - [ ] Test `/dashboard/[resource]s/[id]` renders details

**Step 2: Implement to Pass Tests**
1. **Resource List & Creation**
   - [ ] Implement `/dashboard/[resource]s` - List resources table
   - [ ] Implement `/dashboard/[resource]s/new` - Resource creation form
   - [ ] Implement resource table with status badges
   - [ ] Implement Zod form validation with React Hook Form

2. **Resource Dashboard**
   - [ ] Implement `/dashboard/[resource]s/[id]` - Resource overview
   - [ ] Implement resource status display
   - [ ] Implement quick actions

**Step 3: Verify**
- [ ] Run tests: `npm test`
- [ ] All component tests pass
- [ ] Component coverage ≥ 80%

#### Deliverables
- [ ] Next.js pages and layouts
- [ ] Reusable components
- [ ] Zod form validation
- [ ] `tests/components/[context]/[resource].test.tsx`
- [ ] Component tests (React Testing Library)

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
- [ ] Run tests: `npm test`
- [ ] Run E2E: `npm run test:e2e`
- [ ] Run lint: `npm run lint`
- [ ] Run typecheck: `npm run typecheck`
- [ ] All checks pass

#### Deliverables
- [ ] Test coverage reports (≥80% overall)
- [ ] E2E test suite (`tests/e2e/[flow-name].spec.ts`)
- [ ] User testing feedback incorporated
- [ ] Final documentation

---

## 🚨 Key Constraints & Considerations

### From ADR-009 (DDD)
- Domain entities use methods, not public setters
- Value objects encapsulate validation
- Repository pattern for infrastructure abstraction

### From ADR-007 (Zod)
- Client-side validation before API calls
- Server-side validation in API routes
- Zod schemas in `lib/validations/`

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

### From ADR-002 (Supabase)
- RLS for [context] isolation
- PostgreSQL foreign keys for relationships
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