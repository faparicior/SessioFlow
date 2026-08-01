# Way of Working: Application Use Cases (`ddd-app-use-case-wow.md`)

## 1. Executive Summary & Core Responsibilities

The Application Use Case layer (`app-use-case`) serves as the orchestration bridge between the presentation/presentation-adjacent layer (Controllers, APIs, CLI, Events) and the Domain layer. In this architecture, it is strictly governed by **CQRS (Command Query Responsibility Segregation)** and acts as the single entry point for all business workflows.

**Core Responsibilities:**
- **Orchestration:** Coordinate domain entities, domain services, and repository ports to fulfill a single business intent.
- **Input Validation:** Validate request shapes, types, and constraints *before* domain interaction.
- **Context Injection:** Resolve security, tenant, correlation, and audit context from infrastructure adapters.
- **Transaction Management:** Explicitly open, commit, or rollback database sessions per use case execution.
- **Result Translation:** Map domain outcomes or entity projections into stable Application Transfer Objects (DTOs).

**Key Principles:**
- 🚫 **No Business Rules:** The application layer never implements domain invariants. It only validates structural/formatting constraints.
- 🔒 **Statelessness:** Handlers are instantiated per request and must hold no mutable state.
- 📐 **Strict CQRS:** Commands mutate state; Queries read state. They are never mixed in the same handler or method.

---

## 2. Architectural Constraints & Layering Rules

### 2.1 Dependency Direction
```
Presentation/API → Application Use Cases → Domain Layer → Infrastructure Layer
```
- The Application layer **imports only** `domain` contracts (ports, aggregates, value objects) and shared `infrastructure` interfaces (repositories, messaging ports).
- **Forbidden:** Direct imports of `express`, `typeorm`, `prisma`, `knex`, `pg`, or any presentation/framework-specific types inside `app/`.

### 2.2 Directory Structure Convention
```
src/modules/<module>/application/
├── commands/
│   └── <aggregate>/
│       ├── <action>.command.ts      # Input DTO
│       └── <action>.handler.ts      # Orchestrator
├── queries/
│   └── <aggregate>/
│       ├── <action>.query.ts        # Input DTO
│       └── <action>.handler.ts      # Orchestrator
└── dtos/
    └── <aggregate>.dto.ts           # Output transfer objects
```

### 2.3 Handler Contract Rules
- Constructors receive **only** domain/infrastructure ports (repositories, domain services, message buses, validators).
- The `handle()` method must be `async` for commands, and return a `Promise<T>` or `Promise<Result<T>>`.
- No framework decorators (e.g., `@Injectable`, `@Controller`) should be used inside handlers; DI is resolved via factory/container at module bootstrap.

---

## 3. Pattern Implementations & Code Conventions

### 3.1 Command & Query DTOs
Commands and Queries are **pure value objects**. They contain only input fields, required metadata (e.g., `tenantId`), and validation decorators/schemas.

```ts
// src/modules/conference/application/commands/create-conference/create-conference.command.ts
export class CreateConferenceCommand {
  constructor(
    public readonly title: string,
    public readonly capacity: number,
    public readonly organizerId: string,
    public readonly scheduledAt: Date,
    public readonly correlationId: string,
  ) {}
}
```

```ts
// src/modules/conference/application/queries/get-conference/get-conference.query.ts
export class GetConferenceQuery {
  constructor(
    public readonly conferenceId: string,
    public readonly tenantId: string,
  ) {}
}
```

### 3.2 Handler Implementation
Handlers follow a strict lifecycle: **Validate → Resolve/Map → Execute Domain → Persist/Project → Return**.

```ts
// src/modules/conference/application/commands/create-conference/create-conference.handler.ts
import { Injectable } from "@nestjs/common"; // Replace with your DI framework
import { IConferenceRepository } from "@/modules/conference/domain/interfaces";
import { ConferenceFactory } from "@/modules/conference/domain/factories";
import { CreateConferenceCommand } from "./create-conference.command";
import { ConferenceDto } from "../../dtos/conference.dto";
import { ValidationPipe } from "@/shared/infrastructure/pipes/validation.pipe";

@Injectable()
export class CreateConferenceHandler {
  constructor(
    private readonly conferenceRepository: IConferenceRepository,
    private readonly validator: ValidationPipe,
    private readonly conferenceFactory: ConferenceFactory,
  ) {}

  async handle(command: CreateConferenceCommand): Promise<ConferenceDto> {
    // 1. Structural Validation (fast fail)
    this.validator.ensureValid(command);

    // 2. Domain Factory / Aggregate Instantiation
    const conference = this.conferenceFactory.create({
      title: command.title,
      capacity: command.capacity,
      organizerId: command.organizerId,
      scheduledAt: command.scheduledAt,
    });

    // 3. Domain Invariant Execution (handled inside aggregate/factory)
    // If domain throws, it bubbles up as a DomainError

    // 4. Persistence
    await this.conferenceRepository.save(conference);

    // 5. Projection to DTO
    return ConferenceDto.fromAggregate(conference);
  }
}
```

```ts
// src/modules/conference/application/queries/get-conference/get-conference.handler.ts
import { Injectable } from "@nestjs/common";
import { IConferenceRepository } from "@/modules/conference/domain/interfaces";
import { GetConferenceQuery } from "./get-conference.query";
import { ConferenceDto } from "../../dtos/conference.dto";
import { NotFoundError } from "@/shared/domain/errors/not-found.error";

@Injectable()
export class GetConferenceHandler {
  constructor(
    private readonly conferenceRepository: IConferenceRepository,
  ) {}

  async handle(query: GetConferenceQuery): Promise<ConferenceDto | null> {
    // 1. Query Execution (Repository Port)
    const conference = await this.conferenceRepository.findById(
      query.conferenceId,
      query.tenantId
    );

    if (!conference) {
      return null; // or throw NotFoundError
    }

    // 2. Projection
    return ConferenceDto.fromAggregate(conference);
  }
}
```

### 3.3 Validation Strategy
- Use schema validators (Zod, Joi, class-validator) for **structural** validation.
- Domain invariants are validated **inside** aggregates/domain services.
- Validation must occur in the handler before domain interaction to prevent wasted infrastructure calls.

### 3.4 Error Handling & Results
- **Domain Errors:** Throw explicit domain exceptions (e.g., `ConferenceCapacityExceededError`).
- **Application Errors:** Wrap infrastructure or unexpected errors in consistent `ApplicationException` payloads.
- Return `Result<T>` only if downstream consumers require explicit success/failure state without exceptions. Otherwise, prefer explicit exception throwing for failure paths.

---

## 4. Anti-Patterns & Common Pitfalls

| Anti-Pattern | Why It Breaks DDD / Architecture | Correct Approach |
|--------------|----------------------------------|------------------|
| **God Handler** | Handler orchestrates DB, auth, logging, formatting, and business rules. Violates SRP and becomes unmaintainable. | Extract logging/middleware to infrastructure. Keep handler to ≤5 lines of orchestration + 1 domain call. |
| **Domain Logic in Application Layer** | Handlers contain `if/else` business rules, calculate discounts, or modify aggregates directly. | Move all invariants, calculations, and state transitions into Domain Entities, Value Objects, or Domain Services. |
| **Leaking Infrastructure Types** | Handlers import `TypeORM Entity`, `Request Object`, or `Express Response`. Breaks layer isolation and testability. | Inject ports/interfaces. Use value objects/DTOs for cross-layer contracts. |
| **Command-Query Mixing** | A single handler mutates and reads, or uses `@Query` decorator for mutations. Breaks CQRS predictability and caching. | Separate directories/namespaces. Commands return `void` or `Result`. Queries return DTOs/Projections. |
| **Bypassing Aggregates for Persistence** | Directly mapping command fields to repository inserts/updates without aggregate boundaries. | Always instantiate aggregates via factories/constructors. Let the aggregate manage consistency. |
| **Unbounded Queries** | `find()`, `findAll()`, or loading full aggregates when a simple projection is needed. | Use dedicated query ports, pagination, and projection handlers. Never expose full aggregates via queries. |
| **Missing Transaction Boundaries** | Multiple repository calls or external HTTP calls without distributed transaction control or compensation. | Wrap handlers in explicit transaction scopes (or Sagas/Outbox pattern for cross-aggregate/external flows). |
| **Circular App-Domain Dependencies** | Application handler imports domain entity methods that reference application services. | Domain layer must remain framework and application-free. Use ports/interfaces for outbound communication. |

### ✅ Quick Validation Checklist for PRs
- [ ] Handler is stateless and constructor-injected only.
- [ ] No framework/presentation types inside `app/`.
- [ ] Commands/Queries are pure DTOs with validation.
- [ ] Domain invariants reside in entities/services, not handlers.
- [ ] CQRS separation is enforced (no mutation in query handlers).
- [ ] Repository ports (not concrete implementations) are injected.
- [ ] Handler execution is wrapped in transactional context where applicable.
- [ ] Tests cover validation failure, domain error, and happy-path projection.

---
*Document Version: 1.0 | Target Type: `app-use-case` | Layer: Application | Pattern: CQRS + Handler*  
*Maintainer: Architecture Council | Review Cadence: Quarterly*
