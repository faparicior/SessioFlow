# BR-003: Conference Slug Must Be Unique

* **Status:** Active
* **Domain Context:** Conference Management Bounded Context
* **Business Owner:** Product Team
* **Last Reviewed:** 2026-06-09

---

## 1. Summary
*A clear, single-sentence definition of the business policy written in plain language using the Ubiquitous Language.*

> **Rule:** When creating a conference, then the generated slug must be unique across all conferences in the system, otherwise append a numeric suffix and retry until a unique slug is found.

## 2. Business Context & Rationale
*Why does this rule exist? What business metric, legal requirement, or operational workflow drives this policy?*

* **Objective:** Ensure each conference has a unique, shareable URL that doesn't conflict with other conferences.
* **Source:** User Journey 01 - Setup Conference, Database Schema Design (ADR-002)

## 3. Detailed Rule Logic & Scenarios
*Break down the exact logic. Use tables, bullet points, or Gherkin syntax (Given/When/Then) to cover different edge cases.*

### Evaluation Logic
1. Generate initial slug from conference name (e.g., "My Conference" → "my-conference")
2. Check database for existing slug using `ConferenceRepository.findBySlug()`
3. **If** the slug already exists -> abort creation and throw `SlugExistsError`
   (mapped to `409 SLUG_EXISTS`). There is **no auto-suffix retry** — see decision **D1** in
   [Feature 01](../flows/features/feature-01-conference-creation-with-cfp.md):
   organizer picks a different name
4. **If** the name contains no slug-able characters -> throw `EmptySlugError`
   (mapped to `422 VALIDATION_ERROR`)

### Gherkin Scenarios
```gherkin
Scenario: Unique slug generated
  Given no conference exists with slug "tech-conference-2026"
  When organizer creates conference named "Tech Conference 2026"
  Then the system generates slug "tech-conference-2026"
  And conference is created successfully

Scenario: Slug collision rejected
  Given conference "tech-conference-2026" already exists
  When organizer creates another conference named "Tech Conference 2026"
  Then the request is rejected with 409 SLUG_EXISTS
  And no conference is persisted

Scenario: Name with no slug-able characters
  Given an organizer submits the name "???"
  When the slug is derived from the name
  Then the request is rejected with 422 VALIDATION_ERROR
```

### Asynchronous or Downstream Effects
*Does this rule trigger other business workflows or fire domain events?*
* No async effects - this is a synchronous validation rule during conference creation.

## 4. System Enforcement (How It's Handled)
*Unlike an invariant (which sits strictly inside an Aggregate Root), a business rule can be enforced via Domain Services, Policy objects, or workflow orchestration (like n8n or Saga patterns).*

* **Enforcement Layer:** Application command handler and repository lookup, backed by a database
  unique index

  * `packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts`
    — `CreateConferenceHandler.execute()` calls `ConferenceRepository.findBySlug()` **before** the
    [BR-004](BR-004-free-tier-conference-limit.md) count, so an organizer with a name clash is never
    told they hit a quota
  * `packages/modules/conference/src/domain/value-objects/conference-slug.ts` —
    `ConferenceSlug.create()` normalizes and rejects empty slugs
  * `packages/modules/conference/src/infrastructure/database/conference.repository.ts` —
    `findBySlug()` lookup
  * `packages/shared/database/src/schema.ts` — `conferences_slug_unique` unique index: the last line
    of defence if two requests race past the application check

* **Handling Violations/Exceptions:**
  * Throws `SlugExistsError` → `409 SLUG_EXISTS` (duplicate slug)
  * Throws `EmptySlugError` → `422 VALIDATION_ERROR` (nothing to build a slug from)
  * Transaction aborts; no conference row and no outbox event are written
  * Organizer sees an inline form error asking for a different conference name

## 5. Traceability

*Every edge is a relative link with two ends: adding one here means adding the reciprocal link in
that document, in the same commit. Convention: [Traceability](../../../guidelines/traceability.md).*

### Traces up to

* Journey: [Journey 01 — Setup Conference](../../../../inception/5-user-journeys/journey-01-setup-conference.md)
* Flow: [Journey 01 — Setup Conference & Open CfP](../flows/journey-01-setup-conference.md)
* Feature: [Feature 01 — Conference Creation with CfP](../flows/features/feature-01-conference-creation-with-cfp.md) (`F1-R4`)
* Related rules: [BR-002 — Conference Name Validation](BR-002-conference-name-validation.md) (slug is
  derived from the validated name) · [INV-003 — Conference Slug Must Be Unique](../invariants/INV-003-slug-uniqueness.md)
  (the same policy stated as an invariant)

### Enforced by

one policy, four layers, in this order:

| Layer | Where | Guard | Status |
| ----- | ----- | ----- | ------ |
| Application | `packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts` | `CreateConferenceHandler.execute()` → `findBySlug()` before the BR-004 count | ✅ Verified |
| Domain — value object | `packages/modules/conference/src/domain/value-objects/conference-slug.ts` | `ConferenceSlug.create()` — slugify + empty check | ✅ Verified |
| Infrastructure | `packages/modules/conference/src/infrastructure/database/conference.repository.ts` | `findBySlug()` | ✅ Verified |
| Database | `packages/shared/database/src/schema.ts` | `conferences_slug_unique` | ✅ Verified |

Enforcing entity: [Conference](../entities/conference.md)
Value object: [ConferenceSlug](../value-objects/conference-slug.md)

### Verified by

* `tests/unit/modules/conference/application/commands/create-conference/create-conference.test.ts` —
  "runs the BR-003 slug check before the BR-004 free-tier check", "rejects a duplicate slug with SLUG_EXISTS (409) and persists nothing"
* `tests/unit/modules/conference/domain/value-objects/conference-slug.test.ts` — "generates a slug from a plain name (BR-003)", "rejects names that cannot be converted to a slug"
* `tests/e2e/conference-setup.spec.ts` — "should reject conference with duplicate slug"

### In flight

none.

---

## 6. History & Evolution
*Business rules change frequently based on market conditions. Track changes to this rule here.*

* **2026-06-09:** Rule extracted from Journey 01 and Conference entity documentation.
* **2026-09-15:** Traceability section (§5) added. Corrected against shipped code: the auto-suffix retry
  (steps 3–5: `my-conference-2`, `SlugGenerationError` after 3 attempts) was never implemented and
  contradicted decision **D1** in
  [Feature 01](../flows/features/feature-01-conference-creation-with-cfp.md); §3/§4/§5 now state the
  actual behavior — hard fail with `SlugExistsError` → `409 SLUG_EXISTS`, `EmptySlugError` → 422.
