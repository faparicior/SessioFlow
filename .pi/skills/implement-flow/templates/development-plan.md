# [Flow Name] - Development Plan

* **Date:** YYYY-MM-DD
* **Status:** 📋 **Planning Phase**
* **Flow:** [Flow filename] (e.g., `journey-01-setup-event.md`)
* **Context:** [Bounded Context] (see [README](./README.md))

---

## 🎯 Overview

This document outlines the development plan for implementing **[Flow Name]** in SessioFlow.

**Flow Description:** [Brief description of the user journey or flow]

**Related Flow Documentation:** See `flows/[flow-filename].md` for complete user journey details.

**Associated Features:**
| Feature | Description | Status |
|---------|-------------|--------|
| [Feature 1] | [Brief description] | 📋 Planned |
| [Feature 2] | [Brief description] | 📋 Planned |
| ... | ... | ... |

---

## 📋 Prerequisites (Already Decided in ADRs)

| ADR | Decision | Status | Impact |
|-----|----------|--------|--------|
| 001 | Next.js (App Router) | ✅ Approved | Frontend framework |
| 002-01 | Supabase with DDD Abstraction | ✅ Approved | Database backend |
| 006 | RESTful API Design | ✅ Approved | API structure |
| 007 | Zod Validation | ✅ Approved | Input validation |
| 008 | Comprehensive Testing | ✅ Approved | Testing strategy |
| 009 | Domain-Driven Design | ✅ Approved | Project structure |
| 013 | TypeScript Strict Mode | ✅ Approved | Type safety |

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

**Goal:** Implement domain model with entities, value objects, and domain services.

#### Tasks

1. **Value Objects**
   - [ ] `[ValueObject1]` - [description]
   - [ ] `[ValueObject2]` - [description]
   - [ ] `[ValueObject3]` - [description]
   - [ ] ... (up to 8 value objects)

2. **Entity: [EntityName]**
   - [ ] Implement aggregate root with state machine
   - [ ] Domain methods: `method1()`, `method2()`, etc.
   - [ ] Domain events: `EventCreated`, `EventUpdated`, etc.
   - [ ] Invariants: [list invariants]

3. **Entity: [ChildEntityName]**
   - [ ] Child entity with [states]
   - [ ] Methods: `method1()`, `method2()`
   - [ ] Invariants: [list invariants]

4. **Domain Services**
   - [ ] `[DomainService]` - business rule validation
   - [ ] [business rule] check
   - [ ] [business rule] check

#### Deliverables
- [ ] `domains/[context]/entities/[entity].ts`
- [ ] `domains/[context]/entities/[child-entity].ts`
- [ ] `domains/[context]/value-objects/*.ts` (8 files)
- [ ] `domains/[context]/services/[domain-service].ts`
- [ ] Unit tests for all domain objects (Vitest)

---

### Phase 2: Domain Interfaces

**Goal:** Implement repository interfaces and domain event system.

#### Tasks

1. **Repository Interface**
   - [ ] `[Entity]Repository` interface in `domains/[context]/repositories/`
   - [ ] Methods: `findById`, `findBySlug`, `findBy[Field]`, `findByStatus`, `save`, `delete`

2. **Domain Event System**
   - [ ] Create domain event types
   - [ ] Event publisher interface
   - [ ] Event listeners setup

3. **Domain Exception System**
   - [ ] Custom error classes:
     - [ ] `Invalid[Entity]Error`
     - [ ] `Invalid[ChildEntity]Error`
     - [ ] `[Entity]NotFoundError`
     - [ ] [Other errors]

#### Deliverables
- [ ] `domains/[context]/repositories/[entity]-repository.ts`
- [ ] `domains/[context]/events/*.ts` (8 event types)
- [ ] `domains/[context]/exceptions/*.ts` (6 error classes)
- [ ] Unit tests for domain events and exceptions

---

### Phase 3: Infrastructure & Application

**Goal:** Implement database layer and use cases.

#### Tasks

1. **Database Schema**
   - [ ] `[resources]` table with RLS
   - [ ] `[child-table]` table with foreign keys

2. **Supabase Client Setup**
   - [ ] `infrastructure/database/supabase-client.ts`
   - [ ] RLS policies for [context] isolation
   - [ ] Row-level security setup

3. **Repository Implementation**
   - [ ] `[Entity]Repository` with all methods
   - [ ] Transaction support for aggregate persistence
   - [ ] Soft delete handling

4. **Use Cases**
   - [ ] `[CreateResource]` use case
   - [ ] `[UpdateResource]` use case
   - [ ] `[DeleteResource]` use case
   - [ ] [More use cases]

#### Deliverables
- [ ] Database migration files
- [ ] RLS policies defined
- [ ] `infrastructure/database/[entity]-repository.ts`
- [ ] `application/[context]/use-cases/*.ts` (6-8 use cases)
- [ ] Unit tests for repository and use cases

---

### Phase 4: RESTful API

**Goal:** Implement API endpoints following RESTful conventions.

#### Tasks

1. **API Structure**
   - [ ] `/api/v1/[resource]s` - GET, POST
   - [ ] `/api/v1/[resource]s/:id` - GET, PATCH, DELETE
   - [ ] Error response format

2. **Resource Endpoints**
   - [ ] `GET /api/v1/[resource]s` - List resources
   - [ ] `POST /api/v1/[resource]s` - Create resource
   - [ ] `GET /api/v1/[resource]s/:id` - Get resource details
   - [ ] `PATCH /api/v1/[resource]s/:id` - Update resource
   - [ ] `DELETE /api/v1/[resource]s/:id` - Delete resource

3. **Authentication**
   - [ ] Verify user authorization
   - [ ] RLS integration
   - [ ] Error responses

#### Deliverables
- [ ] API endpoints with proper status codes
- [ ] Zod schemas for request/response
- [ ] Unit tests for each endpoint
- [ ] API documentation (OpenAPI format)

---

### Phase 5: Frontend

**Goal:** Implement Next.js pages and components.

#### Tasks

1. **Resource List & Creation**
   - [ ] `/dashboard/[resource]s` - List resources table
   - [ ] `/dashboard/[resource]s/new` - Resource creation form
   - [ ] Resource table with status badges
   - [ ] Zod form validation with React Hook Form

2. **Resource Dashboard**
   - [ ] `/dashboard/[resource]s/[id]` - Resource overview
   - [ ] Resource status display
   - [ ] Quick actions
   - [ ] Navigation to related pages

#### Deliverables
- [ ] Next.js pages and layouts
- [ ] Reusable components
- [ ] Zod form validation
- [ ] Component unit tests (React Testing Library)

---

### Phase 6: Testing & Refinement

**Goal:** Achieve comprehensive test coverage and validate flow completion.

#### Tasks

1. **Unit Tests**
   - [ ] Domain objects: 95% coverage
   - [ ] Use cases: 90% coverage
   - [ ] Value objects: 100% coverage

2. **Integration Tests**
   - [ ] Complete [entity] lifecycle: DRAFT → COMPLETED
   - [ ] State transition validation
   - [ ] Error path testing

3. **E2E Tests**
   - [ ] **Flow E2E:** [Flow Name] - Complete user journey validation
   - [ ] Journey steps: [List key steps from flow documentation]
   - [ ] Error scenarios

4. **Refinement**
   - [ ] Performance optimization
   - [ ] Error handling polish
   - [ ] Documentation updates

#### Deliverables
- [ ] Test coverage reports
- [ ] E2E test suite
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