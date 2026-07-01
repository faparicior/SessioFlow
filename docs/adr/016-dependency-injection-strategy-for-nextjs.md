# Dependency Injection Strategy for Next.js

* **Status:** Proposed
* **Date:** 2026-07-01
* **Decision Makers:** Technical Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow uses a Domain-Driven Design (DDD) architecture with repository pattern (ADR-009). As the application grows, we need a scalable approach to manage dependencies across layers:
- Domain entities depend on repository interfaces
- Application services depend on domain services and repositories
- Infrastructure implementations need to be injected at runtime
- Testing requires easy mocking of dependencies

The question is: **What dependency injection strategy should we adopt for our Next.js application?**

**Decision Drivers:**
- Must support DDD layer boundaries (ADR-009)
- Must enable easy testing with mocks
- Must work with Next.js Server Components and Client Components
- Must maintain simplicity (Karpathy Principle #2: Simplicity First)
- Must avoid over-engineering (keep files <300 lines)

## Considered Options

1. **Module-Level Singletons (Simple Pattern)**
2. **Factory Functions (Explicit Injection)**
3. **tsyringe (Decorator-based DI Container)**
4. **Context-based DI (Next.js Context)**

## Decision Outcome

**Chosen Option:** "Factory Functions with Explicit Injection"

**Justification:**
- Aligns with Karpathy Principle #2 (Simplicity First) - no external dependencies
- Works seamlessly with existing DDD structure (ADR-009)
- Explicit dependencies make code more readable and testable
- No runtime overhead or complexity from DI containers
- Compatible with Next.js Server/Client Components
- Matches existing patterns in the codebase (repository pattern)

### Consequences

*   **Positive:**
    - Zero dependencies - no new packages to install
    - Explicit dependencies - easy to understand and trace
    - Easy to test - just pass different implementations
    - Works with TypeScript's type system
    - Follows DDD principles (ADR-009)

*   **Negative:**
    - Manual wiring of dependencies at composition root
    - Slightly more boilerplate for complex dependency graphs

*   **Risks:**
    - Potential for manual errors in dependency wiring
    - May become cumbersome for very large dependency graphs

## Pros and Cons of the Options

### Module-Level Singletons

*   Good, because:
    - Simple to implement (no dependencies)
    - Works well for truly global services (database, config)
    - Zero runtime overhead
*   Bad, because:
    - Hard to test (hard to swap implementations)
    - Hidden dependencies (not visible in function signatures)
    - Violates explicit injection principle
    - Difficult to support multi-tenant scenarios

### Factory Functions (Chosen)

*   Good, because:
    - Explicit dependencies in function signatures
    - Easy to test - pass mocks directly
    - Works with TypeScript types
    - No runtime overhead
    - Aligns with DDD repository pattern (ADR-009)
    - Simple and predictable
*   Bad, because:
    - Requires manual wiring at composition root
    - More verbose for complex dependency graphs

### tsyringe (DI Container)

*   Good, because:
    - Automatic dependency resolution
    - Decorator-based syntax
    - Mature library with good TypeScript support
*   Bad, because:
    - Adds external dependency
    - Requires reflection/polyfills for older browsers
    - Hidden dependencies (decorators)
    - Overkill for current project size
    - Conflicts with Next.js Server/Client component model

### Context-based DI

*   Good, because:
    - Built into React/Next.js
    - Works well for UI components
    - No external dependencies
*   Bad, because:
    - Only works in component tree (not in services/repositories)
    - Adds re-render complexity
    - Not suitable for backend services
    - Mixing concerns (UI + business logic)

## Implementation Example

```typescript
// domain/conference/repository.ts
export interface IConferenceRepository {
  findById(id: ConferenceId): Promise<Conference | null>;
  save(conference: Conference): Promise<void>;
}

// infrastructure/database/supabase-conference-repository.ts
export class SupabaseConferenceRepository implements IConferenceRepository {
  constructor(private supabase: SupabaseClient) {
  }
  
  async findById(id: ConferenceId): Promise<Conference | null> {
    // Implementation
  }
  
  async save(conference: Conference): Promise<void> {
    // Implementation
  }
}

// application/conference/create-conference-service.ts
export class CreateConferenceService {
  constructor(
    private conferenceRepository: IConferenceRepository,
    private emailService: IEmailProvider // Optional (ADR-011)
  ) {
  }
  
  async execute(input: CreateConferenceInput): Promise<Result<Conference>> {
    // Use case implementation
  }
}

// interfaces/api/conference-router.ts
// Composition Root - Wire dependencies
const supabase = createSupabaseClient();
const conferenceRepo = new SupabaseConferenceRepository(supabase);
const emailService = createEmailService(); // Optional
const createConference = new CreateConferenceService(conferenceRepo, emailService);

// Now use in API route
export async function POST(request: Request) {
  const result = await createConference.execute(await request.json());
  return Response.json(result);
}
```

## Testing Example

```typescript
// tests/unit/conference/create-conference-service.test.ts
import { MockConferenceRepository } from './mocks/mock-conference-repository';

describe('CreateConferenceService', () => {
  it('creates conference successfully', async () => {
    const mockRepo = new MockConferenceRepository();
    const service = new CreateConferenceService(mockRepo, null); // No email needed
    
    const result = await service.execute(validInput);
    
    expect(result.isSuccess).toBe(true);
    expect(mockRepo.saveCalled).toBe(true);
  });
});
```

## Links

*   [ADR-009](009-adopt-domain-driven-design-structure.md) - Domain-Driven Design Structure
*   [ADR-015](015-adopt-cqrs-pattern.md) - CQRS Pattern for Application Layer
*   [ADR-011](011-00-use-resend-for-email-communications.md) - Optional Email Abstraction