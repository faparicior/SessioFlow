# Map the Big Picture (The Backbone)

Objective: Create the "spine" of your story map by arranging high-level user activities and tasks in a narrative flow (left-to-right). Focus on the breadth of the story, not the depth

## 1 - The Narrative Context

Who is taking this journey and what is the trigger?

- Primary User Persona: **Fernando, the Organizer**
- Trigger Event: **Fernando decides to launch a Call for Papers for his upcoming conference.**
- Ultimate Goal: **The schedule is published and speakers are confirmed.**

## 2 - The Backbone (Activities & Tasks)

    Identify the major "User Activities" (high-level goals) and the sequential "User Tasks" (steps to achieve the goal) that form the narrative flow.

**Tip:** Use short verb phrases (e.g., "Search for items," "Check out").

| Sequence | User Activity <br>*(The Big Things)*<br>Aggregates tasks directed at a common goal | User Tasks <br>*(The Steps)*<br>The sequential actions users take to complete the activity | User Role <br>Who performs this? |
| :--- | :--- | :--- | :--- |
| 1 | **Initial Setup (Deployment)**<br>(Getting the system ready) | 1. **Download source/repo**<br>2. **Configure environment variables** (DB, Auth codes)<br>3. **Run deployment script** (e.g. Docker up) | Fernando (Organizer) |
| 2 | **Event Definition**<br>(Creating the specific C4P) | 1. **Log in as Admin**<br>2. **Create new event**<br>3. **Define submission dates**<br>4. **Publish C4P link** | Fernando (Organizer) |
| 3 | **Proposal Submission**<br>(Speakers submit their talks) | 1. **Access public C4P page**<br>2. **Create speaker account**<br>3. **Fill profile details** (Bio, Photo)<br>4. **Submit talk proposal**<br>5. **Invite co-speaker** (Optional) | Andrea (Speaker) |
| 4 | **Selection Process**<br>(Reviewing and choosing talks) | 1. **Close Call for Papers**<br>2. **Review submitted proposals**<br>3. **Rate/Score talks**<br>4. **Select final lineup** | Fernando (Organizer) |
| 5 | **Program Scheduling**<br>(Building the agenda) | 1. **Define rooms and slots**<br>2. **Assign talks to slots**<br>3. **Publish draft schedule** | Fernando (Organizer) |
| 6 | **Speaker Confirmation**<br>(Closing the loop) | 1. **Notify accepted speakers**<br>2. **View acceptance email**<br>3. **Confirm attendance**<br>4. **View travel info** | Fernando & Andrea |

## 3 - The "And Then..." Check

Read the backbone aloud. Does it tell a coherent story? Use the conjunction "and then..." between steps to test the flow.

- Narrative Check: First the user **Deploys the System**, and then they **Define the Event**, and then speakers **Submit Proposals**, and then the organizer **Selects Talks**, and then they **Schedule the Program**, and then they **Confirm Speakers**.
- Missing Links: Implied time gaps between Submission (Weeks 1-4) and Selection (Week 5).
- Notes: The transition from Deployment to Usage assumes technical competence (Self-hosting).

## 4 - Multi-User/System Intersections

Does the narrative require hand-offs between different users or systems?

- Hand-off Points:
    - **Step 2 -> 3:** Fernando publishes link -> Andrea accesses link.
    - **Step 3 -> 4:** Deadline passes -> Fernando closes CfP.
    - **Step 5 -> 6:** Fernando triggers notification -> System sends email -> Andrea confirms.
- System Actions:
    - **System sends "Received" email** (after Proposal Submission).
    - **System sends "Accepted" email** (after Selection).

--------------------------------------------------------------------------------
🔍 Quality Checklist for Step 2
Use this checklist to validate your Backbone.

- [x] Chronological Order: Is the map arranged left-to-right in time order?
- [x] Breadth over Depth: Have we covered the entire story from start to finish before adding details?
- [x] Verb Phrases: Are the items written as short verb phrases (e.g., "Select movie")?
- [x] Activities vs. Tasks: Have we grouped tasks under higher-level "Activities" (the diamond-shaped sticky notes)?
- [x] No Features Yet: Have we focused on what people do (tasks) rather than features the software has?
