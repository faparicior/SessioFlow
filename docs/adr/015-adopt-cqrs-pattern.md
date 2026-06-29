# Adopt CQRS Pattern for Application Layer

* **Status:** ✅ **APPROVED**
* **Date:** 2026-06-29
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** N/A
* **Amended By:** N/A
* **Related:** [ADR-009](009-adopt-domain-driven-design-structure.md) (DDD Structure)

## Context and Problem Statement

SessioFlow's application layer requires a clear, maintainable structure for handling different types of operations:

1. **Write Operations (Commands)**: Create, update, delete operations that change state
2. **Read Operations (Queries)**: Retrieve data without side effects
3. **Response Data Transfer**: API contracts that separate internal domain models from external representations

**Current Challenge:**
- Application services mix command and query responsibilities
- No clear separation between write logic and read logic
- Domain entities exposed directly in API responses (violates encapsulation)
- Difficult to optimize reads and writes independently
- Testing becomes complex when commands and queries are intertwined

**Decision Drivers:**
- Clear separation of concerns between write and read operations
- API stability through dedicated response DTOs
- Independent optimization of read and write paths
- Improved testability through explicit command/query handlers
- Alignment with DDD principles from ADR-009

## Considered Options

1. **CQRS Pattern (Recommended)**
2. **Simple Service Layer**
3. **Repository Methods Directly**

## Decision Outcome

**Chosen Option:** "CQRS Pattern"

**Justification:**
CQRS is the optimal choice for SessioFlow because:

1. **Clear Separation**: Commands (writes) and queries (reads) have different requirements, lifecycles, and optimization strategies
2. **API Contract Stability**: Response DTOs provide stable API contracts independent of domain model changes
3. **Performance Optimization**: Reads can be optimized separately from writes (e.g., denormalized views for queries)
4. **Testability**: Each handler has a single responsibility, making unit testing straightforward
5. **DDD Alignment**: Complements ADR-009 by providing clean application layer structure
6. **Scalability**: As the system grows, CQRS allows independent scaling of read and write operations

### Consequences

* **Positive:**
  - Clear separation between commands and queries
  - Dedicated response DTOs for API contracts
  - Independent optimization of read and write paths
  - Improved testability with single-responsibility handlers
  - Better alignment with DDD application layer from ADR-009
  - Easier to add caching for queries without affecting commands
  - Clear audit trail for command operations

* **Negative:**
  - More boilerplate code (commands, queries, handlers, DTOs)
  - Increased initial complexity for simple operations
  - Requires discipline to maintain separation
  - May feel over-engineered for very simple CRUD operations

* **Risks:**
  - Team may initially struggle with CQRS patterns
  - Risk of over-using CQRS for trivial operations
  - Requires clear guidelines on when to apply CQRS

## Pros and Cons of the Options

### Option 1: CQRS Pattern

**Good, because:**
- Clear separation of command (write) and query (read) responsibilities
- Response DTOs provide stable API contracts independent of domain changes
- Each handler has a single responsibility (easier to test)
- Independent optimization possible (cache queries, optimize commands)
- Natural fit for DDD application layer (ADR-009)
- Enables eventual consistency patterns if needed
- Makes side effects explicit through commands

**Bad, because:**
- More files and boilerplate code
- Initial learning curve for team
- Can feel over-engineered for simple operations
- Requires discipline to maintain separation

### Option 2: Simple Service Layer

**Good, because:**
- Simpler initial structure
- Fewer files and less boilerplate
- Easier to understand for small applications

**Bad, because:**
- Mixes command and query responsibilities
- Domain entities often exposed in API responses
- Harder to optimize reads and writes independently
- Less testable (multiple responsibilities in one service)
- API contracts coupled to domain models

### Option 3: Repository Methods Directly

**Good, because:**
- Minimal abstraction overhead
- Direct access to data operations
- Simple for very basic CRUD

**Bad, because:**
- No application layer orchestration
- Business logic leaks into infrastructure
- No validation or authorization at application level
- Difficult to test business rules
- Violates DDD layer separation (ADR-009)

## CQRS Implementation Structure

### Project Structure

```
src/application/
├── conference/
│   ├── commands/
│   │   ├── create-conference/
│   │   │   ├── create-conference.command.ts    # Command definition
│   │   │   ├── create-conference.handler.ts    # Command handler
│   │   │   └── create-conference.dto.ts        # Response DTO
│   │   ├── update-conference/
│   │   └── publish-cfp/
│   ├── queries/
│   │   ├── get-conference/
│   │   │   ├── get-conference.query.ts         # Query definition
│   │   │   ├── get-conference.handler.ts       # Query handler
│   │   │   └── get-conference.dto.ts           # Response DTO
│   │   └── list-conferences/
│   └── conference-dto.ts                       # Shared DTOs
│
├── submission/
│   ├── commands/
│   │   ├── submit-proposal/
│   │   │   ├── submit-proposal.command.ts
│   │   │   ├── submit-proposal.handler.ts
│   │   │   └── submit-proposal.dto.ts
│   └── queries/
│       └── get-submission/
│           ├── get-submission.query.ts
│           ├── get-submission.handler.ts
│           └── get-submission.dto.ts
```

### Command Pattern

```typescript
// Command Definition
export class CreateConferenceCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly cfpStartDate: Date,
    public readonly cfpEndDate: Date,
    public readonly maxSubmissions: number,
    public readonly organizerId: string
  ) {}
}

// Command Handler
export class CreateConferenceHandler {
  constructor(
    private conferenceRepository: ConferenceRepository,
    private uuidGenerator: UuidGenerator
  ) {}

  async handle(command: CreateConferenceCommand): Promise<CreateConferenceResult> {
    // 1. Validate command
    const validated = CreateConferenceInput.parse(command);
    
    // 2. Create domain entity
    const conference = new Conference({
      id: new ConferenceId(this.uuidGenerator.generate()),
      name: ConferenceName.create(validated.name),
      slug: ConferenceSlug.create(validated.slug),
      cfpStartDate: CfpStartDate.create(validated.cfpStartDate),
      cfpEndDate: CfpEndDate.create(validated.cfpEndDate),
      maxSubmissions: MaxSubmissions.create(validated.maxSubmissions),
      organizerId: validated.organizerId,
      status: ConferenceStatus.DRAFT
    });

    // 3. Persist domain entity
    await this.conferenceRepository.save(conference);

    // 4. Return response DTO
    return Result.ok(new CreateConferenceDto(conference));
  }
}

// Response DTO
export class CreateConferenceDto {
  constructor(conference: Conference) {
    this.id = conference.id.getValue();
    this.name = conference.name.getValue();
    this.slug = conference.slug.getValue();
    this.status = conference.status;
    this.cfpStartDate = conference.cfpStartDate.getValue();
    this.cfpEndDate = conference.cfpEndDate.getValue();
  }

  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly status: string;
  readonly cfpStartDate: Date;
  readonly cfpEndDate: Date;
}
```

### Query Pattern

```typescript
// Query Definition
export class GetConferenceQuery {
  constructor(public readonly id: string) {}
}

// Query Handler
export class GetConferenceHandler {
  constructor(
    private conferenceRepository: ConferenceRepository
  ) {}

  async handle(query: GetConferenceQuery): Promise<GetConferenceResult> {
    const conference = await this.conferenceRepository.findById(
      new ConferenceId(query.id)
    );

    if (!conference) {
      return Result.fail(new ConferenceNotFoundError(query.id));
    }

    return Result.ok(new GetConferenceDto(conference));
  }
}

// Response DTO
export class GetConferenceDto {
  constructor(conference: Conference) {
    this.id = conference.id.getValue();
    this.name = conference.name.getValue();
    this.slug = conference.slug.getValue();
    this.status = conference.status;
    this.cfpStartDate = conference.cfpStartDate.getValue();
    this.cfpEndDate = conference.cfpEndDate.getValue();
    this.maxSubmissions = conference.maxSubmissions.getValue();
    this.submissionCount = conference.getSubmissionCount();
    this.isCfpOpen = conference.isCfpOpen();
  }

  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly status: string;
  readonly cfpStartDate: Date;
  readonly cfpEndDate: Date;
  readonly maxSubmissions: number;
  readonly submissionCount: number;
  readonly isCfpOpen: boolean;
}
```

### Integration with Domain Layer

```typescript
// Application service orchestrates the command
export class CreateConference {
  constructor(
    private handler: CreateConferenceHandler
  ) {}

  async execute(input: CreateConferenceInput): Promise<Result<CreateConferenceDto>> {
    const command = new CreateConferenceCommand(
      input.name,
      input.slug,
      input.cfpStartDate,
      input.cfpEndDate,
      input.maxSubmissions,
      input.organizerId
    );

    return await this.handler.handle(command);
  }
}

// Usage in API controller
app.post('/conferences', async (req, res) => {
  const createConference = new CreateConference(handler);
  const result = await createConference.execute(req.body);
  
  if (result.isFailure) {
    return res.status(400).json(result.error);
  }
  
  return res.status(201).json(result.value);
});
```

## Key CQRS Principles

1. **Commands are verbs**: `CreateConference`, `UpdateConference`, `DeleteConference`
2. **Queries are nouns**: `GetConference`, `ListConferences`, `SearchSubmissions`
3. **Commands change state**: They have side effects and return success/failure
4. **Queries read state**: They have no side effects and return data
5. **Response DTOs**: Separate from domain entities, optimized for API needs
6. **Handlers are single-responsibility**: One command/query per handler
7. **Zod validation**: All commands/queries validated at entry point

## When to Use CQRS

**Use CQRS when:**
- ✅ Operation has business logic requiring validation
- ✅ Operation needs authorization checks
- ✅ Operation requires side effects (email, notifications)
- ✅ Operation is part of complex business process
- ✅ Read and write requirements differ significantly

**Skip CQRS when:**
- ❌ Simple data retrieval without business logic
- ❌ Basic CRUD with no validation
- ❌ Performance-critical reads (use direct database queries)
- ❌ Internal tooling with no API contract needs

## Integration with ADR-009 (DDD Structure)

CQRS complements ADR-009 by:

1. **Application Layer**: Provides clear structure for use cases
2. **Domain Layer**: Commands use domain entities and value objects
3. **Infrastructure Layer**: Handlers use repository interfaces
4. **Interface Layer**: Response DTOs provide stable API contracts

**Dependency Flow:**
```
interfaces (API) → application (CQRS handlers) → domain (entities) → infrastructure (repositories)
```

## Links

* [Domain-Driven Design (ADR-009)](009-adopt-domain-driven-design-structure.md)
* [CQRS Pattern Documentation](https://martinfowler.com/bliki/CQRS.html)
* [Command Pattern](https://refactoring.guru/design-patterns/command)
* [DTO Pattern](https://martinfowler.com/eaaCatalog/dataTransferObject.html)