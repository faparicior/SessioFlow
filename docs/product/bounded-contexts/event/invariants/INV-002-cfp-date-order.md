# INV-002: Cfp End Date Must Be After Start Date

* **Status:** Active
* **Bounded Context:** Event Management Bounded Context
* **Aggregate Root:** `Event` Aggregate (via `CfpConfig` child entity)
* **Data Integrity Risk:** Invalid submission window, logical impossibility, broken CfP functionality

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary. There are no "if-else workflows" or "fallbacks" here—violating this means transaction failure.*

> **Invariant:** The `cfpEndDate` must always be strictly greater than `cfpStartDate` within the CfpConfig child entity.

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * `CfpConfig.startDate` (CfpStartDate value object)
  * `CfpConfig.endDate` (CfpEndDate value object)
* **Transactional Boundary:** Enforced synchronously during CfpConfig creation or modification within the Event aggregate.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios to illustrate how the aggregate root guards this boundary.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting to set invalid date order
  Given an Event with CfpConfig start date of 2026-07-01
  When the organizer attempts to set end date to 2026-06-15
  Then the system throws InvalidCfpConfigError
  And the CfpConfig dates remain unchanged
  And no state changes are persisted
```

### Critical Edge Cases Handled:
* **Date Modification:** If an organizer tries to change the start date to be after the end date, the operation is rejected.
* **Concurrent Updates:** Two simultaneous requests to update dates are serialized via aggregate locking.
* **Retrospective Changes:** If the CfP end date has already passed, changing the start date to be after the current date is still rejected if it violates the end date constraint.

## 4. Failure Response (Exception Handling)
*What happens when this invariant is violated? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `InvalidCfpConfigError`
* **HTTP/API Mapping:** `422 Unprocessable Entity`
* **Rollback Behavior:** Complete database transaction rollback. No state is persisted.

## 5. Test Cases
*Concrete test scenarios that verify the invariant is enforced at the integration test level.*

### Positive Test (Invariant Holds)
```gherkin
Scenario: Valid CfP date configuration
  Given organizer enters start date 2026-07-01
  And end date 2026-08-31
  When they submit the CfP configuration
  Then the operation succeeds
  And CfpConfig is created with ACTIVE status
  And the invariant remains satisfied
```

### Negative Test (Invariant Violation Blocked)
```gherkin
Scenario: Attempted invalid date order
  Given organizer enters start date 2026-08-31
  And end date 2026-07-01
  When they submit the CfP configuration
  Then the system throws InvalidCfpConfigError
  And HTTP response is 422 Unprocessable Entity
  And database transaction is rolled back
  And no state changes are persisted
  And user receives error message "End date must be after start date"
```

## 6. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-06-09:** Invariant defined alongside CfpConfig entity documentation.
