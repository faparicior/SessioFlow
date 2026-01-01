# Step 7: Features & Sequencing

## Goal
Organize the brainstormed features into a logical sequence of releases to define the **Minimum Viable Product (MVP)** and subsequent increments. This ensures we deliver value early while managing technical risk.

## 7.1 Brainstormed Features (Initial List)
*All features considered, derived from Brainstorming (Step 5).*

* [x] **Collect Proposals (CfP)**: Public form for speakers to submit talks.
* [x] **Review & Score Sessions**: Dashboard for organizers to rate submissions.
* [x] **Automate Speaker Communications**: Email triggers for status changes.
* [x] **Assign Schedule Slots**: Interface to mapping sessions to rooms/times.
* [x] **Co-Speaker Management**: Invite system for multi-speaker sessions.
* [ ] **Bulk Update Session Status**: Batch actions for acceptance/rejection.
* [ ] **Speaker Travel & Info Dashboard**: dedicated area for logistics info.
* [ ] **Deploy with Standard Tools**: Docker/script based deployment.
* [ ] **Expose Public API**: Read-only endpoints for external apps.
* [ ] **Collect Attendee Feedback**: Post-session rating system.
* [ ] **Detect Schedule Conflicts**: Validation logic for double-bookings.

---

## 7.2 The Feature Sequencer (Release Planning)

### 🌊 Wave 1: The Minimum Viable Product (MVP)
*Features required to validate the core hypothesis: "A simple, free tool for non-profits to manage the full CfP lifecycle."*

| Feature | Effort (E, EE, EEE) | Business Value ($, $$, $$$) | UX Value (♥, ♥♥, ♥♥♥) | Tech Comfort (T, TT, TTT) | Owner |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Collect Proposals (CfP)** | E | $$$ | ♥♥♥ | TT | @CoreTeam |
| **Review & Score Sessions** | E | $$$ | ♥ | TT | @CoreTeam |
| **Co-Speaker Management** | E | $$ | ♥♥♥ | TTT | @CoreTeam |

**MVP Rationale:**
This wave focuses strictly on the **Intake and Review** phase. It allows the Persona (Fernando) to launch the Call for Papers and gather content. The "Co-Speaker Management" is the key differentiator (Wow Factor) included to attract high-quality speakers (Andrea) early on. Scheduling and Mass Communication are deferred to Wave 2, as they happen *after* selection.

### 🌊 Wave 2: Operations & Ease of Use (Next Increment)
*Features that streamline the workflow and improve the deployment experience.*

| Feature | Effort (E, EE, EEE) | Business Value ($, $$, $$$) | UX Value (♥, ♥♥, ♥♥♥) | Tech Comfort (T, TT, TTT) | Owner |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Assign Schedule Slots** | EE | $$$ | ♥♥ | T | @CoreTeam |
| **Automate Speaker Communications** | EE | $$$ | ♥♥♥ | T | @CoreTeam |
| **Bulk Update Session Status** | E | $$$ | ♥♥ | TTT | @CoreTeam |

### 🌊 Wave 3: Scale & Ecosystem
*Features that enable growth and external integrations.*

| Feature | Effort (E, EE, EEE) | Business Value ($, $$, $$$) | UX Value (♥, ♥♥, ♥♥♥) | Tech Comfort (T, TT, TTT) | Owner |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Deploy with Standard Tools** | EE | $$ | ♥ | T | @CoreTeam |
| **Speaker Travel & Info Dashboard** | EE | $ | ♥♥♥ | TT | @CoreTeam |
| **Expose Public API** | EEE | $ | ♥ | TT | @CoreTeam |


### 🗑️ Parking Lot (Out of Scope for now)
*Features that are not critical for the initial validation.*

* [ ] **Collect Attendee Feedback**: Happens *after* the main problem (organizing) is solved.
* [ ] **Detect Schedule Conflicts**: A "quality of life" feature. Small events can manage this manually.

---

## 7.3 MVP Definition Validation
*Does this MVP satisfy the constraints?*

1.  **Cost:** Yes, the scope is small enough to run on free tiers (no complex services).
2.  **Usability:** Focuses on the "Happy Path" for Fernando and Andrea.
3.  **Simplicity:** Excludes complex logistics (Travel Dashboard) and API for now.