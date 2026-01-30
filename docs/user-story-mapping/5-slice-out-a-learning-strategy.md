# 5. Slice Out a Learning Strategy

Objective: Validate our biggest risks before building the full release. We are not building to ship yet; we are building to learn.

## 1. The Riskiest Assumptions

Look at the Release Slice (Step 4). What do we believe to be true that, if wrong, would cause this project to fail?

- **Value Risk:** Do organizers actually want a dedicated tool?
  - *Assumption:* Event organizers prefer a self-hosted web app over a simple, free Google Form + Spreadsheet, which they already know how to use.
  - *Source:* `docs/inception/8-mvp-canvas-definition.md` (Hypothesis: "By enabling instant CfP creation, we will acquire users...").

- **Usability Risk:** Can they strictly "self-host" it?
  - *Assumption:* The "Non-Technical" organizer (Fernando/others) can successfully deploy and configure the application using Docker/Scripts without getting stuck.
  - *Source:* `docs/inception/1-product-vision-and-boundaries.md` (Product IS "Simple to self-host").

- **Feasibility Risk:** Can it run for $0?
  - *Assumption:* It is technically possible to host the Next.js app, database, and object storage on a "free tier" or minimal infrastructure indefinitely without incurring costs.
  - *Source:* `docs/inception/8-mvp-canvas-definition.md` (Constraints: "Infrastructure: $0/month").

- **Business Risk:** Is the "Input-Only" MVP sufficient?
  - *Assumption:* Users will accept a tool that *only* collects data (Wave 1) but offers no way to review/export it yet, without churning immediately.
  - *Source:* `docs/inception/7-features-and-sequencing.md` (MVP Rationale: "Reviewing and Scoring can technically wait").

## 2. The Learning Slice (MVPe)

Slice the map even thinner. What is the smallest thing we can make or do to test the assumptions above?

| Assumption | Experiment / Method (Persona: **Target**) | Timebox | Success Signal (Metric) |
| :--- | :--- | :--- | :--- |
| **Value:** Org. prefers App > G-forms | **"Smoke Test" Landing Page:** Create a simple page describing the "One-Click CfP" wrapper vs. the "Copy-Paste Spreadsheet" pain. Measure "Get Early Access" clicks. <br>*(Target: Organizer Persona)* | **3 Days** (Run ads/traffic) | > 20% conversion rate on the "Get Access" button. |
| **Usability:** Easy Self-Hosting | **Wizard of Oz / Tech Spike:** Create a "Deploy Script" that purely sets up the environment (Hello World). Ask a non-dev to run it. <br>*(Target: Fernando/Non-Tech Organizer)* | **4 Hours** (Observation) | **User Success:** The user gets a "It Works!" page up in < 15 minutes with 0 errors. |
| **Feasibility:** $0 Cost | **Infrastructure Spike:** Deploy a dummy heavy-load script to the target "Free Tier" and monitor for 48h to check limit caps. <br>*(Target: System/Architect)* | **2 Days** (Monitoring) | **Cost Audit:** Dashboard shows **$0.00** incurred and no "Rate Limit Exceeded" emails. |
| **Business:** "Input-Only" Sufficiency | **Contextual Inquiry:** Show a paper prototype of the "Dashboard" that only shows a "List of Submissions" (no scoring). Ask: "What would you do next?" <br>*(Target: Organizer Persona)* | **1 Day** (3 Interviews) | **Retention:** User accepts "Export to CSV" as a valid workaround. <br>*(Fail if >50% say "I'm leaving")* |

## 3. The "Go/No-Go" Gate

Before proceeding to Step 6 (Development Strategy), we must review the results.

- **What did we learn?** [Summarize findings]
- **Did we validate the solution?**
  - [ ] Yes: Proceed to build the solution (Step 6).
  - [ ] No: Pivot! We need to go back to Step 3 (Explore) and find a better solution.
  - [ ] Unsure: We need another experiment.
