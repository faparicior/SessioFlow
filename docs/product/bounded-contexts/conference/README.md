# Conference Bounded Context

The Conference Bounded Context manages the lifecycle of Call for Papers (CfP) conferences from creation through completion.

## 📦 Domain Model

### Aggregate Roots

| Entity | Role | Description |
| ------ | ---- | ----------- |
| **Conference** | Root Entity | Main conference with CfP configuration, sessions, and scheduling |

### Value Objects & Embedded Components

| Component | Type | Description |
| --------- | ---- | ----------- |
| **CfpConfig** | Composite Value Object | Embedded Call for Papers submission window configuration |

### Value Objects

| Value Object | Purpose |
| ------------ | ------- |
| `ConferenceId` | Unique conference identifier |
| `ConferenceName` | Conference title with validation |
| `ConferenceSlug` | URL-safe identifier for public links |
| `ConferenceStatus` | Conference state enum (DRAFT, CFP_OPEN, etc.) |
| `CfpConfig` | CfP configuration (composite) |
| `CfpStartDate` | CfP window start date |
| `CfpEndDate` | CfP window end date |
| `CfpStatus` | CfP state enum (ACTIVE, CLOSED, ARCHIVED) |
| `MaxSubmissions` | Maximum submission limit |
| `ConferenceDescription` | Optional description (≤ 1000 chars, default `''`) — [doc](value-objects/conference-description.md) |
| `OrganizerId` | Organizer / tenant key (BR-004 subject) — [doc](value-objects/organizer-id.md) |
| `RequiresApproval` | Auto-approve flag, defaults `true` — [doc](value-objects/requires-approval.md) |

All twelve value objects in `packages/modules/conference/src/domain/value-objects/` now have a doc.

## 🔄 Conference Lifecycle

The authoritative transition graph is the `TRANSITIONS` table in
`domain/value-objects/conference-status.ts` (INV-001). Shipped vs specified — per
[entities/conference.md](entities/conference.md), which is the source of truth for this split:

```text
✅ Built (Wave 1):
    [*] → DRAFT ──── Conference.create() ────▶ DRAFT ──── publishCfp() ────▶ CFP_OPEN

⏳ Planned (states exist in ConferenceStatus; the mutators below do not):
    CFP_OPEN ──closeCfp()⏳──▶ CFP_CLOSED ──startReview()⏳──▶ REVIEWING
      │                                                      │
      │                                                      ⏳ completeSelection()
      ▼                                                      ▼
    DELETED ◀──cancel()⏳── DRAFT                     SCHEDULED ──publishSchedule()⏳──▶ PUBLISHED ──complete()⏳──▶ COMPLETED
```

> Today `DELETED` is only a value: the repository's `ne(status, 'DELETED')` filter (BR-004) is
> built, but no shipped code can set a conference to `DELETED` — `cancel()` is ⏳ Planned.

## 📚 Documentation

| Type | Document | Description |
| ---- | -------- | ----------- |
| **Entity** | [entities/conference.md](entities/conference.md) | Conference aggregate root lifecycle |
| **Entity** | [entities/cfp-config.md](entities/cfp-config.md) | CfP configuration child entity |
| **Flow** | [flows/journey-01-setup-conference.md](flows/journey-01-setup-conference.md) | Journey 1: Setup Conference and Open CfP |
| **Feature** | [flows/features/feature-01-conference-creation-with-cfp.md](flows/features/feature-01-conference-creation-with-cfp.md) | F1: conference creation with CfP (incl. HTTP error contract) |
| **Feature** | [flows/features/feature-02-conference-dashboard-cfp-link.md](flows/features/feature-02-conference-dashboard-cfp-link.md) | F2: conference dashboard with CfP link |
| **Guideline** | [../../guidelines/traceability.md](../../guidelines/traceability.md) | Traceability convention for every edge below |

## 🔗 Cross-Context Relationships

| Context | Relationship |
| ------- | ------------ |
| **Submission** | Conference provides CfP configuration for submissions |
| **Review** | Conference provides submission list for review |
| **Scheduling** | Conference provides sessions for schedule creation |

## 🎯 Domain Events

Only two event classes exist in `domain/events/` today; the rest are Wave 2+ specification
(mirrors the verified table in [entities/conference.md](entities/conference.md)).

| Domain Event | Emitted By | Status |
| ------------ | ---------- | ------ |
| `ConferenceCreatedEvent` (`CONFERENCE_CREATED`) | `Conference.create()` | ✅ Built — persisted to `outbox_messages` (PENDING) in the ADR-017 transaction |
| `CfpOpenedEvent` (`CFP_OPENED`) | `Conference.publishCfp()` | ✅ Built — same outbox write; **no worker consumes it yet** (`processPending()` is never called; welcome email out of scope per ADR-011-01) |
| `CfpClosedEvent` | ⏳ `Conference.closeCfp()` (not built) | ⏳ Planned — no file in `domain/events/` |
| `ReviewStartedEvent` | ⏳ `Conference.startReview()` (not built) | ⏳ Planned — no file in `domain/events/` |
| `SelectionCompletedEvent` | ⏳ `Conference.completeSelection()` (not built) | ⏳ Planned — no file in `domain/events/` |
| `SchedulePublishedEvent` | ⏳ `Conference.publishSchedule()` (not built) | ⏳ Planned — no file in `domain/events/` |
| `ConferenceCompletedEvent` | ⏳ `Conference.complete()` (not built) | ⏳ Planned — no file in `domain/events/` |
| `ConferenceCancelledEvent` | ⏳ `Conference.cancel()` (not built) | ⏳ Planned — no file in `domain/events/` |
