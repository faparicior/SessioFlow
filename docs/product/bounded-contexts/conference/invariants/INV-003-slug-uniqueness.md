# INV-003: Conference Slug Must Be Unique Across All Conferences

* **Status:** Active
* **Bounded Context:** Conference Management Bounded Context
* **Aggregate Root:** `Conference` Aggregate
* **Data Integrity Risk:** URL collisions, broken links, ambiguous conference identification

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary. There are no "if-else workflows" or "fallbacks" here—violating this means transaction failure.*

> **Invariant:** Every conference slug must be unique across all conferences in the system; no two conferences can share the same slug value.

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * `Conference.slug` (ConferenceSlug value object)
* **Transactional Boundary:** Enforced synchronously during conference creation before persistence.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios to illustrate how the aggregate root guards this boundary.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting to create conference with duplicate slug
  Given a conference exists with slug "tech-conference-2026"
  When another conference is created with the same name "Tech Conference 2026"
  Then the system generates an alternative slug "tech-conference-2026-2"
  And the new conference is created with the alternative slug
  And the invariant (slug uniqueness) is maintained
```

### Critical Edge Cases Handled:
* **Race Conditions:** Two users creating conferences with the same name simultaneously - database UNIQUE constraint provides final protection.
* **Slug Collision After Generation:** Database constraint (`conferences.slug UNIQUE`) ensures no duplicates can be persisted even if application logic fails.
* **Case Sensitivity:** Normalization to lowercase prevents "My-Conference" and "my-conference" from being treated as different.

## 4. Failure Response (Exception Handling)
*What happens when this invariant is violated? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `SlugGenerationError` or `DatabaseUniqueViolationError`
* **HTTP/API Mapping:** `500 Internal Server Error` (rare) or `409 Conflict`
* **Rollback Behavior:** Complete database transaction rollback. No state is persisted.

## 5. Test Cases
*Concrete test scenarios that verify the invariant is enforced at the integration test level.*

### Positive Test (Invariant Holds)
```gherkin
Scenario: Creating conference with unique slug
  Given no conference exists with slug "tech-conference-2026"
  When organizer creates conference named "Tech Conference 2026"
  Then the system generates slug "tech-conference-2026"
  And conference is created successfully
  And the invariant remains satisfied
```

### Negative Test (Invariant Violation Blocked)
```gherkin
Scenario: Slug collision after multiple retry attempts
  Given conferences with slugs "my-conference", "my-conference-2", "my-conference-3" exist
  When organizer creates another conference named "My Conference"
  Then the system throws SlugGenerationError after 3 attempts
  And HTTP response is 500 Internal Server Error
  And database transaction is rolled back
  And no state changes are persisted
  And user receives error message "Unable to create conference. Please try again."
```

## 6. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-06-09:** Invariant defined alongside Conference entity documentation.
* **Database Constraint:** UNIQUE index on `conferences.slug` column provides additional enforcement layer.
