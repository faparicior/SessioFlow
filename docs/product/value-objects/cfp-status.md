# Value Object: CfpStatus

## 📋 Definition
* **Description:** Enumerated value representing the current state of the Call for Papers. Controls submission behavior.
* **Type:** Enum (string-based)
* **Immutability:** ✅ Immutable
* **Validation:** Must be one of the defined status values

---

## 🎯 Status Values

| Status | Description | Allowed Transitions |
|--------|-------------|---------------------|
| `ACTIVE` | CfP is open and accepting submissions | → `CLOSED` |
| `CLOSED` | CfP is closed, no new submissions | → `ARCHIVED` |
| `ARCHIVED` | CfP is archived with completed event | None (terminal) |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `isValidStatus(status: string)` | Check if string is a valid CfpStatus |
| `canTransitionTo(current: CfpStatus, target: CfpStatus)` | Validate state transition |
| `isAcceptingSubmissions(status: CfpStatus)` | Check if status allows new submissions |
| `isArchived(status: CfpStatus)` | Check if status is archived |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [[cfp-config.md]] | Core property of CfpConfig |
| [[../entities/cfp-config.md]] | State tracking for CfP |
| [[../../application/use-cases/submit-proposal.ts]] | Check if submissions allowed |

---

## 📚 DDD Principles Applied

1. **Encapsulation**: Status is a strong type, not raw string
2. **Validation**: Invalid statuses are rejected at assignment time
3. **Behavior**: Includes transition validation methods
4. **Domain Language**: Uses business terminology (ACTIVE, CLOSED)
5. **Immutability**: Status changes only through explicit domain methods

---

## 🔄 State Transition Matrix

| Current Status | Allowed Next Statuses | Domain Method |
|----------------|----------------------|---------------|
| `ACTIVE` | `CLOSED` | `close()` |
| `CLOSED` | `ARCHIVED` | `archive()` |
| `ARCHIVED` | None | Terminal state |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidCfpStatusError` | Invalid status string provided |
| `InvalidStatusTransitionError` | Attempted illegal state transition |
| `SubmissionNotAllowedError` | Submission attempted when status != ACTIVE |
