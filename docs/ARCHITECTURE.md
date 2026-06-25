# SessioFlow Architecture

Domain-Driven Design (DDD) architecture for the Call-for-Papers platform.

## 🏛️ Layer Structure

```
src/
├── app/                    # Next.js routing only
│   ├── layout.tsx
│   └── page.tsx
│
├── domains/                # Business logic (vendor-agnostic)
│   └── event/
│       ├── entities/      # Event, Submission, Review (with identity)
│       ├── value-objects/ # EventId, EventName, CfpDates, EventStatus
│       ├── services/      # Domain services (business logic)
│       └── repositories/  # Repository interfaces (ports)
│
├── application/            # Use cases and application services
│   └── event/
│       ├── create-event.ts
│       ├── submit-proposal.ts
│       └── review-submission.ts
│
├── infrastructure/         # External service implementations
│   ├── external/
│   │   ├── auth0-provider.ts
│   │   ├── supabase-auth-adapter.ts
│   │   ├── cloudflare-r2-adapter.ts
│   │   └── resend-email-adapter.ts
│   └── database/
│       └── event-repository.ts
│
└── interfaces/            # UI and API entry points
    ├── web/
    │   ├── (dashboard)/   # Dashboard routes
    │   └── (auth)/        # Authentication routes
    └── api/
        └── v1/            # RESTful API endpoints
```

## 🔑 Core Principles

### Domain Layer
- **Pure business logic** with no external dependencies
- Entities have identity (EventId, SubmissionId)
- Value objects are immutable (EventName, CfpDates)
- Repository interfaces defined here, implemented in infrastructure

### Application Layer
- Orchestrates use cases using domain services
- Handles transaction boundaries
- Coordinates between domain and infrastructure

### Infrastructure Layer
- Implements repository interfaces from domain
- Handles external services (Auth0, Supabase, Cloudflare R2, Resend)
- Database access and persistence

### Interfaces Layer
- Web interfaces (Next.js pages and components)
- API routes (RESTful endpoints)
- Handles HTTP request/response

## 📐 DDD Patterns

### Entities
```typescript
// Example: Event entity
export class Event {
  constructor(
    public readonly id: EventId,
    public readonly name: EventName,
    public readonly slug: EventSlug,
    public readonly status: EventStatus,
    public readonly cfpStartDate: CfpStartDate,
    public readonly cfpEndDate: CfpEndDate,
    public readonly maxSubmissions: MaxSubmissions
  ) {}
}
```

### Value Objects
```typescript
// Example: EventName value object
export class EventName {
  private constructor(private readonly value: string) {}

  static create(name: string): Result<EventName> {
    if (name.length < 3) return Result.fail('Name must be at least 3 characters');
    if (name.length > 100) return Result.fail('Name must be at most 100 characters');
    return Result.ok(new EventName(name));
  }

  getValue(): string {
    return this.value;
  }
}
```

### Repository Pattern
```typescript
// Domain interface (port)
export interface EventRepository {
  findById(id: EventId): Promise<Event | null>;
  findBySlug(slug: EventSlug): Promise<Event | null>;
  save(event: Event): Promise<void>;
  delete(id: EventId): Promise<void>;
}

// Infrastructure implementation (adapter)
export class SupabaseEventRepository implements EventRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: EventId): Promise<Event | null> {
    const result = await this.db.from('events').select('*').eq('id', id.getValue()).single();
    return result ? this.mapToEvent(result) : null;
  }

  async save(event: Event): Promise<void> {
    await this.db.from('events').upsert(this.mapFromEvent(event));
  }
}
```

## 🔗 Dependencies

```
interfaces → application → domains
                ↓
         infrastructure
```

- **interfaces** depend on **application** for use cases
- **application** depends on **domains** for business logic
- **infrastructure** implements **domains** repository interfaces
- **domains** has NO dependencies on other layers

## 🎯 Design Rules

1. **Domain layer must be framework-agnostic**
2. **Infrastructure implements interfaces defined in domain**
3. **Application orchestrates, doesn't contain business logic**
4. **Interfaces handle only HTTP/UI concerns**
5. **Repository pattern for data access**
6. **Value objects for validated domain data**

## 📚 Related Documentation

- [Architecture Decision Records](../docs/adr/README.md)
- [Testing Strategy](./TESTING.md)
- [API Design](./API-DESIGN.md)