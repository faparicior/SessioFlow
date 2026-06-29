# 009-adopt-domain-driven-design-structure

* **Status:** ✅ **APPROVED**
* **Date:** 2026-06-06
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** ADR-009 (Feature-Based Colocation)
* **Amended By:** ADR-002-01 (Supabase DDD Abstraction), ADR-002-03 (Auth Strategy)
* **Related:** [ADR-015](015-adopt-cqrs-pattern.md) (CQRS Pattern)

## Context and Problem Statement

SessioFlow requires a project structure that supports:

1. **Long-Term Maintainability**: Code must remain organized as complexity grows from MVP to full-featured CfP platform
2. **Domain Complexity**: Call-for-Papers involves rich business logic (submissions, reviews, scheduling, speaker management)
3. **Future Feature Expansion**: Complex domain features (advanced scheduling, multi-event management, plugin system) planned for near future
4. **AI-Assisted Development**: Modern AI coding tools reduce DDD overhead, enabling rapid evolution despite architectural complexity

The original MVP Canvas identified core features (submission, review, scheduling). However, market analysis shows Pretalx (leading CfP platform) achieves success through deep domain modeling. SessioFlow must match this capability to compete.

**Decision Drivers:**
- Must support complex business logic from the start (scheduling conflicts, review algorithms, bias prevention)
- Must enable clean separation of concerns for long-term maintenance
- Must accommodate future features without major refactoring
- Must leverage AI coding tools to offset DDD complexity overhead
- Must provide clear bounded contexts for team scaling

## Considered Options

1. **Domain-Driven Design (DDD) Structure (Recommended)**
2. **Feature-Based Colocation**
3. **Layered Architecture (Separate controllers, services, views)**
4. **Simple Flat Structure (All components in one folder)**

## Decision Outcome

**Chosen Option:** "Domain-Driven Design (DDD) Structure"

**Updated Rationale (2026-06-25):**
ADR-002-01 analysis confirms DDD is **essential** for vendor independence, not just maintainability:
- Reduces migration cost from 156-336 hours to 24-42 hours (85% reduction)
- Enables hybrid architecture (Supabase DB + Auth0 + R2) at $0/month
- Makes all external dependencies (auth, storage, database) swappable with 8-14 hours effort
- Critical for MVP flexibility while maintaining $0 budget constraint

**Justification:**
DDD is the optimal choice because it provides long-term architectural stability for a domain-complex application:

1. **Domain Complexity Match**: SessioFlow's core value is in complex business logic (review scoring algorithms, scheduling conflict detection, bias prevention). DDD excels at modeling such complexity.

2. **Future-Proof Architecture**: Planned features (advanced scheduling, multi-event management, plugin system) require clear bounded contexts. DDD provides this from day one, avoiding costly refactoring.

3. **AI-Assisted Development**: Modern AI coding tools (GitHub Copilot, Cursor, Claude) significantly reduce DDD overhead. AI can generate boilerplate, suggest patterns, and explain complex structures, making DDD as fast as feature-based for experienced teams.

4. **Clean Separation**: DDD's layers (Domain, Application, Infrastructure, Interface) provide clear boundaries that prevent business logic leakage and enable independent testing.

5. **Scalability**: As team grows beyond 2-3 developers, DDD's explicit contracts and bounded contexts reduce merge conflicts and coordination overhead.

6. **Pretalx Parity**: Leading CfP platform Pretalx uses domain-centric architecture. To match their feature set (scheduling, reviews, multi-language), DDD provides the necessary foundation.

### Consequences

* **Positive:**
  - Clear domain model: Business logic is explicit and testable
  - Evolution-ready: New features (scheduling, plugins) integrate cleanly
  - AI-friendly: DDD patterns are well-documented, AI tools excel at generating them
  - Independent layers: Domain logic can be tested without UI or infrastructure
  - Team scaling: Bounded contexts reduce coordination overhead
  - Pretalx parity: Matches architecture of leading CfP platform
  - **Vendor Independence:** Reduces migration cost by 85% (per ADR-002-01 analysis)
  - **Hybrid Architecture:** Enables $0/month hybrid approach (Supabase DB + Auth0 + R2)

* **Negative:**
  - Initial complexity: Requires DDD knowledge and discipline
  - More boilerplate: Entities, repositories, services add code volume
  - Steeper learning curve: New developers need DDD training
  - Over-engineering risk: Must resist adding unnecessary complexity
  - **Upfront Investment:** 30-51 hours to implement all abstractions

* **Risks:**
  - Team may struggle with DDD concepts initially
  - AI tools may generate incorrect DDD patterns without guidance
  - May feel slow for simple MVP features without AI assistance
  - Requires discipline to maintain separation of concerns

### Pros and Cons of the Options

#### Option 1: Domain-Driven Design (DDD) Structure

* Good, because it provides explicit domain model with entities, value objects, aggregates, and repositories
* Good, because it separates business logic from infrastructure and UI concerns
* Good, because it enables complex domain features (scheduling, review algorithms) without architectural changes
* Good, because it scales well for teams of 5+ developers with clear bounded contexts
* Good, because it matches Pretalx's architecture for CfP domain complexity
* Good, because AI coding tools excel at generating DDD patterns (well-documented, repetitive structure)
* Good, because it prevents business logic leakage across layers
* Bad, because it requires DDD knowledge and initial learning investment
* Bad, because it adds boilerplate code (repositories, services, DTOs)
* Bad, because it may feel slow for simple MVP features without AI assistance
* Bad, because team discipline is required to maintain separation of concerns

#### Option 2: Feature-Based Colocation

* Good, because it groups all code related to a feature together (components, hooks, tests)
* Good, because it maps directly to user journeys and is intuitive for developers
* Good, because it enables rapid MVP development with minimal architectural overhead
* Good, because it reduces initial onboarding time for new developers
* Good, because it aligns with modern React/Next.js patterns
* Bad, because it lacks explicit domain model, making complex business logic harder to maintain
* Bad, because it requires refactoring when adding complex features (scheduling, advanced reviews)
* Bad, because business logic can leak across feature boundaries
* Bad, because it doesn't scale well beyond 3-4 developers without major restructuring
* Bad, because it doesn't match Pretalx's domain-centric architecture

#### Option 3: Layered Architecture (Separate controllers, services, views)

* Good, because it enforces separation of concerns by technical layer
* Good, because it is a well-established pattern with extensive documentation
* Bad, because it creates artificial boundaries that don't match business domains
* Bad, because it can lead to "anemic" domain models with logic spread across layers
* Bad, because it requires navigating multiple directories to understand a business feature
* Bad, because it increases cognitive load for developers working on domain logic
* Bad, because it doesn't provide clear bounded contexts for complex features

#### Option 4: Simple Flat Structure (All components in one folder)

* Good, because it is simple to understand and set up initially
* Good, because it requires minimal planning and organization
* Bad, because it becomes unmanageable as the codebase grows
* Bad, because it creates merge conflicts when multiple developers work simultaneously
* Bad, because it doesn't support complex domain features
* Bad, because it makes testing and code organization difficult at scale
* Bad, because it doesn't align with SessioFlow's long-term goals

## Project Structure

### DDD Layers

```typescript
src/
├── domain/                     # Domain layer (business logic)
│   ├── conference/             # Conference bounded context
│   │   ├── conference.ts       # Conference entity
│   │   ├── conference.repository.ts  # ConferenceRepository interface
│   │   ├── value-objects/      # ConferenceId, ConferenceName, CfpDates, ConferenceStatus
│   │   └── services/           # Domain services (conference rules)
│   ├── submission/             # Submission bounded context
│   │   ├── submission.ts       # Submission entity
│   │   ├── speaker.ts          # Speaker entity
│   │   ├── submission.repository.ts  # SubmissionRepository interface
│   │   ├── value-objects/      # SubmissionId, Abstract, Title
│   │   └── services/           # Submission validation rules
│   ├── review/                 # Review bounded context
│   │   ├── review.ts           # Review entity
│   │   ├── reviewer.ts         # Reviewer entity
│   │   ├── review.repository.ts  # ReviewRepository interface
│   │   ├── value-objects/      # ReviewId, Criteria, Rating
│   │   └── services/           # Review algorithms, bias detection
│   └── scheduling/             # Scheduling bounded context
│       ├── schedule.ts         # Schedule entity
│       ├── time-slot.ts        # TimeSlot entity
│       ├── schedule.repository.ts  # ScheduleRepository interface
│       ├── value-objects/      # SlotId, Conflict, Availability
│       └── services/           # Scheduling algorithms, conflict detection
│
├── application/                # Application layer (use cases)
│   ├── conference/             # Conference use cases
│   │   ├── create-conference.ts
│   │   ├── publish-cfp.ts
│   │   └── conference-dto.ts
│   ├── submission/             # Submission use cases
│   │   ├── submit-proposal.ts
│   │   ├── get-submission.ts
│   │   └── submission-dto.ts
│   ├── review/                 # Review use cases
│   │   ├── assign-reviewers.ts
│   │   ├── submit-review.ts
│   │   └── review-dto.ts
│   └── scheduling/             # Scheduling use cases
│       ├── generate-schedule.ts
│       ├── detect-conflicts.ts
│       └── schedule-dto.ts
│
├── infrastructure/             # Infrastructure layer (implementation)
│   ├── database/               # Supabase/PostgreSQL implementations
│   │   ├── conference-repository.ts
│   │   ├── submission-repository.ts
│   │   ├── review-repository.ts
│   │   └── scheduling-repository.ts
│   ├── external/               # External services
│   │   ├── resend-email.ts
│   │   └── auth-service.ts
│   └── config/                 # Configuration
│
└── interfaces/                 # Interface layer (entry points)
    ├── web/                    # Next.js pages and components
    │   ├── (auth)/
    │   ├── (dashboard)/
    │   └── api/
    ├── api/                    # REST/tRPC API endpoints
    └── cli/                    # CLI commands (if needed)
```

### Key DDD Concepts Applied

**Entities:** Objects with identity that live in domain context folders (Conference, Submission, Review, Schedule)
**Value Objects:** Immutable objects defined by attributes (Title, Abstract, Score)
**Domain Services:** Business logic that doesn't belong to entities
**Repository Interfaces:** Abstractions for data access (implemented in infrastructure, interfaces live in domain context)
**Application Services:** Use cases that orchestrate domain objects (see [ADR-015](015-adopt-cqrs-pattern.md) for CQRS pattern)
**DTOs:** Data transfer objects for interfaces (API, UI)

**Note on Structure:** Entities and repository interfaces live directly in their domain context folders for better colocation and discoverability. The `domain` folder (singular) contains all bounded contexts.

## AI-Assisted DDD Development

### Why DDD is Feasible with Modern AI Tools

**AI Coding Assistants (2026):**
- GitHub Copilot, Cursor, Claude can generate DDD boilerplate automatically
- AI understands DDD patterns from training data (extensive open-source examples)
- Reduces DDD overhead by 60-70% compared to manual implementation

**Example: Proper DDD Implementation**

```typescript
// Value Object: Encapsulates validation and behavior
export class SubmissionId {
  private constructor(private readonly value: string) {
    if (!value || !/^[a-zA-Z0-9-]+$/.test(value)) {
      throw new InvalidSubmissionIdError('Invalid submission ID');
    }
  }

  static create(id: string): SubmissionId {
    return new SubmissionId(id);
  }

  // No public getter - value is accessed through domain methods
  equals(other: SubmissionId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Value Object: Title with validation
export class Title {
  private readonly MAX_LENGTH = 200;
  
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidTitleError('Title cannot be empty');
    }
    if (value.length > this.MAX_LENGTH) {
      throw new InvalidTitleError(`Title must be less than ${this.MAX_LENGTH} characters`);
    }
  }

  static create(title: string): Title {
    return new Title(title.trim());
  }

  // Behavior-focused method, not a getter
  isLongerThan(other: Title): boolean {
    return this.value.length > other.value.length;
  }
}

// Entity: Submission with domain behavior
export class Submission {
  // Private fields - no public getters
  private readonly id: SubmissionId;
  private readonly title: Title;
  private readonly abstract: string;
  private readonly speakerId: string;
  private status: SubmissionStatus;
  private readonly createdAt: Date;
  private reviews: Review[] = [];

  constructor(props: SubmissionProps) {
    this.id = SubmissionId.create(props.id);
    this.title = Title.create(props.title);
    this.abstract = props.abstract;
    this.speakerId = props.speakerId;
    this.status = props.status || 'draft';
    this.createdAt = props.createdAt || new Date();
  }

  // Domain methods that express behavior, not data access

  submit(): void {
    if (this.status !== 'draft') {
      throw new SubmissionAlreadySubmittedError('Submission is not in draft status');
    }
    if (this.title.isLongerThan(Title.create('Maximum Length Title Here'))) {
      // Business rule validation
    }
    this.status = 'submitted';
  }

  reject(reason: string): void {
    this.assertStatus('submitted');
    if (!reason || reason.trim().length === 0) {
      throw new InvalidRejectionReason('Rejection reason required');
    }
    this.status = 'rejected';
  }

  accept(): void {
    this.assertStatus('submitted');
    this.status = 'accepted';
  }

  addReview(review: Review): void {
    if (this.status !== 'submitted') {
      throw new InvalidReviewOperation('Can only review submitted submissions');
    }
    if (this.hasReviewFrom(review.getReviewerId())) {
      throw new DuplicateReviewError('Review already exists');
    }
    this.reviews.push(review);
  }

  // Domain query methods (not getters)
  hasReviewFrom(speakerId: string): boolean {
    return this.reviews.some(r => r.getReviewerId() === speakerId);
  }

  getAverageScore(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.getScore(), 0);
    return sum / this.reviews.length;
  }

  isEligibleForSchedule(): boolean {
    return this.status === 'accepted' && this.reviews.length >= 3;
  }

  // Private helper
  private assertStatus(expected: SubmissionStatus): void {
    if (this.status !== expected) {
      throw new InvalidStatusTransitionError(
        `Expected status '${expected}' but found '${this.status}'`
      );
    }
  }

  // Repository needs this for persistence (internal use)
  toJSON() {
    return {
      id: this.id.toString(),
      title: this.title.toString(),
      abstract: this.abstract,
      speakerId: this.speakerId,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}

// Repository Interface (abstraction)
export interface SubmissionRepository {
  findById(id: SubmissionId): Promise<Submission | null>;
  findBySpeakerId(speakerId: string): Promise<Submission[]>;
  findByStatus(status: SubmissionStatus): Promise<Submission[]>;
  save(submission: Submission): Promise<void>;
  delete(id: SubmissionId): Promise<void>;
}

// Application Service (use case)
export class SubmitProposal {
  constructor(
    private submissionRepository: SubmissionRepository,
    private conferenceRepository: ConferenceRepository
  ) {}

  async execute(command: SubmitProposalCommand): Promise<Submission> {
    // Validate conference exists
    const conference = await this.conferenceRepository.findById(command.conferenceId);
    if (!conference) {
      throw new ConferenceNotFoundError(command.conferenceId);
    }

    // Check CFP deadline
    if (!conference.isCfpOpen()) {
      throw new CfpClosedError('Call for papers is closed');
    }

    // Create and submit submission
    const submission = new Submission({
      id: generateId(),
      title: command.title,
      abstract: command.abstract,
      speakerId: command.speakerId,
      status: 'draft'
    });

    submission.submit(); // Domain method

    await this.submissionRepository.save(submission);

    return submission;
  }
}
```

**Key DDD Principles Demonstrated:**

1. **Encapsulation**: Private fields, no public getters
2. **Behavior over Data**: Methods express intent (`submit()`, `reject()`)
3. **Validation in Value Objects**: `Title`, `SubmissionId` validate on creation
4. **Domain Invariants**: `assertStatus()` ensures business rules
5. **Repository Pattern**: Abstraction over data persistence
6. **Application Services**: Orchestrate use cases without business logic

**Benefits:**
- ✅ Business logic is explicit and testable
- ✅ Entities protect their invariants
- ✅ Value objects prevent invalid states
- ✅ Clean separation from infrastructure
- ✅ AI can generate this pattern consistently

**Recommendation:**
- Use AI for initial DDD scaffolding
- Review AI output for domain accuracy
- Maintain DDD discipline despite AI assistance

## Links

* [Domain-Driven Design Distilled (Book)](https://www.amazon.com/Domain-Driven-Design-Distilled-Vaughn-Vernon/dp/0134434420)
* [DDD Starter Guide](https://docs.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/domain-driven-design-ddd)
* [Pretalx Architecture](https://docs.pretalx.org/developer/architecture/)
* [Next.js + DDD Pattern](https://nextjs.org/docs/app/building-your-application/structure)
