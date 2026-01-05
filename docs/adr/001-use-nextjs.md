# Use Next.js as Frontend Framework

* **Status:** Proposed
* **Date:** 2026-01-05
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

For the SessioFlow MVP, we need a web framework that can handle both static content (public Call for Papers forms that need SEO) and dynamic, interactive dashboards (Organizer Review System). The solution must adhere to the strict **$0/month infrastructure cost** constraint and be simple enough for a small team to maintain ("Boring Tech").

**Decision Drivers:**
*   **Constraint:** Must run on free-tier hosting (e.g., Vercel).
*   **Requirement:** SEO is important for the public Call for Papers pages.
*   **Requirement:** Rich interactivity is needed for the Review & Score dashboard.
*   **Simplicity:** Preference for a unified stack (Frontend + API routes) to avoid managing separate backend servers.

## Considered Options

*   **Next.js (React Framework)**
*   **React SPA (Vite)**
*   **Plain HTML/CSS/JavaScript**
*   **Vue.js / Nuxt**

## Decision Outcome

**Chosen Option:** "Next.js (React Framework)"

**Justification:**
Next.js provides the best balance of Server-Side Rendering (SSR) for the public CfP pages (crucial for SEO and sharability) and Client-Side Rendering (CSR) for the interactive dashboard. Its built-in API routes allow us to build a "serverless" backend without a separate server project, perfectly aligning with the "Simplicity" and "Cost" constraints. It is also the native framework for Vercel, our target deployment platform.

### Consequences

*   **Positive:** Unified codebase (frontend + backend logic in one repo).
*   **Positive:** Excellent fast-load performance for public forms.
*   **Positive:** Zero-config deployment to Vercel.
*   **Negative:** Steeper learning curve than plain HTML/JS (though the team is tech-savvy).
*   **Risks:** Vendor lock-in with Vercel features (mitigated by using standard Node.js practices where possible).

## Pros and Cons of the Options

### Next.js

*   Good, because it supports Hybrid Rendering (Static + Dynamic).
*   Good, because it simplifies the backend via API Routes.
*   Good, because it has a massive ecosystem and component library support.
*   Bad, because it can be "heavy" for extremely simple pages.

### React SPA (Vite)

*   Good, because it is extremely simple references for pure client-side apps.
*   Bad, because it lacks out-of-the-box SSR for SEO.
*   Bad, because it requires a separate backend solution or external serverless function setup.

### Plain HTML/CSS/JavaScript

*   Good, because it is the simplest possible stack.
*   Bad, because managing state for the "Review & Score" dashboard would become complex and "spaghetti code" very quickly.
*   Bad, because no component reusability.

## Links

*   [Next.js Documentation](https://nextjs.org/)
*   [Inception Step 8: MVP Canvas](../inception/8-mvp-canvas-definition.md)
