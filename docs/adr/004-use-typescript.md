# Use TypeScript

* **Status:** Proposed
* **Date:** 2026-01-05
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

We are dealing with structured data (Conference Proposals, Speaker Profiles, Reviews). Ensuring that the data flowing from the Database (Supabase) to the Frontend (Next.js) is consistent is critical to prevent runtime crashes during the live Call for Papers.

**Decision Drivers:**
*   **Reliability:** Prevent "undefined is not a function" errors.
*   **Developer Experience:** Autocomplete and self-documentation of code.
*   **Maintainability:** The codebase needs to be understandable for future contributors.

## Considered Options

*   **TypeScript**
*   **JavaScript (ES6+)**
*   **JSDoc**

## Decision Outcome

**Chosen Option:** "TypeScript"

**Justification:**
TypeScript is the industry standard for modern React applications. It provides static typing which catches errors at compile time rather than runtime. For a project like SessioFlow where data schemas (e.g., a Session object) are central, TypeScript ensures that we strictly adhere to the defined models.

### Consequences

*   **Positive:** Drastically reduced runtime errors.
*   **Positive:** Improved refactoring capabilities.
*   **Positive:** Seamless integration with Next.js and Supabase (which generates types).
*   **Negative:** Initial setup time and extra boilerplate code.

## Pros and Cons of the Options

### TypeScript

*   Good, because it provides type safety.
*   Good, because it serves as documentation.
*   Bad, because it adds a compilation step (handled by Next.js automatically).

### JavaScript

*   Good, because it is dynamic and flexible.
*   Bad, because it allows loose typing which leads to bugs in data-heavy apps.

### JSDoc

*   Good, because it adds type checking without a compilation step.
*   Bad, because the syntax is verbose and clutters the code comments.
*   Bad, because the developer experience is inferior to native TypeScript.

## Links

*   [TypeScript](https://www.typescriptlang.org/)
