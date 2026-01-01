# Step 8: The MVP Canvas

## Goal
Synthesize all previous steps into a strategic blueprint for the first release (The "Cupcake"). This canvas aligns the team on exactly WHAT we are building, WHY, FOR WHOM, and HOW we will measure success.

---

## 1. MVP Proposal
*What is the "Cupcake" (the minimum valuable slice)?*

**Product Name:** SessioFlow MVP 1.0 - "The CfP Manager"

**MVP Vision Statement:**
For **Event Organizers** (Fernando) who need to **manage the Call for Papers efficiently**, **SessioFlow** is a **session management tool** that **streamlines the submission, review, and selection process**. Unlike **manual spreadsheets or Google Forms**, our product is **specialized for tech events, includes co-speaker support by default, and is free to host.**

### Core Value Proposition
We are not building the "Full Event Management System" yet. We are solving the most painful initial phase: **Getting high-quality talks and reviewing them without chaos.**

---

## 2. MVP Scope - Wave 1 Features
*From Step 7 (Features & Sequencing) - the specific feature set.*

### Critical Path Features (The "Cupcake")
1. ✅ **Collect Proposals (CfP)**: Public form for speakers (Andrea) to submit talks.
2. ✅ **Co-Speaker Management**: The "Wow" feature allowing easy multi-speaker proposals.
3. ✅ **Review & Score Sessions**: Dashboard for Fernando to rate and filter submissions.

### Explicitly Out of Scope (Wave 2+)
*Crucial for preventing scope creep:*
- ❌ **Assign Schedule Slots** (Scheduling happens *after* selection - can be done manually for MVP if needed).
- ❌ **Automate Speaker Communications** (Fernando can email accepted speakers manually for the first pilot).
- ❌ **Speaker Travel Dashboard** (Complex logistics, not core).
- ❌ **Public API** (Not needed for the first event).

---

## 3. Personas & Journey Alignment
*From Steps 3 & 6 - Who are we serving?*

**Primary Persona:** **Fernando**, the Community Organizer.
*   **Pain Solved:** "Too repetitive work to organize the call for papers" & "Data inconsistencies".
*   **Gain:** A centralized, clean list of scored proposals ready for selection.

**Secondary Persona:** **Andrea**, the Experienced Speaker.
*   **Pain Solved:** "Adding a partner to the proposal is not easy."
*   **Gain:** A smooth submission flow that respects her need for collaboration.

**Core Journey Supported:**
*   **Step 1:** Andrea lands on CfP -> Submits Talk + Invites Co-Speaker.
*   **Step 2:** Fernando sees new proposal -> Reviews content -> Assigns Score.
*   **Step 3:** Fernando filters top-rated talks -> Final Selection (Manual notification).

---

## 4. Hypothesis & Success Metrics
*How do we know if this works?*

**Hypothesis:**
We believe that by **providing a specialized CfP tool with built-in co-speaker management**, we will **reduce the organizer's administrative time by 50%** and **reduce friction for speakers**, resulting in **higher completion rates for multi-speaker proposals**.

### Validation Metrics (KPIs)
*   **Adoption:** 5 Event Organizers installing/using the MVP in the first month.
*   **Efficiency:** Fernando spends < 3 minutes on average to review and score a session.
*   **Engagement:** > 20% of submitted sessions utilize the Co-Speaker feature (proving the "Wow" factor).
*   **Satisfaction:** Net Promoter Score (NPS) > 40 from Organizers after the selection phase.

### Failure Condition
*   If organizers revert to exporting data to Excel to generate the final list, the **Review & Score** feature has failed in usability.

---

## 5. Cost, Schedule, and Risks
*From Step 2 (Tradeoffs) and Step 7.*

### Cost & Schedule
*   **Infrastructure:** **$0/month** (Constraint #1). Must run on Vercel/Netlify + Supabase/Firebase Free Tier.
*   **Development Effort:** Estimated 3 Sprints (6 Weeks) for 2 Developers.
    *   Sprint 1: CfP Form & Co-Speaker Logic.
    *   Sprint 2: Organizer Dashboard & Auth.
    *   Sprint 3: Scoring Logic & Polish.

### Risks & Mitigation
*   **Risk:** Low adoption because "Google Forms is easier".
    *   *Mitigation:* Focus heavily on the **Co-Speaker Experience** (which Forms handles poorly) as the key differentiator.
*   **Risk:** GDPR/Privacy compliance for collecting emails.
    *   *Mitigation:* Implement "Delete my Data" button in Sprint 2 (Regulatory necessity).
*   **Risk:** Organizers need to schedule immediately.
    *   *Mitigation:* Provide a simple "Export to CSV" button so they can schedule in Excel if they can't wait for Wave 2.

---

## 6. Technical & UX Enablers
*Foundations needed to support the MVP.*

### Technical Enablers
- [ ] Setup defined tech stack (Next.js + Tailwind + Database).
- [ ] Database (e.g., Supabase/Postgres) Schema for `Proposals`, `Speakers`, and `Reviews`.
- [ ] Authentication system (Magic Link or Social Auth) for Organizers.

### UX Enablers
- [ ] "Clean & Focused" Design System (High readability for reading abstract text).
- [ ] Mobile-responsive form for Speakers (Andrea often submits on the go).

---

## 7. Final Validation Checklist

- [x] **Vision Alignment:** Focuses strictly on the "Session Management" core.
- [x] **Constraints Respected:** Designs for $0 infrastructure cost.
- [x] **User-Centered:** Solves Fernando's "Manual Data" pain and Andrea's "Co-speaker" pain.
- [x] **Properly Scoped:** It is a "Cupcake" - a complete "Collect & Select" workflow. It is not just a DB (Dry) or just a Form (Unfinished).
- [x] **Risky:** We acknowledge the "Google Forms" competitor risk and tackle it with the Co-Speaker feature.

**Ready for Implementation!** 🚀
