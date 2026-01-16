# Explore (Filling the Body)

Objective: Break down the high-level tasks from the Backbone into specific, buildable user stories. Explore variations, alternative paths, and "sad paths" (when things go wrong) to ensure a complete understanding of the solution space.

## 1. The "What-About" Brainstorming

Before finalizing stories, play the "What-About" game for your major activities. Ask these questions to generate details.

• **Variations**:
    - *What about* the user is a first-time speaker vs. a veteran? (Veteran needs quick copy-paste; novice needs guidance).
    - *What about* the organizer is technically savvy vs. non-technical? (Docker commands vs. UI).
• **Exceptions**:
    - *What about* if the profile photo is too large?
    - *What about* if the co-speaker declines the invitation?
    - *What about* if the internet drops during submission?
• **Alternatives**:
    - *What about* logging in via Social vs. Magic Link?
    - *What about* manual scheduling vs. auto-suggestions?
• **Pains & Joys**:
    - *Pain*: Re-entering data if the page reloads.
    - *Joy*: Auto-saving drafts.

## 2. The Body of the Map

Map the details vertically under each Backbone Task. Ideally, arrange them with the "Happy Path" (standard flow) at the top, and variations/exceptions below.

| Backbone Task | Wave (MVP/2/3) | User Stories / Sub-Tasks (The specifics) | Notes / Dependencies / Variations |
| :--- | :---: | :--- | :--- |
| **1. System Deployment** | | | |
| [Download & Setup] | 3 | 1. Clone repository from GitHub<br>2. Configure environment variables (.env)<br>3. Run `docker-compose up`<br>4. Access localhost:3000 | **Dep:** Docker not installed (Show error message/Link to docs)<br>**Dep:** Port 3000 busy (Allow port configuration)<br>**Var:** Download ZIP instead of Git |
| **2. Event Configuration** | | | |
| [Define Event Details] | MVP | 1. Enter Event Name & Description<br>2. Set Start/End Dates<br>3. Upload Event Logo/Banner | **Val:** End date before Start date?<br>**Exc:** Image upload fails (Size/Format limit)<br>**Var:** Multi-day vs Single-day event logic |
| [Configure CfP] | MVP | 1. Set CfP Open/Close Dates<br>2. Define Session Tracks (e.g., Frontend, DevOps)<br>3. Define Session Formats (e.g., Lightning Talk, Workshop) | **Risk:** Changing dates while CfP is active?<br>**Var:** Allow "Anonymous Review" toggle? |
| **3. Proposal Submission** | | | |
| [Account & Profile] | MVP | 1. Enter Email for Magic Link<br>2. Click Magic Link to Log in<br>3. Complete Profile (Bio, Name)<br>4. **Upload Profile Photo** | **Var:** Social Login (Google/GitHub) - *Start with Magic Link for MVP*<br>**Exc:** Photo too big (>5MB) -> Auto-resize or Error?<br>**Edge:** User exists but Profile incomplete |
| [Fill Proposal] | MVP | 1. Enter Session Title<br>2. Enter Abstract/Description<br>3. Select Track & Format<br>4. Save Draft | **Pain:** Losing work on refresh -> Needs LocalStorage autosave<br>**Val:** Abstract too short/long |
| [Co-Speaker Mgmt] | 2 | 1. Click "Add Co-Speaker"<br>2. Enter Co-Speaker Email<br>3. Generate & Send Invite Link | **Exc:** Co-speaker already has a session?<br>**Edge:** Co-speaker declines -> Notify Primary Speaker<br>**Risk:** Invite link expires |
| [Submit] | MVP | 1. Review Summary<br>2. Click "Submit Final"<br>3. Receive Confirmation Email | **Exc:** Network error on submit -> Retry logic<br>**Post:** Lock editing after submission (unless "Edit" allowed until close) |
| **4. Selection & Scheduling** | | | |
| [Review & Rate] | MVP | 1. View List of Blinded Proposals<br>2. Rate 1-5 Stars<br>3. Add internal comment | **Var:** Sort by Track/Format<br>**Exc:** Tie-breaking logic?<br>**Risk:** Organizer bias (ensure blinding works) |
| [Select Final List] | MVP | 1. Filter by Top Rated<br>2. Mark status "Accepted"<br>3. Mark status "Waitlist" / "Rejected" | **Vol:** Bulk select capabilities needed for large events<br>**Exc:** Selecting more talks than slots available (Warning?) |
| [Assign Slots] | 2 | 1. View Schedule Grid (Time x Room)<br>2. Drag accepted session to slot<br>3. Publish Schedule | **Con:** Double booking a speaker? (Warn user)<br>**Exc:** Room capacity mismatch |
| **5. Acceptance & Logistics** | | | |
| [Notify Speakers] | 2 | 1. Trigger "Send Decision Emails"<br>2. System filters Accepted vs Rejected templates<br>3. Send in batches | **Exc:** Email bounces<br>**Edge:** Speaker hasn't responded in X days |
| [Speaker Confirm] | 2 | 1. Speaker clicks "Confirm Attendance"<br>2. Speaker enters Dietary Requirements<br>3. View Travel/Hotel Info Page | **Sad:** Speaker Declines -> Prompt to select from Waitlist<br>**Note:** Travel info is static Markdown/HTML for MVP |
| **6. Event Wrap-up** | | | |
| [Check-in] | 3 | 1. Admin view of all accepted speakers<br>2. Mark "Checked In"<br>3. Distribute badge (manual) | **Exc:** Speaker no-show<br>**Var:** QR Code check-in (Nice to have, not MVP) |
| [Feedback] | 3 | 1. Send "Thank you" email to attendees<br>2. Link to external feedback form (Google Forms) | **Scope:** In-app feedback form is too complex for now. Use external link. |

## 3. Story Definition Template

For high-priority items identified above, flesh out the "Card, Conversation, Confirmation" details.

### Story Card 1: Event Configuration

**Title:** Define Event Core Details

**The Narrative (Who/What/Why):**
As an **Organizer (Fernando)**, I want to **set up my event name, dates, and logo**, So that **speakers know what they are applying for**.

### Acceptance Criteria (Confirmation)

- [ ] Verify event name and description are required.
- [ ] Verify Start Date <= End Date validation.
- [ ] Verify logo upload (max 2MB, image format).
- [ ] **Sad Path:** Show error if dates are in the past (optional warning).

### Design/Technical Notes

- **Dependencies:** Requires Database Schema for `Events` table.
- **UI Sketch Reference:** One-page Setup Wizard (Step 1).

---

### Story Card 2: CfP Setup

**Title:** Configure Call for Papers

**The Narrative (Who/What/Why):**
As an **Organizer**, I want to **define submission tracks and formats**, So that **speakers can categorize their talks correctly**.

### Acceptance Criteria (Confirmation)

- [ ] Verify organizer can add multiple tracks (e.g. Frontend, DevOps).
- [ ] Verify organizer can add multiple formats (e.g. Lightning Talk, Standard).
- [ ] Verify CfP Open/Close dates can be set.
- [ ] **Constraint:** At least one track and one format required to open CfP.

### Design/Technical Notes

- **Dependencies:** Relation 1:N (`Events` -> `Tracks`, `Events` -> `Formats`).
- **UI Sketch Reference:** Dynamic input list (Add/Remove tags or rows).

---

### Story Card 3: Speaker Onboarding

**Title:** Speaker Profile & Auth

**The Narrative (Who/What/Why):**
As a **Speaker (Andrea)**, I want to **log in via Magic Link and set my profile photo**, So that **I can start my submission securely**.

### Acceptance Criteria (Confirmation)

- [ ] Verify email entry triggers Magic Link email.
- [ ] Verify clicking link logs user in.
- [ ] Verify Name and Bio inputs.
- [ ] Verify Profile Photo upload (circular crop preview).
- [ ] **Sad Path:** Token expired -> Request new link.

### Design/Technical Notes

- **Dependencies:** Supabase Auth (Magic Link) + Supabase Storage (Images).
- **UI Sketch Reference:** Clean Login Card -> Profile Modal.

---

### Story Card 4: Proposal Submission

**Title:** Submit Session Proposal

**The Narrative (Who/What/Why):**
As a **Speaker**, I want to **fill in my talk details and submit**, So that **the organizers can review it**.

### Acceptance Criteria (Confirmation)

- [ ] Verify Title and Abstract are required.
- [ ] Verify Selection of Track and Format from organizer-defined lists.
- [ ] Verify "Save Draft" works without validation.
- [ ] Verify "Submit" enforces all required fields and locks the proposal.
- [ ] **Sad Path:** Network error during submit -> Auto-retry or user alert.

### Design/Technical Notes

- **Dependencies:** Autosave to LocalStorage to prevent data loss.
- **UI Sketch Reference:** Two-column layout (Inputs left, Preview right/bottom).

---

### Story Card 5: Review & Scoring

**Title:** Blind Review Dashboard

**The Narrative (Who/What/Why):**
As an **Organizer**, I want to **rate anonymized proposals 1-5 stars**, So that **content is judged on merit, not fame**.

### Acceptance Criteria (Confirmation)

- [ ] Verify Speaker Name is hidden (Blind Mode).
- [ ] Verify 1-5 Star rating input.
- [ ] Verify optional internal comment field.
- [ ] Verify "Next Proposal" navigation for rapid review.

### Design/Technical Notes

- **Dependencies:** Database RLS policy to hide `speaker_id` from reviewer during this phase (optional secure implementation).
- **UI Sketch Reference:** Tinder-like or Card-based review interface (Focus on one at a time).

---

### Story Card 6: Selection

**Title:** Final Breakdown & Selection

**The Narrative (Who/What/Why):**
As an **Organizer**, I want to **filter top talks and mark them as Accepted**, So that **I can finalize the program**.

### Acceptance Criteria (Confirmation)

- [ ] Verify list can be sorted by Average Score.
- [ ] Verify filter by Track.
- [ ] Verify status toggle: Pending -> Accepted | Waitlist | Rejected.
- [ ] **Operational:** Total selected count vs available slots (Manual check for MVP).

### Design/Technical Notes

- **Dependencies:** Bulk update API endpoint highly recommended for performance.
- **UI Sketch Reference:** Data Table with Status Dropdowns.

## 4. Risk Assessment (The "Opps" Factor)

Identify any high-risk assumptions or technical unknowns discovered during exploration.

- **Risk 1: Email Deliverability**
  - **Context:** If magic links or invites go to Spam, users get blocked.
  - **Mitigation:** Use a reputable provider (Resend/Postmark) and verify domain records (DKIM/SPF) early.
- **Risk 2: Image Storage Costs/Abuse**
  - **Context:** Malicious users uploading huge files or non-images.
  - **Mitigation:** Strict RLS (Row Level Security) and file size limits in Supabase Storage buckets.
- **Risk 3: Conflict Detection**
  - **Context:** Manual scheduling might lead to a speaker being in two rooms at once.
  - **Mitigation:** For MVP, simple visual warning if "Andrea" is assigned to slot A and slot B.

--------------------------------------------------------------------------------

🔍 Quality Checklist for Step 3

- [x] Vertical Depth: Did we go "deep" enough to understand the complexity? (Yes, broke down into upload, auth, invite).
- [x] Sad Paths: Did we account for errors and what happens when things fail? (Network errors, bounds checks, declines).
- [x] User Focus: Are the stories written from the user's perspective, not the system's? (User uploads, User invites).
- [x] Conversation Trigger: Do the cards serve as a promise for a future conversation, rather than a full specification? (Yes, key criteria listed).
