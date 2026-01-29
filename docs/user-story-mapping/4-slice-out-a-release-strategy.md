# Slice Out a Release Strategy

Objective: Prioritize outcomes over output. Slice the map horizontally to define the Minimum Viable Solution (MVS)—the smallest amount of output required to achieve the desired outcome for a specific target audience.

## 1. Define the Release Goal (The Outcome)

Before selecting stories, define the success criteria for this specific slice. Don't prioritize features; prioritize the result.

- **Release Name:** "The Cupcake" (MVP Pilot)
- **Target Audience:** Event Organizers (starting with Fernando) who need to launch a Call for Papers immediately.
- **Desired Outcome:** An organizer can self-host the tool, publish a CfP page, and start collecting proposals within minutes, eliminating the need for manual spreadsheets.
- **Impact Metric:**
  - **Activation:** 5 Events created.
  - **Volume:** >50 Proposals collected.
  - **Conversion:** 80% completion rate (Form Start -> Submit).

## 2. The Minimum Viable Solution (MVS)

Identify the stories that fall **Above the Line**. These are the stories that are strictly necessary to achieve the outcome defined above. If you remove one, the user cannot achieve the goal.

| Backbone Activity | Selected Stories (Must-Haves) | Why is this in the slice? |
| :--- | :--- | :--- |
| **1. Initial Setup** | • **Deploy via Docker Compose**<br>• Clone & Configure Repo | Critical for "Self-Hosted" constraint. Users cannot use the app without this. |
| **2. Event Definition** | • **Organizer Login** (Magic Link)<br>• **Create and Publish Event** | Defines the "product" (the CfP page) that organizers share. |
| **3. Proposal Submission** | • **Speaker Login** (Magic Link)<br>• **Create Speaker Profile** (with Photo)<br>• **Submit Session Proposal** (w/ Success Page) | The core value: collecting data. Includes "Success Page" as critical feedback (replacing email for MVP). |
| **4. Selection Process** | • **View Submission List** (Basic Read-only) | Essential visibility. "Black box" data collection is not a functional solution. |

> **Note:** The "Minimum Viable Solution" is the intersection of what is **Valuable** (users want it), **Usable** (users can figure it out), and **Feasible** (we can build it with current time/tech).

## 3. Subsequent Slices (The Roadmap)

Move the remaining stories into future slices. This forms your release roadmap based on value, not just a schedule.

### Slice 2: "The Selection & Management Update" (Wave 2)

- **Goal:** Enable organizers to process the proposals, make decisions, and shape the event program.
- **Key Stories:**
  - Invite Co-Speakers (Workaround removed)
  - Close CfP (Stop submissions)
  - Review & Score Sessions (Rating UI)
  - Bulk Update Session Status

### Slice 3: "The Full Conference Suite" (Wave 3)

- **Goal:** Manage the full event schedule and final logistics.
- **Key Stories:**
  - Program Scheduling (Drag-and-drop slots)
  - Bulk Email Confirmations (Accept/Reject)
  - Assign Schedule Slots
  - Speaker Travel & Info Dashboard

## 4. The Trash / "Not Now" Pile

Explicitly list the ideas that were "good" but didn't make the cut for the foreseeable future. This prevents scope creep.

- **Discarded/Deferred:**
  - **Payment Processing** - **Reason:** Permanent Anti-Goal. We focus on free/community events.
  - **Automated Speaker Emails** - **Reason:** Complexity (SMTP setup, reliability). MVP relies on manual personal emails.
  - **Complex Microservices** - **Reason:** Technical Constraint. Must run on minimal infrastructure/free tier.
  - **Attendee Feedback** - **Reason:** Out of scope for the "Organizing" phase.
  - **Reviewer Roles** - **Reason:** Organizers review themselves in MVP.

--------------------------------------------------------------------------------

🔍 Quality Checklist for Step 4

Use this checklist to validate your release slice.

- [ ] **Cohesion:** If you look only at the stories in Slice 1, can the user complete a full, meaningful journey from start to finish?
- [ ] **Thinness:** Is the slice as thin as possible? Did we remove "nice-to-haves" that don't directly support the target outcome?
- [ ] **Outcome Focus:** Did we prioritize based on what the business/user gets (outcome), not just what the developers build (output)?
- [ ] **Feasibility:** Do we believe this slice is actually buildable in the timeframe we have?
