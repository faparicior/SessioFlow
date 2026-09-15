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
  Then the system throws InvalidStatusTransitionError
  And the Conference status remains DRAFT
  And no state changes are persisted
```

### Critical Edge Cases Handled:
* **Direct State Mutation:** The `status` field is private and can only be modified through domain methods that validate transitions.
* **Concurrent Transitions:** Optimistic concurrency control via `version` field ensures only one transition can succeed per conference.
* **Skipping States:** Attempting to transition from `DRAFT` directly to `REVIEWING` is rejected; must follow `DRAFT` → `CFP_OPEN` → `CFP_CLOSED` → `REVIEWING`.

## 4. Failure Response (Exception Handling)
*What happens when this invariant is violated? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `InvalidStatusTransitionError`
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
  Then the system throws InvalidStatusTransitionError
  And HTTP response is 422 Unprocessable Entity
  And database transaction is rolled back
  And no state changes are persisted
  And user receives error message "Invalid state transition from DRAFT to REVIEWING"
```

## 6. Traceability

*Every edge is a relative link with two ends: adding one here means adding the reciprocal link in
that document, in the same commit. Convention: [Traceability](../../../guidelines/traceability.md).*

### Traces up to

* Journey: [Journey 01 — Setup Conference](../../../../inception/5-user-journeys/journey-01-setup-conference.md)
* Flow: [Journey 01 — Setup Conference & Open CfP](../flows/journey-01-setup-conference.md)
* Feature: [Feature 01 — Conference Creation with CfP](../flows/features/feature-01-conference-creation-with-cfp.md) (`F1-R5`)
* Related rules: [BR-004 — Free Tier Conference Limit](../business-rules/BR-004-free-tier-conference-limit.md)
  (`DELETED` is what keeps a conference out of the free-tier count)

### Enforced by

the transition table is the single source of truth; mutators never assign a status
directly.

| Layer | Where | Guard | Status |
| ----- | ----- | ----- | ------ |
| Domain — value object | `packages/modules/conference/src/domain/value-objects/conference-status.ts` | `TRANSITIONS` table + `ConferenceStatus.canTransitionTo()` | ✅ Verified |
| Domain — aggregate root | `packages/modules/conference/src/domain/conference.ts` | `Conference.publishCfp()` (only `DRAFT → CFP_OPEN`; Wave 1 ships this mutator only) | ✅ Verified |
| Domain — exception | `packages/modules/conference/src/domain/exceptions/invalid-status-transition-error.ts` | `InvalidStatusTransitionError` | ✅ Verified |
| Domain — aggregate (later mutators) | `packages/modules/conference/src/domain/conference.ts` | `closeCfp()` / `publishSchedule()` / `delete()` | ⏳ Planned |

Enforcing entity: [Conference](../entities/conference.md)
Value object: [ConferenceStatus](../value-objects/conference-status.md)

### Verified by

* `tests/unit/modules/conference/domain/value-objects/conference-status.test.ts` — "allows the full lifecycle transition path (INV-001)", "rejects skipped or reversed transitions", "rejects transitions out of terminal states"
* `tests/unit/modules/conference/domain/conference.test.ts` — "transitions DRAFT -> CFP_OPEN (INV-001) and records CfpOpenedEvent", "rejects publishCfp() from non-DRAFT states"
* `tests/unit/modules/conference/domain/value-objects/cfp-status.test.ts` — CfP-side transitions

### In flight

none.

---

## 7. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-06-09:** Invariant defined alongside Conference entity lifecycle documentation.
* **2026-09-15:** Traceability section (§6) added; §2/§4 corrected to the name actually thrown
  (`InvalidStatusTransitionError` — there is no `InvalidStateTransitionError`). The transition table is
  now named as the single source of truth (`TRANSITIONS` + `ConferenceStatus.canTransitionTo()`), and the
  Wave 2 mutators listed in §1 are recorded as ⏳ Planned: only `publishCfp()` exists today.
