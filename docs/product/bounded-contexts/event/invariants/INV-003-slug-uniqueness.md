# INV-003: Event Slug Must Be Unique Across All Events

* **Status:** Active
* **Bounded Context:** Event Management Bounded Context
* **Aggregate Root:** `Event` Aggregate
* **Data Integrity Risk:** URL collisions, broken links, ambiguous event identification

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary. There are no "if-else workflows" or "fallbacks" here—violating this means transaction failure.*

> **Invariant:** Every event slug must be unique across all events in the system; no two events can share the same slug value.

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * `Event.slug` (EventSlug value object)
* **Transactional Boundary:** Enforced synchronously during event creation before persistence.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios to illustrate how the aggregate root guards this boundary.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting to create event with duplicate slug
  Given an event exists with slug "tech-conference-2026"
  When another event is created with the same name "Tech Conference 2026"
  Then the system generates an alternative slug "tech-conference-2026-2"
  And the new event is created with the alternative slug
  And the invariant (slug uniqueness) is maintained
```

### Critical Edge Cases Handled:
* **Race Conditions:** Two users creating events with the same name simultaneously - database UNIQUE constraint provides final protection.
* **Slug Collision After Generation:** Database constraint (`events.slug UNIQUE`) ensures no duplicates can be persisted even if application logic fails.
* **Case Sensitivity:** Slugs are normalized to lowercase to prevent "My-Event" and "my-event" from being treated as different.

## 4. Failure Response (Exception Handling)
*What happens when this invariant is violated? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `SlugGenerationError` or `DatabaseUniqueViolationError`
* **HTTP/API Mapping:** `500 Internal Server Error` (rare) or `409 Conflict`
* **Rollback Behavior:** Complete database transaction rollback. No state is persisted.

## 5. Test Cases
*Concrete test scenarios that verify the invariant is enforced at the integration test level.*

### Positive Test (Invariant Holds)
```gherkin
Scenario: Creating event with unique slug
  Given no event exists with slug "tech-conference-2026"
  When organizer creates event named "Tech Conference 2026"
  Then the system generates slug "tech-conference-2026"
  And event is created successfully
  And the invariant remains satisfied
```

### Negative Test (Invariant Violation Blocked)
```gherkin
Scenario: Slug collision after multiple retry attempts
  Given events with slugs "my-event", "my-event-2", "my-event-3" exist
  When organizer creates another event named "My Event"
  Then the system throws SlugGenerationError after 3 attempts
  And HTTP response is 500 Internal Server Error
  And database transaction is rolled back
  And no state changes are persisted
  And user receives error message "Unable to create event. Please try again."
```

## 6. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-06-09:** Invariant defined alongside Event entity documentation.
* **Database Constraint:** UNIQUE index on `events.slug` column provides additional enforcement layer.
