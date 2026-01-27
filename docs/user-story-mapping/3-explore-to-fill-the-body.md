# Explore (Filling the Body)

Objective: Break down the high-level tasks from the Backbone into specific, buildable user stories. Explore variations, alternative paths, and "sad paths" (when things go wrong) to ensure a complete understanding of the solution space.

## 1. The "What-About" Brainstorming

Before finalizing stories, play the "What-About" game for your major activities.

*   **What about novices?**
    *   *Deployment:* Fernando might not know Docker. -> **Mitigation:** Provide a single copy-paste script or a "Deploy to Vercel" button in the repo.
*   **What about errors?**
    *   *Submission:* What if the speaker loses internet while typing a long abstract? -> **Detail:** We need local autosave or a warning.
    *   *Images:* What if the profile photo is 10MB? -> **Constraint:** Enforce 2MB limit and simple crop.
*   **What about the "Missing" features (Wave 2)?**
    *   *Co-Speakers:* Andrea wants to add a partner but the feature is "Out of Scope". -> **Workaround:** Add a "Notes/Co-speakers" text field in the MVP form so she isn't blocked.
    *   *Reviews:* Fernando collects talks but can't review them on the platform yet. -> **Workaround:** Ensure he can export to CSV or see a basic list to view them manually.

## 2. The Body of the Map

| Backbone Task (Step 2) | Wave | User Stories / Sub-Tasks (The specifics) | Notes / Dependencies / Variations |
| :--- | :---: | :--- | :--- |
| **1. Initial Setup** | **MVP** | 1. **Clone & Configure:** User downloads repo and sets `.env` vars (DB, Auth).<br>2. **Run Start Script:** User runs `docker-compose up` to launch app. | **Dep:** Needs Docker installed.<br>**Sad:** Port conflict errors? |
| **2. Event Definition** | **MVP** | 1. **Organizer Login:** User logs in via Magic Link.<br>2. **Create Event:** User entered Name, Slug, Dates.<br>3. **Publish Link:** User flips status to "Open" and gets public URL. | **Dep:** Supabase Auth.<br>**Var:** Admin accidentally deletes event? (Hide button for MVP). |
| **3. Proposal Submission** | **MVP** | 1. **Speaker Login:** User logs in (Magic Link).<br>2. **Create Profile:** User fills Bio, Name, uploads Photo.<br>3. **Submit Talk:** User enters Title, Abstract, Level.<br>4. **View Confirm:** User sees "Submitted" success state. | **Dep:** Supabase Storage (Photo).<br>**Var:** User edits proposal after submitting? (Allow until CfP closes). |
| (Invite Co-Speaker) | *Wave 2* | 1. Generate Invite Link<br>2. Accept Invite | **MVP Workaround:** Free text field. |
| **4. Selection Process** | *Wave 2* | 1. Close CfP (Stop submissions)<br>2. View Submission List (Read-only)<br>3. Rate/Score Talks | MVP only needs a basic "List View" to prove data was saved. Scoring is deferred. |
| **5. Program Scheduling** | *Wave 2* | 1. Create Room/Slots<br>2. Drag-and-drop assignment | **MVP:** Not included. |
| **6. Confirmation** | *Wave 2* | 1. Send Bulk Emails (Accept/Reject)<br>2. Speaker confirms attendance | **MVP:** Manual email by organizer outside platform. |

## 3. Story Definition Template

### Story Card 1: Organizer Launches Event

**Title:** Create and Publish Event

**The Narrative (Who/What/Why):**
As **Fernando (Organizer)**, I want to **configure key event details and generate a public link**, So that **I can start marketing my Call for Papers immediately.**

**Acceptance Criteria (Confirmation):**
- [ ] Verify user can enter Event Name, Start/End Dates, and unique URL Slug.
- [ ] Verify system generates a unique public URL (e.g., `app.sessioflow.com/java-conf-2025`).
- [ ] Constraint: Start Date cannot be in the past.
- [ ] Constraint: Slug must be URL-safe (no spaces/special chars).

**Design/Technical Notes:**
- **Dependencies:** Database table `Events`.
- **UI:** Simple single-column form. "Publish" toggle activates the public route.

---

### Story Card 2: Speaker Profile Setup

**Title:** Create Speaker Profile (with Photo)

**The Narrative (Who/What/Why):**
As **Andrea (Speaker)**, I want to **create a profile with my bio and photo**, So that **organizers know who I am and can use my info for the website if accepted.**

**Acceptance Criteria (Confirmation):**
- [ ] Verify user can upload a profile image (JPG/PNG, max 2MB).
- [ ] Verify user can enter Name, Headline, and Bio.
- [ ] Verify profile persists across multiple logins.
- [ ] **Sad Path:** If image upload fails, show clear error (e.g., "File too big").

**Design/Technical Notes:**
- **Dependencies:** Supabase Storage for images.
- **Risk:** Malicious uploads? (Restrict mime-types).

---

### Story Card 3: Submit Talk Proposal

**Title:** Submit Session Proposal

**The Narrative (Who/What/Why):**
As **Andrea (Speaker)**, I want to **submit my session details**, So that **I can be considered for the conference.**

**Acceptance Criteria (Confirmation):**
- [ ] Verify inputs: Title, Abstract, Description, Format (Talk/Workshop), Level.
- [ ] Feature: "Co-Speakers" field is a **simple text area** (MVP workaround).
- [ ] Verify "Submit" button saves data and redirects to a "Success/Dashboard" view.
- [ ] Verify user can edit their submission while the CfP is open.

**Design/Technical Notes:**
- **Dependencies:** Database table `Proposals` linked to `Events`.
- **UI:** Clean form with autosave (if possible) or "Stay on page" warning.

---

### Story Card 4: Self-Hosted Deployment

**Title:** Deploy via Docker Compose

**The Narrative (Who/What/Why):**
As **Fernando (Volunteer)**, I want to **deploy the app with a standard script**, So that **I can host it on my own cheap server ($0 cost) without complex DevOps.**

**Acceptance Criteria (Confirmation):**
- [ ] Verify `docker-compose.yml` includes App and Database (or connection to cloud DB).
- [ ] Verify `README.md` has clear copy-paste instructions for env vars.
- [ ] Verify app starts on `localhost:3000` after running the script.

**Design/Technical Notes:**
- **Dependencies:** Node.js, Docker.
- **Risk:** User environment differences (Windows vs Linux). Solution: Stick to standard Linux/WSL instructions.

## 4. Risk Assessment (The "Opps" Factor)

*   **Risk 1: Image Hosting Costs**
    *   *Assumption:* We assume Fernando can config Supabase Storage easily.
    *   *Mitigation:* Create a setup script or strict documentation on how to get the Supabase API keys.
*   **Risk 2: Lack of Reviews (MVP Limitation)**
    *   *Assumption:* Users will be okay with just *collecting* data and not viewing it well yet.
    *   *Mitigation:* Ensure we provide a "Export to CSV" button in the Admin Dashboard even if it wasn't explicitly in the features list, otherwise the data is trapped. (Added to backlog).
