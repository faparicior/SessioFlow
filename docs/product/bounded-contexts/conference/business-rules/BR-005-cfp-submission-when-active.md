# BR-005: Submissions Only Accepted When CfP Is Active

* **Status:** Active
* **Domain Context:** Conference Management Bounded Context
* **Business Owner:** Product Team
* **Last Reviewed:** 2026-06-09

---

## 1. Summary
*A clear, single-sentence definition of the business policy written in plain language using the Ubiquitous Language.*

> **Rule:** When a speaker attempts to submit a proposal, then the system must verify the CfP is in ACTIVE state and within the submission window, otherwise reject the submission with an appropriate error message.

## 2. Business Context & Rationale
*Why does this rule exist? What business metric, legal requirement, or operational workflow drives this policy?*

* **Objective:** Ensure submissions are only accepted during the designated CfP window, maintaining process integrity and fairness.
* **Source:** User Journey 02 - Submit Proposal, CfpConfig entity lifecycle

## 3. Detailed Rule Logic & Scenarios
*Break down the exact logic. Use tables, bullet points, or Gherkin syntax (Given/When/Then) to cover different edge cases.*

### Evaluation Logic
* **If** `cfpConfig.status != ACTIVE` -> Reject submission with "CfP is closed" error
* **If** `currentTime < cfpConfig.startDate` -> Reject submission with "CfP not yet open" error
* **If** `currentTime > cfpConfig.endDate` -> Reject submission with "CfP deadline has passed" error
* **Else** -> Allow submission

### Gherkin Scenarios
```gherkin
Scenario: Submission during active CfP
  Given CfP status is ACTIVE
  And current time is within the submission window
  When speaker submits a proposal
  Then the system accepts the submission
  And creates a new Session entity in DRAFT state

Scenario: CfP not yet open
  Given CfP start date is 2026-07-01
  And current time is 2026-06-09
  When speaker attempts to submit
  Then the system displays "CfP opens on July 1st, 2026"
  And submission is rejected

Scenario: CfP already closed
  Given CfP end date is 2026-06-30
  And current time is 2026-07-01
  When speaker attempts to submit
  Then the system displays "Submission deadline has passed"
  And submission is rejected
```

### Asynchronous or Downstream Effects
*Does this rule trigger other business workflows or fire domain events?*
* No async effects - this is a synchronous business rule validation.

## 4. System Enforcement (How It's Handled)
*Unlike an invariant (which sits strictly inside an Aggregate Root), a business rule can be enforced via Domain Services, Policy objects, or workflow orchestration (like n8n or Saga patterns).*

* **Enforcement Layer:** `CfpConfig.isActive()` / `CfpConfig.isWithinWindow(date)` in the domain layer.
  The submission use case that will call them (`SubmitProposal`) is **not built in Wave 1** — see the
  ⏳ Planned rows in section 5.
* **Handling Violations/Exceptions:** 
  * Throws `InvalidCfpStatusError` domain exception
  * HTTP/API returns 403 Forbidden or 422 Unprocessable Entity
  * User sees clear error message explaining why submission was rejected
  * No state changes occur; transaction is aborted

## 5. Traceability

*Every edge is a relative link with two ends: adding one here means adding the reciprocal link in
that document, in the same commit. Convention: [Traceability](../../../guidelines/traceability.md).*

### Traces up to

* Journey: [Journey 02 — Submitting Talk](../../../../inception/5-user-journeys/journey-02-submitting-talk.md)
* Flow: [Journey 01 — Setup Conference & Open CfP](../flows/journey-01-setup-conference.md) (opens the window this rule gates)
* Related rules: [INV-002 — Cfp End Date Must Be After Start Date](../invariants/INV-002-cfp-date-order.md)
  (defines the window) · [INV-001](../invariants/INV-001-state-transition-validity.md)
  (how `CfpStatus` may move)

### Enforced by

the window logic exists; the submission use case that will consume it is a later wave.

| Layer | Where | Guard | Status |
| ----- | ----- | ----- | ------ |
| Domain — composite VO | `packages/modules/conference/src/domain/value-objects/cfp-config.ts` | `CfpConfig.isActive()` and `.isWithinWindow(date)` | ✅ Verified |
| Domain — value object | `packages/modules/conference/src/domain/value-objects/cfp-status.ts` | `CfpStatus` transitions; throws `InvalidCfpStatusError` | ✅ Verified |
| Application (submission use case) | *(not built — no `SubmitProposal` command in Wave 1)* | intended call site of the two guards above | ⏳ Planned |
| UI | *(not built)* | disabled submission form outside the window | ⏳ Planned |

Enforcing entity: [CfpConfig](../entities/cfp-config.md)
Value objects: [CfpConfig](../value-objects/cfp-config.md) · [CfpStatus](../value-objects/cfp-status.md)

### Verified by

* `tests/unit/modules/conference/domain/cfp-config.test.ts` — "closes the submission window exactly once", "checks whether a date falls within the window"
* `tests/unit/modules/conference/domain/value-objects/cfp-status.test.ts` — status transition rules

### In flight

none. The submission flow is scheduled after Wave 1; until it ships this rule has no
end-to-end verification, so treat the ⏳ rows as a real gap rather than paperwork.

---

## 6. History & Evolution
*Business rules change frequently based on market conditions. Track changes to this rule here.*

* **2026-06-09:** Rule extracted from Journey 02 and CfpConfig entity documentation.
* **2026-09-15:** Traceability section (§5) added. §4 corrected: there is no `SubmitProposalService` in
  the codebase — the guards that exist are `CfpConfig.isActive()` and `CfpConfig.isWithinWindow()`, and
  the submission use case that will call them is ⏳ Planned (outside Wave 1). Exception corrected to
  `InvalidCfpStatusError`.
