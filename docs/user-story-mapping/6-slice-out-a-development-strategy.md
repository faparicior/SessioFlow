# Slice Out a Development Strategy

Objective: Break the Minimum Viable Solution (MVS) defined in Step 4 into three tactical stages of development. The goal is to learn fast, mitigate risk early, and avoid a "big bang" integration at the end.

## 1. Risk Assessment

Before sequencing the work, identify what could cause this release to fail. We prioritize building the risky parts first.

- **Technical Risks:** **Self-Hosting (Docker/Env)** is the biggest unknown. If users can't run the `docker-compose` script on their machine, the software is useless.
- **User/Value Risks:** We assume organizers can figure out the "Event Slug" concept without a complex wizard. If they mess up the URL, the shareable link breaks.
- **Business Risks:** **Image Storage**. We are betting on Supabase's free tier. If we implement this wrong (e.g., no size limits), we could hit quotas immediately.

## 2. The Chess Strategy (Opening, Mid, End)

Slice the MVS vertically into three phases. Do not build feature-by-feature; build across the system.

### Phase 1: The Opening Game (The Walking Skeleton)

Focus on essential features that cross the entire system. Build just enough to see the product working end-to-end. Skip business rules, auth, and fancy UI.

- **Goal:** **"The Hello World Deployment"**. Proof that data flows from a local container to the database and renders on a public URL.
- **Key Stories:**
  - **Deploy via Docker Compose:** Create the `docker-compose.yml` and ensure it spins up Next.js + Postgres.
  - **Seed Event:** Manually insert one event into the DB.
  - **Public Page Render:** Create the `/[slug]` page that fetches and displays the event title.
  - **Simple Submission:** A raw HTML form that posts a "Talk Title" to the database (No auth, no validation).
- **Validation:** Can I clone the repo, run one command, and see a page that saves data?

### Phase 2: The Mid Game (Fleshing it Out)

Fill in the details. Add the actual business rules, authentication, and secondary flows.

- **Goal:** **"Secure and Correct"**. Replace hardcoded/raw inputs with real users and validated data.
- **Key Stories:**
  - **Organizer & Speaker Auth:** Implement Magic Link login.
  - **Event Creation UI:** Allow Organizers to create the event (replacing the manual DB seed).
  - **Proposal Form & Validation:** Switch raw HTML form to React Hook Form + Zod.
  - **Profile Photo Upload:** Implement Supabase Storage connection.
- **Validation:** Can a real user log in and submit a proposal with a photo?

### Phase 3: The End Game (Polishing)

Refine the release. Make it sexy, efficient, and launch-ready. This is where you apply feedback gathered from the Opening and Mid games.

- **Goal:** **"Trustworthy UI & Measurable"**. Ensure the user feels safe, professional, and we can track success.
- **Key Stories:**
  - **Success States:** Replace alerts with proper "Thank You" pages.
  - **Error Handling:** Friendly error messages for duplicate slugs or failed uploads.
  - **Dashboard List View:** A clean table to view specific submissions.
  - **Turning on the Lights (Analytics):** Basic event tracking (Form Start vs Submit) to measure the 80% conversion goal.
  - **Manage Expectations:** Add disabled "Review/Scoring" tabs with "Coming Soon" badges.
  - **Tailwind Polish:** typography, spacing, and mobile responsiveness adjustments.
- **Validation:** Is this delightful enough for Fernando to share with his network?

## 3. The Learning Plan (Experiments & Spikes)

Identify specific activities required to validate the risks listed in Section 1. These are not necessarily code; they can be prototypes or research.

| Assumption / Risk | Experiment / Spike | Success Metric |
| :--- | :--- | :--- |
| **Docker Complexity**<br>(Users might fail to start the app) | **Spike:** Run the deploy script on a clean, low-powered VM (simulate a user's cheap VPS). | Script succeeds in < 3 minutes with zero manual dependency installation. |
| **Image Storage Abuse**<br>(Malicious large uploads) | **Spike:** Test Supabase Storage RLS policies. | Uploading a >2MB file returns a 400 error immediately. |
| **"Slug" Confusion**<br>(User Risk defined in Sec 1) | **Experiment:** Paper Prototype / Hallway Test. Ask 3 people to "create a URL for their event". | 3/3 users understand they need to type a URL-safe string (e.g., 'my-event') not a full sentence. |

## 4. Team Capacity Check

Does the "Opening Game" fit into the first few sprints?

- **Estimated Velocity:** 20 points per sprint (2 Developers).
- **Opening Game Size:** ~13 Points (Docker Setup: 5, DB Connect: 3, Skeleton Page: 5).
- **Reality Check:** Yes, this fits comfortably in Sprint 1. We are "cheating" by skipping Auth and Validation in the Opening Game to ensure the *infrastructure* works first.

--------------------------------------------------------------------------------

🔍 Quality Checklist for Step 6

- [ ] **Walking Skeleton:** Does the "Opening Game" slice cut through the entire architecture (UI, Logic, Database) rather than just building one layer?
- [ ] **Risk First:** Did we schedule the highest-risk stories in the Opening Game?
- [ ] **Learning Loops:** Have we planned moments to pause and evaluate the product with stakeholders after the Opening and Mid games, rather than waiting for the final release?
