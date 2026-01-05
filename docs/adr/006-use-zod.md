# Use Zod for Data Validation

* **Status:** Proposed
* **Date:** 2026-01-05
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

We are collecting user input via public forms (Call for Papers). This input includes personal data (names, emails) and content data (abstracts). We must ensure that the data is valid (e.g., valid email format, max length for abstracts) before processing it or sending it to the database. We need a way to share validation logic between the Client (Frontend form) and the Server (API Route).

**Decision Drivers:**
*   **Reliability:** Reusing validation logic prevents divergence between UI feedback and API errors.
*   **Security:** Sanitize inputs to prevent garbage data.
*   **Developer Experience:** Type inference (Zod schemas automatically generate TypeScript types).

## Considered Options

*   **Zod**
*   **Yup**
*   **Joi**
*   **Manual If/Else Checks**

## Decision Outcome

**Chosen Option:** "Zod"

**Justification:**
Zod has become the standard for TypeScript-first validation. Its "schema-first" approach allows us to define the shape of a valid "Proposal" once, and then infer the TypeScript type from that schema. This guarantees that our compile-time types always match our runtime validation logic. It works seamlessly with `react-hook-form` (for the UI) and on the server-side API.

### Consequences

*   **Positive:** Single source of truth for data shapes.
*   **Positive:** API and Frontend share the same validation rules.
*   **Positive:** Excellent Type inference.
*   **Negative:** Adds a small amount to bundle size.

## Pros and Cons of the Options

### Zod

*   Good, because of TypeScript integration.
*   Good, because of its concise syntax.
*   Bad, because it is strictly for runtime validation (not compile time optimization).

### Yup

*   Good, because it is mature.
*   Bad, because type inference is less robust than Zod.

### Manual Checks

*   Good, because zero dependencies.
*   Bad, because it is error-prone, repetitive, and hard to maintain.

### Joi

*   Good, because it is a powerful legacy validation library.
*   Bad, because it was designed for JavaScript and has poor TypeScript inference support compared to Zod.

## Links

*   [Zod Documentation](https://zod.dev/)
