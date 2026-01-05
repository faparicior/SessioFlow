# Use GitHub Actions for CI/CD

* **Status:** Proposed
* **Date:** 2026-01-05
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

To maintain code quality and prevent regressions, we need an automated system to run checks (linting, type checking, testing) whenever code is pushed to the repository. We want to catch errors *before* they are deployed to production.

**Decision Drivers:**
*   **Quality:** Ensure main branch is always stable.
*   **Constraint:** Cost (must be free for this project).
*   **Integration:** Must work with our code repository (GitHub).

## Considered Options

*   **GitHub Actions**
*   **CircleCI**
*   **Travis CI**
*   **Manual Testing**

## Decision Outcome

**Chosen Option:** "GitHub Actions"

**Justification:**
GitHub Actions is built directly into our repository host (GitHub). It provides a generous free tier for public repositories (and even private ones). It allows us to define workflows (e.g., "Run Linter on Pull Request") using simple YAML files. It integrates perfectly with the ecosystem, allowing us to enforce checks before merging code.

### Consequences

*   **Positive:** Integrated experience (no external accounts needed).
*   **Positive:** Free to use.
*   **Positive:** Huge marketplace of pre-built actions.
*   **Negative:** YAML configuration can sometimes be finicky.

## Pros and Cons of the Options

### GitHub Actions

*   Good, because it is native to GitHub.
*   Good, because it is free.
*   Bad, because debugging local runs is difficult (requires `act` tool).

### CircleCI / Travis

*   Good, because they are powerful dedicated CI tools.
*   Bad, because they require setting up external accounts and permissions.

### Manual Testing

*   Good, because it costs nothing to setup.
*   Bad, because humans forget to run tests.
*   Bad, because it scales poorly.

## Links

*   [GitHub Actions](https://github.com/features/actions)
