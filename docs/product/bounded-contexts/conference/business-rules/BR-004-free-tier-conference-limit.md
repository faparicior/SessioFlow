# BR-004: Free Tier Conference Creation Limit

* **Status:** Active
* **Domain Context:** Conference Management Bounded Context
* **Business Owner:** Product Team
* **Last Reviewed:** 2026-06-09

---

## 1. Summary
*A clear, single-sentence definition of the business policy written in plain language using the Ubiquitous Language.*

> **Rule:** When a free tier organizer attempts to create an event, then the system must check if they already have 5 active events, and if so, block creation and prompt for upgrade.

## 2. Business Context & Rationale
*Why does this rule exist? What business metric, legal requirement, or operational workflow drives this policy?*

* **Objective:** Drive subscription upgrades by limiting free tier capacity while ensuring fair usage.
* **Source:** Product Strategy - Monetization Model Q2 2026

## 3. Detailed Rule Logic & Scenarios
*Break down the exact logic. Use tables, bullet points, or Gherkin syntax (Given/When/Then) to cover different edge cases.*

### Evaluation Logic
* **If** `organizer.tier == FREE` AND `count(activeConferences) >= 5` -> Block creation, show upgrade prompt
* **If** `organizer.tier == FREE` AND `count(activeConferences) < 5` -> Allow creation
* **If** `organizer.tier != FREE` (PRO/ENTERPRISE) -> No limit applied

### Gherkin Scenarios
```gherkin
Scenario: Free tier under limit
  Given organizer has 3 active events
  And organizer tier is FREE
  When they attempt to create a new event
  Then the system allows event creation
  And active event count becomes 4

Scenario: Free tier at limit
  Given organizer has 5 active events
  And organizer tier is FREE
  When they attempt to create a new event
  Then the system blocks creation
  And displays upgrade prompt with pricing information

Scenario: Pro tier user
  Given organizer has 10 active events
  And organizer tier is PRO
  When they attempt to create a new event
  Then the system allows event creation
  And no limit check is applied
```

### Asynchronous or Downstream Effects
*Does this rule trigger other business workflows or fire domain events?*
* No async effects - this is a synchronous business policy check.

## 4. System Enforcement (How It's Handled)
*Unlike an invariant (which sits strictly inside an Aggregate Root), a business rule can be enforced via Domain Services, Policy objects, or workflow orchestration (like n8n or Saga patterns).*

* **Enforcement Layer:** Application Service (`CreateConferenceService`) checks subscription tier before event creation
* **Handling Violations/Exceptions:** 
  * Does NOT throw domain exception
  * Returns business rule violation response with upgrade information
  * HTTP/API returns 403 Forbidden or 402 Payment Required
  * User sees upgrade modal with pricing tiers
  * No state changes occur; transaction is aborted

## 5. History & Evolution
*Business rules change frequently based on market conditions. Track changes to this rule here.*

* **2026-06-09:** Rule extracted from Journey 01 edge cases.
