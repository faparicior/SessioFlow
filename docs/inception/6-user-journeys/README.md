# Step 6: User Journey Mapping

## Goal
Map the sequence of steps that users (personas) take to achieve their goals. This connects the **Features** identified in Step 5 to a coherent narrative, ensuring no step is missing and the flow is logical.

---

## The Conference Lifecycle (The "Composite" View)
*How the individual journeys connect over time*

These interactions happen over time, separated by days or weeks. We manage this complexity by splitting them into distinct **Functional Journeys**, which are tied together by the **Conference Status**.

| Timeframe | Conference Status | Active Persona | Journey Link |
| :--- | :--- | :--- | :--- |
| **Day 1** | `Draft` → `C4P Open` | Fernando | [Journey 1: Setup](./journey-01-setup-conference.md) |
| **Weeks 1-4** | `C4P Open` | Andrea | [Journey 2: Submission](./journey-02-submitting-talk.md) |
| **Week 5** | `C4P Closed` → `Voting` | Fernando | [Journey 3: Selection](./journey-03-selection-and-program.md) |
| **Week 6** | `Published` | Both | [Journey 4: Acceptance](./journey-04-acceptance-and-logistics.md) |
| **Operational** | `All` | Fernando | [Journey 5: Deployment](./journey-05-deployment.md) |

---

## Matrix: Feature Coverage Check

*Ensure every "Must-have" feature from Step 5 is used in at least one journey.*

| Feature Name | Priority | Used in Journey? |
| :--- | :--- | :--- |
| **Collect Proposals (CfP)** | Must-have | ✅ Journey 1, 2, 3 |
| **Review & Score Sessions** | Must-have | ✅ Journey 3 |
| **Automate Speaker Communications** | Must-have | ✅ Journey 2, 4 |
| **Assign Schedule Slots** | Must-have | ✅ Journey 3 |
| **Co-Speaker Management** | Must-have | ✅ Journey 2 |
| **Bulk Update Session Status** | Should-have | ✅ Journey 3 |
| **Speaker Travel & Info Dashboard** | Should-have | ✅ Journey 4 |
| **Deploy with Standard Tools** | Should-have | ✅ Journey 5 |
| **Expose Public API** | Should-have | ❌ (Targeted at 3rd party devs, not primary persona flow) |

---

## Notes & Observations
* **Composite Nature:** The journeys described above are **time-separated**. Journey 1 happens weeks before Journey 3. We treat them as separate "User Sessions" to make them buildable.
* **Gap Identified:** The **Public API** feature is a "Should-have" but doesn't have a direct *primary persona* journey mapped here. This is acceptable.
* **State Management:** The transition between Journey 2 (Submission) and Journey 3 (Selection) implies a "Close CfP" action which creates a new state in the system (Voting/Selection).

---

**Next Step:** In Step 7, we will sequence these features into the MVP Canvas to define the specific releases.
