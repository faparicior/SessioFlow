# Value Object: EventStatus

## 📋 Definition
* **Description:** Enumerated value representing the current state of an Event in its lifecycle. Controls which operations are allowed.
* **Type:** Enum (string-based)
* **Immutability:** ✅ Immutable (state transitions are explicit)
* **Validation:** Must be one of the defined status values

---

## 🎯 Status Values

| Status | Description | Allowed Transitions |
|--------|-------------|---------------------|
| `DRAFT` | Event created but not yet published | → `CFP_OPEN`, `DELETED` |
| `CFP_OPEN` | Event accepting submissions | → `CFP_CLOSED`, `DELETED` |
| `CFP_CLOSED` | Submission deadline passed | → `REVIEWING` |
| `REVIEWING` | Organizer reviewing submissions | → `SCHEDULED` |
| `SCHEDULED` | Sessions selected, scheduling in progress | → `PUBLISHED` |
| `PUBLISHED` | Event agenda public | → `COMPLETED` |
| `COMPLETED` | Event concluded | None (terminal state) |
| `DELETED` | Event cancelled | None (terminal state) |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `isValidStatus(status: string)` | Check if string is a valid EventStatus |
| `canTransitionTo(current: EventStatus, target: EventStatus)` | Validate state transition |
| `isAcceptingSubmissions(status: EventStatus)` | Check if status allows new submissions |
| `isPublished(status: EventStatus)` | Check if status is publicly visible |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [[../entities/event.md]] | Core property of Event aggregate |
| [[../../application/use-cases/create-event.ts]] | Initial status validation |
| [[../../application/use-cases/submit-proposal.ts]] | Check if submissions allowed |

---

## 📚 DDD Principles Applied

1. **Encapsulation**: Status is a strong type, not raw string
2. **Validation**: Invalid statuses are rejected at assignment time
3. **Behavior**: Includes transition validation methods
4. **Domain Language**: Uses business terminology (CFP_OPEN, not "open")
5. **Immutability**: Status changes only through explicit domain methods

---

## 🔄 State Transition Matrix

| Current Status | Allowed Next Statuses | Domain Method |
|----------------|----------------------|---------------|
| `DRAFT` | `CFP_OPEN`, `DELETED` | `publishCfp()`, `cancel()` |
| `CFP_OPEN` | `CFP_CLOSED`, `DELETED` | `closeCfp()`, `cancel()` |
| `CFP_CLOSED` | `REVIEWING` | `startReview()` |
| `REVIEWING` | `SCHEDULED` | `completeSelection()` |
| `SCHEDULED` | `PUBLISHED` | `publishSchedule()` |
| `PUBLISHED` | `COMPLETED` | `complete()` |
| `COMPLETED` | None | Terminal state |
| `DELETED` | None | Terminal state |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidEventStatusError` | Invalid status string provided |
| `InvalidStatusTransitionError` | Attempted illegal state transition |
| `OperationNotAllowedError` | Operation not valid for current status |
