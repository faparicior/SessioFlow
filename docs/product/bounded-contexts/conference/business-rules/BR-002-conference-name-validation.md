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
* **If** `eventName.length < 3` -> Throw `InvalidConferenceNameError: "Conference name must be at least 3 characters"`
* **If** `eventName.length > 100` -> Throw `InvalidConferenceNameError: "Conference name cannot exceed 100 characters"`
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
*Unlike an invariant (which sits strictly inside an Aggregate Root), a business rule can be enforced via Domain Services, Policy objects, or workflow orchestration (like n8n or Saga patterns).*

* **Enforcement Layer:** Value Object (`ConferenceName`) and Zod validation schema
* **Handling Violations/Exceptions:** 
  * Throws `InvalidConferenceNameError` domain exception
  * HTTP/API returns 422 Unprocessable Entity
  * Form displays inline validation error in real-time
  * No state changes occur; transaction is aborted

## 5. History & Evolution
*Business rules change frequently based on market conditions. Track changes to this rule here.*

* **2026-06-09:** Rule extracted from Journey 01 and Conference entity documentation.
