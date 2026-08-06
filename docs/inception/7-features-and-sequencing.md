# Step 7: Features & Sequencing

## Goal
Organize the brainstormed features into a logical sequence of releases to define the **Minimum Viable Product (MVP)** and subsequent increments. This ensures we deliver value early while managing technical risk.

## 7.1 Brainstormed Features (Initial List)
*All features considered, derived from Brainstorming (Step 5) and Journey Mapping (Step 6).*

* [x] **Setup Conference (C4P Configuration)**: Create conference, set dates, and open C4P (Found in Journey 1).
* [x] **Collect Proposals (CfP)**: Public form for speakers to submit talks.
* [x] **Review & Score Sessions**: Dashboard for organizers to rate submissions.
* [x] **Automate Speaker Communications**: Email triggers for status changes.
* [x] **Assign Schedule Slots**: Interface to mapping sessions to rooms/times.
* [x] **Co-Speaker Management**: Invite system for multi-speaker sessions.
* [ ] **Bulk Update Session Status**: Batch actions for acceptance/rejection.
* [ ] **Speaker Travel & Info Dashboard**: dedicated area for logistics info.
* [ ] **Deploy with Standard Tools**: Docker/script based deployment.
* [ ] **Expose Public API**: Read-only endpoints for external apps.
* [x] **User Authentication**: Secure login for Organizers and Speaker account creation.
* [x] **Speaker Profile (Photo Upload)**: Allow speakers to upload profile pictures.
* [ ] **Collect Attendee Feedback**: Post-session rating system.
* [ ] **Detect Schedule Conflicts**: Validation logic for double-bookings.

---

## 7.2 The Feature Sequencer (Release Planning)

### 🌊 Wave 1: The Minimum Viable Product (MVP) - "Intake & Setup"
*Features required to validate the core hypothesis: "A simple, free tool for non-profits to start collecting proposals."*

| Feature | Effort (E, EE, EEE) | Business Value ($, $$, $$$) | UX Value (♥, ♥♥, ♥♥♥) | Tech Comfort (T, TT, TTT) | Owner |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Setup Conference (C4P Configuration)** | E | $$$ | ♥ | TTT | @CoreTeam |
| **Collect Proposals (CfP)** | E | $$$ | ♥♥♥ | TT | @CoreTeam |
| **User Authentication** | EE | $$$ | ♥♥ | TT | @CoreTeam |
| **Speaker Profile (Photo Upload)** | EE | $$ | ♥♥♥ | TT | @CoreTeam |

**MVP Rationale:**
We prioritize the **Start of the Lifecycle**. Without "Conference Setup" and "CfP Collection", nothing else matters. This MVP enables Fernando to Create an account -> Create a Conference -> Share the link -> Receive Submissions. Reviewing and Scoring can technically wait until submissions arrive (Wave 2), reducing initial scope and risk.

### 🌊 Wave 2: Selection & Management (The "Closed CfP" Phase)
*Features needed once the submission deadline passes.*

| Feature | Effort (E, EE, EEE) | Business Value ($, $$, $$$) | UX Value (♥, ♥♥, ♥♥♥) | Tech Comfort (T, TT, TTT) | Owner |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Review & Score Sessions** | E | $$$ | ♥ | TT | @CoreTeam |
| **Co-Speaker Management** | EE | $$ | ♥♥♥ | TTT | @CoreTeam |
| **Bulk Update Session Status** | E | $$$ | ♥♥ | TTT | @CoreTeam |
| **Automate Speaker Communications** | EE | $$$ | ♥♥♥ | T | @CoreTeam |

**Rationale:**
This wave addresses the "Middle" of the lifecycle. Once proposals are in, Fernando needs to review them. Co-speakers are added here to ensure the proposal data is complete before final selection.

### 🌊 Wave 3: Execution & Logistics (The "Conference Day" Phase)
*Features required to publish the agenda and manage logistics.*

| Feature | Effort (E, EE, EEE) | Business Value ($, $$, $$$) | UX Value (♥, ♥♥, ♥♥♥) | Tech Comfort (T, TT, TTT) | Owner |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Assign Schedule Slots** | EE | $$$ | ♥♥ | T | @CoreTeam |
| **Deploy with Standard Tools** | EE | $$ | ♥ | T | @CoreTeam |
| **Speaker Travel & Info Dashboard** | EE | $ | ♥♥♥ | TT | @CoreTeam |
| **Expose Public API** | EEE | $ | ♥ | TT | @CoreTeam |


### 🗑️ Parking Lot (Out of Scope for now)
*Features that are not critical for the initial validation.*

* [ ] **Collect Attendee Feedback**: Happens *after* the main problem (organizing) is solved.
* [ ] **Detect Schedule Conflicts**: A "quality of life" feature. Small conferences can manage this manually.

---

## 7.3 MVP Definition Validation
*Does this MVP satisfy the constraints?*

1.  **Cost:** Yes, the scope is small enough to run on free tiers (no complex services).
2.  **Usability:** Focuses on the "Happy Path" for Fernando and Andrea.
3.  **Simplicity:** Excludes complex logistics (Travel Dashboard) and API for now.