# Map the Big Picture (The Backbone)

Objective: Create the "spine" of your story map by arranging high-level user activities and tasks in a narrative flow (left-to-right). Focus on the breadth of the story, not the depth

## 1 - The Narrative Context

Who is taking this journey and what is the trigger?

- Primary User Persona: Fernando, the SQL and Spreadsheet Juggler (Volunteer Organizer)
- Secondary Persona: Andrea, the Experienced Speaker
- Trigger Event: A new conference is being organized, and the Call for Papers needs to be managed.
- Ultimate Goal: Reduce administrative overhead by 70%, manage sessions efficiently, and provide a single source of truth for the event.

## 2 - The Backbone (Activities & Tasks)

    Identify the major "User Activities" (high-level goals) and the sequential "User Tasks" (steps to achieve the goal) that form the narrative flow.

**Tip:** Use short verb phrases (e.g., "Search for items," "Check out").

| Sequence | User Activity <br>*(The Big Things)*<br>Aggregates tasks directed at a common goal | User Tasks <br>*(The Steps)*<br>The sequential actions users take to complete the activity | User Role <br>Who performs this? |
| :--- | :--- | :--- | :--- |
| 1 | **System Deployment**<br>(Getting the platform ready) | 1. Download the repository<br>2. Run startup script (docker-compose up) | Fernando (Organizer) |
| 2 | **Event Configuration**<br>(Setting the rules) | 1. Define event details (Dates, Tracks)<br>2. Configure CfP open/close dates<br>3. Customize submission form | Fernando (Organizer) |
| 3 | **Proposal Submission**<br>(Collecting content) | 1. Land on CfP page<br>2. Create account or log in<br>3. Fill in title, abstract, and upload photo<br>4. Invite co-speaker (optional)<br>5. Submit proposal | Andrea (Speaker) |
| 4 | **Selection & Scheduling**<br>(Curating the program) | 1. Log in as Authorized Admin<br>2. Review and rate sessions<br>3. Select final list of talks<br>4. Assign rooms and time slots | Fernando (Organizer) |
| 5 | **Acceptance & Logistics**<br>(Communicating results) | 1. Publish results (Send emails)<br>2. Click link in acceptance email<br>3. View travel guides and info<br>4. Confirm attendance | Fernando & Andrea |
| 6 | **Event Wrap-up**<br>(Closing the loop) | 1. Check-in speakers (Day of event)<br>2. Collect attendee feedback<br>3. Send thank you notes | Fernando (Organizer) |

## 3 - The "And Then..." Check

Read the backbone aloud. Does it tell a coherent story? Use the conjunction "and then..." between steps to test the flow.

- Narrative Check: First **Fernando deploys the system**, and then **he configures the event details**, and then **Andrea submits a proposal**, and then **Fernando selects the talks**, and then **publish results/logistics occur**, and finally **the event finishes with feedback**.
- Missing Links: The previous gap (Deploy -> Submit) is now bridged by the Configuration step. The story now extends through the actual event execution.
- Notes:
    - **Deployment (Journey 4)** is a prerequisite step but essential for the Volunteer Organizer persona who needs a "simple checkout" equivalent for IT operations.
    - **Co-Speaker Management** is handled within the Proposal Submission activity to address Andrea's pain point immediately.

## 4 - Multi-User/System Intersections

Does the narrative require hand-offs between different users or systems?

- Hand-off Points:
    - **Submission -> Selection**: Andrea submits data -> Fernando accesses it.
    - **Selection -> Acceptance**: Fernando triggers publication -> System notifies Andrea -> Andrea returns to platform.
- System Actions:
    - System handles co-speaker invite links.
    - System sends automated emails (Received, Accepted).
    - System updates status when Andrea confirms attendance.

--------------------------------------------------------------------------------
🔍 Quality Checklist for Step 2
Use this checklist to validate your Backbone.

- [x] Chronological Order: Is the map arranged left-to-right in time order?
- [x] Breadth over Depth: Have we covered the entire story from start to finish before adding details?
- [x] Verb Phrases: Are the items written as short verb phrases (e.g., "Select movie")?
- [x] Activities vs. Tasks: Have we grouped tasks under higher-level "Activities" (the diamond-shaped sticky notes)?
- [x] No Features Yet: Have we focused on what people do (tasks) rather than features the software has?
