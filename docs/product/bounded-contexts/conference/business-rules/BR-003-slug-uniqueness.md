# BR-003: Conference Slug Must Be Unique

* **Status:** Active
* **Domain Context:** Conference Management Bounded Context
* **Business Owner:** Product Team
* **Last Reviewed:** 2026-06-09

---

## 1. Summary
*A clear, single-sentence definition of the business policy written in plain language using the Ubiquitous Language.*

> **Rule:** When creating an event, then the generated slug must be unique across all events in the system, otherwise append a numeric suffix and retry until a unique slug is found.

## 2. Business Context & Rationale
*Why does this rule exist? What business metric, legal requirement, or operational workflow drives this policy?*

* **Objective:** Ensure each event has a unique, shareable URL that doesn't conflict with other events.
* **Source:** User Journey 01 - Setup Conference, Database Schema Design (ADR-002)

## 3. Detailed Rule Logic & Scenarios
*Break down the exact logic. Use tables, bullet points, or Gherkin syntax (Given/When/Then) to cover different edge cases.*

### Evaluation Logic
1. Generate initial slug from event name (e.g., "My Conference" → "my-event")
2. Check database for existing slug using `ConferenceRepository.findBySlug()`
3. **If** slug exists -> Append numeric suffix (e.g., "my-event-2", "my-event-3")
4. Retry up to 3 times with incremented suffix
5. **If** still conflicts after 3 attempts -> Throw `SlugGenerationError`

### Gherkin Scenarios
```gherkin
Scenario: Unique slug generated
  Given no event exists with slug "tech-conference-2026"
  When organizer creates event named "Tech Conference 2026"
  Then the system generates slug "tech-conference-2026"
  And event is created successfully

Scenario: Slug collision handled
  Given event "tech-conference-2026" already exists
  When organizer creates another event named "Tech Conference 2026"
  Then the system generates slug "tech-conference-2026-2"
  And event is created successfully

Scenario: Multiple collisions
  Given "tech-conference-2026", "tech-conference-2026-2", "tech-conference-2026-3" exist
  When organizer creates another event with same name
  Then the system generates slug "tech-conference-2026-4"
```

### Asynchronous or Downstream Effects
*Does this rule trigger other business workflows or fire domain events?*
* No async effects - this is a synchronous validation rule during event creation.

## 4. System Enforcement (How It's Handled)
*Unlike an invariant (which sits strictly inside an Aggregate Root), a business rule can be enforced via Domain Services, Policy objects, or workflow orchestration (like n8n or Saga patterns).*

* **Enforcement Layer:** Application Service (`CreateConferenceService`) and Repository (`ConferenceRepository.findBySlug()`)
* **Handling Violations/Exceptions:** 
  * Automatically generates alternative slug with numeric suffix
  * Retries up to 3 times
  * Throws `SlugGenerationError` if all attempts fail
  * HTTP/API returns 500 Internal Server Error (rare edge case)
  * User sees generic error message

## 5. History & Evolution
*Business rules change frequently based on market conditions. Track changes to this rule here.*

* **2026-06-09:** Rule extracted from Journey 01 and Conference entity documentation.
