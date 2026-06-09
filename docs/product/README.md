# Product Documentation

This directory contains the Domain-Driven Design (DDD) model for SessioFlow, aligned with **ADR-009: Adopt Domain-Driven Design Structure**.

## 📁 Directory Structure

```
docs/product/
├── README.md                          # This file
├── entities/                          # Aggregate roots and entities
│   ├── event.md                       # Event aggregate root
│   └── cfp-config.md                  # CfpConfig child entity
├── value-objects/                     # Value objects (immutable, no identity)
│   ├── event-id.md                    # Event identifier
│   ├── event-name.md                  # Event title
│   ├── event-slug.md                  # URL-safe identifier
│   ├── event-status.md                # Event state enum
│   ├── cfp-config.md                  # CfP configuration composite
│   ├── cfp-start-date.md              # CfP start date
│   ├── cfp-end-date.md                # CfP end date
│   ├── cfp-status.md                  # CfP state enum
│   └── max-submissions.md             # Submission limit
└── flows/                             # User journey flows
    └── journey-01-setup-event.md      # Journey 1: Setup Event
```

## 🏗️ Domain Model

### Aggregate Roots

| Aggregate | Description | Child Entities |
|-----------|-------------|----------------|
| **Event** | Main event with CfP configuration, sessions, and scheduling | CfpConfig, Session, Schedule |

### Value Objects

| Value Object | Purpose | Referenced By |
|--------------|---------|---------------|
| `EventId` | Unique event identifier | Event |
| `EventName` | Event title with validation | Event |
| `EventSlug` | URL-safe identifier | Event |
| `EventStatus` | Event state enum | Event |
| `CfpConfig` | CfP configuration (composite) | Event |
| `CfpStartDate` | CfP window start | CfpConfig |
| `CfpEndDate` | CfP window end | CfpConfig |
| `CfpStatus` | CfP state enum | CfpConfig |
| `MaxSubmissions` | Submission limit | CfpConfig |

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| [ADR-009: DDD Structure](../adr/009-adopt-domain-driven-design-structure.md) | Architecture decision for DDD |
| [Inception Step 6: User Journey Mapping](../inception/6-user-journey-mapping.md) | User journeys (Journey 1-5) |
| [Inception Step 7: Features & Sequencing](../inception/7-features-and-sequencing.md) | Feature waves (MVP, Wave 2, Wave 3) |

## 🔗 User Flows

| Flow | Description | Linked Entities |
|------|-------------|-----------------|
| [Journey 01: Setup Event](flows/journey-01-setup-event.md) | Create event and open CfP | Event, CfpConfig |
| Journey 02: Submit Proposal | Speaker submits talk | Event, CfpConfig, Submission |
| Journey 03: Review Sessions | Organizer reviews submissions | Event, Submission, Review |
| Journey 04: Acceptance & Logistics | Publish schedule and notify | Event, Schedule |
| Journey 05: Deployment | Deploy with standard tools | N/A (Infrastructure) |

## 🎯 DDD Principles Applied

1. **Aggregate Design**: Event is the aggregate root, CfpConfig is a child entity
2. **Value Objects**: All domain concepts with behavior but no identity are value objects
3. **Encapsulation**: Entities and value objects have private constructors
4. **Validation**: All constraints enforced at creation time
5. **Domain Behavior**: Entities expose methods like `publishCfp()`, `closeCfp()` instead of data setters
6. **Domain Events**: State changes publish domain events (e.g., `CfpOpened`, `CfpClosed`)
7. **Repository Pattern**: Data access abstracted through repository interfaces

## 📖 Entity Lifecycle Documentation

Each entity document includes:
- **Definition & Context**: Description, aggregate role, database mapping
- **DDD Structure**: Aggregate composition, value objects used
- **State Machine**: Visual diagram of valid states and transitions
- **State Transition Matrix**: Complete mapping of allowed transitions
- **Domain Behavior**: Core methods and business logic
- **State Definitions**: Plain English descriptions of each state
- **Repository Interface**: Data access abstraction
- **Linked Flows**: User stories that interact with the entity
- **Domain Events**: Events published by state changes

## 📖 Value Object Documentation

Each value object document includes:
- **Definition**: Description, type, immutability, validation
- **Validation Rules**: All constraints and business rules
- **Behavior**: Domain-relevant methods
- **Referenced By**: Entities and use cases that use this value object
- **DDD Principles**: How it applies DDD concepts
- **Usage Examples**: Common scenarios
- **Error Conditions**: What errors can be thrown
