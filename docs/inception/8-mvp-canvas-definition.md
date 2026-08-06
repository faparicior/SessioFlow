# Step 8: MVP Canvas Definition

## Goal
Synthesize all decisions from Steps 1-7 into a final, high-level business plan for the MVP. This canvas reflects your product vision, constraints, user needs, key features, and sequencing decisions.

---

## 1. MVP Definition

**MVP Proposal:**
For **Conference Organizers** (Fernando) who need to **start their conference journey**, **SessioFlow** is a **Call for Papers (CfP) launch tool** that **enables the setup and collection of session proposals**. Unlike **generic form builders**, our product is **tailored for tech conferences, free to host, and creates a professional first impression.**

*Product Name:* SessioFlow MVP 1.0 - "The CfP Launcher"

### Core Value Proposition
We are addressing the **Urgency of Starting**. The organizer's first hurdle is simply "Opening the CfP". By focusing on this, we allow them to start marketing their conference immediately, buying us time to build the selection features while proposals are rolling in.

---

## 2. Business Results & Metrics

### Business Goals
1. Reduce session organization time by 50% compared to manual tools.
2. Enable 80% of target users to run on free-tier infrastructure ($0/month).
3. Acquire users early in their conference lifecycle via instant CfP creation.

### Success Metrics (KPIs)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Activation | 5 Conferences created | First month tracking |
| Volume | > 50 Proposals collected | Total submissions across conferences |
| Conversion | 80% completion rate | Speakers who start and submit form |

### Validation Criteria
- **Success:** At least 5 conferences launched and > 50 proposals collected on $0 infrastructure.
- **Failure:** Organizers find the "Create Conference" flow too complex and revert to Google Forms.

---

## 3. MVP Scope - Wave 1 Features

### Critical Path Features
1. ✅ **Setup Conference (C4P Configuration)** - Create conference, set dates, and generate public link (The Input).
2. ✅ **User Authentication** - Secure login for Organizers (to setup) and Speakers (to manage submissions).
3. ✅ **Speaker Profile** - Basic bio and photo upload.
4. ✅ **Collect Proposals (CfP)** - The public-facing form for submitting talks (The Output).

### Explicitly Out of Scope (Wave 2+)
- ❌ **Review & Score Sessions** - *Reason: Deferred; Fernando doesn't need this until CfP closes.*
- ❌ **Co-Speaker Management** - *Reason: Deferred; speakers can list co-speakers in text for MVP.*
- ❌ **Bulk Update Session Status** - *Reason: Deferred to Wave 2.*
- ❌ **Assign Schedule Slots** - *Reason: Deferred to Wave 3.*
- ❌ **Automate Speaker Communications** - *Reason: Deferred to Wave 2.*

---

## 4. Cost, Schedule, and Risks

### Cost Estimate
- **Infrastructure/Hosting:** **$0/month** (Constraint #1 - free tier hosting).
- **Development Effort:** 3 Sprints (6 Weeks) for 2 Developers (36 person-days).

### Schedule
- **Duration:** 3 Sprints (6 Weeks)
- **Key Milestones:**
  - Sprint 1: Auth & "Create Conference" Setup.
  - Sprint 2: Speaker Profile & CfP Form.
  - Sprint 3: Dashboard Basic View (Submission list).

### Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| Users expect full admin panel immediately | High | Medium | Manage expectations with "Coming Soon" badge on Review/Scoring tabs |
| Speakers entering invalid/malformed data | Medium | Medium | Implement strong Zod input validation on CfP form fields |

---

## 5. Technical & UX Enablers

### Technical Enablers
- [x] Setup tech stack (Next.js + Tailwind + PostgreSQL).
- [x] Database Schema for `Conferences`, `Proposals`, and `Profiles`.
- [x] Authentication system (Magic Link).
- [x] Image Storage (Supabase Storage) for profile photos.

### UX Enablers
- [x] "Setup Wizard" design for creating a conference.
- [x] "Public Landing Page" template for the CfP link.

---

## 6. Personas & Journey Alignment

**Primary Persona:** Fernando, the Conference Organizer.
- **Pain Points Addressed:** "I need to launch my Call for Papers NOW but setting up a form is annoying."
- **Gains Delivered:** A professional CfP link generated in minutes.

**Secondary Persona:** Andrea, the Experienced Speaker.
- **Pain Points Addressed:** "I need a single place to submit my talk."
- **Gains Delivered:** A clean, mobile-accessible submission interface.

**Core Journey Supported:**
- **Step 1:** Fernando logs in -> Create Conference -> Publishes Link (Journey 1).
- **Step 2:** Andrea creates account -> Fills Profile -> Submits Proposal (Journey 2).

---

## 7. Final Validation Checklist

- [x] **Vision Alignment:** Focuses on the "Launcher" strategy (Wave 1).
- [x] **Constraints Respected:** Designs for $0 infrastructure cost.
- [x] **User-Centered:** Solves Fernando's immediate need to "Go Live".
- [x] **Journey Complete:** Can users complete the critical path with Wave 1 features?
- [x] **Properly Scoped:** It is a strictly "Input-focused" release.
- [x] **Measurable:** Clear KPIs and failure criteria defined.
- [x] **Achievable:** 6-week timeline with 2 developers.
- [x] **Risky:** Risks identified and mitigated with UI feedback.

**Ready for Implementation!** 🚀
