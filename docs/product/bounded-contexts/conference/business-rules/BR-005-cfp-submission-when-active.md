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

* **Enforcement Layer:** Application Service (`SubmitProposalService`) and CfpConfig entity method `isActive()`
* **Handling Violations/Exceptions:** 
  * Throws `CfpNotAcceptingSubmissionsError` domain exception
  * HTTP/API returns 403 Forbidden or 422 Unprocessable Entity
  * User sees clear error message explaining why submission was rejected
  * No state changes occur; transaction is aborted

## 5. History & Evolution
*Business rules change frequently based on market conditions. Track changes to this rule here.*

* **2026-06-09:** Rule extracted from Journey 02 and CfpConfig entity documentation.
