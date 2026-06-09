# INV-005: All Accepted Sessions Must Be Assigned Before Schedule Can Be Published

* **Status:** Active
* **Bounded Context:** Event Management Bounded Context
* **Aggregate Root:** `Event` Aggregate
* **Data Integrity Risk:** Incomplete schedule, public agenda with missing sessions, attendee confusion

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary. There are no "if-else workflows" or "fallbacks" here—violating this means transaction failure.*

> **Invariant:** The `Event.publishSchedule()` method can only succeed when all accepted sessions have been assigned to time slots and rooms.

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * `Event.sessions` (Collection of Session entities)
  * `Session.status` (ACCEPTED, REJECTED, or PENDING)
  * `Session.timeSlot` (TimeSlot value object, nullable)
  * `Session.room` (Room value object, nullable)
  * `Event.status` (must be SCHEDULED)
* **Transactional Boundary:** Enforced synchronously when `Event.publishSchedule()` is called.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios to illustrate how the aggregate root guards this boundary.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting to publish schedule with unassigned sessions
  Given an Event with status SCHEDULED
  And 8 sessions are accepted and assigned to time slots
  And 2 sessions are accepted but not assigned
  When the organizer calls Event.publishSchedule()
  Then the system throws UnassignedSessionsError
  And the Event status remains SCHEDULED
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
  Given an Event with status SCHEDULED
  And 10 sessions are accepted
  And all 10 sessions are assigned to time slots and rooms
  When the organizer calls Event.publishSchedule()
  Then the Event status transitions to PUBLISHED
  And the SchedulePublished domain event is published
  And the invariant remains satisfied
```

### Negative Test (Invariant Violation Blocked)
```gherkin
Scenario: Attempting to publish schedule with unassigned sessions
  Given an Event with status SCHEDULED
  And 10 sessions are accepted
  And 2 sessions are not assigned to time slots
  When the organizer calls Event.publishSchedule()
  Then the system throws UnassignedSessionsError
  And HTTP response is 422 Unprocessable Entity
  And database transaction is rolled back
  And no state changes are persisted
  And user receives error message "2 accepted sessions remain unassigned. Please assign all sessions before publishing schedule."
```

## 6. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-06-09:** Invariant defined alongside Event entity lifecycle documentation.
