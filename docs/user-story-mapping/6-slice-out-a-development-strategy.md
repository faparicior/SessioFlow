# Slice Out a Development Strategy

Objective: Break the Minimum Viable Solution (MVS) defined in Step 4 and validated in Step 5 into three tactical stages of development. The goal is to learn fast, mitigate risk early, and avoid a "big bang" integration at the end.

## 1. Risk Assessment

Before sequencing the work, we identify what could cause this release to fail. We prioritize building the risky parts first.

- **Technical Risks (Feasibility):**
  - **Self-Hosting Complexity:** The biggest technical hurdle is ensuring the "Deploy via Docker Compose" story works flawlessly for non-technical users on varying environments. (Rated `T` - Low Tech Comfort).
  - **$0 Infrastructure:** Uncertainty if the stack (Next.js + DB + Storage) runs reliably on free tiers indefinitely.

- **User/Value Risks (Usability):**
  - **Setup Friction:** If the initial setup requires CLI wizardry, the "Self-Hosted" MVS fails immediately.
  - **"Input-Only" Gap:** Users might reject a tool that only collects data without offering tools to manage it (The "Black Box" problem).

- **Business Risks:**
  - **Adoption:** Do organizers prefer this over Google Forms? (Value Assumption).

## 2. The Chess Strategy (Opening, Mid, End)

We apply the "Da Vinci" strategy: build a thin slice across the whole system first (Opening), then fill in the heavy logic (Mid), then polish (End).

### Phase 1: The Opening Game (The Walking Skeleton & Infra)

Focus on the highest technical risk: **The Deployment Pipeline**. We build the "Skeleton" of the application that proves data flows from the Speaker to the Organizer's Database.

- **Goal:** A user can "Self-Host" the app (clone & run), log in, and see data flowing end-to-end.
- **Key Stories (Vertical Slices):**
  - **Infrastructure Spike:** Deploy a "Hello World" Next.js + DB stack via Docker Compose to a minimal VPS/Free Tier. *Rationale: Validation of "Self-Host" constraint (Tech Comfort: T).*
  - **Story: The Skeleton Auth:** "Organizer Login" (Stub/Dev-Mode). Allow access without full Email Service integration yet.
  - **Story: The Skeleton Write:** "Submit Proposal" (Title Only). Speaker submits text -> API -> saved to DB.
  - **Story: The Skeleton Read:** "View Submission List" (Raw List). Organizer sees the submitted title.
- **Validation:** Can Fernando clone the repo, run `docker compose up`, and successfully see a submitted item in the list?

### Phase 2: The Mid Game (Fleshing it Out)

Fill in the details. Enable the actual "Product" value: reliable data collection and management.

- **Goal:** The application is fully functional for a real Event. Real data, real auth, real images.
- **Key Stories:**
  - **Features: Real Auth:** Implement Magic Link emails (Resend/SMTP). *Rationale: Tech Comfort TT/E.*
  - **Features: Full Event Definition:** Add dates, description, "Publish" status toggle.
  - **Features: Full Speaker Profile:** Implement Photo Upload & Storage handling (Local/S3). *Rationale: Tech Comfort TT.*
  - **Features: Full Proposal Form:** Add Abstract, Bio, Requirements fields.
  - **Features: Validation Logic:** Ensure required fields and data constraints are enforced.
- **Validation:** Can an organizer effectively manage a real simplified Call for Papers without hitting errors?

### Phase 3: The End Game (Polishing)

Refine the release. Make it "Product-Ready" for the public. Focus on the "Usability Risk" of the self-hosting documentation.

- **Goal:** The experience is professional, trustworthy, and easy to handover.
- **Key Stories:**
  - **UX: Success Page:** Provide clear feedback to speakers after submission.
  - **UX: Styling & Responsiveness:** Apply Shadcn UI polish and Mobile responsiveness.
  - **Docs: The "One-Click" Guide:** Write the definitive `README` and setup guide for non-tech users. *Rationale: Migitates Usability Risk.*
  - **Ops: Error Handling:** Friendly 404/500 pages and empty states for the Dashboard.
- **Validation:** Is this delightful enough to tweet about? Is the setup foolproof?

## 3. The Learning Plan (Experiments & Spikes)

Activities required to validate the risks listed in Section 1, derived from *Slice Out a Learning Strategy*.

| Assumption / Risk | Experiment / Spike | Success Metric |
| :--- | :--- | :--- |
| **Feasibility:** $0 Cost & Limit Caps | **Infra Spike (Opening Game):** Deploy dummy load script to target Free Tier. | Cost Audit shows **$0.00** after 48h. |
| **Usability:** Easy Self-Hosting | **Wizard of Oz:** Ask a non-dev to run the "Opening Game" Docker script. | User gets "It Works!" page in < 15 mins. |
| **Value:** Org prefers App > G-forms | **Smoke Test Landing Page:** "One-Click CfP" vs "Spreadsheet Pain" ads. | > 20% conversion on "Get Access". |
| **Business:** "Input-Only" Sufficiency | **Contextual Inquiry:** Show "Mid Game" dashboard prototype (List only). | Retention: User accepts "Export to CSV" as workaround. |

## 4. Team Capacity Check

Does the "Opening Game" fit into the first sprint?

- **Opening Game Size:** Small. It consists of 1 Spike (Infra), 1 Setup Task (Docker), and 3 "Tiny" Stories (Title-only CRUD).
- **Reality Check:** Yes. By stripping out Auth complexity, Validation, and File Uploads from the Opening Game, we ensure the team focuses 100% on the riskiest part: **Getting the Docker container to deploy and talk to the DB.** This serves as the foundation for everything else.
