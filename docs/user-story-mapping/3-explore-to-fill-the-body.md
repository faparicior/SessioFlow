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

### Story Card 1: Co-Speaker Invitation

**Title:** Invite Co-Speaker to Session
**The Narrative:**
As a **Speaker (Andrea)**, I want to **invite a colleague to my proposal via email**, So that **we can present together properly attributed**.

### Acceptance Criteria (Confirmation)

- [ ] Verify that the primary speaker can enter an email address.
- [ ] Verify that a unique, secure link is generated and sent to that email.
- [ ] Verify that the co-speaker accepts, their profile is linked to the session.
- [ ] **Sad Path:** If the co-speaker rejects, the primary speaker is notified.
- [ ] **Constraint:** Maximum 1 co-speaker per talk for MVP.

### Design/Technical Notes

- **Dependencies:** Requires Email Service (Resend/SendGrid).
- **Risk:** What if the co-speaker creates a new duplicate session instead of accepting? (UX text must be clear).

---

### Story Card 2: Upload Profile Photo

**Title:** Speaker Profile Photo Upload
**The Narrative:**
As a **Speaker**, I want to **upload my photo**, So that **attendees can recognize me on the schedule page**.

### Acceptance Criteria (Confirmation)

- [ ] Verify user can select image file (jpg, png).
- [ ] Verify file size limit (e.g., 2MB) is enforced.
- [ ] Verify image is displayed in circular preview after upload.
- [ ] **Sad Path:** Show clear error if file is not an image or too large.

### Design/Technical Notes

- **Tech:** Use Supabase Storage (S3).
- **Optimization:** Client-side resize preferable to save bandwidth.

---

### Story Card 3: Organizer Scoring

**Title:** Rate and Review Sessions
**The Narrative:**
As an **Organizer (Fernando)**, I want to **rate sessions on a 1-5 scale**, So that **I can sort them by quality for selection**.

### Acceptance Criteria

- [ ] Verify organizer can see abstract and title without speaker name (Blind Review).
- [ ] Verify 1-5 star input is persisted instantly.
- [ ] Verify list can be sorted by average score.

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
