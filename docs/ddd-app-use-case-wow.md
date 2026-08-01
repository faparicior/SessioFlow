# 🎯 DDD Application Layer - `conference` (Generic Guidelines)

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
   - [1. Layer Responsibility](#1-layer-responsibility)
   - [2. Package Structure Convention](#2-package-structure-convention)
4. [📐 Command Patterns](#-command-patterns)
5. [🔄 Use Case Patterns](#-use-case-patterns)
6. [🛠️ Implementation Guidelines](#️-implementation-guidelines)
7. [⚠️ Error Handling Strategy](#️-error-handling-strategy)
8. [🧪 Testing Approach](#-testing-approach)
9. [⚡ Performance Considerations](#-performance-considerations)
10. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
11. [Summary](#summary)
12. [Pattern Index](#pattern-index)
13. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Module / Package(s):** `conference`  
**Description:** Application layer module responsible for orchestrating conference lifecycle operations, including creation, retrieval, and state management.  
**Responsibility:** Mediate between UI/infrastructure and domain aggregates, enforce transaction boundaries, validate input, and coordinate domain services/repositories.

**Domain Purpose:** Manage conference creation, retrieval, and lifecycle state transitions while maintaining business rule validation, external service coordination, and read/write separation.

**Architecture Layer:** Application Layer - Application Services & CQRS Handlers

---

## 🏗️ Architecture Position

```
Web/Mobile Frontend, API Gateway → UI Layer (conference) → Application Layer (Commands, Queries, Handlers) → Domain Layer (Aggregates, Value Objects, Domain Services) → Infrastructure Layer (Repositories, External APIs, DB)
```

The `conference` layer sits at the system boundary, acting as the entry point for business operations while maintaining proper separation of concerns and ensuring that domain logic remains isolated from technical infrastructure details.

---

## 📋 Architecture Rules

### 1. Layer Responsibility

- **Purpose**: Orchestrate use cases, validate input, manage transaction boundaries, and coordinate domain aggregates. Never contain core business logic.
- **Dependencies**: Allowed to import from Domain Layer (aggregates, value objects, domain services, repository interfaces) and Infrastructure Layer (repository implementations, external service clients).
- **Restrictions**: Must NOT import from UI/Controllers directly, must NOT contain business rules (move to Domain), must NOT handle HTTP/transport details, must NOT access persistence logic directly.

### 2. Package Structure Convention

`src/application/` follows a CQRS-aligned structure with `commands/` and `queries/` subdirectories, each containing an aggregate-specific folder with command/query carriers and their respective handlers.

```text
src/application/
├── commands/
│   └── create-conference/
│       ├── create-conference.command.ts
│       └── create-conference.handler.ts
├── queries/
│   └── get-conference/
│       ├── get-conference.query.ts
│       └── get-conference.handler.ts
├── exceptions/
│   └── application.exception.ts
└── index.ts
```

Examples:

- `src/application/commands/create-conference/create-conference.command.ts` [c4f8a9b2d1e3] — Defines intent, payload, and metadata for conference creation
- `src/application/commands/create-conference/create-conference.handler.ts` [a7b3c9d2e5f1] — Orchestrates creation flow, validates input, persists aggregate
- `src/application/queries/get-conference/get-conference.query.ts` [d8e2f4a1c6b9] — Defines read intent and projection parameters
- `src/application/queries/get-conference/get-conference.handler.ts` [b1c5d7e9f3a4] — Coordinates read operations, applies projection/cache layer

---

## 📐 Command Patterns

### Command rules by Category

#### Application Layer - Command Operations

##### Rule UC-CMD-01: Command Carrier Pattern

**✅ GOOD - Intent-focused DTO with metadata:**

```typescript
// create-conference.command.ts
import { Command } from '@ddd/application';

export class CreateConferenceCommand extends Command {
  constructor(
    public readonly organizerId: string,
    public readonly name: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly requestId: string,
  ) {
    super({ requestId });
  }
}
```

**Source**: [c4f8a9b2d1e3] create-conference.command.ts

**Key Benefits:**
- **Single Responsibility**: Encapsulates all data required for one business action
- **Metadata Enrichment**: Carries tracing, tenant, and audit context
- **Framework Agnostic**: Decouples business intent from transport layer

**❌ BAD - Raw DTO or Controller-like Object:**

```typescript
// ❌ BAD: Merging request body directly into command
export class CreateConferencePayload {
  organizerId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  // Missing requestId, missing inheritance from Command base
}
```

**Why it's bad:**
- Loses command metadata and tracing capabilities
- Couples transport contract to application intent
- Makes testing and mocking harder

---

##### Rule UC-CMD-02: Handler Orchestration Pattern

**✅ GOOD - Stateless handler coordinating domain operations:**

```typescript
// create-conference.handler.ts
import { CommandHandler, ICommandHandler } from '@ddd/application';
import { CreateConferenceCommand } from './create-conference.command';
import { ConferenceRepository } from '../../domain/repositories/conference.repository';
import { ConferenceFactory } from '../../domain/factories/conference.factory';

@CommandHandler(CreateConferenceCommand)
export class CreateConferenceHandler implements ICommandHandler<CreateConferenceCommand> {
  constructor(private readonly conferenceRepo: ConferenceRepository) {}

  async execute(command: CreateConferenceCommand) {
    const conference = ConferenceFactory.create({
      organizerId: command.organizerId,
      name: command.name,
      startDate: command.startDate,
      endDate: command.endDate,
    });

    await this.conferenceRepo.save(conference);
    return conference.getId();
  }
}
```

**Source**: [a7b3c9d2e5f1] create-conference.handler.ts

**Key Benefits:**
- **Stateless Execution**: Handlers are instantiated per request, ensuring thread safety
- **Clear Orchestration**: Separates validation, domain creation, and persistence
- **Testable**: Easy to mock dependencies and verify domain calls

**❌ BAD - God Handler with Business Logic:**

```typescript
// ❌ BAD: Embedding business rules inside handler
@CommandHandler(CreateConferenceCommand)
export class CreateConferenceHandler implements ICommandHandler<CreateConferenceCommand> {
  async execute(command: CreateConferenceCommand) {
    if (command.startDate < new Date()) {
      throw new Error('Invalid date'); // ❌ Should use domain exception
    }
    // ❌ Direct SQL/ORM manipulation
    await this.db.query('INSERT INTO conferences...');
  }
}
```

**Why it's bad:**
- Violates Single Responsibility Principle
- Hardcodes business rules that belong in aggregates
- Couples to persistence technology

---

#### Application Layer - Validation Operations

##### Rule UC-CMD-03: Pre-Validation Pattern

**✅ GOOD - Validate before domain interaction:**

```typescript
// In handler or dedicated validator
class ConferenceCreationValidator {
  static validate(cmd: CreateConferenceCommand) {
    if (!cmd.name || cmd.name.length < 3) {
      throw new ValidationError('Conference name must be at least 3 characters');
    }
    if (cmd.endDate < cmd.startDate) {
      throw new ValidationError('End date must be after start date');
    }
  }
}
```

**Key Benefits:**
- Prevents invalid state propagation to domain
- Fast-fail with clear error messages
- Keeps domain aggregates clean

**❌ BAD - Relying on Aggregate for All Validation:**

```typescript
// ❌ BAD: Skipping app layer validation entirely
async execute(cmd) {
  const conf = ConferenceFactory.create(cmd); // Throws domain exception
  // ❌ No early validation, heavy domain instantiation for simple checks
}
```

**Why it's bad:**
- Domain aggregates should focus on invariant enforcement, not input sanitization
- Increases overhead and obscures validation responsibility

---

## 🔄 Use Case Patterns

### Use case rules by Category

#### Application Layer - Query Operations

##### Rule UC-QRY-01: Query Carrier Pattern

**✅ GOOD - Read intent with projection parameters:**

```typescript
// get-conference.query.ts
import { Query } from '@ddd/application';

export class GetConferenceQuery extends Query {
  constructor(
    public readonly conferenceId: string,
    public readonly includeAgenda: boolean = false,
    public readonly includeSpeakers: boolean = false,
  ) {
    super();
  }
}
```

**Source**: [d8e2f4a1c6b9] get-conference.query.ts

**Key Benefits:**
- Explicit read intent decoupled from write operations
- Supports flexible projection without mutating command objects
- Enables read-model optimization independently

**❌ BAD - Reusing Command for Reads:**

```typescript
// ❌ BAD: Using CreateConferenceCommand for reads
const query = new CreateConferenceCommand(/* ... */); // ❌ Mixes write intent with read
```

**Why it's bad:**
- Violates CQRS separation
- Couples read paths to write-side metadata
- Makes caching and optimization harder

---

##### Rule UC-QRY-02: Stateless Read Handler Pattern

**✅ GOOD - Pure coordination of read operations:**

```typescript
// get-conference.handler.ts
import { QueryHandler, IQueryHandler } from '@ddd/application';
import { GetConferenceQuery } from './get-conference.query';
import { ConferenceRepository } from '../../domain/repositories/conference.repository';
import { ConferenceProjectionService } from '../../infrastructure/projections';

@QueryHandler(GetConferenceQuery)
export class GetConferenceHandler implements IQueryHandler<GetConferenceQuery> {
  constructor(
    private readonly conferenceRepo: ConferenceRepository,
    private readonly projectionService: ConferenceProjectionService,
  ) {}

  async execute(query: GetConferenceQuery) {
    const conference = await this.conferenceRepo.findById(query.conferenceId);
    if (!conference) throw new NotFoundError('Conference not found');

    return this.projectionService.mapToDTO(conference, {
      includeAgenda: query.includeAgenda,
      includeSpeakers: query.includeSpeakers,
    });
  }
}
```

**Source**: [b1c5d7e9f3a4] get-conference.handler.ts

**Key Benefits:**
- Separates read modeling from write domains
- Supports caching, pagination, and materialized views
- Maintains handler statelessness

**❌ BAD - Embedding Complex Mapping Logic:**

```typescript
// ❌ BAD: Heavy projection logic inside handler
async execute(query) {
  const raw = await this.db.query(`SELECT * FROM conferences WHERE id = ?`, [query.id]);
  // ❌ 50 lines of manual mapping, conditional joins, inline formatting
  return formatted;
}
```

**Why it's bad:**
- Violates separation of concerns
- Duplicates logic across handlers
- Makes read models untestable

---

## 🛠️ Implementation Guidelines

### Dependency Injection

- **DI Pattern**: Constructor injection with framework-agnostic interfaces (e.g., `ConferenceRepository`)
- **Configuration**: Use factory providers or module config for environment-specific bindings
- **Lifecycle**: Handlers are stateless; instantiate per request via DI container

- **Handler Registration**: Auto-register via decorator metadata or explicit module exports
- **Factory Usage**: Create aggregates via static factory methods or builder patterns inside handlers
- **Transaction Boundaries**: Handlers initiate transaction scope; commit/rollback handled by infrastructure wrapper

---

## ⚠️ Error Handling Strategy

### Domain Exception Propagation

Domain and application exceptions bubble up to handlers. Handlers should translate or wrap infrastructure errors while preserving domain intent.

**Example:**

```typescript
try {
  await this.conferenceRepo.save(conference);
} catch (err) {
  if (err instanceof UniqueConstraintError) {
    throw new DomainException('Conference with this name already exists');
  }
  throw new InfrastructureException('Persist failure', err);
}
```

### Input Validation Exceptions

Early validation failures use `ValidationError` or `BadRequestException` to return fast, structured responses without domain interaction.

**Example:**

```typescript
if (!command.name) throw new ValidationError('Name is required');
```

### Fallback & Retry Strategy

Infrastructure calls (DB, external APIs) use exponential backoff and circuit breakers. Handlers never retry invalid domain operations.

---

## 🧪 Testing Approach

### Unit Testing

- **Unit Test Pattern**: Arrange-Act-Assert with strict dependency mocking
- **Mock Strategy**: Mock repository interfaces, validate domain factory calls and transaction boundaries
- **Coverage Target**: 85%+ line coverage, 100% for validation & orchestration paths

### Integration Testing

- **Integration Test Pattern**: Contract tests for command/query execution against test containers
- **Test Environment**: In-memory DB or Dockerized Postgres/Redis with schema migration
- **Data Setup Strategy**: Use test factories and clean-slate transactions per test case

### Use Case Testing Rules

#### ✅ Good Test Structure

```typescript
it('should create conference and persist', async () => {
  // Arrange
  const cmd = new CreateConferenceCommand('org-1', 'DDD Conf', new Date(), new Date(2025, 0, 1), 'req-1');
  const repoMock = { save: jest.fn().mockResolvedValue(undefined) };
  const handler = new CreateConferenceHandler(repoMock as any);

  // Act
  const result = await handler.execute(cmd);

  // Assert
  expect(repoMock.save).toHaveBeenCalledWith(jasmine.objectContaining({ organizerId: 'org-1' }));
  expect(result).toBeDefined();
});
```

#### ❌ Bad Test Patterns

```typescript
// ❌ Testing framework decorators or DI container directly
// ❌ Mocking entire modules instead of interfaces
// ❌ Ignoring transaction/rollback behavior in tests
```

---

## ⚡ Performance Considerations

### Read Optimization

- **Caching**: Query handlers can leverage Redis/Memcached for frequent reads; cache keys based on query parameters
- **Pagination**: Always support cursor/offset pagination in query handlers
- **Projection Isolation**: Keep read models separate from write aggregates to avoid blocking writes

### Write Optimization

- **Batch Processing**: Handlers should avoid N+1 queries; use repository batch methods
- **Transaction Scope**: Keep transactions as short as possible; commit immediately after persistence
- **Idempotency**: Use `requestId` or domain events to prevent duplicate operations in async flows

---

## 🚫 Anti-Patterns to Avoid

### ❌ God Handler

**Problem:** Handler contains business rules, mapping logic, external service calls, and data transformation.  
**Solution:** Extract business rules to domain aggregates/services, move mapping to projection services, keep handler to orchestration only.  
**Detected Files:** None detected

### ❌ Anemic Handler / Direct ORM Access

**Problem:** Handler bypasses repository interfaces and uses raw SQL/ORM methods directly.  
**Solution:** Always use domain-repository abstractions. Infrastructure implements persistence details.  
**Detected Files:** None detected

### ❌ Cross-Layer Leaking

**Problem:** Command/Query DTOs leak into domain aggregates or UI responses.  
**Solution:** Maintain clear boundaries: Commands → Domain → Domain DTOs/Value Objects → Projections → UI DTOs.  
**Detected Files:** None detected

### ❌ Synchronous External Calls in Handlers

**Problem:** Blocking HTTP calls or heavy IO within handler execution path.  
**Solution:** Offload to background workers or event-driven pipelines; use async patterns in handlers.  
**Detected Files:** None detected

---

## Summary

**Key Implementation Principles** _(actionable guidelines for developers)_

1. **Separate Read & Write Intent** — Commands and queries must never share carriers or handlers. CQRS preserves scalability and testability.
2. **Stateless Handlers** — Inject dependencies via constructor, avoid mutable state, and treat each execution as ephemeral.
3. **Orchestrate, Don't Implement** — Handlers coordinate domain factories, repositories, and projections. Business rules belong in aggregates.
4. **Validate Early** — Use pre-validation before domain instantiation to fail fast and preserve aggregate invariants.
5. **Preserve Transaction Boundaries** — Begin/commit transactions at handler level; never span multiple use cases in a single transaction.

- **DDD Patterns:** Command Handler, Query Handler, Factory Method, Repository Interface, Domain Exception, Idempotency Key
- **Architecture Documentation:** CQRS Application Layer, DDD Bounded Context: Conference, Module: conference

**What to Avoid** _(common anti-patterns and restrictions)_

- Embedding business logic or SQL in handlers
- Reusing command objects for read operations
- Skipping input validation before domain interaction
- Mixing UI transport contracts with application intents
- Creating long-running or blocking operations within synchronous handler execution

---

## Pattern Index

### Application Layer - Command Operations Patterns

- UC-CMD-01: Command Carrier Pattern - [c4f8a9b2d1e3] create-conference.command.ts
- UC-CMD-02: Handler Orchestration Pattern - [a7b3c9d2e5f1] create-conference.handler.ts
- UC-CMD-03: Pre-Validation Pattern - N/A (guideline only)

### Application Layer - Query Operations Patterns

- UC-QRY-01: Query Carrier Pattern - [d8e2f4a1c6b9] get-conference.query.ts
- UC-QRY-02: Stateless Read Handler Pattern - [b1c5d7e9f3a4] get-conference.handler.ts

### Coverage Summary

**Total Application Layer Use Cases Analyzed**: 4

- **Command Operations**: 2 use cases (100% coverage)
- **Query Operations**: 2 use cases (100% coverage)

**Key Files Analyzed**:
- [c4f8a9b2d1e3] create-conference.command.ts ✓
- [a7b3c9d2e5f1] create-conference.handler.ts ✓
- [d8e2f4a1c6b9] get-conference.query.ts ✓
- [b1c5d7e9f3a4] get-conference.handler.ts ✓

---

## ❓ Open Questions

- [ ] Should conference creation require multi-step approval workflow or remain single-step?
- [ ] Do query handlers need to support event-sourced read model reconstruction or CQRS projections?
- [ ] Are idempotency constraints required at the handler level for distributed deployments?
- [ ] Should validation be centralized via a schema-validator service or kept inline per use case?

## ⚖️ Architectural Conformance & Inconsistency Audit

### 1. Adherence Summary to the Big Picture Rules
| Big Picture Principle | Conformance Status | Notes |
|------------------------|-------------------|-------|
| **Strict CQRS Separation** | ✅ Fully Compliant | Commands and queries are explicitly segregated into separate carriers, handlers, and use-case rules. No mixing of read/write intents is permitted. |
| **Stateless Handlers** | ✅ Fully Compliant | Handlers are explicitly documented as stateless, instantiated per request, and dependency-injected via constructors. Mutable state across executions is banned. |
| **Repository Isolation** | ✅ Fully Compliant | Handlers interact strictly with repository ports/interfaces. Direct SQL/ORM manipulation and raw DB queries are explicitly flagged as anti-patterns. |
| **Orchestration & Pre-Validation** | ✅ Fully Compliant | The `UC-CMD-03` pattern enforces early validation before domain instantiation. Handlers coordinate factories, ports, and projections without implementing business invariants. |
| **Explicit Error Handling (`Result` preference)** | ⚠️ Partially Compliant | The documentation relies on imperative `throw` statements with structured exceptions (`ValidationError`, `DomainException`). While this avoids untyped `new Error()`, it diverges from the Big Picture's preference for explicit `Result<T, E>` return types over exception-driven control flow. |
| **Context Injection & DTO Translation** | ⚠️ Partially Compliant | Context enrichment (`requestId`) is shown but missing explicit mandates for tenant, security, and audit context resolution. Command handlers return primitive/domain IDs instead of stable Application DTOs, violating the explicit DTO translation rule. |
| **Transaction Management** | ⚠️ Ambiguous Compliance | The guideline states transactions are initiated at the handler but "commit/rollback handled by infrastructure wrapper." This blurs responsibility; the Big Picture requires explicit application-layer session lifecycle control per use case. |

---

### 2. Specific DDD Inconsistencies & Deviations

| # | Deviation / Gap | Reference Location | Impact |
|---|-----------------|-------------------|--------|
| 1 | **Exception-Driven Flow vs. Explicit `Result` Types** | `UC-CMD-02`, `UC-QRY-02`, `Error Handling Strategy` | Handlers use `throw` for failures, which can leak across async boundaries and breaks pure function semantics. DDD prefers explicit failure representation (`Result.fail()`) to avoid exception-based branching. |
| 2 | **Missing Context Injection Mandate** | `UC-CMD-01`, `Implementation Guidelines` | Only `requestId` is enforced. Tenant, security, correlation, and audit context resolution from infrastructure adapters is undocumented, risking cross-cutting concern leakage into the domain. |
| 3 | **Ambiguous Transaction Boundary Ownership** | `Implementation Guidelines` → `Transaction Boundaries` | Delegating commit/rollback to an "infrastructure wrapper" dilutes application-layer responsibility. Explicit session management must be codified as an app-layer contract, not infra-implementation detail. |
| 4 | **Primitive Command Returns vs. Application DTOs** | `UC-CMD-02` → `execute()` method | Command handlers return `conference.getId()` (primitive/aggregate internal). The Big Picture requires mapping domain outcomes to stable Application Transfer Objects before exposing them to callers. |
| 5 | **Lack of Explicit Result Mapping for Success Paths** | `UC-QRY-02` vs `UC-CMD-02` | Query handlers use `projectionService.mapToDTO()`, but command handlers skip this step. Inconsistent DTO ownership creates coupling leaks and breaks the "single application boundary" principle. |

---

### 3. Actionable Refactoring Recommendations

1. **Adopt `Result<T, E>` Semantics Across Handlers**
   - Replace imperative `throw` statements with explicit return types: `Result.success(data)` and `Result.failure(error)`.
   - Update `UC-CMD-02` and `UC-QRY-02` examples to demonstrate return-based error propagation. This aligns with the Big Picture's explicit error handling preference and enables predictable, exception-free orchestration.
   - *Action*: Introduce a `UC-ERR-01: Explicit Result Type Pattern` section with TS/JS type definitions (`Result<T, E>`, `Ok`, `Err`).

2. **Formalize Context Injection via `ExecutionContext` Carrier**
   - Create a framework-agnostic `ExecutionContext` interface containing `tenantId`, `userId`, `correlationId`, and `auditTimestamp`.
   - Handlers must receive this context explicitly (via constructor or command wrapper) to resolve security/tenant boundaries before domain interaction.
   - *Action*: Add `UC-CMD-04: Context Resolution Pattern` showing how infrastructure adapters merge request metadata into the execution context before handler dispatch.

3. **Clarify Application-Layer Transaction Ownership**
   - Explicitly state that the application layer (typically via a `TransactionalMediator` or handler lifecycle wrapper) owns the full session lifecycle: `beginTransaction() → execute() → commit()/rollback()`.
   - Remove ambiguous phrasing like "handled by infrastructure wrapper." The infrastructure provides the `DataSource`/`ConnectionProvider`, but the app layer dictates the boundary semantics.
   - *Action*: Revise `Implementation Guidelines` → `Transaction Boundaries` to mandate explicit `try/catch` or declarative transaction attributes within the use-case execution pipeline.

4. **Standardize Application DTOs for All Use Cases**
   - Command handlers must map aggregate outcomes to immutable Application DTOs (e.g., `ConferenceCreatedDTO`) rather than returning raw IDs or entity internals.
   - Query handlers should continue using projection services, but both paths must converge on a consistent application-level contract.
   - *Action*: Refactor `UC-CMD-02` example to return `return new ConferenceCreatedDTO(conference.getId(), conference.getVersion(), conference.getStatus());`.

5. **Enforce Strict Application DTO Isolation**
   - Add a linter/commit-hook rule or architecture test to verify that no Domain Aggregates, Value Objects, or Repository interfaces leak into controller/response layers.
   - Ensure all public handler methods expose only Application DTOs or `Result<ApplicationDTO, Error>` types.
   - *Action*: Document `UC-ARC-01: Application Boundary Enforcement` in the anti-patterns section, providing architecture test examples (e.g., ArchUnit or Jest custom matchers).

**Audit Verdict:** The generated documentation is **structurally sound** and correctly enforces CQRS, statelessness, and repository isolation. However, it requires **targeted refinements** around explicit error typing, context injection, transaction boundary ownership, and consistent DTO translation to fully align with the Big Picture DDD expectations. Implementing the above recommendations will harden the application layer into a robust, testable, and framework-agnostic orchestration boundary.
