# Deploy to Vercel

* **Status:** Proposed
* **Date:** 2026-01-05
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

We need to host the SessioFlow application on the public internet so that Organizers and Speakers can access it. The project has a strict **$0/month infrastructure cost** constraint and the team wants to minimize DevOps efforts (server management, scaling, security patching).

**Decision Drivers:**
*   **Constraint:** $0/month cost.
*   **Requirement:** Easy integration with the chosen framework (Next.js).
*   **Requirement:** Automatic HTTPS (SSL) and Global CDN for performance.
*   **Simplicity:** Git-push deployment workflow.

## Considered Options

*   **Vercel**
*   **Netlify**
*   **AWS Free Tier (S3 + CloudFront + Lambda)**
*   **Heroku (Paid)**
*   **Self-Hosted (VPS)**

## Decision Outcome

**Chosen Option:** "Vercel"

**Justification:**
Vercel is the creator of Next.js and provides the most optimized hosting environment for it. Their "Hobby" plan is free forever for personal/non-commercial projects, which fits the MVP stage perfectly. It offers zero-configuration deployment (just connect the GitHub repo), automatic HTTPS, and global edge network, removing all DevOps burden from the team.

### Consequences

*   **Positive:** Zero configuration required.
*   **Positive:** Automatic Preview Deployments for every Pull Request.
*   **Positive:** Free tier meets current traffic needs.
*   **Negative:** Vendor lock-in (migrating away from Vercel specifics like Edge Functions can be work).
*   **Risks:** If the app becomes a commercial SaaS, the pricing scales up significantly (though we are focused on MVP/Non-profit use).

## Pros and Cons of the Options

### Vercel

*   Good, because it is the native home of Next.js.
*   Good, because it is free for hobby use.
*   Good, because of the developer experience (CI/CD built-in).
*   Bad, because commercial limits are strict.

### Netlify

*   Good, because it is a strong competitor with similar features.
*   Bad, because Next.js features sometimes lag slightly behind Vercel's support.

### AWS Free Tier

*   Good, because it is industry standard.
*   Bad, because the complexity is extremely high (IAM, CloudFormation, Certificates).
*   Bad, because "free tier" expires after 12 months for many services.

## Links

*   [Vercel](https://vercel.com/)
