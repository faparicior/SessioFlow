# 🗺️ Journey 2: Submitting a Talk

**Persona:** [Andrea (Experienced Speaker)](../3-personas/03-andrea-speaker.md)  
**Main Goal:** Submit a session proposal with a co-speaker and receive an automated email confirmation.

> **Context note:** Public speaker flow using passwordless Magic Link authentication for friction-free onboarding. Profile photo storage uses Supabase Storage.

---

## Overview Visualization

```
[Andrea (Speaker)]                   [SessioFlow System]                  [Co-Speaker & Email Service]
        │                                     │                                         │
        │── [Accesses Public CFP URL] ──────> │ Stage 1: CFP Landing & Discovery        │
        │                                     │  · Displays event info & guidelines     │
        │                                     │                                         │
        │── [Magic Link Auth Request] ──────> │ Stage 2: Authentication & Profile       │
        │                                     │  · Authenticates & uploads photo        │
        │                                     │                                         │
        │── [Fills Session Form] ───────────> │ Stage 3: Proposal Submission            │
        │                                     │  · Saves Title, Abstract, Track         │
        │                                     │                                         │
        │── [Invites Co-Speaker] ───────────> │ Stage 4: Collaboration                  │
        │                                     │  · Generates unique invite link ───────>│ [Co-Speaker receives invite]
        │                                     │                                         │
        │── [Finalize Submission] ──────────> │ Stage 5: Confirmation                   │
        │                                     │  · Triggers confirmation email ────────>│ [Receives "Submitted" Email]
```

---

## Lifecycle Overview

| Stage | Trigger | Persona's Action | System Response |
| :--- | :--- | :--- | :--- |
| **1. Landing** | Andrea opens CFP public link | Views conference info & requirements | Renders public landing page |
| **2. Authentication** | Andrea enters email | Clicks magic link in email | Authenticates session & loads speaker profile |
| **3. Proposal** | Andrea fills proposal form | Enters talk title, abstract & bio | Validates input & saves draft proposal |
| **4. Collaboration** | Andrea adds co-speaker | Enters co-speaker email / invite link | Generates invite token & links co-speaker |
| **5. Confirmation** | Andrea clicks "Submit" | Finalizes proposal submission | Persists status as `Submitted` & sends notification email |

---

## Stage 1: CFP Landing & Discovery

**Trigger:** Andrea opens the CFP link shared on social media or community channels.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Visit CFP URL | Collect Proposals (CfP) | Render conference overview, topics, and deadline |
| 2 | Click "Submit a Talk" | Initiate Submission Flow | Prompt for speaker authentication |

**Pain points addressed:**  
- ❌ **Pain 3:** Hard to find clear conference information.
- ✅ **Need 1:** Single point with all information about the conference.

**Gap:** None for MVP.

---

## Stage 2: Authentication & Profile Setup

**Trigger:** Andrea provides her email address to start submitting.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Enter Email for Magic Link | User Authentication | Magic Link email sent |
| 2 | Click Magic Link & Upload Headshot | Speaker Profile & Storage | Authenticated user profile with photo URL |

**Pain points addressed:**  
- ❌ **Pain 1:** Difficult to find a smooth and easy way to create a proposal.

**Gap:** Social provider login (OAuth) deferred to Wave 2.

---

## Stage 3: Proposal Submission

**Trigger:** Andrea fills out the talk details form.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Enter Title, Abstract, Level & Format | Collect Proposals (CfP) | Validated proposal payload |
| 2 | Save Draft / Proceed | Proposal Persistence | Draft proposal stored in database |

**Pain points addressed:**  
- ✅ **Need 3:** Simple, intuitive interface that doesn't require training.

**Gap:** Rich text formatting in abstract deferred to Wave 2.

---

## Stage 4: Co-Speaker Management

**Trigger:** Andrea opts to add a co-presenter to the proposal.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Enter Co-Speaker Email | Co-Speaker Management | Invite link generated |
| 2 | Send Co-Speaker Invite | Collaboration Link | Co-speaker attached to proposal upon confirmation |

**Pain points addressed:**  
- ❌ **Pain 2:** Adding a partner to the proposal is not easy.
- ✅ **Need 2:** Easy way to add a colleague to the proposal.

**Gap:** Multiple co-speakers (>1) deferred to Wave 3.

---

## Stage 5: Confirmation & Notifications

**Trigger:** Andrea submits the completed proposal.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Click "Submit Proposal" | Complete Submission | Proposal status updated to `Submitted` |
| 2 | System dispatches email | Automate Speaker Communications | Email notification delivered via Resend |

**Pain points addressed:**  
- ✅ **Need 2:** Clear view of schedule and steps in the process.

**Gap:** In-app notification center deferred to Wave 3.

---

## Critical Path

**Minimum Happy Path:**

| # | Step | Stage |
| :--- | :--- | :--- |
| 1 | Open CFP Link & Log in via Magic Link | Stage 1 & 2 |
| 2 | Fill Proposal Form & Upload Photo | Stage 3 |
| 3 | Submit Proposal & Receive Confirmation Email | Stage 5 |

**Related journeys:**
- [Journey 1: Setup the Conference](./journey-01-setup-conference.md)
- [Journey 3: Selection & Program Creation](./journey-03-selection-and-program.md)
- [Journey 4: Acceptance & Logistics](./journey-04-acceptance-and-logistics.md)

---

**Next Step:** In Step 7, we will sequence these features into the MVP Canvas to define the specific releases.
