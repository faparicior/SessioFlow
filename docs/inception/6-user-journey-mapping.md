# Step 6: User Journey Mapping

## Goal
Map the sequence of steps that users (personas) take to achieve their goals. This connects the **Features** identified in Step 5 to a coherent narrative, ensuring no step is missing and the flow is logical.

---

## � The Event Lifecycle (The "Composite" View)
*How the individual journeys connect over time*

The user is asking about the "Composite Journey"—the fact that these interactions happen over time, separated by days or weeks. We manage this complexity by splitting them into distinct **Functional Journeys**, which are tied together by the **Event Status**.

| Timeframe | Event Status | Active Persona | Active Journey |
| :--- | :--- | :--- | :--- |
| **Day 1** | `Draft` → `C4P Open` | Fernando | **Journey 1: Setup** |
| **Weeks 1-4** | `C4P Open` | Andrea | **Journey 2: Submission** |
| **Week 5** | `C4P Closed` → `Voting` | Fernando | **Journey 3: Selection** |
| **Week 6** | `Published` | Both | **Journey 4: Acceptance** |

---

## �🗺️ Journey 1: Setup the Event (Fernando)

**Persona:** Fernando, the Organizer
**Goal:** Configure the event and open the Call for Papers (C4P Session).

| Step | User Action | System Feature / Response | Pain Point Addressed |
| :--- | :--- | :--- | :--- |
| 1. | Fernando logs in. | **User Authentication**: Shows Admin Dashboard. | **Need 1:** Single platform for all data. |
| 2. | Fernando creates a new "C4P Session". | **Collect Proposals (CfP)**: Form to set Event Name/Dates. | **Pain 1:** Repetitive work to organize CfP. |
| 3. | Fernando publishes the session. | **Collect Proposals (CfP)**: Generates and activates Public Link. | **Need 3:** Simple, intuitive interface. |

---

## 🗺️ Journey 2: Submitting a Talk (Andrea)

**Persona:** Andrea, the Experienced Speaker
**Goal:** Submit a session proposal with a colleague and get confirmation.

| Step | User Action | System Feature / Response | Pain Point Addressed |
| :--- | :--- | :--- | :--- |
| 1. | Andrea lands on the CfP page. | **Collect Proposals (CfP)**: Displays landing page. | Needs a single entry point. |
| 2. | Andrea creates an account or logs in. | **User Authentication**: Magic Link / Social Login. | Security & Profile persistence. |
| 3. | Andrea fills in title, abstract & **uploads photo**. | **Speaker Profile**: Forms + **File Storage**. | |
| 4. | Andrea wants to add her co-speaker. | **Co-Speaker Management**: Generates invite link. | **Pain 2:** "Add a partner is not easy." |
| 5. | Andrea submits the proposal. | **Automate Speaker Communications**: Sends "Received" email. | **Need 2:** Clear view of steps. |

---

## 🗺️ Journey 3: Selection & Program Creation (Fernando)

**Persona:** Fernando, the Organizer
**Goal:** Select the best talks and build the schedule efficiently.

| Step | User Action | System Feature / Response | Pain Point Addressed |
| :--- | :--- | :--- | :--- |
| 1. | Fernando logs in (Authorized Admin). | **User Authentication**: Admin Role Check. | **Need 1:** Single platform. |
| 2. | Fernando **closes the CfP**. | **Collect Proposals (CfP)**: Status change to `Voting`. | |
| 3. | Fernando rates sessions. | **Review & Score Sessions**: Scoring UI. | **Pain 2:** Manual work in Excel. |
| 4. | Fernando selects final list. | **Bulk Update Session Status**: Marks as "Accepted". | **Pain 1:** Repetitive work. |
| 5. | Fernando assigns rooms/times. | **Assign Schedule Slots**: Drag-and-drop/Form. | **Need 1:** Single platform. |

---

## 🗺️ Journey 4: Acceptance & Logistics (Andrea & Fernando)

**Persona:** Andrea (Speaker) & Fernando (Organizer)
**Goal:** Post-selection communication and event logistics.

| Step | User Action | System Feature / Response | Pain Point Addressed |
| :--- | :--- | :--- | :--- |
| 1. | Fernando publishes results. | **Automate Speaker Communications**: Sends "Accepted" email. | **Fernando's Goal:** Reduce admin overhead. |
| 2. | Andrea clicks link in email. | **Speaker Travel & Info Dashboard**: Opens portal. | **Andrea's Pain 3:** Hard to find info. |
| 3. | Andrea views travel guides. | **Speaker Travel & Info Dashboard**: Shows Hotel/Travel info. | **Andrea's Need 1:** Intro & recommendations. |
| 4. | Andrea confirms attendance. | System updates status for Fernando. | |

---

## 🗺️ Journey 5: Deployment (Fernando)

**Persona:** Fernando, the Organizer
**Goal:** Get the system running without a DevOps team.

| Step | User Action | System Feature / Response | Pain Point Addressed |
| :--- | :--- | :--- | :--- |
| 1. | Fernando downloads the repo. | | |
| 2. | Fernando runs startup script. | **Deploy with Standard Tools**: `docker-compose up`. | **Pain 3:** New volunteers need training / Complexity. |

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
*   **Composite Nature:** The journeys described above are **time-separated**. Journey 1 happens weeks before Journey 3. we treat them as separate "User Sessions" to make them buildable.
*   **Gap Identified:** The **Public API** feature is a "Should-have" but doesn't have a direct *primary persona* journey mapped here. This is acceptable.
*   **State Management:** The transition between Journey 2 (Submission) and Journey 3 (Selection) implies a "Close CfP" action which creates a new state in the system (Voting/Selection).

---

**Next Step:** In Step 7, we will sequence these features into the MVP Canvas to define the specific releases.
