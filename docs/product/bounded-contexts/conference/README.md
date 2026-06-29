# Conference Bounded Context

The Conference Bounded Context manages the lifecycle of Call for Papers (CfP) conferences from creation through completion.

## 📦 Domain Model

### Aggregate Roots

| Entity | Role | Description |
|--------|------|-------------|
| **Conference** | Root Entity | Main conference with CfP configuration, sessions, and scheduling |

### Child Entities

| Entity | Parent | Description |
|--------|--------|-------------|
| **CfpConfig** | Child Entity | Call for Papers submission window configuration |

### Value Objects

| Value Object | Purpose |
|--------------|---------|
| `ConferenceId` | Unique conference identifier |
| `ConferenceName` | Conference title with validation |
| `ConferenceSlug` | URL-safe identifier for public links |
| `ConferenceStatus` | Conference state enum (DRAFT, CFP_OPEN, etc.) |
| `CfpConfig` | CfP configuration (composite) |
| `CfpStartDate` | CfP window start date |
| `CfpEndDate` | CfP window end date |
| `CfpStatus` | CfP state enum (ACTIVE, CLOSED, ARCHIVED) |
| `MaxSubmissions` | Maximum submission limit |

## 🔄 Conference Lifecycle

```
DRAFT → CFP_OPEN → CFP_CLOSED → REVIEWING → SCHEDULED → PUBLISHED → COMPLETED
                                            ↓
                                          DELETED (from DRAFT or CFP_OPEN)
```

## 📚 Documentation

| Type | Document | Description |
|------|----------|-------------|
| **Entity** | [entities/conference.md](entities/conference.md) | Conference aggregate root lifecycle |
| **Entity** | [entities/cfp-config.md](entities/cfp-config.md) | CfP configuration child entity |
| **Flow** | [flows/journey-01-setup-conference.md](flows/journey-01-setup-conference.md) | Journey 1: Setup Conference and Open CfP |

## 🔗 Cross-Context Relationships

| Context | Relationship |
|---------|--------------|
| **Submission** | Conference provides CfP configuration for submissions |
| **Review** | Conference provides submission list for review |
| **Scheduling** | Conference provides sessions for schedule creation |

## 🎯 Domain Events

| Domain Event | Published When |
|-------|----------------|
| `ConferenceCreated` | Conference first created in DRAFT state |
| `CfpOpened` | Conference transitions to CFP_OPEN |
| `CfpClosed` | Conference transitions to CFP_CLOSED |
| `ReviewStarted` | Conference transitions to REVIEWING |
| `SelectionCompleted` | Conference transitions to SCHEDULED |
| `SchedulePublished` | Conference transitions to PUBLISHED |
| `ConferenceCompleted` | Conference transitions to COMPLETED |
| `ConferenceCancelled` | Conference transitions to DELETED |
