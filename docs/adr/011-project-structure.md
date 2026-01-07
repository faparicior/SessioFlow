# Define Project Structure (App Router)

* **Status:** Proposed
* **Date:** 2026-01-07
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

Next.js App Router allows great flexibility in file organization, but without a defined structure, the `app/` directory can become a mix of pages, components, and logic, leading to "Spaghetti Code". We need a structure that organizes code by **Features** (Domain) rather than just technical layers, making it easier to navigate and maintain.

**Decision Drivers:**
*   **Maintainability:** Code related to a specific feature (e.g., "Proposals") should be easy to find.
*   **Scalability:** The structure should support adding new features without refactoring the whole app.
*   **Performance:** Clear distinction between Server and Client components.

## Considered Options

*   **Feature-Based / Domain-Driven (Colocation)**
*   **Layer-Based (MVC style: `components/`, `hooks/`, `utils/`)**
*   **Atomic Design**

## Decision Outcome

**Chosen Option:** "Feature-Based / Domain-Driven (Colocation)"

**Justification:**
We will group code by **Feature Domain** where possible.
*   `app/`: Only for routing (page.tsx, layout.tsx, route.ts). Minimal logic here.
*   `components/`: Shared UI components (Input, Button) - generic, no business logic.
*   `features/`: The core business logic.
    *   `features/auth/`: Login forms, Auth hooks.
    *   `features/cfp/`: Submission forms, validation schemas.
    *   `features/dashboard/`: Dashboard layout, tables.
*   `lib/`: Shared utilities (database client, generic helpers).

This "Feature-Based" approach ensures that when a developer works on the "CfP" feature, they have the UI, Logic, and Types all in one folder, rather than jumping between `components/cfp`, `hooks/cfp`, `types/cfp`.

### Consequences

*   **Positive:** Highly modular and easy to navigate.
*   **Positive:** Encourages encapsulation of feature logic.
*   **Positive:** Easy to delete/refactor features (just delete the folder).
*   **Negative:** Developers used to separation by file type (MVC) might find it unfamiliar initially.

## Pros and Cons of the Options

### Feature-Based / Domain-Driven

*   Good, because it keeps related code together (Colocation).
*   Good, because it scales better as the app grows.
*   Bad, because it requires discipline to explicitly define "features".

### Layer-Based (Traditional)

*   Good, because it is familiar to most React devs.
*   Bad, because business logic gets scattered across the codebase.

### Atomic Design

*   Good, because it creates a robust UI system.
*   Bad, because it is overkill for logic-heavy apps and often confusing (Is this a molecule or organism?).

## Links

*   [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)
*   [Bulletproof React](https://github.com/alan2207/bulletproof-react)
