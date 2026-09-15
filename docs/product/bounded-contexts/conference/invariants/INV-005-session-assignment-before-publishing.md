# INV-005: All Accepted Sessions Must Be Assigned Before Schedule Can Be Published

* **Status:** Active
* **Bounded Context:** Conference Management Bounded Context
* **Aggregate Root:** `Conference` Aggregate
* **Data Integrity Risk:** Incomplete schedule, public agenda with missing sessions, attendee confusion

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary. There are no "if-else workflows" or "fallbacks" here—violating this means transaction failure.*

> **Invariant:** The `Conference.publishSchedule()` method can only succeed when all accepted sessions have been assigned to time slots and rooms.

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * `Conference.sessions` (Collection of Session entities)
  * `Session.status` (ACCEPTED, REJECTED, or PENDING)
  * `Session.timeSlot` (TimeSlot value object, nullable)
  * `Session.room` (Room value object, nullable)
  * `Conference.status` (must be SCHEDULED)
* **Transactional Boundary:** Enforced synchronously when `Conference.publishSchedule()` is called.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios to illustrate how the aggregate root guards this boundary.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting to publish schedule with unassigned sessions
  Given an Conference with status SCHEDULED
  And 8 sessions are accepted and assigned to time slots
  And 2 sessions are accepted but not assigned
  When the organizer calls Conference.publishSchedule()
  Then the system throws UnassignedSessionsError
  And the Conference status remains SCHEDULED
  And no state changes are persisted
```

### Critical Edge Cases Handled:
* **Room Conflicts:** Two sessions cannot be assigned to the same room at the same time (separate invariant).
* **Time Slot Exhaustion:** If all time slots are filled but sessions remain unassigned, the operation is rejected.
* **Session Status Changes:** If an accepted session is later rejected, the invariant check is re-evaluated.

## 4. Failure Response (Exception Handling)
*What happens when this invariant is violated? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `UnassignedSessionsError`
* **HTTP/API Mapping:** `422 Unprocessable Entity` with details on which sessions are unassigned
* **Rollback Behavior:** Complete database transaction rollback. No state is persisted.

## 5. Test Cases
*Concrete test scenarios that verify the invariant is enforced at the integration test level.*

### Positive Test (Invariant Holds)
```gherkin
Scenario: Publishing schedule with all sessions assigned
  Given an Conference with status SCHEDULED
  And 10 sessions are accepted
  And all 10 sessions are assigned to time slots and rooms
  When the organizer calls Conference.publishSchedule()
  Then the Conference status transitions to PUBLISHED
  And the SchedulePublished domain event is published
  And the invariant remains satisfied
```

### Negative Test (Invariant Violation Blocked)
```gherkin
Scenario: Attempting to publish schedule with unassigned sessions
  Given an Conference with status SCHEDULED
  And 10 sessions are accepted
  And 2 sessions are not assigned to time slots
  When the organizer calls Conference.publishSchedule()
  Then the system throws UnassignedSessionsError
  And HTTP response is 422 Unprocessable Entity
  And database transaction is rolled back
  And no state changes are persisted
  And user receives error message "2 accepted sessions remain unassigned. Please assign all sessions before publishing schedule."
```

## 6. Traceability

*Every edge is a relative link with two ends: adding one here means adding the reciprocal link in
that document, in the same commit. Convention: [Traceability](../../../guidelines/traceability.md).*

### Traces up to

* Journey: [Journey 03 — Selection and Program](../../../../inception/5-user-journeys/journey-03-selection-and-program.md)
* Flow: **none yet** — no flow document exists under `../flows/` for selection & program (⚠️ gap: the
  journey is the only up-link until `journey-03-*` is documented)
* Feature: **none yet** — `../flows/features/` currently holds Feature 01 and 02 only
* Related rules: [INV-004 — All Sessions Must Be Scored Before Scheduling](INV-004-session-scoring-before-scheduling.md)
  (runs first) · [INV-001 — Valid Conference Status Transitions](INV-001-state-transition-validity.md)
  (publishing is a status transition, so both gates apply)

### Enforced by

**not implemented**: scheduling and publishing are outside Wave 1, so every row here
is a specification, not a claim about current code.

| Layer | Where | Guard | Status |
| ----- | ----- | ----- | ------ |
| Domain — aggregate root | `packages/modules/conference/src/domain/conference.ts` | `Conference.publishSchedule()` — reject when any scheduled session lacks a speaker or room | ⏳ Planned |
| Domain — value object | `packages/modules/conference/src/domain/value-objects/` *(file to be created)* | `SpeakerAssignment` / room assignment VO | ⏳ Planned |
| Domain — exception | `packages/modules/conference/src/domain/exceptions/` *(file to be created)* | `UnassignedSessionsError` | ⏳ Planned |
| Database | `packages/shared/database/src/schema.ts` | intended `NOT NULL` on scheduled session assignment columns | ⏳ Planned |

Enforcing entity: *none yet* — no `Session` entity exists in code

### Verified by

* none yet — the Gherkin cases in section 5 are the acceptance criteria the future test suite must
  reproduce

### In flight

none. Same rule as INV-004: when `publishSchedule()` ships, flip the `⏳ Planned` rows
to `✅ Verified` with the real file and method, and record the tests here.

---

## 7. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-06-09:** Invariant defined alongside Conference entity lifecycle documentation.
* **2026-09-15:** Traceability section (§6) added with every enforcement and test row marked ⏳ Planned:
  scheduling and `publishSchedule()` do not exist in Wave 1, so the document is now explicit that this
  invariant is specified rather than enforced.
