# Entity: Event

## 🛡️ ADR Compliance Checklist
After generating the entity lifecycle document, review the project's Architecture Decision Records (ADRs) to ensure alignment with established architectural decisions.

- [x] Entity is properly designated as Aggregate Root or Child Entity
- [x] Value Objects encapsulate validation and business rules
- [x] Domain behavior is exposed through methods (not data setters)
- [x] State transitions are explicit and validated
- [x] Domain events are published on state changes
- [x] Repository interfaces are defined for data access
- [x] Entity invariants are documented and enforced
- [x] Entity links to relevant User Flows / Journeys
- [x] Domain events are documented with triggers and side effects
- [x] State definitions are clear and unambiguous
- [x] Validation rules are comprehensive

## 📋 Definition & Context
* **Description:** Represents a Call for Papers (CfP) event organized by a user. Contains all configuration, settings, and metadata for a single event lifecycle from creation through completion.
* **Aggregate Root:** ✅ Yes (Event is the aggregate root; manages consistency boundary for CfP configuration, sessions, and schedules)
* **Database Table / Collection:** `events`
* **Primary Key / Identifier:** `EventId` (UUIDv4 Value Object)
* **Owner Team:** Core Event Team
* **Domain Context:** Event Bounded Context (see ADR-009)

---

## 🧱 DDD Structure

### Aggregate Composition
```
EventAggregate
├── Event (Root Entity)
│   ├── id: EventId (Value Object)
│   ├── name: EventName (Value Object)
│   ├── description: Description (Value Object)
│   ├── slug: EventSlug (Value Object)
│   ├── status: EventStatus (Value Object / Enum)
│   ├── createdAt: CreatedAt (Value Object)
│   └── cfpConfig: CfpConfig (Child Entity / Embedded)
│       ├── startDate: CfpStartDate
│       ├── endDate: CfpEndDate
│       └── isActive: CfpStatus
├── Sessions (Child Entities) - Collection of Session entities
└── Domain Services
    └── EventValidationService (validates business rules)
```

### Value Objects Used
| Value Object | Purpose | Referenced Doc |
|--------------|---------|----------------|
| `EventId` | Unique identifier with validation | [[value-objects/event-id]] |
| `EventName` | Event title with length constraints | [[value-objects/event-name]] |
| `EventSlug` | URL-safe identifier generator | [[value-objects/event-slug]] |
| `EventStatus` | State enum (DRAFT, CFP_OPEN, etc.) | [[value-objects/event-status]] |
| `CfpConfig` | Submission window configuration | [[value-objects/cfp-config]] |

---

## 🗺️ State Machine Diagram
*This Mermaid diagram models all valid states and transitions for this entity. It renders natively in GitHub, GitLab, and Obsidian.*

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Event.create()
    DRAFT --> CFP_OPEN : Event.publishCfp()
    CFP_OPEN --> CFP_CLOSED : Event.closeCfp() / CfpDeadlineReached
    CFP_CLOSED --> REVIEWING : Event.startReview()
    REVIEWING --> SCHEDULED : Event.completeSelection()
    SCHEDULED --> PUBLISHED : Event.publishSchedule()
    PUBLISHED --> COMPLETED : Event.complete() / EventDatePassed
    COMPLETED --> [*]
    
    DRAFT --> DELETED : Event.cancel()
    CFP_OPEN --> DELETED : Event.cancel()
    DELETED --> [*]
```

---

## 🔄 State Transition Matrix
*A strict mapping of every allowed state change, the trigger behind it, and any automatic system side-effects.*

| Current State | Domain Method / Event | Target State | Guards / Conditions | Side Effects / Actions |
| :--- | :--- | :--- | :--- | :--- |
| `DRAFT` | `Event.create()` | `DRAFT` | Event name valid; CfP dates in future | Create `CfpConfig` child entity; generate unique slug; publish `EventCreated` domain event. |
| `DRAFT` | `Event.publishCfp()` | `CFP_OPEN` | CfP dates are valid; organizer authorized | Set status to `CFP_OPEN`; publish `CfpOpened` domain event; send welcome email. |
| `DRAFT` | `Event.cancel()` | `DELETED` | No submissions exist | Soft delete; mark as deleted; publish `EventCancelled` domain event. |
| `CFP_OPEN` | `Event.closeCfp()` | `CFP_CLOSED` | CfP end date reached or manual action | Lock submission form; publish `CfpClosed` domain event; notify speakers. |
| `CFP_OPEN` | `CfpDeadlineReached` (cron) | `CFP_CLOSED` | Current time >= cfpEndDate | Auto-close submissions; publish `CfpClosed` domain event. |
| `CFP_CLOSED` | `Event.startReview()` | `REVIEWING` | Submissions exist to review | Enable scoring dashboard; publish `ReviewStarted` domain event. |
| `REVIEWING` | `Event.completeSelection()` | `SCHEDULED` | All sessions scored; acceptances defined | Generate session list; publish `SelectionCompleted` domain event. |
| `SCHEDULED` | `Event.publishSchedule()` | `PUBLISHED` | All sessions assigned to rooms/times | Generate public agenda; publish `SchedulePublished` domain event; send acceptance emails. |
| `PUBLISHED` | `Event.complete()` | `COMPLETED` | Event date passed or manual close | Archive event; publish `EventCompleted` domain event; enable feedback collection. |

---

## 🎯 Domain Behavior

### Core Entity Methods

| Method | Purpose | Pre-conditions | Post-conditions |
|--------|---------|----------------|-----------------|
| `Event.create()` | Initialize new event in DRAFT state | Valid name, CfP dates in future | Event created with `CfpConfig` child |
| `publishCfp()` | Open event for submissions | Status must be `DRAFT` | Status → `CFP_OPEN`; `CfpOpened` event published |
| `closeCfp(reason)` | Close submission window | Status must be `CFP_OPEN` | Status → `CFP_CLOSED`; `CfpClosed` event published |
| `startReview()` | Begin review process | Status must be `CFP_CLOSED` | Status → `REVIEWING`; `ReviewStarted` event published |
| `completeSelection()` | Finalize session selection | Status must be `REVIEWING`; all sessions scored | Status → `SCHEDULED`; `SelectionCompleted` event published |
| `publishSchedule()` | Make schedule public | Status must be `SCHEDULED`; all sessions assigned | Status → `PUBLISHED`; `SchedulePublished` event published |
| `complete()` | Mark event as finished | Status must be `PUBLISHED` or `SCHEDULED` | Status → `COMPLETED`; `EventCompleted` event published |
| `cancel(reason)` | Cancel the event | Status must be `DRAFT` or `CFP_OPEN` | Status → `DELETED`; `EventCancelled` event published |

### Domain Invariants

| Invariant | Description |
|-----------|-------------|
| **Cfp Dates Valid** | `cfpEndDate` must always be after `cfpStartDate` |
| **State Transitions** | Only allowed transitions per state machine (no skipping states) |
| **Session Scoring** | All sessions must be scored before `completeSelection()` can succeed |
| **Session Assignment** | All accepted sessions must have time slots before `publishSchedule()` can succeed |
| **Slug Uniqueness** | Event slug must be unique across all events |

---

## 📐 Mermaid Diagram & State Definition Consistency

This entity lifecycle document follows the consistency guidelines:

1. **State Completeness:** Every state shown in the Mermaid diagram has a corresponding definition in the State Definitions section
2. **Transition Completeness:** Every transition arrow in the Mermaid diagram is documented in the State Transition Matrix
3. **State Names:** Consistent naming using uppercase (e.g., `DRAFT`, `CFP_OPEN`)
4. **Trigger Alignment:** The triggering actions/events in the Mermaid diagram match the "Event / Trigger" column in the State Transition Matrix
5. **Target State Alignment:** The target states in the Mermaid diagram match the "Target State" column in the State Transition Matrix
6. **Domain Methods:** Domain methods shown in the Mermaid (e.g., `Event.publishCfp()`) are documented in the Domain Behavior section
7. **Terminal States:** Terminal states (`DELETED`, `COMPLETED`) are clearly identified in State Definitions

## 🔍 State Definitions
*Detailed criteria for what each state means in plain English.*

| State | Description | Domain Method |
|-------|-------------|---------------|
| `DRAFT` | Event created but not yet published. CfP not visible to speakers. Only organizer can access. | `Event.create()` |
| `CFP_OPEN` | Event is live and accepting proposal submissions. Speakers can submit talks via public form. | `Event.publishCfp()` |
| `CFP_CLOSED` | Submission deadline passed or manually closed. No new submissions accepted. Proposals locked for review. | `Event.closeCfp()`, `CfpDeadlineReached` |
| `REVIEWING` | Organizer actively reviewing and scoring submissions. Scoring dashboard active. Speakers cannot modify submissions. | `Event.startReview()` |
| `SCHEDULED` | Selection complete. Sessions accepted/rejected. Time slots and rooms being assigned. Schedule not yet public. | `Event.completeSelection()` |
| `PUBLISHED` | Event agenda live and visible to public. Speakers notified of acceptance/rejection. Schedule finalized. | `Event.publishSchedule()` |
| `COMPLETED` | Event concluded. All sessions occurred. Data archived for historical reference. Feedback collection may be enabled. | `Event.complete()` |
| `DELETED` | Event cancelled by organizer before going live. All data soft-deleted and no longer accessible. | `Event.cancel()` |

---

## 🛠️ Repository Interface (DDD Pattern)

```typescript
// Repository Interface (abstraction - see ADR-009)
export interface EventRepository {
  findById(id: EventId): Promise<Event | null>;
  findBySlug(slug: EventSlug): Promise<Event | null>;
  findByOrganizerId(organizerId: string): Promise<Event[]>;
  findByStatus(status: EventStatus): Promise<Event[]>;
  save(event: Event): Promise<void>;
  delete(id: EventId): Promise<void>;
}
```

---

## 🔒 Invariants & Business Rules
*Links to the business rules and invariants enforced by this entity.*

**Invariants:**
* [INV-001](../invariants/INV-001-state-transition-validity.md): Event State Transitions Must Follow State Machine
* [INV-002](../invariants/INV-002-cfp-date-order.md): Cfp End Date Must Be After Start Date
* [INV-003](../invariants/INV-003-slug-uniqueness.md): Event Slug Must Be Unique Across All Events
* [INV-004](../invariants/INV-004-session-scoring-before-scheduling.md): All Sessions Must Be Scored Before Selection Can Be Completed
* [INV-005](../invariants/INV-005-session-assignment-before-publishing.md): All Accepted Sessions Must Be Assigned Before Schedule Can Be Published

**Business Rules:**
* [BR-001](../business-rules/BR-001-cfp-dates-validation.md): CfP Dates Must Be Valid
* [BR-002](../business-rules/BR-002-event-name-validation.md): Event Name Must Meet Requirements
* [BR-003](../business-rules/BR-003-slug-uniqueness.md): Event Slug Must Be Unique
* [BR-004](../business-rules/BR-004-free-tier-event-limit.md): Free Tier Event Creation Limit

---

## 🔗 Linked User Stories & Flows
*Relative links to the User Stories/Flows that interact with or trigger mutations on this entity.*

* [[../value-objects/event-id]]: Triggers `Event.create()` → `Event.publishCfp()`
* [[../../flows/journey-03-review-sessions.md]]: Triggers `Event.closeCfp()` → `Event.startReview()` → `Event.completeSelection()`
* [[../../flows/journey-04-acceptance-logistics.md]]: Triggers `Event.publishSchedule()` → `Event.complete()`

---

## 🔗 Domain Events

| Event | Triggered By | Published When |
|-------|--------------|----------------|
| `EventCreated` | `Event.create()` | Event first created in DRAFT state |
| `CfpOpened` | `Event.publishCfp()` | Event transitions to CFP_OPEN |
| `CfpClosed` | `Event.closeCfp()` | Event transitions to CFP_CLOSED |
| `ReviewStarted` | `Event.startReview()` | Event transitions to REVIEWING |
| `SelectionCompleted` | `Event.completeSelection()` | Event transitions to SCHEDULED |
| `SchedulePublished` | `Event.publishSchedule()` | Event transitions to PUBLISHED |
| `EventCompleted` | `Event.complete()` | Event transitions to COMPLETED |
| `EventCancelled` | `Event.cancel()` | Event transitions to DELETED |

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| [[../value-objects/event-id]] | Unique identifier value object |
| [[../value-objects/event-name]] | Event title value object |
| [[../value-objects/event-slug]] | URL-safe slug value object |
| [[../value-objects/event-status]] | State enum value object |
| [[../value-objects/cfp-config]] | CfP configuration value object |
| [[../../adr/009-adopt-domain-driven-design-structure.md]] | DDD architecture decision |
