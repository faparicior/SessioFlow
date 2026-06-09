# Event Bounded Context

The Event Bounded Context manages the lifecycle of Call for Papers (CfP) events from creation through completion.

## 📦 Domain Model

### Aggregate Roots

| Entity | Role | Description |
|--------|------|-------------|
| **Event** | Root Entity | Main event with CfP configuration, sessions, and scheduling |

### Child Entities

| Entity | Parent | Description |
|--------|--------|-------------|
| **CfpConfig** | Event | Call for Papers submission window configuration |

### Value Objects

| Value Object | Purpose |
|--------------|---------|
| `EventId` | Unique event identifier |
| `EventName` | Event title with validation |
| `EventSlug` | URL-safe identifier for public links |
| `EventStatus` | Event state enum (DRAFT, CFP_OPEN, etc.) |
| `CfpConfig` | CfP configuration (composite) |
| `CfpStartDate` | CfP window start date |
| `CfpEndDate` | CfP window end date |
| `CfpStatus` | CfP state enum (ACTIVE, CLOSED, ARCHIVED) |
| `MaxSubmissions` | Maximum submission limit |

## 🔄 Event Lifecycle

```
DRAFT → CFP_OPEN → CFP_CLOSED → REVIEWING → SCHEDULED → PUBLISHED → COMPLETED
                                            ↓
                                          DELETED (from DRAFT or CFP_OPEN)
```

## 📚 Documentation

| Type | Document | Description |
|------|----------|-------------|
| **Entity** | [entities/event.md](entities/event.md) | Event aggregate root lifecycle |
| **Entity** | [entities/cfp-config.md](entities/cfp-config.md) | CfP configuration child entity |
| **Flow** | [flows/journey-01-setup-event.md](flows/journey-01-setup-event.md) | Journey 1: Setup Event and Open CfP |

## 🔗 Cross-Context Relationships

| Context | Relationship |
|---------|--------------|
| **Submission** | Event provides CfP configuration for submissions |
| **Review** | Event provides submission list for review |
| **Scheduling** | Event provides sessions for schedule creation |

## 🎯 Domain Events

| Event | Published When |
|-------|----------------|
| `EventCreated` | Event first created in DRAFT state |
| `CfpOpened` | Event transitions to CFP_OPEN |
| `CfpClosed` | Event transitions to CFP_CLOSED |
| `ReviewStarted` | Event transitions to REVIEWING |
| `SelectionCompleted` | Event transitions to SCHEDULED |
| `SchedulePublished` | Event transitions to PUBLISHED |
| `EventCompleted` | Event transitions to COMPLETED |
| `EventCancelled` | Event transitions to DELETED |
