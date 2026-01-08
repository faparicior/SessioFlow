# Use Vitest and Playwright for Testing

* **Status:** Proposed
* **Date:** 2026-01-07
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

As the application grows, relying solely on manual testing becomes unsustainable and risky. We need a testing strategy that ensures reliability without violating the "Simplicity" and "Cost" constraints. We need to define *what* to test and *which tools* to use, avoiding the "Testing Trophy" vs "Testing Pyramid" debates that waste time.

**Decision Drivers:**
*   **Simplicity:** The setup must be minimal and fast.
*   **Integration:** Must work seamlessly with Next.js and our tooling (Vite/Vitest).
*   **Reliability:** Critical flows (Login, Submission) must work 100% of the time.
*   **Developer Experience:** Tests should be easy to write and run locally.

## Considered Options

*   **Vitest (Unit) + Playwright (E2E)**
*   **Jest (Unit) + Cypress (E2E)**
*   **Manual Testing Only**
*   **Testing Library (RTL) Only**

## Decision Outcome

**Chosen Option:** "Vitest (Unit) + Playwright (E2E)"

**Justification:**
We choose **Vitest** for unit/integration tests. Although this deviates slightly from the "Boring Tech" preference (Jest is older), Vitest integrates natively with the modern ecosystem (Next.js/SWC), is significantly faster, and requires less configuration than Jest for TypeScript. For End-to-End (E2E) testing, **Playwright** is chosen over Cypress because it is faster, supports parallel execution better, and allows testing multiple browser tabs (crucial for Auth flows).

The strategy is:
1.  **Unit Tests (Vitest):** logic-heavy functions (e.g. Zod validators, scoring algorithms).
2.  **E2E Tests (Playwright):** Critical User Journeys (e.g., "Speaker submits talk", "Organizer accepts talk").
3.  **Low Coverage Threshold:** We will not enforce arbitrary % coverage (e.g. 80%), but rather enforce that *Critical Journeys* are tested.

### Consequences

*   **Positive:** Fast test execution (Vitest is significantly faster than Jest).
*   **Positive:** Playwright is more reliable (less flaky) than Cypress for modern web apps.
*   **Positive:** Clear separation of concerns (Unit vs E2E).
*   **Negative:** Developers need to learn two tools.
*   **Risks:** Playwright setup in CI (GitHub Actions) requires managing browser binaries.

## Pros and Cons of the Options

### Vitest (Unit) + Playwright (E2E)

*   Good, because Vitest shares configuration with Vite-based tools (fast).
*   Good, because Playwright handles modern web features (simulating mobile, multi-tab) natively.
*   Bad, because it is a relatively newer stack compared to Jest/Cypress.

### Jest (Unit) + Cypress (E2E)

*   Good, because it is the "traditional" industry standard.
*   Bad, because Jest is slow and requires heavy config for TypeScript/Next.js.
*   Bad, because Cypress has limitations with multi-tab support and is slower in CI.

### Manual Testing Only

*   Good, because zero setup.
*   Bad, because it is unscalable and error-prone.

## Links

*   [Vitest](https://vitest.dev/)
*   [Playwright](https://playwright.dev/)
