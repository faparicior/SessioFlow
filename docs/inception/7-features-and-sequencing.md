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

| Feature | Business Value (1-5) | Tech Comfort (1-5) | Owner |
| :--- | :---: | :---: | :--- |
| **Collect Proposals (CfP)** | 5 (High) | 4 (Standard CRUD) | @CoreTeam |
| **Review & Score Sessions** | 5 (High) | 4 (Standard CRUD) | @CoreTeam |
| **Automate Speaker Communications** | 5 (High) | 3 (Email Integration) | @CoreTeam |
| **Assign Schedule Slots** | 5 (High) | 3 (Logic/UI) | @CoreTeam |
| **Co-Speaker Management** | 4 (Differentiator) | 5 (Simple Link Logic) | @CoreTeam |

**MVP Rationale:**
This wave covers the "Critical Path" identified in Step 6 (Journeys 1, 2, and 3). It allows a user to **collect**, **select**, **communicate**, and **schedule** content. Without any of these, the product is incomplete for holding an event. "Co-Speaker Management" is included because it addresses a specific high-priority pain point for the "Andrea" persona that competitors often fail at.

### 🌊 Wave 2: Operations & Ease of Use (Next Increment)
*Features that streamline the workflow and improve the deployment experience.*

* [ ] **Deploy with Standard Tools**: Essential for the "self-hosting" promise, but can be manual/documented for MVP.
* [ ] **Bulk Update Session Status**: Adds efficiency for larger events (pain point relief), but not strictly blocking for small batches.
* [ ] **Speaker Travel & Info Dashboard**: High value for speakers, but can be handled via static emails in MVP.
* [ ] **Expose Public API**: Enables "Power User" flexibility (Fernando's tech savviness).

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