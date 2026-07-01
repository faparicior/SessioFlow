# Value Object: ConferenceStatus

## 📋 Definition
* **Description:** Enumerated value representing the current state of a Conference in its lifecycle. Controls which operations are allowed.
* **Type:** Enum (string-based)
* **Immutability:** ✅ Immutable (state transitions are explicit)
* **Validation:** Must be one of the defined status values

---

## 🎯 Status Values

| Status | Description | Allowed Transitions |
|--------|-------------|---------------------|
| `DRAFT` | Conference created but not yet published | → `CFP_OPEN`, `DELETED` |
| `CFP_OPEN` | Conference accepting submissions | → `CFP_CLOSED`, `DELETED` |
| `CFP_CLOSED` | Submission deadline passed | → `REVIEWING` |
| `REVIEWING` | Organizer reviewing submissions | → `SCHEDULED` |
| `SCHEDULED` | Sessions selected, scheduling in progress | → `PUBLISHED` |
| `PUBLISHED` | Conference agenda public | → `COMPLETED` |
| `COMPLETED` | Conference concluded | None (terminal state) |
| `DELETED` | Conference cancelled | None (terminal state) |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `isValidStatus(status: string)` | Check if string is a valid ConferenceStatus |
| `canTransitionTo(current: ConferenceStatus, target: ConferenceStatus)` | Validate state transition |
| `isAcceptingSubmissions(status: ConferenceStatus)` | Check if status allows new submissions |
| `isPublished(status: ConferenceStatus)` | Check if status is publicly visible |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [[../entities/conference.md]] | Core property of Conference aggregate |
| [[../../../../../src/application/conference/use-cases/create-conference.ts]] | Initial status validation |
| [[../../../../../src/application/submission/use-cases/submit-proposal.ts]] | Check if submissions allowed |

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
| `InvalidConferenceStatusError` | Invalid status string provided |
| `InvalidStatusTransitionError` | Attempted illegal state transition |
| `OperationNotAllowedError` | Operation not valid for current status |
