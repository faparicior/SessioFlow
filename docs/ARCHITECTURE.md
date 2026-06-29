# SessioFlow Architecture

Domain-Driven Design (DDD) architecture for the Call-for-Papers platform.

## 🏛️ Layer Structure

```
src/
├── app/                    # Next.js routing only
│   ├── layout.tsx
│   └── page.tsx
│
├── domain/                 # Business logic (vendor-agnostic)
│   └── conference/
│       ├── conference.ts  # Conference entity
│       ├── submission.ts  # Submission entity
│       ├── value-objects/ # ConferenceId, ConferenceName, CfpDates, ConferenceStatus
│       ├── services/      # Domain services (business logic)
│       └── repositories/  # Repository interfaces (ports)
│
├── application/            # Use cases and application services
│   └── conference/
│       ├── create-conference.ts
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
│       └── conference-repository.ts
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
- Entities have identity (ConferenceId, SubmissionId)
- Value objects are immutable (ConferenceName, CfpDates)
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
// Example: Conference entity
export class Conference {
  constructor(
    public readonly id: ConferenceId,
    public readonly name: ConferenceName,
    public readonly slug: ConferenceSlug,
    public readonly status: ConferenceStatus,
    public readonly cfpStartDate: CfpStartDate,
    public readonly cfpEndDate: CfpEndDate,
    public readonly maxSubmissions: MaxSubmissions
  ) {}
}
```

### Value Objects
```typescript
// Example: ConferenceName value object
export class ConferenceName {
  private constructor(private readonly value: string) {}

  static create(name: string): Result<ConferenceName> {
    if (name.length < 3) return Result.fail('Name must be at least 3 characters');
    if (name.length > 100) return Result.fail('Name must be at most 100 characters');
    return Result.ok(new ConferenceName(name));
  }

  getValue(): string {
    return this.value;
  }
}
```

### Repository Pattern
```typescript
// Domain interface (port)
export interface ConferenceRepository {
  findById(id: ConferenceId): Promise<Conference | null>;
  findBySlug(slug: ConferenceSlug): Promise<Conference | null>;
  save(conference: Conference): Promise<void>;
  delete(id: ConferenceId): Promise<void>;
}

// Infrastructure implementation (adapter)
export class SupabaseConferenceRepository implements ConferenceRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: ConferenceId): Promise<Conference | null> {
    const result = await this.db.from('conferences').select('*').eq('id', id.getValue()).single();
    return result ? this.mapToConference(result) : null;
  }

  async save(conference: Conference): Promise<void> {
    await this.db.from('conferences').upsert(this.mapFromConference(conference));
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