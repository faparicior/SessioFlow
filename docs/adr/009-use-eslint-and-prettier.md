# Use ESLint and Prettier for Linting

* **Status:** Proposed
* **Date:** 2026-01-07
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

Inconsistent code styles (tabs vs spaces, semicolons, import ordering) lead to "bikeshedding" during code reviews and confusing diffs. We need a way to enforce a standard code style automatically to maintain "Simplicity" and focus reviews on logic, not syntax.

**Decision Drivers:**
*   **Consistency:** The codebase should look like it was written by one person.
*   **Automation:** Formatting should happen automatically on save or commit.
*   **Integration:** Must work with Next.js and VS Code.

## Considered Options

*   **ESLint + Prettier**
*   **StandardJS**
*   **Biome (formerly Rome)**

## Decision Outcome

**Chosen Option:** "ESLint + Prettier"

**Justification:**
This is the de-facto standard for the React/Next.js ecosystem. Next.js comes with `eslint-config-next` out of the box. Prettier is the industry standard for code formatting. While Biome is faster, the ecosystem support for ESLint plugins (e.g., `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`) is superior and necessary for accessibility and React best practices.

### Consequences

*   **Positive:** Zero bikeshedding on style.
*   **Positive:** Catches common React bugs (via Hooks rules).
*   **Positive:** Native support in almost all IDEs.
*   **Negative:** Setup can be complex (conflicting rules between ESLint and Prettier), though `eslint-config-prettier` solves this.

## Pros and Cons of the Options

### ESLint + Prettier

*   Good, because it is the ecosystem default.
*   Good, because it handles both Logic (Linting) and Style (formatting).
*   Bad, because configuration can get large.

### Biome

*   Good, because it is incredibly fast (Rust-based).
*   Good, because it combines linting and formatting in one tool.
*   Bad, because it lacks the rich plugin ecosystem of ESLint.

### StandardJS

*   Good, because it is "zero config".
*   Bad, because it is opinionated (e.g., no semicolons) and harder to customize if needed.

## Links

*   [Next.js ESLint](https://nextjs.org/docs/basic-features/eslint)
*   [Prettier](https://prettier.io/)
