# INV-[000]: [Short, Strict Title of the Invariant]

* **Status:** [Active | Proposed | Retired]
* **Bounded Context:** [e.g., Conference Management Bounded Context]
* **Aggregate Root:** [e.g., `Conference` Aggregate]
* **Data Integrity Risk:** [e.g., Overbooking, Corrupt State, Financial/Inventory Discrepancy]
* **Invariant Type:** Strict constraint (must be protected inside Aggregate Root, no fallbacks)

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary. There are no "if-else workflows" or "fallbacks" here—violating this means transaction failure.*

> **Invariant:** [e.g., The number of `ConfirmedTickets` can never exceed the `TotalCapacity` of the Conference.]

**Note:** Unlike a business rule, this invariant:
- MUST be enforced synchronously inside the Aggregate Root
- CANNOT have exceptions or fallbacks
- MUST result in immediate transaction rollback if violated
- If violated, the system enters an illegal state

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * `Conference.capacity` (Integer)
  * `Conference.tickets` (Collection of Ticket entities where status == CONFIRMED)
* **Transactional Boundary:** Enforced synchronously during any command that alters ticket state or conference capacity.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios to illustrate how the aggregate root guards this boundary.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting to violate the invariant
  Given [precondition state describing the current valid state]
  When [action or command that would violate the invariant]
  Then [system rejects the operation with [SpecificDomainException]]
  And [no state changes occur]
  And [database transaction is rolled back]
```

### Critical Edge Cases Handled:
* **Edge Case 1:** [Describe critical edge case, e.g., "Capacity Reduction: What happens if an Organizer tries to lower the conference capacity *below* the current number of confirmed tickets?"]
* **Edge Case 2:** [Describe concurrency challenge, e.g., "If two users attempt conflicting operations simultaneously, the aggregate locking mechanism must guarantee serial execution"]

## 4. Failure Response (Exception Handling)
*What happens when this invariant is violated? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `[SpecificDomainException]`
* **HTTP/API Mapping:** `[e.g., 409 Conflict or 422 Unprocessable Entity]`
* **Rollback Behavior:** Complete database transaction rollback. No state is persisted.

## 5. Test Cases
*Concrete test scenarios that verify the invariant is enforced at the integration test level.*

### Positive Test (Invariant Holds)
```gherkin
Scenario: Valid operation that respects the invariant
  Given [valid precondition state]
  When [legitimate action is performed]
  Then [operation succeeds]
  And [invariant remains satisfied]
  And [appropriate domain event is published if applicable]
```

### Negative Test (Invariant Violation Blocked)
```gherkin
Scenario: Attempted violation of the invariant
  Given [precondition state]
  When [action that would violate the invariant]
  Then [system throws [SpecificDomainException]]
  And [HTTP response is [4xx error code]]
  And [database transaction is rolled back]
  And [no state changes are persisted]
  And [user receives clear error message explaining the violation]
```

## 6. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **YYYY-MM-DD:** Invariant defined alongside [related feature/entity introduction].