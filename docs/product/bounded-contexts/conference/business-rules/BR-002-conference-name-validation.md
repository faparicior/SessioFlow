# BR-002: Conference Name Must Meet Requirements

* **Status:** Active
* **Domain Context:** Conference Management Bounded Context
* **Business Owner:** Product Team
* **Last Reviewed:** 2026-06-09

---

## 1. Summary
*A clear, single-sentence definition of the business policy written in plain language using the Ubiquitous Language.*

> **Rule:** When creating a conference, then the conference name must be between 3-100 characters and contain valid characters, otherwise reject the operation with a validation error.

## 2. Business Context & Rationale
*Why does this rule exist? What business metric, legal requirement, or operational workflow drives this policy?*

* **Objective:** Ensure conference names are meaningful, displayable, and suitable for URL slugs while preventing abuse or broken links.
* **Source:** User Journey 01 - Setup Conference, UI/UX Design Specifications

## 3. Detailed Rule Logic & Scenarios
*Break down the exact logic. Use tables, bullet points, or Gherkin syntax (Given/When/Then) to cover different edge cases.*

### Evaluation Logic
* **If** `eventName.length < 3` -> Throw `ConferenceNameTooShortError: "Conference name must be at least 3 characters"`
* **If** `eventName.length > 100` -> Throw `ConferenceNameTooLongError: "Conference name cannot exceed 100 characters"`
* **If** `eventName` contains invalid characters (e.g., control characters) -> Sanitize or reject
* **Else** -> Allow conference creation; generate slug from sanitized name

### Gherkin Scenarios
```gherkin
Scenario: Valid conference name
  Given the organizer enters conference name "Tech Conference 2026"
  When they submit the form
  Then the system accepts the name
  And generates slug "tech-conference-2026"

Scenario: Name too short
  Given the organizer enters conference name "ABC"
  When they submit the form
  Then the system displays error "Conference name must be at least 3 characters"

Scenario: Name too long
  Given the organizer enters a 150-character conference name
  When they submit the form
  Then the system displays error "Conference name cannot exceed 100 characters"
```

### Asynchronous or Downstream Effects
*Does this rule trigger other business workflows or fire domain events?*
* No async effects - this is a synchronous validation rule.

## 4. System Enforcement (How It's Handled)
*Enforced as a **Domain Invariant** directly within the Value Object (`ConferenceName`) and the `Conference` Aggregate Root.*

* **Enforcement Layer:** Value Object (`ConferenceName`) and Zod validation schema
* **Handling Violations/Exceptions:** 
  * Throws `ConferenceNameTooShortError` / `ConferenceNameTooLongError` (or Zod's validation issue at the contract layer)
  * HTTP/API returns 422 Unprocessable Entity
  * Form displays inline validation error in real-time
  * No state changes occur; transaction is aborted

## 5. Traceability

*Every edge is a relative link with two ends: adding one here means adding the reciprocal link in
that document, in the same commit. Convention: [Traceability](../../../guidelines/traceability.md).*

### Traces up to

* Journey: [Journey 01 — Setup Conference](../../../../inception/5-user-journeys/journey-01-setup-conference.md)
* Flow: [Journey 01 — Setup Conference & Open CfP](../flows/journey-01-setup-conference.md)
* Feature: [Feature 01 — Conference Creation with CfP](../flows/features/feature-01-conference-creation-with-cfp.md) (`F1-R2`)
* Related rules: [BR-003 — Conference Slug Must Be Unique](BR-003-slug-uniqueness.md) (slug is derived from this name)

### Enforced by

split across three layers; the bounds (3–100) are duplicated on purpose and must
be edited together.

| Layer | Where | Guard | Status |
| ----- | ----- | ----- | ------ |
| Contract (shared Zod) | `packages/api-definitions/src/zod/conference.ts` | `ConferenceCreateSchema.name` `.min(3).max(100)` | ✅ Verified |
| Domain — value object | `packages/modules/conference/src/domain/value-objects/conference-name.ts` | `ConferenceName.create()` — trim + length bounds | ✅ Verified |
| Domain — aggregate | `packages/modules/conference/src/domain/conference.ts` | `Conference.create()` builds the `ConferenceName` VO | ✅ Verified |
| UI | `apps/frontend/src/modules/conference/conference-form.tsx` | `ConferenceForm()` inline validation | ✅ Verified |

Enforcing entities: [Conference](../entities/conference.md)
Value object: [ConferenceName](../value-objects/conference-name.md)

### Verified by

* `tests/unit/modules/conference/domain/value-objects/conference-name.test.ts` — "rejects names shorter than 3 characters (BR-002)", "rejects names longer than 100 characters (BR-002)"
* `tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts` — parametrized case `name: 'name too short'` → "maps the name too short domain error to 400 { error: { code, message } }"

### In flight

none.

---

## 6. History & Evolution
*Business rules change frequently based on market conditions. Track changes to this rule here.*

* **2026-06-09:** Rule extracted from Journey 01 and Conference entity documentation.
* **2026-09-15:** Traceability section (§5) added. §3/§4 exception names corrected to the classes
  actually thrown (`ConferenceNameTooShortError`, `ConferenceNameTooLongError`);
  `InvalidConferenceNameError` never existed. The shared contract layer
  (`ConferenceCreateSchema.name.min(3).max(100)`) is now recorded as an enforcement site — the bounds
  are duplicated there and must be edited together.
