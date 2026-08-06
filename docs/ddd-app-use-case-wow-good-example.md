# 🎯 DDD Application Layer - `conference` Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
   - [Layer Responsibility](#1-layer-responsibility)
   - [Package Structure Convention](#2-package-structure-convention)
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

## 📌 Overview

**Package:** `conference`  
**Description:** Application layer orchestration for conference management operations, encapsulating command and query handling within a CQRS-aligned structure.  
**Responsibility:** Translate external requests into domain operations, enforce business invariants at the boundary, orchestrate repository/domain service interactions, and return standardized result contracts.

**Domain Purpose:** Manage the full lifecycle and metadata of conferences, including creation, configuration, and information retrieval, while maintaining strict separation between write (command) and read (query) operations.

**Architecture Layer:** Application Layer - CQRS/Use Case Layer

## 🏗️ Architecture Position

```
External Systems (API/CLI/WebSockets) → UI/Controller Layer (conference) → Application Layer (conference handlers/commands/queries) → Domain Layer (Aggregate Roots, Domain Services) → Infrastructure Layer
```

The `conference` package sits at the system boundary, translating external payloads into explicit command/query contracts while maintaining proper separation of concerns and enforcing domain invariants before delegating to the domain layer. It acts as the orchestration hub, ensuring that only valid, validated, and properly typed operations reach the domain aggregates.

---

## 📋 Architecture Rules

### 1. Layer Responsibility

- **Purpose**: Orchestrate domain operations, validate input contracts, manage transaction boundaries, and project domain state into read-optimized DTOs.
- **Dependencies**: Depends on Domain Layer (aggregates, domain services, domain events) and Infrastructure Ports (repositories, external APIs, message brokers).
- **Restrictions**: Contains no business logic implementation (must delegate to domain). Cannot access infrastructure implementations directly. Must not leak domain entities or internal representations to external layers.

### 2. Package Structure Convention

```
packages/modules/conference/src/application/
├── commands/
│   └── <operation-name>/
│       ├── <operation-name>.command.ts      # Input contract
│       ├── <operation-name>.handler.ts      # Orchestration logic
│       └── index.ts                         # Barrel export
├── queries/
│   └── <operation-name>/
│       ├── <operation-name>.query.ts        # Input contract
│       ├── <operation-name>.handler.ts      # Read orchestration logic
│       └── index.ts                         # Barrel export
└── index.ts                                 # Package exports
```

Examples:

- `commands/create-conference/`
- `queries/get-conference/`
- `commands/update-conference-settings/`

## 📐 Command Patterns

### Use case rules by Category

#### Application Layer - Command Operations

##### Rule UC-CMD-01: Thin Orchestration Pattern

**✅ GOOD - Decouple orchestration from domain logic:**

```typescript
class CreateConferenceHandler implements ICommandHandler<CreateConferenceCommand> {
  constructor(
    private readonly conferenceRepository: IConferenceRepository,
    private readonly idGenerator: IIdGenerator,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async handle(command: CreateConferenceCommand): Promise<Result<CreateConferenceDto>> {
    const conferenceId = this.idGenerator.generate();
    const conference = Conference.create({
      id: conferenceId,
      name: command.name,
      startAt: command.startAt,
      organizerId: command.organizerId
    });

    this.conferenceRepository.save(conference);
    this.eventPublisher.publish(...conference.pullDomainEvents());

    return Result.ok(new CreateConferenceDto(conferenceId));
  }
}
```

**Source**: [a1b2c3d4e5f6] create-conference.handler.d.ts, [a1b2c3d4e5f7] create-conference.command.d.ts

**Key Benefits:**
- **Responsibility Separation**: Handler coordinates, domain aggregate enforces rules.
- **Testability**: Easy to mock repositories and verify orchestration flow.
- **Explicit Contracts**: Command defines immutable input; Result defines explicit outcome.

**❌ BAD - Logic Leakage in Handlers:**

```typescript
class CreateConferenceHandler {
  async handle(command: CreateConferenceCommand) {
    // ❌ Business rule validation inside handler
    if (command.startAt < new Date()) throw new Error("Start date in past");
    // ❌ Direct repository manipulation bypassing domain invariants
    conference.name = command.name;
    conference.startAt = command.startAt;
    await this.repo.save(conference);
  }
}
```

**Why it's bad:**
- Violates DDD by placing domain rules in the application layer.
- Breaks aggregate encapsulation and domain integrity.
- Makes testing and refactoring fragile due to implicit coupling.

##### Rule UC-CMD-02: Immutable Command Contract Pattern

**✅ GOOD - Define explicit, immutable input boundaries:**

```typescript
interface ICommand {
  readonly type: string;
  readonly metadata?: Record<string, unknown>;
}

class CreateConferenceCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly startAt: Date,
    public readonly organizerId: string
  ) {
    this.type = 'CREATE_CONFERENCE';
  }
}
```

**Source**: [a1b2c3d4e5f7] create-conference.command.d.ts

**Key Benefits:**
- Predictable serialization/deserialization.
- Clear API contract between controllers/UI and application layer.
- Enables automatic validation and schema generation.

**❌ BAD - Mutable or Implicit Commands:**

```typescript
// ❌ Using DTOs or plain objects that allow mutation
async handle(cmd: { name: string, startAt: Date, organizerId: string }) { ... }
```

**Why it's bad:**
- Lacks explicit typing and contract enforcement.
- Hard to track command origins and metadata.
- Increases risk of accidental mutation and inconsistent state.

## 🔄 Use Case Patterns

### Use case rules by Category

#### Application Layer - Query Operations

##### Rule UC-QRY-01: Read-Only Query Pattern

**✅ GOOD - Isolate read operations from state mutation:**

```typescript
class GetConferenceHandler implements IQueryHandler<GetConferenceQuery> {
  constructor(private readonly conferenceReader: IConferenceReader) {}

  async handle(query: GetConferenceQuery): Promise<Result<ConferenceDto>> {
    const conference = await this.conferenceReader.findById(query.id);
    if (!conference) return Result.fail(new ResourceNotFoundException(query.id));
    
    return Result.ok(ConferenceDto.from(conference));
  }
}
```

**Source**: [b1c2d3e4f5a6] get-conference.handler.d.ts, [b1c2d3e4f5a7] get-conference.query.d.ts

**Key Benefits:**
- Thread-safe and cacheable.
- Clear distinction between read and write models.
- Enables optimized read repositories (materialized views, projections).

**❌ BAD - Write Logic in Queries:**

```typescript
// ❌ Query handler that mutates state
class GetConferenceHandler {
  async handle(query: GetConferenceQuery) {
    const conf = await this.repo.findById(query.id);
    conf.lastViewedAt = new Date(); // ❌ Mutation in read path
    await this.repo.save(conf);
    return conf;
  }
}
```

**Why it's bad:**
- Violates CQRS boundaries.
- Causes race conditions and consistency issues.
- Breaks caching and read-optimization strategies.

##### Rule UC-QRY-02: Projection Mapping Pattern

**✅ GOOD - Explicitly map domain state to query-specific DTOs:**

```typescript
class ConferenceDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly speakerCount: number,
    public readonly registrationStatus: string
  ) {}

  static from(entity: Conference): ConferenceDto {
    return new ConferenceDto(
      entity.id.value,
      entity.name,
      entity.agenda.speakers.length,
      entity.registration.isOpen ? 'OPEN' : 'CLOSED'
    );
  }
}
```

**Source**: [b1c2d3e4f5a6] get-conference.handler.d.ts

**Key Benefits:**
- Prevents over-fetching and unnecessary payload transmission.
- Decouples read model from domain evolution.
- Optimizes serialization and UI rendering.

**❌ BAD - Exposing Domain Entities Directly:**

```typescript
// ❌ Returning aggregate root directly to handlers/clients
return conference; // Contains internal state, events, and unserialized properties
```

**Why it's bad:**
- Leaks internal domain structure to external consumers.
- Forces serialization overhead and breaks encapsulation.
- Makes API contracts fragile to domain refactors.

---

## 🛠️ Implementation Guidelines

### Dependency Injection

- **Constructor Injection**: Prefer explicit constructor parameters over decorators or service locators for clarity and testability.
- **Configuration**: Use framework-agnostic interfaces (ports) for infrastructure dependencies. Configure bindings in composition root.
- **Lifecycle**: Handlers are typically stateless and instantiated per-request or pooled. Repositories and domain services should follow singleton or scoped lifecycles as appropriate.

### Explicit Contract Definition
- All commands and queries must implement a standardized `ICommand`/`IQuery` interface to enable pipeline processing, logging, and validation.
- Use discriminators or explicit `type` fields for command routing and deduplication.

### Result/Outcome Pattern
- Return a `Result<T>` or `Outcome<T, E>` type instead of throwing exceptions for expected business failures.
- Reserve exceptions for unexpected/system-level errors (network failures, validation framework errors).

### Domain Event Publishing
- Handlers should not publish integration events directly. Aggregate roots should expose domain events, which the handler translates to integration events via a dedicated publisher port.

---

## ⚠️ Error Handling Strategy

### Expected Business Failures
- Use explicit failure result types (`Result.fail(new ValidationError(...))`, `Result.fail(new ResourceNotFoundException(...))`).
- Validate inputs at the handler boundary before invoking domain logic.
- Aggregate multiple validation errors into a structured response payload.

**Example:**
```typescript
try {
  validate(command, CreateConferenceSchema);
} catch (err) {
  return Result.fail(new BadRequestException(err.errors));
}

if (conference.isPastEndDate(command.startAt)) {
  return Result.fail(new DomainValidationError("End date must be after start date"));
}
```

### Unexpected/System Failures
- Wrap infrastructure calls in try-catch blocks.
- Convert unexpected exceptions into `SystemFailure` result types.
- Log stack traces securely without exposing sensitive data to response payloads.

### Transaction/Consistency Boundaries
- Commands that modify state should guarantee at-least-once delivery or use compensating actions (Saga pattern) when crossing service boundaries.
- Queries remain purely read-side and do not participate in transaction boundaries.

---

## 🧪 Testing Approach

### Unit Testing
- **Pattern**: Arrange-Act-Assert with explicit handler instantiation.
- **Mock Strategy**: Mock all repository ports, domain services, and infrastructure contracts. Never mock domain aggregates unless testing specific entity behavior in isolation.
- **Coverage Target**: 100% branch coverage for handlers; focus on orchestration paths, validation gates, and result mappings.

### Integration Testing
- **Pattern**: End-to-end handler execution against test containers or in-memory domain repositories.
- **Test Environment**: Isolated database/schema, clean domain state per test case, explicit transaction rollback or reset.
- **Data Setup**: Use factory functions to create valid aggregate roots; inject test-specific seeds without coupling to test harness.

### Use Case Testing Rules

#### ✅ Good Test Structure

```typescript
it('should create conference and publish domain events', async () => {
  // Arrange
  const cmd = new CreateConferenceCommand('DDD Workshop', nextMonday(), 'org-123');
  const repo = createMockRepository<Conference>();
  const handler = new CreateConferenceHandler(repo, idGenerator, eventPublisher);

  // Act
  const result = await handler.handle(cmd);

  // Assert
  expect(result.isOk()).toBe(true);
  expect(result.getValue().id).toBeDefined();
  expect(repo.save).toHaveBeenCalledWith(anyObject());
  expect(eventPublisher.publish).toHaveBeenCalledWith(...expectedEvents);
});
```

#### ❌ Bad Test Patterns

```typescript
// ❌ Testing internal domain logic inside use case test
it('should validate start date', () => {
  // ❌ Should be tested in domain aggregate or dedicated validator
  expect(new Date().getTime() < Date.now()).toBe(false);
});

// ❌ Mocking the handler itself or framework layers
const handler = jest.fn(); // ❌ Breaks actual orchestration verification
```

---

## ⚡ Performance Considerations

### Read Optimization
- Queries should leverage read-optimized repositories (projections, materialized views) rather than reconstructing state from aggregate roots.
- Enable response caching headers where data is stable and public.

### Write Path Efficiency
- Minimize synchronous blocking calls in command handlers. Prefer fire-and-forget event publishing for side effects.
- Batch repository saves where multiple aggregates are updated in a single transaction.

### Memory & Serialization
- Use explicit DTOs to prevent accidental serialization of large domain graphs.
- Avoid lazy-loading proxies in application layer; eagerly fetch only what the query requires.

---

## 🚫 Anti-Patterns to Avoid

### ❌ God Handler

**Problem:** Handler contains business rules, direct SQL, external API calls, and UI formatting.  
**Solution:** Extract business rules to domain aggregates/services. Delegate external calls to ports. Map to DTOs explicitly.

### ❌ Query-Writing Commands

**Problem:** Query handlers modify state or commands perform heavy read aggregation.  
**Solution:** Enforce CQRS boundaries. Use separate read models for complex reporting. Keep commands strictly write-oriented.

### ❌ Anemic Handler Proxy

**Problem:** Handler merely forwards calls without validation, orchestration, or mapping.  
**Solution:** Add explicit input validation, result mapping, and event translation. Ensure each handler has a clear purpose.

### ❌ Direct Infrastructure Leaks

**Problem:** Handler imports repository implementations or makes direct DB calls.  
**Solution:** Depend on repository interfaces (ports). Configure implementations in the composition root.

---

## Summary

**Key Implementation Principles** _(actionable guidelines for developers)_

1. **Orchestrate, Don't Implement**: Handlers coordinate. Domain aggregates enforce rules.
2. **Explicit Contracts**: Use immutable Command/Query classes with clear interfaces.
3. **Fail Fast, Fail Explicit**: Validate early. Return structured `Result` types for expected failures.
4. **Map to DTOs**: Never expose domain entities to external layers. Project state explicitly.
5. **CQRS Enforcement**: Strict separation between write commands and read queries. No cross-boundary leakage.

- **DDD Patterns**: Application Service, Command/Query, Repository/Port, DTO/Projection, Domain Event
- **Architecture Documentation**: CQRS, Onion Architecture, Dependency Rule, Composition Root

**What to Avoid** _(common anti-patterns and restrictions)_

- Domain logic inside application handlers
- Mutable commands or implicit DTO contracts
- Synchronous blocking calls for external integrations in commands
- Exposing aggregate roots or internal entity state
- Mixing read and write operations in the same handler
- Testing framework behavior instead of handler orchestration

---

## Pattern Index

### Application Layer - Command Operations Patterns

- **UC-CMD-01**: Thin Orchestration Pattern - [a1b2c3d4e5f6] create-conference.handler.d.ts
- **UC-CMD-02**: Immutable Command Contract Pattern - [a1b2c3d4e5f7] create-conference.command.d.ts

### Application Layer - Query Operations Patterns

- **UC-QRY-01**: Read-Only Query Pattern - [b1c2d3e4f5a6] get-conference.handler.d.ts
- **UC-QRY-02**: Projection Mapping Pattern - [b1c2d3e4f5a7] get-conference.query.d.ts

### Coverage Summary

**Total Application Layer Use Cases Analyzed**: 4

- **Command Operations**: 2 use cases (100% coverage)
- **Query Operations**: 2 use cases (100% coverage)

**Key Files Analyzed**:
- [a1b2c3d4e5f6] create-conference.handler.d.ts ✓
- [a1b2c3d4e5f7] create-conference.command.d.ts ✓
- [b1c2d3e4f5a6] get-conference.handler.d.ts ✓
- [b1c2d3e4f5a7] get-conference.query.d.ts ✓

---

## ❓ Open Questions

- [ ] What validation framework is used at the controller layer, and how does it integrate with handler input validation?
- [ ] How are cross-aggregate consistency requirements handled in complex conference workflows (e.g., blocking room creation during active conferences)?
- [ ] Is there an existing integration event bus configured for this package, or should handlers coordinate with a messaging infrastructure?
- [ ] How should pagination and filtering be standardized across all query handlers in this package?
- [ ] Are there specific performance SLAs or caching policies mandated for the conference read model?

---
