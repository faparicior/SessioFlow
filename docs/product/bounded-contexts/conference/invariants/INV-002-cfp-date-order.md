# INV-002: Cfp End Date Must Be After Start Date

* **Status:** Active
* **Bounded Context:** Conference Management Bounded Context
* **Aggregate Root:** `Conference` Aggregate (via `CfpConfig` child entity)
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
* **Transactional Boundary:** Enforced synchronously during CfpConfig creation or modification within the Conference aggregate.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios to illustrate how the aggregate root guards this boundary.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting to set invalid date order
  Given an Conference with CfpConfig start date of 2026-07-01
  When the organizer attempts to set end date to 2026-06-15
  Then the system throws CfpDatesInvalidError
  And the CfpConfig dates remain unchanged
  And no state changes are persisted
```

### Critical Edge Cases Handled:
* **Date Modification:** If an organizer tries to change the start date to be after the end date, the operation is rejected.
* **Concurrent Updates:** Two simultaneous requests to update dates are serialized via aggregate locking.
* **Retrospective Changes:** If the CfP end date has already passed, changing the start date to be after the current date is still rejected if it violates the end date constraint.

## 4. Failure Response (Exception Handling)
*What happens when this invariant is violated? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `CfpDatesInvalidError`
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
  Then the system throws CfpDatesInvalidError
  And HTTP response is 422 Unprocessable Entity
  And database transaction is rolled back
  And no state changes are persisted
  And user receives error message "End date must be after start date"
```

## 6. Traceability

*Every edge is a relative link with two ends: adding one here means adding the reciprocal link in
that document, in the same commit. Convention: [Traceability](../../../guidelines/traceability.md).*

### Traces up to

* Journey: [Journey 01 — Setup Conference](../../../../inception/5-user-journeys/journey-01-setup-conference.md)
* Flow: [Journey 01 — Setup Conference & Open CfP](../flows/journey-01-setup-conference.md)
* Feature: [Feature 01 — Conference Creation with CfP](../flows/features/feature-01-conference-creation-with-cfp.md) (`F1-R3`)

### Related rules

* [BR-001 — CfP Dates Must Be Valid](../business-rules/BR-001-cfp-dates-validation.md): the
  organizer-facing policy (which dates are *acceptable*). This invariant is the narrower structural
  guarantee (`endDate > startDate`, never reversible). Both live in the same guard, so a change here
  is a change there.

### Enforced by

one guard, deliberately in the value object rather than the repository, so no
persisted state can bypass it:

| Layer | Where | Guard | Status |
| ----- | ----- | ----- | ------ |
| Domain — composite VO | `packages/modules/conference/src/domain/value-objects/cfp-config.ts` | `CfpConfig.create()` — throws `CfpDatesInvalidError` when `endDate <= startDate`; also enforces the ≤ 180-day window | ✅ Verified |
| Domain — value object | `packages/modules/conference/src/domain/value-objects/cfp-end-date.ts` | `CfpEndDate.isAfter(other)` | ✅ Verified |
| Contract (shared Zod) | `packages/api-definitions/src/zod/conference.ts` | `ConferenceCreateSchema` `.refine()` — early rejection, not the guarantee | ✅ Verified |
| Reconstitution path | `packages/modules/conference/src/domain/value-objects/cfp-config.ts` | `CfpConfig.fromData()` — intentionally skips the check so historical rows load | ✅ Verified |

Enforcing entity: [CfpConfig](../entities/cfp-config.md)
Value objects: [CfpStartDate](../value-objects/cfp-start-date.md) · [CfpEndDate](../value-objects/cfp-end-date.md) · [CfpConfig](../value-objects/cfp-config.md)

### Verified by

* `tests/unit/modules/conference/domain/cfp-config.test.ts` — "rejects end dates equal to start dates (INV-002)", "rejects end dates before start dates (INV-002)", "accepts the 180-day window boundary", "reconstitutes historical configurations via fromData (past dates allowed)"

### In flight

none.

---

## 7. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-07-18:** Linked to BR-001 business rule documentation.
* **2026-09-15:** Traceability section (§6) added, folding in the former "Related Business Rules" section
  and the `fromData()` reconstitution exemption. Exception name corrected to `CfpDatesInvalidError`
  (`InvalidCfpConfigError` never existed).
* **2026-06-09:** Invariant defined alongside CfpConfig entity documentation.
