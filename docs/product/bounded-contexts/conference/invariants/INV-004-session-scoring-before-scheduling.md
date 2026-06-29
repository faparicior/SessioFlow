# INV-004: All Sessions Must Be Scored Before Selection Can Be Completed

* **Status:** Active
* **Bounded Context:** Conference Management Bounded Context
* **Aggregate Root:** `Conference` Aggregate
* **Data Integrity Risk:** Incomplete review process, unfair selection, schedule generation failures

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary. There are no "if-else workflows" or "fallbacks" here—violating this means transaction failure.*

> **Invariant:** The `Conference.completeSelection()` method can only succeed when all submitted sessions have been scored by reviewers.

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * `Conference.sessions` (Collection of Session entities)
  * `Session.score` (Score value object, nullable)
  * `Conference.status` (must be REVIEWING)
* **Transactional Boundary:** Enforced synchronously when `Conference.completeSelection()` is called.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios to illustrate how the aggregate root guards this boundary.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting to complete selection with unscored sessions
  Given an Conference with status REVIEWING
  And 5 sessions exist with scores
  And 2 sessions exist without scores
  When the organizer calls Conference.completeSelection()
  Then the system throws UnscoredSessionsError
  And the Conference status remains REVIEWING
  And no state changes are persisted
```

### Critical Edge Cases Handled:
* **Partial Scoring:** If 95 out of 100 sessions are scored, the operation is rejected with the count of unscored sessions.
* **Late Submissions:** If a submission is accepted after review has started, it must be scored before `completeSelection()` can succeed.
* **Reviewer Absence:** Sessions assigned to unavailable reviewers must be reassigned or marked as exempt before selection can complete.

## 4. Failure Response (Exception Handling)
*What happens when this invariant is violated? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `UnscoredSessionsError`
* **HTTP/API Mapping:** `422 Unprocessable Entity` with details on which sessions are unscored
* **Rollback Behavior:** Complete database transaction rollback. No state is persisted.

## 5. Test Cases
*Concrete test scenarios that verify the invariant is enforced at the integration test level.*

### Positive Test (Invariant Holds)
```gherkin
Scenario: Completing selection with all sessions scored
  Given an Conference with status REVIEWING
  And 10 sessions exist
  And all 10 sessions have scores
  When the organizer calls Conference.completeSelection()
  Then the Conference status transitions to SCHEDULED
  And the SelectionCompleted domain event is published
  And the invariant remains satisfied
```

### Negative Test (Invariant Violation Blocked)
```gherkin
Scenario: Attempting to complete selection with unscored sessions
  Given an Conference with status REVIEWING
  And 10 sessions exist
  And 3 sessions are without scores
  When the organizer calls Conference.completeSelection()
  Then the system throws UnscoredSessionsError
  And HTTP response is 422 Unprocessable Entity
  And database transaction is rolled back
  And no state changes are persisted
  And user receives error message "3 sessions remain unscored. Please score all sessions before completing selection."
```

## 6. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-06-09:** Invariant defined alongside Conference entity lifecycle documentation.
