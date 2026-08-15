# SessioFlow Generic Architectural Rules & DDD Templates

This guide documents the **generic Domain-Driven Design (DDD) and CQRS architectural patterns, invariants, and code templates** for SessioFlow.

AI Coding Agents **must follow these generic templates and rules** whenever creating or modifying domain entities, value objects, use cases, or repositories in any Bounded Context (e.g., `conference`, `submission`, `speaker`, `scheduling`).

---

## 🛠️ Fast Architecture Verification Command

Before declaring any task complete, AI agents **must run the fast architecture checker**:

```bash
# Check all modules across the monorepo:
npm run check:arch

# Scoped check on target module or created file:
npm run check:arch packages/modules/[bounded-context]
```

---

## 🏛️ 1. Layer Boundaries & Package Isolation

| Layer / Package | Allowed Imports | Forbidden Imports |
|---|---|---|
| **Domain Layer** (`packages/modules/[context]/src/domain/`) | `domain/`, `@sessioflow/shared-*`, `node_modules` | `application/`, `infrastructure/`, ORMs (`drizzle-orm`), API Controllers, Next.js, React, Zod |
| **Application Layer** (`packages/modules/[context]/src/application/`) | `application/`, `domain/`, `@sessioflow/shared-*`, `node_modules` | `infrastructure/`, ORMs (`drizzle-orm`), Next.js pages, React components |
| **Infrastructure Layer** (`packages/modules/[context]/src/infrastructure/`) | `infrastructure/`, `domain/`, `@sessioflow/shared-*`, `drizzle-orm`, database drivers | `application/`, Next.js pages, React components |
| **Interfaces / Controllers** (`packages/modules/[context]/src/interfaces/`) | `interfaces/`, `application/`, `@sessioflow/api-definitions`, `@sessioflow/shared-*`, `node_modules` | `domain/` entities directly, `infrastructure/` directly, ORM clients |
| **API Definitions** (`packages/api-definitions/`) | `api-definitions/`, `node_modules` | `domain/`, `application/`, `infrastructure/`, shared database |
| **Event Bus** (`packages/shared/bus/`) | `bus/`, `@sessioflow/shared-logging`, `node_modules` | `domain/`, `application/`, `infrastructure/` |

---

## 🧩 2. Generic DDD Domain Layer Templates

### A. Generic Value Object Template
Location: `packages/modules/[context]/src/domain/value-objects/[vo-name].ts`

```typescript
import { Result } from '@sessioflow/shared-domain';
import { Invalid[VoName]Error } from '../exceptions/invalid-[vo-name]-error';

export class [VoName] {
  /**
   * Static factory method for creating NEW validated Value Objects.
   * Enforces business invariants (e.g. future dates, format checks).
   */
  public static create(rawValue: [PrimitiveType]): Result<[VoName]> {
    if (![VoName].isValid(rawValue)) {
      return Result.fail(new Invalid[VoName]Error());
    }
    return Result.ok(new [VoName](rawValue));
  }

  /**
   * Static factory method for RECONSTITUTING historical records from database.
   * Bypasses time-relative validation (e.g. historical start dates already in past).
   */
  public static fromData(rawValue: [PrimitiveType]): [VoName] {
    return new [VoName](rawValue);
  }

  private static isValid(val: [PrimitiveType]): boolean {
    // Domain validation logic
    return val !== undefined && val !== null;
  }

  /**
   * Private constructor prevents direct external instantiations.
   */
  private constructor(private readonly _value: [PrimitiveType]) {}

  /**
   * Encapsulated getter for the underlying primitive value.
   */
  public get value(): [PrimitiveType] {
    return this._value;
  }

  /**
   * Value Objects MUST implement structural equality comparison.
   */
  public equals(other: [VoName]): boolean {
    if (!other || !(other instanceof [VoName])) return false;
    return this._value === other._value;
  }
}
```

**Key Invariants for Value Objects:**
- Private constructor.
- Static `create()` or `fromString()` factory method for new validated instances.
- Static `fromData()` factory method for database reconstitution (when creation rules like time-relative constraints must not block historical data).
- `get value()` getter.
- `equals(other: [VoName]): boolean` method for structural equality.
- ❌ **NO `implements [VoName]` self-implementation anti-pattern**.
- ❌ **NO dependencies on domain entities or repositories**.

---

### B. Generic Aggregate Root / Domain Entity Template
Location: `packages/modules/[context]/src/domain/[entity-name].ts`

```typescript
import { Result } from '@sessioflow/shared-domain';
import { DomainEvent } from './events/domain-event.interface';
import { [EntityName]Id } from './value-objects/[entity-name]-id';
import { [Field]ValueObject } from './value-objects/[field]-value-object';

export type [EntityName]Data = {
  id: [EntityName]Id;
  field: [Field]ValueObject;
  createdAt: Date;
};

export type Create[EntityName]Params = {
  field: [Field]ValueObject;
};

export class [EntityName] {
  private _domainEvents: DomainEvent[] = [];

  /**
   * Named Constructor for creating NEW domain aggregates.
   * Parameter signature MUST accept Value Objects, NOT raw primitives.
   */
  public static create(params: Create[EntityName]Params): Result<[EntityName]> {
    const id = [EntityName]Id.create();
    const entity = new [EntityName]({
      id: id.value,
      field: params.field,
      createdAt: new Date(),
    });

    entity.recordEvent(new [EntityName]CreatedEvent(entity.id.value));
    return Result.ok(entity);
  }

  /**
   * Reconstitution Factory Method used ONLY by Repository implementations.
   */
  public static fromData(data: [EntityName]Data): [EntityName] {
    return new [EntityName](data);
  }

  private constructor(private readonly _data: [EntityName]Data) {}

  public get id(): [EntityName]Id {
    return this._data.id;
  }

  public get field(): [Field]ValueObject {
    return this._data.field;
  }

  /**
   * Flushes and returns internal recorded domain events for Outbox persistence.
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  protected recordEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}
```

**Key Invariants for Entities:**
- Entity `Data` properties and `create()` factory parameters **MUST use Value Objects**, never raw primitives (`string`, `number`, `boolean`).
- Private constructor with static `create()` (new) and `fromData()` (reconstitution) factory methods.
- Aggregate roots must implement `pullDomainEvents()` for event outbox management.

---

### C. Generic Domain Event Template
Location: `packages/modules/[context]/src/domain/events/[event-name]-event.ts`

```typescript
import { DomainEvent } from '@sessioflow/shared-domain';

export class [EntityName]CreatedEvent implements DomainEvent {
  public readonly type = '[ENTITY]_CREATED';
  public readonly timestamp: Date;

  constructor(public readonly aggregateId: string) {
    this.timestamp = new Date();
  }

  /**
   * Required for Outbox payload serialization.
   */
  public toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      aggregateId: this.aggregateId,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
```

**Key Invariants for Domain Events:**
- Must reside in `domain/events/` and end with `Event`.
- Must define `type` discriminator tag and `timestamp` / `occurredOn`.
- Must implement `toJSON()` serialization method.

---

### D. Generic Domain Exception Template
Location: `packages/modules/[context]/src/domain/exceptions/[exception-name]-error.ts`

```typescript
import { DomainError, EntityNotFoundError } from '@sessioflow/shared-domain/exceptions';

export class [EntityName]NotFoundError extends EntityNotFoundError {
  constructor(id: string) {
    super('NOT_FOUND', `[EntityName] with ID "${id}" was not found.`);
    this.name = '[EntityName]NotFoundError';
  }
}
```

**Key Invariants for Exceptions:**
- Must reside in `domain/exceptions/` and end with `Error`.
- Must extend base `DomainError`, `EntityNotFoundError`, `DomainForbiddenError`, or `DomainConflictError`.

---

### E. Generic Domain Repository Interface Template
Location: `packages/modules/[context]/src/domain/[entity-name].repository.interface.ts`

```typescript
import { [EntityName] } from './[entity-name]';
import { [EntityName]Id } from './value-objects/[entity-name]-id';

export interface [EntityName]Repository {
  findById(id: [EntityName]Id): Promise<[EntityName] | null>;
  save(entity: [EntityName]): Promise<void>;
  delete(id: [EntityName]Id): Promise<void>;
}
```

**Key Invariants for Repository Interfaces:**
- Must reside in `domain/`.
- ❌ **Zero dependencies** on ORMs (`drizzle-orm`), database clients, or infrastructure.

---

## ⚡ 3. Generic CQRS Application Layer Templates

Co-located Feature Folder Structure:
```
packages/modules/[context]/src/application/[commands|queries]/[feature-name]/
├── [feature-name].command.ts    # DTO
├── [feature-name].handler.ts    # Handler
└── [feature-name].response.ts   # Response DTO
```

### A. Generic Command DTO Template (`*.command.ts`)

```typescript
export type [FeatureName]Input = {
  field: string;
};

export class [FeatureName]Command {
  public static from(input: [FeatureName]Input): [FeatureName]Command {
    return new [FeatureName]Command(input.field);
  }

  private constructor(public readonly field: string) {}
}
```

**Key Invariants:**
- Class named `*Command`, exports an `Input` type alias.
- ❌ **Must NOT import from `domain/` layer**.

---

### B. Generic Command Handler Template (`*.handler.ts`)

```typescript
import { Result } from '@sessioflow/shared-domain';
import { Logger } from '@sessioflow/shared-logging';
import { OutboxRepository } from '@sessioflow/shared-domain/repositories';
import { [FeatureName]Command } from './[feature-name].command';
import { [FeatureName]Response } from './[feature-name].response';

export class [FeatureName]Handler {
  constructor(
    private readonly repository: [EntityName]Repository,
    private readonly outboxRepository: OutboxRepository,
    private readonly logger: Logger,
  ) {}

  public async execute(command: [FeatureName]Command): Promise<Result<[FeatureName]Response>> {
    this.logger.info('Executing [FeatureName]Command', { command });

    // 1. Domain logic execution
    // 2. Outbox event persistence:
    // const events = aggregate.pullDomainEvents();
    // await this.outboxRepository.saveAll(events, '[Aggregate]', aggregate.id.value);

    // 3. Return mapped response DTO
    return Result.ok([FeatureName]Response.from(aggregate));
  }
}
```

**Key Invariants:**
- Filename ends with `.handler.ts` and class ends with `Handler`.
- Must implement `execute(command/query)` method.
- ❌ **NO `console.log()`** — must call structured Pino logger.
- Command Handlers must accept `OutboxRepository` for event persistence.
- Query Handlers must be read-only.

---

### C. Generic Response DTO Template (`*.response.ts`)

```typescript
import { [EntityName] } from '../../../domain/[entity-name]';

export class [FeatureName]Response {
  /**
   * Static factory maps domain entity to primitives.
   */
  public static from(entity: [EntityName]): [FeatureName]Response {
    return new [FeatureName]Response(
      entity.id.value,
      entity.field.value,
      entity.createdAt,
    );
  }

  /**
   * Private constructor with ONLY readonly primitive fields.
   */
  private constructor(
    public readonly id: string,
    public readonly field: string,
    public readonly createdAt: Date,
  ) {}
}
```

**Key Invariants for Response DTOs:**
- Private constructor with `readonly` primitive fields ONLY.
- Exactly ONE method: static `from(entity)`.
- ❌ **NO instance methods, extra getters, or domain entity references**.

---

## 💾 4. Generic Infrastructure Layer Template

Location: `packages/modules/[context]/src/infrastructure/database/[entity-name].repository.ts`

```typescript
import { [EntityName]Repository } from '../../domain/[entity-name].repository.interface';
import { [EntityName] } from '../../domain/[entity-name]';
import { [EntityName]Id } from '../../domain/value-objects/[entity-name]-id';

export class Drizzle[EntityName]Repository implements [EntityName]Repository {
  public async findById(id: [EntityName]Id): Promise<[EntityName] | null> {
    const record = await this.db.query.[entityTable].findFirst({ where: ... });
    if (!record) return null;

    // Reconstitute domain entity via static .fromData factory method
    return [EntityName].fromData({
      id: [EntityName]Id.fromString(record.id).value,
      field: [Field]ValueObject.create(record.field).value,
      createdAt: record.createdAt,
    });
  }
}
```

**Key Invariants:**
- Class ends with `Repository` in `infrastructure/`.
- Reconstitutes domain entities using `Entity.fromData(...)` (never calling private entity constructors directly).

---

## ❌ Summary Table of Anti-Patterns vs Standard DDD Patterns

| Anti-Pattern | Standard Pattern |
|---|---|
| Entity parameter: `create({ name: string })` | Value Object parameter: `create({ name: ConferenceName })` |
| Primitive field in Entity Data: `name: string` | Value Object field: `name: ConferenceName` |
| `class ConferenceName implements ConferenceName` | `class ConferenceName` (remove self-implementation) |
| Using `console.log()` in Handler | `this.logger.info('Executing command', { id })` |
| Direct ORM import in Domain Repository | Define interface in `domain/`, implementation in `infrastructure/` |
| Returning Domain Entity in HTTP Response | Map through Response DTO: `CreateConferenceResponse.from(entity)` |
| Direct `new Entity(...)` in Repository | Reconstitute via `Entity.fromData(dbRecord)` |

---

*Generated for AI Code Generation Agents working on SessioFlow monorepo.*
