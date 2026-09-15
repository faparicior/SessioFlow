# BR-004: Free Tier Conference Creation Limit

* **Status:** Active
* **Domain Context:** Conference Management Bounded Context
* **Business Owner:** Product Team
* **Last Reviewed:** 2026-06-09

---

## 1. Summary
*A clear, single-sentence definition of the business policy written in plain language using the Ubiquitous Language.*

> **Rule:** When a free tier organizer attempts to create a conference, then the system must check if they already have 5 active conferences, and if so, block creation and prompt for upgrade.

## 2. Business Context & Rationale
*Why does this rule exist? What business metric, legal requirement, or operational workflow drives this policy?*

* **Objective:** Drive subscription upgrades by limiting free tier capacity while ensuring fair usage.
* **Source:** Product Strategy - Monetization Model Q2 2026

## 3. Detailed Rule Logic & Scenarios
*Break down the exact logic. Use tables, bullet points, or Gherkin syntax (Given/When/Then) to cover different edge cases.*

### Evaluation Logic
* **Active Conference Definition:** Any conference where `status != 'DELETED'` (including `DRAFT`, `CFP_OPEN`, `CFP_CLOSED`, `PUBLISHED`).
* **Wave 1 (MVP) Default:** In the absence of a separate billing module, all organizers default to `FREE` tier.
* **If** `organizer.tier == FREE` AND `count(activeConferences) >= 5` -> Block creation, show upgrade prompt (HTTP 403 / `FREE_TIER_LIMIT_EXCEEDED`)
* **If** `organizer.tier == FREE` AND `count(activeConferences) < 5` -> Allow creation
* **If** `organizer.tier != FREE` (PRO/ENTERPRISE) -> No limit applied

### Gherkin Scenarios
```gherkin
Scenario: Free tier under limit
  Given organizer has 3 active conferences
  And organizer tier is FREE
  When they attempt to create a new conference
  Then the system allows conference creation
  And active conference count becomes 4

Scenario: Free tier at limit
  Given organizer has 5 active conferences
  And organizer tier is FREE
  When they attempt to create a new conference
  Then the system blocks creation
  And displays upgrade prompt with pricing information

Scenario: Pro tier user
  Given organizer has 10 active conferences
  And organizer tier is PRO
  When they attempt to create a new conference
  Then the system allows conference creation
  And no limit check is applied
```

### Asynchronous or Downstream Effects
*Does this rule trigger other business workflows or fire domain events?*
* No async effects - this is a synchronous business policy check.

## 4. System Enforcement (How It's Handled)
*Unlike an invariant (which sits strictly inside an Aggregate Root), a business rule can be enforced via Domain Services, Policy objects, or workflow orchestration (like n8n or Saga patterns).*

* **Enforcement Layer:** Application command handler + repository count query (Wave 1 has no billing
  module, so the tier is implicitly `FREE`)
* **Handling Violations/Exceptions:**
  * Throws `ConferenceFreeTierLimitError`
    (`packages/modules/conference/src/domain/exceptions/conference-free-tier-limit-error.ts`)
  * HTTP/API returns `403 FREE_TIER_LIMIT` — see
    `tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts`
  * Organizer sees the upgrade prompt in the creation form
  * No state changes occur; the transaction is aborted

## 5. Traceability

*Every edge is a relative link with two ends: adding one here means adding the reciprocal link in
that document, in the same commit. Convention: [Traceability](../../../guidelines/traceability.md).*

### Traces up to

* Journey: [Journey 01 — Setup Conference](../../../../inception/5-user-journeys/journey-01-setup-conference.md)
* Flow: [Journey 01 — Setup Conference & Open CfP](../flows/journey-01-setup-conference.md)
* Feature: [Feature 01 — Conference Creation with CfP](../flows/features/feature-01-conference-creation-with-cfp.md) (`F1-R6`)
* Related rules: [BR-003 — Conference Slug Must Be Unique](BR-003-slug-uniqueness.md) — evaluated
  **before** this one, so a name clash never reads as a quota problem

### Enforced by

Wave 1 evaluates the limit with a repository count; there is no billing module yet.

| Layer | Where | Guard | Status |
| ----- | ----- | ----- | ------ |
| Application | `packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts` | `CreateConferenceHandler.execute()` — `FREE_TIER_LIMIT = 5` | ✅ Verified |
| Domain (repository port) | `packages/modules/conference/src/domain/conference-repository.interface.ts` | `countActiveByOrganizerId()` contract | ✅ Verified |
| Infrastructure | `packages/modules/conference/src/infrastructure/database/conference.repository.ts` | `countActiveByOrganizerId()` — excludes `DELETED` | ✅ Verified |
| UI | `apps/frontend/src/modules/conference/conference-form.tsx` | renders the upgrade prompt | ✅ Verified |
| Application (tier lookup) | *(none — no billing module in Wave 1)* | everyone is `FREE` | ⏳ Planned |

Enforcing entity: [Conference](../entities/conference.md)

### Verified by

* `tests/unit/modules/conference/application/commands/create-conference/create-conference.test.ts` —
  "rejects when the organizer reached the free-tier limit with FREE_TIER_LIMIT (403)",
  "runs the BR-003 slug check before the BR-004 free-tier check"
* `tests/integration/modules/conference/conference-repository.integration.test.ts` — "countActiveByOrganizerId (BR-004)" against real PostgreSQL
* `tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts` — parametrized case `name: 'free tier limit (BR-004)'` → "maps the free tier limit (BR-004) domain error to 403 { error: { code, message } }"
* `tests/e2e/conference-setup.spec.ts` — "should reject conference with free tier limit exceeded"

### In flight

none.

---

## 6. History & Evolution
*Business rules change frequently based on market conditions. Track changes to this rule here.*

* **2026-06-09:** Rule extracted from Journey 01 edge cases.
* **2026-09-15:** Traceability section (§5) added. §4 corrected against shipped code: the rule **does**
  throw a domain exception — `ConferenceFreeTierLimitError` → `403 FREE_TIER_LIMIT` from
  `CreateConferenceHandler.execute()` via `countActiveByOrganizerId()` — rather than returning a
  violation response from a `CreateConferenceService` (no such class exists). Tier lookup stays
  ⏳ Planned: Wave 1 has no billing module, so every organizer is implicitly `FREE`.
