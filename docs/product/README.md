# Product Documentation

This directory contains the Domain-Driven Design (DDD) model for SessioFlow, aligned with **ADR-009: Adopt Domain-Driven Design Structure**.

## 📁 Directory Structure

```
docs/
├── product/
│   ├── README.md                          # This file
│   ├── flows/                             # 🎯 User Flow Entry Points
│   │   └── README.md                      # Flow catalog with journey summaries
│   ├── bounded-contexts/                  # DDD Bounded Contexts
│   │   ├── event/                         # Event Bounded Context
│   │   │   ├── entities/                  # Event, CfpConfig
│   │   │   ├── value-objects/             # EventId, EventName, CfpConfig, etc.
│   │   │   ├── flows/                     # Journey 01: Setup Event
│   │   │   ├── business-rules/            # Business Rules (BR-XXX)
│   │   │   └── invariants/                # System Invariants (INV-XXX)
│   │   ├── submission/                    # Submission Bounded Context
│   │   │   ├── entities/                  # Submission, Speaker
│   │   │   ├── value-objects/             # SubmissionId, Title, Abstract
│   │   │   ├── flows/                     # Journey 02: Submit Proposal
│   │   │   ├── business-rules/            # Business Rules (BR-XXX)
│   │   │   └── invariants/                # System Invariants (INV-XXX)
│   │   ├── review/                        # Review Bounded Context
│   │   │   ├── entities/                  # Review, Reviewer, Score
│   │   │   ├── value-objects/             # ReviewId, Criteria, Rating
│   │   │   ├── flows/                     # Journey 03: Review Sessions
│   │   │   ├── business-rules/            # Business Rules (BR-XXX)
│   │   │   └── invariants/                # System Invariants (INV-XXX)
│   │   └── scheduling/                    # Scheduling Bounded Context
│   │       ├── entities/                  # Schedule, TimeSlot, Room
│   │       ├── value-objects/             # SlotId, Conflict, Availability
│   │       ├── flows/                     # Journey 04: Acceptance & Logistics
│   │       ├── business-rules/            # Business Rules (BR-XXX)
│   │       └── invariants/                # System Invariants (INV-XXX)
│   └── shared/                            # Shared Kernel (cross-cutting concerns)
│       └── value-objects/                 # DateTimeRange, Email, etc.
└── templates/                             # Documentation templates
    └── product/
        ├── flows.md                       # User Flow template
        ├── entity-lifecycle.md            # Entity Lifecycle template
        ├── business-rules.md              # Business Rules template
        ├── invariants.md                  # Invariants template
```

## 🏗️ Domain Model by Bounded Context

### Event Bounded Context
| Type | Name | Description |
|------|------|-------------|
| **Aggregate Root** | Event | Main event with CfP configuration |
| **Child Entity** | CfpConfig | Call for Papers configuration |
| **Value Objects** | EventId, EventName, EventSlug, EventStatus, CfpConfig, CfpStartDate, CfpEndDate, CfpStatus, MaxSubmissions | Domain concepts with behavior |
| **Flows** | Journey 01: Setup Event | Create event and open CfP |

### Submission Bounded Context
| Type | Name | Description |
|------|------|-------------|
| **Aggregate Root** | Submission | Speaker proposal submission |
| **Child Entity** | Speaker | Speaker profile and information |
| **Value Objects** | SubmissionId, Title, Abstract, CoSpeakerInvite | Submission-related concepts |
| **Flows** | Journey 02: Submit Proposal | Speaker submits talk |

### Review Bounded Context
| Type | Name | Description |
|------|------|-------------|
| **Aggregate Root** | Review | Review and scoring of submissions |
| **Child Entity** | Reviewer | Reviewer profile and assignments |
| **Value Objects** | ReviewId, Criteria, Rating, Score | Review-related concepts |
| **Flows** | Journey 03: Review Sessions | Organizer reviews submissions |

### Scheduling Bounded Context
| Type | Name | Description |
|------|------|-------------|
| **Aggregate Root** | Schedule | Event schedule and time slots |
| **Child Entity** | TimeSlot, Room | Schedule components |
| **Value Objects** | SlotId, Conflict, Availability | Scheduling concepts |
| **Flows** | Journey 04: Acceptance & Logistics | Publish schedule and notify |

## 🔗 Cross-Context Relationships

| Context | Depends On | Relationship |
|---------|------------|--------------|
| **Submission** | Event | References EventId (published API) |
| **Review** | Submission | References SubmissionId (aggregate boundary) |
| **Scheduling** | Event, Submission | References EventId and accepted SubmissionIds |

## 🗺️ User Flows

User journeys span multiple bounded contexts. See [flows/README.md](./flows/README.md) for:
- Complete journey documentation
- Visual flow diagrams (sequence, flowchart, state)
- Cross-context relationships

## 📚 Documentation Templates

| Template | Purpose | Location |
|----------|---------|----------|
| [flows.md](../templates/product/flows.md) | User journey flow documentation (with 3 diagrams) | `bounded-contexts/*/flows/` |
| [entity-lifecycle.md](../templates/product/entity-lifecycle.md) | Entity state and behavior | `bounded-contexts/*/entities/` |
| [business-rules.md](../templates/product/business-rules.md) | Business logic and policies | `bounded-contexts/*/business-rules/` |
| [invariants.md](../templates/product/invariants.md) | Unbreakable data integrity constraints | `bounded-contexts/*/invariants/` |

## 🛠️ Guidelines

| Guide | Purpose | Location |
|-------|---------|----------|
| [Flow Documentation Structure](./guidelines/flow-documentation-structure.md) | How to create comprehensive flow specs | `guidelines/` |
| [Business Rules vs Invariants](./guidelines/business-rules-vs-invariants.md) | When to use BR vs INV | `guidelines/` |

## 🎯 DDD Principles Applied

1. **Aggregate Design**: Each context has clear aggregate roots with child entities
2. **Value Objects**: All domain concepts with behavior but no identity are value objects
3. **Encapsulation**: Entities and value objects have private constructors
4. **Domain Behavior**: Entities expose methods like `publishCfp()`, `closeCfp()` instead of data setters
5. **Domain Events**: State changes publish domain events (e.g., `CfpOpened`, `CfpClosed`)
6. **Repository Pattern**: Data access abstracted through repository interfaces
7. **Bounded Contexts**: Clear boundaries between Event, Submission, Review, and Scheduling domains

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [ADR-009: DDD Structure](../adr/009-adopt-domain-driven-design-structure.md) | Architecture decision for DDD |
| [Inception Step 6: User Journey Mapping](../inception/6-user-journey-mapping.md) | User journeys (Journey 1-5) |
| [Inception Step 7: Features & Sequencing](../inception/7-features-and-sequencing.md) | Feature waves (MVP, Wave 2, Wave 3) |
| [Create Flow Command](../commands/product/create-flow.md) | Prompt for generating flow docs |
| [Create Entity Lifecycle Command](../commands/product/create-entity-lifecycle.md) | Prompt for generating entity docs |
