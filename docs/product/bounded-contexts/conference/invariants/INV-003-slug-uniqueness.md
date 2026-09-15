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

* **Domain Exception:** `SlugExistsError` (duplicate slug → `409 SLUG_EXISTS`) or `EmptySlugError`
  (nothing to build a slug from → `422 VALIDATION_ERROR`)
* **HTTP/API Mapping:** `409 Conflict` (duplicate) or `422 Unprocessable Entity` (unusable name)
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
Scenario: Slug collision blocked
  Given a conference with slug "my-conference" exists
  When organizer creates another conference named "My Conference"
  Then the system throws SlugExistsError
  And HTTP response is 409 Conflict with code SLUG_EXISTS
  And database transaction is rolled back
  And no state changes are persisted
  And organizer receives an inline form error asking for a different conference name
```

## 6. Traceability

*Every edge is a relative link with two ends: adding one here means adding the reciprocal link in
that document, in the same commit. Convention: [Traceability](../../../guidelines/traceability.md).*

### Traces up to

* Journey: [Journey 01 — Setup Conference](../../../../inception/5-user-journeys/journey-01-setup-conference.md)
* Flow: [Journey 01 — Setup Conference & Open CfP](../flows/journey-01-setup-conference.md)
* Feature: [Feature 01 — Conference Creation with CfP](../flows/features/feature-01-conference-creation-with-cfp.md) (`F1-R4`)

### Related rules

* [BR-003 — Conference Slug Must Be Unique](../business-rules/BR-003-slug-uniqueness.md): the same
  constraint seen as an organizer-facing policy. If only one of the two gets updated, they become
  contradictory — update both, in one commit.

### Enforced by

application check plus database constraint: the check gives a good error, the
constraint is what actually guarantees uniqueness under concurrent inserts.

| Layer | Where | Guard | Status |
| ----- | ----- | ----- | ------ |
| Application | `packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts` | `CreateConferenceHandler.execute()` — `findBySlug()` pre-check | ✅ Verified |
| Domain — value object | `packages/modules/conference/src/domain/value-objects/conference-slug.ts` | `ConferenceSlug.create()` — lowercase normalization, `EmptySlugError` | ✅ Verified |
| Domain (repository port) | `packages/modules/conference/src/domain/conference-repository.interface.ts` | `findBySlug()` contract | ✅ Verified |
| Infrastructure | `packages/modules/conference/src/infrastructure/database/conference.repository.ts` | `findBySlug()` implementation | ✅ Verified |
| Database | `packages/shared/database/src/schema.ts` | `conferences_slug_unique` unique index | ✅ Verified |

Enforcing entity: [Conference](../entities/conference.md)
Value object: [ConferenceSlug](../value-objects/conference-slug.md)

### Verified by

* `tests/unit/modules/conference/application/commands/create-conference/create-conference.test.ts` — "rejects a duplicate slug with SLUG_EXISTS (409) and persists nothing", "derives the slug from the conference name (slug is not an input)"
* `tests/unit/modules/conference/domain/value-objects/conference-slug.test.ts` — normalization cases
* `tests/integration/modules/conference/conference-repository.integration.test.ts` — "save + findBySlug round-trip", "returns null for an unknown id or slug"
* `tests/e2e/conference-setup.spec.ts` — "should reject conference with duplicate slug"

### In flight

none.

---

## 7. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **2026-06-09:** Invariant defined alongside Conference entity documentation.
* **2026-09-15:** Traceability section (§6) added. §4/§5 corrected: `SlugGenerationError` and
  `DatabaseUniqueViolationError` do not exist and the auto-suffix retry was never implemented — shipped
  behavior is `SlugExistsError` → `409 SLUG_EXISTS`, guaranteed by the `conferences_slug_unique` index in
  `packages/shared/database/src/schema.ts`.
* **Database Constraint:** UNIQUE index on `conferences.slug` column provides additional enforcement layer.
