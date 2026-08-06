# INV-001: Conference State Transitions Must Follow State Machine

* **Status:** Active
* **Bounded Context:** Conference Management Bounded Context
* **Aggregate Root:** `Conference` Aggregate
* **Data Integrity Risk:** Corrupt state, invalid workflow progression, broken business logic

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary. There are no "if-else workflows" or "fallbacks" here—violating this means transaction failure.*

> **Invariant:** Conference state transitions must follow the defined state machine diagram; no state can be changed except through valid domain methods that enforce allowed transitions.

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * `Conference.status` (ConferenceStatus value object)
  * `Conference.cfpConfig` (CfpConfig child entity)
* **Transactional Boundary:** Enforced synchronously during any command that alters conference state via domain methods.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios to illustrate how the aggregate root guards this boundary.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting invalid state transition
  Given an Conference with status DRAFT
  When a command attempts to transition directly to REVIEWING
  Then the system throws InvalidStateTransitionError
  And the Conference status remains DRAFT
  And no state changes are persisted
```

### Critical Edge Cases Handled:
* **Direct State Mutation:** The `status` field is private and can only be modified through domain methods that validate transitions.
* **Concurrent Transitions:** Optimistic concurrency control via `version` field ensures only one transition can succeed per conference.
* **Skipping States:** Attempting to transition from `DRAFT` directly to `REVIEWING` is rejected; must follow `DRAFT` → `CFP_OPEN` → `CFP_CLOSED` → `REVIEWING`.

## 4. Failure Response (Exception Handling)
*What happens when this invariant is violated? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `InvalidStateTransitionError`
* **HTTP/API Mapping:** `409 Conflict` or `422 Unprocessable Entity`
* **Rollback Behavior:** Complete database transaction rollback. No state is persisted.

## 5. Test Cases
*Concrete test scenarios that verify the invariant is enforced at the integration test level.*

### Positive Test (Invariant Holds)
```gherkin
Scenario: Valid state transition following state machine
  Given an Conference with status DRAFT
  When the organizer calls Conference.publishCfp()
  Then the Conference status transitions to CFP_OPEN
  And the CfpOpened domain event is published
  And the invariant remains satisfied
```

### Negative Test (Invariant Violation Blocked)
```gherkin
Scenario: Attempted invalid state transition
  Given an Conference with status DRAFT
  When a command attempts to transition directly to REVIEWING
  Then the system throws InvalidStateTransitionError
  And HTTP response is 422 Unprocessable Entity
  And database transaction is rolled back
  And no state changes are persisted
  And user receives error message "Invalid state transition from DRAFT to REVIEWING"
```

## 6. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-06-09:** Invariant defined alongside Conference entity lifecycle documentation.
