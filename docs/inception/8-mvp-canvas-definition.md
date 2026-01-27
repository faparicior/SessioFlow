# Step 8: The MVP Canvas

## Goal
Synthesize all previous steps into a strategic blueprint for the first release (The "Cupcake"). This canvas aligns the team on exactly WHAT we are building, WHY, FOR WHOM, and HOW we will measure success.

---

## 1. MVP Proposal
*What is the "Cupcake" (the minimum valuable slice)?*

**Product Name:** SessioFlow MVP 1.0 - "The CfP Launcher"

**MVP Vision Statement:**
For **Event Organizers** (Fernando) who need to **start their event journey**, **SessioFlow** is a **Call for Papers (CfP) launch tool** that **enables the setup and collection of session proposals**. Unlike **generic form builders**, our product is **tailored for tech events, free to host, and creates a professional first impression.**

### Core Value Proposition
We are addressing the **Urgency of Starting**. The organizer's first hurdle is simply "Opening the CfP". By focusing on this, we allow them to start marketing their event immediately, buying us time to build the selection features while proposals are rolling in.

---

## 2. MVP Scope - Wave 1 Features (The "Setup & Collect" Phase)
*From Step 7 (Features & Sequencing) - the specific feature set.*

### Critical Path Features (The "Cupcake")
1. ✅ **Setup Event (C4P Configuration)**: Create event, set dates, and generate public link. (The Input).
2. ✅ **User Authentication**: Secure login for Organizers (to setup) and Speakers (to manage submissions).
3. ✅ **Speaker Profile**: Basic bio and photo upload.
4. ✅ **Collect Proposals (CfP)**: The public-facing form for submitting talks. (The Output).

### Explicitly Out of Scope (deferred to Wave 2)
*Crucial for preventing scope creep:*
- ❌ **Review & Score Sessions** (Deferred: Fernando doesn't need this until the CfP closes).
- ❌ **Co-Speaker Management** (Deferred: Speakers can add names in text for now).
- ❌ **Bulk Update Session Status** (Deferred).
- ❌ **Assign Schedule Slots** (Deferred).
- ❌ **Automate Speaker Communications** (Deferred).

---

## 3. Personas & Journey Alignment
*From Steps 3 & 6 - Who are we serving?*

**Primary Persona:** **Fernando**, the Community Organizer.
*   **Pain Solved:** "I need to launch my Call for Papers NOW but setting up a form is annoying."
*   **Gain:** A professional CfP link generated in minutes.

**Secondary Persona:** **Andrea**, the Experienced Speaker.
*   **Pain Solved:** "I need a single place to submit my talk."
*   **Gain:** A clean, mobile-accessible submission interface.

**Core Journey Supported:**
*   **Step 1:** Fernando Logs in -> Create Event -> Publishes Link (Journey 1).
*   **Step 2:** Andrea creates account -> Fills Profile -> Submits Proposal (Journey 2).

---

## 4. Hypothesis & Success Metrics
*How do we know if this works?*

**Hypothesis:**
We believe that by **enabling instant CfP creation**, we will **acquire users early in their event lifecycle**.

### Validation Metrics (KPIs)
*   **Activation:** 5 Events created within the first month.
*   **Volume:** > 50 Proposals collected across all events.
*   **Conversion:** 80% of speakers who start the form complete the submission.

### Failure Condition
*   If organizers find the "Create Event" flow too complex and revert to Google Forms, we have failed to lower the barrier to entry.

---

## 5. Cost, Schedule, and Risks
*From Step 2 (Tradeoffs) and Step 7.*

### Cost & Schedule
*   **Infrastructure:** **$0/month** (Constraint #1).
*   **Development Effort:** Estimated 3 Sprints (6 Weeks) for 2 Developers.
    *   Sprint 1: Auth & "Create Event" Setup.
    *   Sprint 2: Speaker Profile & CfP Form.
    *   Sprint 3: Dashboard Basic View (List of submissions).

### Risks & Mitigation
*   **Risk:** Users might expect a full admin panel immediately.
    *   *Mitigation:* Manage expectations with a "Coming Soon" badge on the Review/Scoring tabs.
*   **Risk:** Speakers entering wrong data.
    *   *Mitigation:* Strong validation on the CfP form input fields.

---

## 6. Technical & UX Enablers
*Foundations needed to support the MVP.*

### Technical Enablers
- [ ] Setup defined tech stack (Next.js + Tailwind + Database).
- [ ] Database Schema for `Events`, `Proposals`, and `Profiles`.
- [ ] Authentication system (Magic Link).
- [ ] **Image Storage** (Supabase Storage) for profile photos.

### UX Enablers
- [ ] "Setup Wizard" design for creating an event (Step-by-step).
- [ ] "Public Landing Page" template for the CfP link.

---

## 7. Final Validation Checklist

- [x] **Vision Alignment:** Focuses on the "Launcher" strategy (Wave 1).
- [x] **Constraints Respected:** Designs for $0 infrastructure cost.
- [x] **User-Centered:** Solves Fernando's immediate need to "Go Live".
- [x] **Properly Scoped:** It is a strictly "Input-focused" release. No processing/output features yet.
- [x] **Risky:** We acknowledge the risk of "missing features" (Scoring) by betting on the time-delay of the CfP process.

**Ready for Implementation!** 🚀
