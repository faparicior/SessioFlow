# Define Git Branching Strategy

* **Status:** Proposed
* **Date:** 2026-01-07
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

Multpile developers working on the same codebase can lead to merge conflicts and unstable code in the `main` branch. We need a workflow that ensures code review happens before merging, while keeping the process simple enough for a small team. Complex workflows like GitFlow are often overkill for small/medium web apps.

**Decision Drivers:**
*   **Simplicity:** Minimal overhead for creating branches.
*   **Velocity:** Enable fast iteration and deployment.
*   **Stability:** `main` branch must always be deployable.

## Considered Options

*   **GitHub Flow**
*   **GitFlow**
*   **Trunk Based Development**

## Decision Outcome

**Chosen Option:** "GitHub Flow"

**Justification:**
GitHub Flow is a lightweight branching strategy. It consists of a `main` branch and short-lived feature branches. It aligns perfectly with Continuous Deployment (CD) on Vercel, where every push to `main` is deployed to production, and every PR gets a Preview Deployment. GitFlow (with `develop`, `release`, `hotfix` branches) is too complex and slows down delivery. Trunk Based Development is great but requires a very mature testing culture which we are just building.

The workflow is:
1.  Create a branch from `main` (`feat/my-feature`).
2.  Commit changes.
3.  Open a Pull Request (PR).
4.  Discuss & Review.
5.  Merge to `main`.

### Consequences

*   **Positive:** Extremely simple to understand and use.
*   **Positive:** Encourages small, frequent releases.
*   **Positive:** Native Integration with GitHub features (PRs, Issues).
*   **Negative:** Requires discipline to keep `main` stable (broken `main` means blocked releases).

## Pros and Cons of the Options

### GitHub Flow

*   Good, because it reduces process overhead.
*   Good, because it matches Vercel's deployment model perfectly.
*   Bad, because it relies heavily on CI to prevent bad merges to `main`.

### GitFlow

*   Good, because it offers strict control over releases.
*   Bad, because it is complex and cumbersome for continuous deployment.

### Trunk Based Development

*   Good, because it maximizes velocity (no long-lived branches).
*   Bad, because it requires advanced feature-flagging and testing setups to be safe.

## Links

*   [GitHub Flow Guide](https://docs.github.com/en/get-started/using-github/github-flow)
