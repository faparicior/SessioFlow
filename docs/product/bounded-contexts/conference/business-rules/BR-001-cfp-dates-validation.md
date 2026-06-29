# BR-001: CfP Dates Must Be Valid

* **Status:** Active
* **Domain Context:** Conference Management Bounded Context
* **Business Owner:** Product Team
* **Last Reviewed:** 2026-06-09

---

## 1. Summary
*A clear, single-sentence definition of the business policy written in plain language using the Ubiquitous Language.*

> **Rule:** When creating or updating a Call for Papers (CfP) configuration, then the end date must be after the start date and both dates must be in the future, otherwise reject the operation with a validation error.

## 2. Business Context & Rationale
*Why does this rule exist? What business metric, legal requirement, or operational workflow drives this policy?*

* **Objective:** Ensure logical CfP windows that provide adequate time for speaker submissions and prevent configuration errors.
* **Source:** User Journey 01 - Setup Conference (C4P Configuration), Product Requirements for Conference Creation Flow

## 3. Detailed Rule Logic & Scenarios
*Break down the exact logic. Use tables, bullet points, or Gherkin syntax (Given/When/Then) to cover different edge cases.*

### Evaluation Logic
* **If** `cfpEndDate` <= `cfpStartDate` -> Throw `InvalidCfpConfigError: "End date must be after start date"`
* **If** `cfpStartDate` < today -> Throw `InvalidCfpConfigError: "Start date must be in the future"`
* **Else** -> Allow CfP configuration creation/update

### Gherkin Scenarios
```gherkin
Scenario: Valid CfP date range
  Given the organizer enters a start date of 2026-07-01
  And an end date of 2026-08-31
  When they submit the form
  Then the system accepts the configuration
  And the CfP is set to ACTIVE status

Scenario: Invalid date order
  Given the organizer enters a start date of 2026-08-31
  And an end date of 2026-07-01
  When they submit the form
  Then the system displays error "End date must be after start date"
  And no CfP configuration is created

Scenario: Past start date
  Given today is 2026-06-09
  And the organizer enters a start date of 2026-05-01
  When they submit the form
  Then the system displays error "Start date must be in the future"
  And no CfP configuration is created
```

### Asynchronous or Downstream Effects
*Does this rule trigger other business workflows or fire domain events?*
* No async effects - this is a synchronous validation rule that prevents invalid state creation.

## 4. System Enforcement (How It's Handled)
*Unlike an invariant (which sits strictly inside an Aggregate Root), a business rule can be enforced via Domain Services, Policy objects, or workflow orchestration (like n8n or Saga patterns).*

* **Enforcement Layer:** Domain Service (`CfpValidationService`) and Value Objects (`CfpStartDate`, `CfpEndDate`)
* **Handling Violations/Exceptions:** 
  * Throws `InvalidCfpConfigError` domain exception
  * HTTP/API returns 422 Unprocessable Entity
  * Form displays inline validation error to user
  * No state changes occur; transaction is aborted

## 5. History & Evolution
*Business rules change frequently based on market conditions. Track changes to this rule here.*

* **2026-06-09:** Rule extracted from Journey 01 and Conference/CfpConfig entity documentation.
