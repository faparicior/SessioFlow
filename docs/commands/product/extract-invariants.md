You are an expert Domain-Driven Design (DDD) Architect and Software Modeling Specialist.

Your task is to analyze the provided documentation/code, identify the strict **Invariants** (the unbreakable data consistency rules), and document them using the specific structure requested.

### Definition for Context:

**Business Rule vs Invariant:**

| Aspect | Business Rule | Invariant |
|--------|--------------|-----------|
| **Scope** | Broad (Workflows, policies, formulas) | Strict (Data integrity, state constraints) |
| **Strictness** | Can have exceptions or asynchronous fallbacks | Absolute. Cannot be violated under any circumstance |
| **Enforcement** | Can be handled by UI, Workflows, or Domain Services | Must be protected synchronously inside the Aggregate Root |
| **If Violated** | The business handles the exception (e.g., charge a late fee) | The system is in an illegal state (transaction must rollback) |

*Focus exclusively on invariants - the unbreakable state constraints that MUST be enforced inside the Aggregate Root. Filter out general business rules (like discounts, notifications, or routing logic).*

---

### Input Source to Analyze:
[PASTE YOUR CODE OR SPECIFICATION MARKDOWN HERE]

---

### Instructions:
1. Scan the input looking for transactional limits, capacities, structural integrity constraints, or conditions that throw immediate errors/exceptions when violated.
2. Filter out general business rules (like discounts, notifications, or routing logic). Focus exclusively on **unbreakable state constraints**.
3. For each invariant found, fill out the following template exactly as structured below. Do not change the section headers.
4. Use **Gherkin syntax** to describe enforcement logic and test scenarios instead of code snippets.

---

### Output Template to Use for Each Invariant:

# INV-[Number]: [Short, Strict Title of the Invariant]

* **Status:** [Active | Proposed | Retired]
* **Bounded Context:** [Infer from context]
* **Aggregate Root:** [Identify the entity/aggregate root responsible for protecting this state]
* **Data Integrity Risk:** [What breaks if this rule is ignored?]

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary.*

> **Invariant:** [e.g., The number of confirmed tickets can never exceed the total capacity.]

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * [List the fields involved]
* **Transactional Boundary:** [Explain when this constraint is checked synchronously]

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail using Gherkin scenarios.*

### Gherkin Scenarios

```gherkin
Scenario: Attempting to violate the invariant
  Given [precondition state]
  When [action that would violate the invariant]
  Then [system rejects the operation with specific error]
  And [no state changes occur]
```

### Critical Edge Cases Handled:
* [Detail at least one critical edge case or concurrency challenge related to this rule]

## 4. Failure Response (Exception Handling)
*What happens when this invariant is triggered?*

* **Domain Exception:** [Name a specific domain exception that should be thrown]
* **HTTP/API Mapping:** [e.g., 409 Conflict or 422 Unprocessable Entity]
* **Rollback Behavior:** Complete database transaction rollback. No state is persisted.

## 5. Test Cases
*Concrete test scenarios that verify the invariant is enforced.*

### Positive Test (Invariant Holds)
```gherkin
Scenario: Valid operation that respects the invariant
  Given [valid precondition state]
  When [legitimate action is performed]
  Then [operation succeeds]
  And [invariant remains satisfied]
```

### Negative Test (Invariant Violation Blocked)
```gherkin
Scenario: Attempted violation of the invariant
  Given [precondition state]
  When [action that would violate the invariant]
  Then [system throws [SpecificDomainException]]
  And [HTTP response is [4xx error code]]
  And [database transaction is rolled back]
  And [no state changes are persisted]
```

## 6. History & Evolution

* **YYYY-MM-DD:** Invariant extracted from source documentation.

**Output Path:**
Write the results in: `docs/product/bounded-contexts/{bounded-context-name}/invariants/INV-[XXX]-[invariant-name].md`

Where `{bounded-context-name}` is the kebab-case name of the bounded context (e.g., `conference`, `submission`, `review`, `scheduling`, or any future context)

---
Go ahead and extract all the system invariants from the input provided using the template above.