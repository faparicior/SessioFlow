# 🎯 DDD Application Layer - `conference` (Generic Guidelines)

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

**Module / Package(s):** `conference`  
**Description:** Application layer implementation for the Conference module, encapsulating use case orchestration, command handling, and query execution.  
**Responsibility:** Orchestrate business processes, enforce use case boundaries, coordinate domain aggregates with infrastructure, and manage transactional consistency.

**Domain Purpose:** Manage the lifecycle of conferences (creation, retrieval) and coordinate domain operations without exposing business logic to the application entry points.

**Architecture Layer:** Application Layer - Command and Query Operations (CQRS-friendly structure)

## 🏗️ Architecture Position

```
External Systems (UI/API) → UI Layer → Application Layer (conference) → Domain Layer → Infrastructure
```

The `conference` application layer sits at the system boundary for the module, acting as the orchestrator for all conference-related operations. It translates external inputs into domain actions while maintaining proper separation of concerns and ensuring that business rules remain encapsulated within the Domain Layer.

---

## 📋 Architecture Rules

### 1. Layer Responsibility

- **Purpose**: Define and execute use cases; handle Commands (write operations) and Queries (read operations); coordinate Domain Entities/Aggregates with Repositories; manage transactions and validations.
- **Dependencies**: Domain Layer (Entities, Aggregates, Value Objects, Domain Services, Repositories); Infrastructure Layer (Repository implementations, External services); Configuration; Common/Shared utilities.
- **Restrictions**: No direct database queries; No business logic implementation; No UI/View models; No infrastructure implementation details; No cross-module orchestration outside defined ports.

### 2. Package Structure Convention

Modular structure by use case, separated by command and query concerns to support CQRS principles and clear single-responsibility boundaries.

```text
packages/modules/conference/application/
├── commands/
│   └── create-conference/
│       ├── create-conference.command.ts
│       └── create-conference.handler.ts
└── queries/
    └── get-conference/
        ├── get-conference.query.ts
        └── get-conference.handler.ts
```

Examples:

- `packages/modules/conference/application/commands/create-conference/create-conference.command.ts` [c5d6e7f8] — Command definition; carries payload, metadata, and transactional attributes for write operations.
- `packages/modules/conference/application/commands/create-conference/create-conference.handler.ts` [c1d2e3f4] — Command handler; orchestrates domain logic, validates inputs, and executes the use case.
- `packages/modules/conference/application/queries/get-conference/get-conference.query.ts` [q5d6e7f8] — Query definition; carries read-only parameters and filtering criteria.
- `packages/modules/conference/application/queries/get-conference/get-conference.handler.ts` [q1d2e3f4] — Query handler; retrieves data from repositories and returns DTOs without side effects.

## 📐 Command Patterns

### Command rules by Category

#### Command Operations

##### Rule UC-CMD-01: Command Payload Isolation Pattern

**✅ GOOD - Separate command definition from handler logic:**

```text
Source: [c5d6e7f8] create-conference.command.ts

export class CreateConferenceCommand extends Command {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly date: Date
  ) {
    super();
  }
}
```

**Source**: [c5d6e7f8] create-conference.command.ts

**Key Benefits:**
- **Separation of Concerns**: Payload definition is isolated, making commands reusable and testable.
- **Clarity**: Command structure clearly defines the intent and required data for the operation.
- **Validation Foundation**: Enables strict typing and DTO validation at the boundary.

**❌ BAD - Embedding handler logic in command:**

```text
Source: [c5d6e7f8] create-conference.command.ts

export class CreateConferenceCommand {
  constructor(readonly name: string) {
    if (name.length < 3) {
      throw new ValidationError('Name too short'); // Bad: Logic in command
    }
  }
}
```

**Why it's bad:**
- **Violates SRP**: Commands should only carry data, not contain orchestration or validation logic.
- **Testing Complexity**: Logic in commands makes them harder to test in isolation.
- **Domain Leakage**: Commands may leak infrastructure or domain-specific logic.

##### Rule UC-CMD-02: Handler Orchestration Pattern

**✅ GOOD - Handler orchestrates domain interaction and persistence:**

```text
Source: [c1d2e3f4] create-conference.handler.ts

@Injectable()
export class CreateConferenceHandler implements ICommandHandler<CreateConferenceCommand> {
  constructor(
    private readonly conferenceRepository: ConferenceRepository
  ) {}

  async execute(command: CreateConferenceCommand): Promise<void> {
    const conference = Conference.create(command.name, command.date);
    await this.conferenceRepository.save(conference);
  }
}
```

**Source**: [c1d2e3f4] create-conference.handler.ts

**Key Benefits:**
- **Domain Focus**: Handler delegates creation to the Domain Aggregate, keeping logic in the right layer.
- **Transaction Management**: Clear boundary for transactional operations.
- **Extensibility**: Easy to add domain events or side effects without modifying the command.

**❌ BAD - Business logic in handler:**

```text
Source: [c1d2e3f4] create-conference.handler.ts

@Injectable()
export class CreateConferenceHandler {
  async execute(command: CreateConferenceCommand) {
    if (command.date < new Date()) {
      throw new Error('Date in past'); // Bad: Validation in handler
    }
    // Bad: Manually constructing aggregate instead of using domain factory
    const conference = {
      id: uuid(),
      name: command.name,
      date: command.date,
      // ...
    };
  }
}
```

**Why it's bad:**
- **Anemic Domain**: Bypasses domain invariants and factory methods.
- **Validation Leakage**: Validation should occur at the boundary or within the domain, not scattered in handlers.
- **Maintainability**: Logic in handlers is harder to track and reuse.

## 🔄 Use Case Patterns

### Use case rules by Category

#### Query Operations

##### Rule UC-QRY-01: Query Handler Isolation Pattern

**✅ GOOD - Query handlers are read-only and side-effect free:**

```text
Source: [q1d2e3f4] get-conference.handler.ts

@Injectable()
export class GetConferenceHandler implements IQueryHandler<GetConferenceQuery> {
  constructor(
    private readonly conferenceRepository: ConferenceRepository
  ) {}

  async execute(query: GetConferenceQuery): Promise<ConferenceDto> {
    const conference = await this.conferenceRepository.findById(query.id);
    if (!conference) {
      throw new NotFoundError('Conference not found');
    }
    return ConferenceMapper.toDto(conference);
  }
}
```

**Source**: [q1d2e3f4] get-conference.handler.ts

**Key Benefits:**
- **Purity**: Query handlers do not mutate state, ensuring predictable reads.
- **CQRS Compliance**: Separation of write and read models is maintained.
- **Safety**: Easy to cache and optimize for read performance.

**❌ BAD - Query handler with side effects:**

```text
Source: [q1d2e3f4] get-conference.handler.ts

@Injectable()
export class GetConferenceHandler {
  async execute(query: GetConferenceQuery) {
    const conference = await this.repository.findById(query.id);
    await this.auditService.logAccess(conference.id); // Bad: Side effect in query
    return conference;
  }
}
```

**Why it's bad:**
- **Violates Read Model Purity**: Queries should not have side effects like logging or notifications.
- **Unpredictability**: Side effects in queries can lead to unexpected behavior.
- **Performance**: Unnecessary writes during reads can impact performance.

##### Rule UC-QRY-02: Query Payload Isolation Pattern

**✅ GOOD - Query payload defines parameters clearly:**

```text
Source: [q5d6e7f8] get-conference.query.ts

export class GetConferenceQuery extends Query {
  constructor(readonly id: string) {
    super();
  }
}
```

**Source**: [q5d6e7f8] get-conference.query.ts

**Key Benefits:**
- **Clarity**: Query parameters are explicitly defined.
- **Type Safety**: Strong typing prevents invalid queries.
- **Reusability**: Query can be used across different handlers or projections.

**❌ BAD - Embedding logic in query:**

```text
Source: [q5d6e7f8] get-conference.query.ts

export class GetConferenceQuery {
  constructor(readonly name: string) {
    this.name = this.name.trim().toLowerCase(); // Bad: Logic in query
  }
}
```

**Why it's bad:**
- **SRP Violation**: Queries should not contain processing logic.
- **Inconsistency**: Logic in queries may differ from logic in commands or domain.
- **Testing**: Embedded logic requires tests for queries, increasing complexity.

## 🛠️ Implementation Guidelines

### Dependency Injection

- **Constructor Injection**: All handlers must use constructor injection for dependencies (repositories, services).
- **Configuration**: Handlers are registered as injectable classes; framework handles lifecycle based on scope.
- **Lifecycle**: Singleton for stateless handlers; transient if per-request state is needed (rare in DDD).

### Handler Responsibilities

- Handlers must only orchestrate; they should not contain business rules.
- Delegates to Domain Aggregates for creation, updates, and invariant enforcement.
- Uses Repositories for persistence and data retrieval.
- Throws domain-specific exceptions or validation errors.

### Command/Query Separation

- Commands must not return data; they signal intent and may publish events.
- Queries must not mutate state; they return DTOs or projections.
- Handlers should be tightly coupled to their respective command/query types.

### Validation Strategy

- Input validation is performed in the handler or via dedicated validators before the handler execution.
- Business rule validation is delegated to the Domain Layer.
- Use DTO validation libraries for structural validation at the boundary.

## ⚠️ Error Handling Strategy

### Domain Exception Handling

Domain exceptions (e.g., `ConferenceAlreadyExists`, `InvalidConferenceDate`) should be thrown by domain aggregates and caught by handlers or global exception filters.

**Example:**

```typescript
try {
  await this.handler.execute(command);
} catch (error) {
  if (error instanceof DomainException) {
    throw new BadRequestException(error.message);
  }
  throw error;
}
```

### Validation Error Mapping

Validation errors should be aggregated and returned as structured error responses, not raw exceptions where possible.

**Example:**

```typescript
const errors = validate(command);
if (errors.length > 0) {
  throw new ValidationError('Invalid input', errors);
}
```

### Transaction Rollback

Handlers operating in transactions should ensure that any failure results in a proper rollback. Rely on the framework's transaction management or explicitly manage transactions.

**Example:**

```typescript
async execute(command: CreateConferenceCommand): Promise<void> {
  await this.transactionManager.execute(async () => {
    const conference = Conference.create(command.name);
    await this.repository.save(conference);
  });
}
```

## 🧪 Testing Approach

### Unit Testing

- **Test Handler Orchestration**: Verify that handlers correctly call domain methods and repositories.
- **Mock Strategy**: Mock repositories and dependencies; test handler logic in isolation.
- **Coverage Target**: 100% branch coverage for handler logic.

### Integration Testing

- **Test Database Interactions**: Verify that commands and queries correctly interact with the database.
- **Test Environment**: Use an isolated test database or in-memory repository.
- **Data Setup**: Use factories and seeds to prepare test data consistently.

### Use Case Testing Rules

#### ✅ Good Test Structure

```typescript
describe('CreateConferenceHandler', () => {
  it('should create a conference successfully', async () => {
    // Given
    const command = new CreateConferenceCommand('uuid', 'My Conference', new Date());
    const repository = mock<ConferenceRepository>();
    const handler = new CreateConferenceHandler(repository);

    // When
    await handler.execute(command);

    // Then
    expect(repository.save).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'My Conference' }));
  });
});
```

#### ❌ Bad Test Patterns

```typescript
it('bad test', async () => {
  // Bad: Testing framework setup in assertions
  await handler.execute(command);
  expect(true).toBe(true); // Bad: No assertion on behavior
});
```

## ⚡ Performance Considerations

### N+1 Query Prevention

Handlers executing queries must ensure efficient data retrieval. Use eager loading or projection patterns to avoid N+1 queries.

**Example:**

```typescript
// Good: Using projection
const conferences = await this.repository.findConferencesWithSpeakers(ids);

// Bad: Fetching all, then mapping
const conferences = await this.repository.findAll();
conferences.forEach(c => c.speakers = this.speakerRepo.findByConference(c.id));
```

### Caching Strategy

Query handlers should support caching where appropriate. Implement cache keys based on query parameters to maximize hit rates.

**Example:**

```typescript
async execute(query: GetConferenceQuery): Promise<ConferenceDto> {
  const cacheKey = `conference:${query.id}`;
  let dto = await this.cache.get(cacheKey);
  if (!dto) {
    dto = await this.repository.findById(query.id);
    await this.cache.set(cacheKey, dto, { ttl: 300 });
  }
  return dto;
}
```

## 🚫 Anti-Patterns to Avoid

### ❌ God Handler

**Problem**: A single handler contains logic for multiple use cases or excessive complexity, violating Single Responsibility Principle.  
**Solution**: Split handlers into distinct use cases; ensure each handler handles one command/query.  
**Detected Files**: None detected

### ❌ Logic in Commands/Queries

**Problem**: Commands or queries contain business logic, validation, or orchestration, leading to duplicated and inconsistent behavior.  
**Solution**: Move logic to handlers and domain aggregates; keep commands/queries as pure data carriers.  
**Detected Files**: None detected

### ❌ Mixing Commands and Queries

**Problem**: A handler processes both commands and queries, violating CQRS principles and making state management complex.  
**Solution**: Separate command handlers from query handlers; enforce read/write separation.  
**Detected Files**: None detected

### ❌ Anemic Application Layer

**Problem**: Handlers contain business logic that should reside in the Domain Layer, leading to anemic domain entities.  
**Solution**: Move business rules to aggregates and domain services; handlers should only orchestrate.  
**Detected Files**: None detected

## Summary

**Key Implementation Principles** _(actionable guidelines for developers)_

The `conference` application layer follows strict DDD principles to ensure maintainability, scalability, and clear separation of concerns. Adhere to these guidelines for consistent and robust implementations.

1. **Command/Query Separation** - Commands and queries must be distinct; handlers must not mix read and write operations.
2. **Domain Orchestration** - Handlers must delegate business logic to domain aggregates; avoid logic in handlers.
3. **Payload Isolation** - Commands and queries must be pure data carriers with no embedded logic.
4. **Transaction Boundaries** - Handlers must manage transactions explicitly or via framework mechanisms.
5. **Exception Handling** - Use domain-specific exceptions and map them appropriately at the boundary.

- **DDD Patterns**: Command Pattern, Query Pattern, Repository Pattern, Domain Orchestration, CQRS.
- **Architecture Documentation**: [Conference Module Architecture](#)

**What to Avoid** _(common anti-patterns and restrictions)_

- Avoid embedding logic in commands/queries.
- Avoid cross-module dependencies in handlers.
- Avoid direct database access in handlers.
- Avoid testing framework setup in assertions.
- Avoid mixing command and query handling in the same handler.

---

## Pattern Index

### Application Layer - Command Operations Patterns

- **UC-CMD-01**: Command Payload Isolation Pattern - [c5d6e7f8] create-conference.command.ts
- **UC-CMD-02**: Handler Orchestration Pattern - [c1d2e3f4] create-conference.handler.ts

### Application Layer - Query Operations Patterns

- **UC-QRY-01**: Query Handler Isolation Pattern - [q1d2e3f4] get-conference.handler.ts
- **UC-QRY-02**: Query Payload Isolation Pattern - [q5d6e7f8] get-conference.query.ts

### Coverage Summary

**Total Application Layer Use Cases Analyzed**: 4

- **Command Operations**: 2 use cases (100% coverage)
- **Query Operations**: 2 use cases (100% coverage)

**Key Files Analyzed**:
- [c1d2e3f4] create-conference.handler.ts ✓
- [c5d6e7f8] create-conference.command.ts ✓
- [q1d2e3f4] get-conference.handler.ts ✓
- [q5d6e7f8] get-conference.query.ts ✓

---

## ❓ Open Questions

- [ ] Are commands required to be immutable?
- [ ] Is there a standardized result object for queries?
- [ ] How are domain events published from handlers?
- [ ] Is event sourcing used in addition to CQRS?
- [ ] What is the strategy for handling concurrent writes to conferences?
- [ ] Are there specific caching requirements for query handlers?
- [ ] How are cross-module dependencies handled if needed?

