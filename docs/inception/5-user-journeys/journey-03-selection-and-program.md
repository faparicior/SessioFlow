# 🗺️ Journey 3: Selection & Program Creation

**Persona:** [Fernando (Volunteer Organizer)](../3-personas/01-fernando-organizer.md)  
**Main Goal:** Review submitted talks, score proposals, perform bulk status updates, and assign schedule slots.

> **Context note:** Journey triggered when CFP submission period ends. Fernando closes CFP, shifting status to `Voting` -> `Selection` -> `Published`.

---

## Overview Visualization

```
[Fernando (Organizer)]              [SessioFlow System]                   [Speakers / Public]
          │                                  │                                     │
          │── [Close CFP Action] ──────────> │ Stage 1: Close CFP                  │
          │                                  │  · Status -> Voting                 │
          │                                  │                                     │
          │── [Review & Score Sessions] ───> │ Stage 2: Evaluation & Scoring       │
          │                                  │  · Aggregates rating scores         │
          │                                  │                                     │
          │── [Bulk Update Status] ────────> │ Stage 3: Decision & Bulk Updates    │
          │                                  │  · Marks Accepted / Rejected        │
          │                                  │                                     │
          │── [Assign Schedule Slots] ─────> │ Stage 4: Schedule Building          │
          │                                  │  · Assigns Rooms & Time slots       │
          │                                  │  · Status -> Published ────────────>│ [Public Program Live]
```

---

## Lifecycle Overview

| Stage | Trigger | Persona's Action | System Response |
| :--- | :--- | :--- | :--- |
| **1. Close CFP** | CFP deadline reached | Clicks "Close CFP" button | Updates conference status to `Voting` & disables submissions |
| **2. Review & Scoring** | Committee reviews talks | Reads proposals & submits ratings (1-5 stars) | Calculates aggregate scores and ranks proposals |
| **3. Decision** | Selection meeting completed | Selects accepted proposals via bulk status editor | Updates session statuses to `Accepted` or `Rejected` |
| **4. Scheduling** | Program grid building | Drag-and-drops / selects room & time slots | Generates schedule grid and publishes schedule |

---

## Stage 1: Close CFP

**Trigger:** The advertised Call for Papers submission window ends.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Click "Close CFP" in Admin | Collect Proposals (CfP) | Conference status updated to `Voting` |
| 2 | Public Form Locks | Prevent new submissions | Public CFP page displays "Submissions Closed" |

**Pain points addressed:**  
- ❌ **Pain 2:** Lot of manual work to manage conference with different data sources.

**Gap:** Automated deadline timer closure deferred to Wave 2.

---

## Stage 2: Evaluation & Scoring

**Trigger:** Organizers begin reviewing submitted proposals.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Open Proposals Grid | Review & Score Sessions | Filterable table of all submitted proposals |
| 2 | Read Proposal & Assign Rating / Notes | Score Session Use Case | Persisted rating score & review comments |

**Pain points addressed:**  
- ❌ **Pain 2:** Replaces manual spreadsheet review workflows.
- ✅ **Need 2:** Automated data evaluation and summary reports.

**Gap:** Multi-blind review mode deferred to Wave 3.

---

## Stage 3: Decision & Bulk Updates

**Trigger:** Committee finalizes session selection.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Select Top Rated Proposals | Bulk Update Session Status | Multi-selection active in admin grid |
| 2 | Apply "Mark as Accepted" Action | Bulk Status Change | Batch status update executed atomically |

**Pain points addressed:**  
- ❌ **Pain 1:** Repetitive work to process speaker acceptance.
- ✅ **Need 3:** Simple, intuitive interface saving hours of manual work.

**Gap:** Automated regret email delay queue deferred to Wave 2.

---

## Stage 4: Schedule Building & Publishing

**Trigger:** Accepted sessions are ready to be placed on the agenda.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Open Schedule Builder | Assign Schedule Slots | Interactive room/time grid UI |
| 2 | Assign Session to Room & Track | Schedule Assignment | Session linked to Room ID and Start/End Time |
| 3 | Click "Publish Schedule" | Publish Program | Conference status -> `Published`; public schedule live |

**Pain points addressed:**  
- ✅ **Need 1:** Single platform for managing all conference sessions.

**Gap:** Automatic conflict detection (double booking) listed as Nice-to-Have.

---

## Critical Path

**Minimum Happy Path:**

| # | Step | Stage |
| :--- | :--- | :--- |
| 1 | Close CFP Window | Stage 1 |
| 2 | Score Sessions in Admin Portal | Stage 2 |
| 3 | Bulk Mark Top Proposals as "Accepted" | Stage 3 |
| 4 | Assign Rooms/Times and Publish Agenda | Stage 4 |

**Related journeys:**
- [Journey 1: Setup the Conference](./journey-01-setup-conference.md)
- [Journey 2: Submitting a Talk](./journey-02-submitting-talk.md)
- [Journey 4: Acceptance & Logistics](./journey-04-acceptance-and-logistics.md)

---

**Next Step:** In Step 7, we will sequence these features into the MVP Canvas to define the specific releases.
