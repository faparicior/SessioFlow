# 🗺️ Journey 1: Setup the Conference

**Persona:** [Fernando (Volunteer Organizer)](../3-personas/01-fernando-organizer.md)  
**Main Goal:** Configure the conference details and open the Call for Papers (C4P Session) for public submission.

> **Context note:** Initial setup is synchronous and admin-authenticated. Opening the C4P updates the conference status to `C4P Open` and activates the public landing page.

---

## Overview Visualization

```
[Fernando (Organizer)]              [SessioFlow System]                   [Public / Speakers]
          │                                  │                                     │
          │── [Login Request] ─────────────> │ Stage 1: Authentication & Dashboard │
          │                                  │  · Authenticates Admin User         │
          │                                  │                                     │
          │── [Create Conference Form] ────> │ Stage 2: Conference Configuration   │
          │                                  │  · Saves Name, Dates, CFP Config    │
          │                                  │                                     │
          │── [Publish / Open CFP] ────────> │ Stage 3: Activation                 │
          │                                  │  · Status -> C4P Open               │
          │                                  │  · Generates Public Link ──────────>│ [Public CFP Page Active]
```

---

## Lifecycle Overview

| Stage | Trigger | Persona's Action | System Response |
| :--- | :--- | :--- | :--- |
| **1. Authentication** | Fernando opens admin panel | Logs in with admin credentials | Authenticates & displays Admin Dashboard |
| **2. Configuration** | Fernando clicks "Create Conference" | Fills in title, dates, and CFP parameters | Validates input & saves conference draft |
| **3. Activation** | Fernando reviews & clicks "Publish" | Triggers "Open Call for Papers" action | Updates status to `C4P Open` & exposes public submission URL |

---

## Stage 1: Authentication & Dashboard

**Trigger:** Fernando accesses the SessioFlow platform to set up a new conference event.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Admin Login Request | User Authentication | Validated Admin Session |
| 2 | Redirect to Admin Console | View Admin Dashboard | Display active and upcoming conferences list |

**Pain points addressed:**  
- ✅ **Need 1:** Single platform that integrates all data sources.

**Gap:** None for MVP.

---

## Stage 2: Conference Configuration

**Trigger:** Fernando initiates creation of a new conference event.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Fill Conference Details (Name, Location, Dates) | Collect Proposals (CfP) | Draft Conference Entity created |
| 2 | Set CFP Start & End Dates, Guidelines | Configure CFP Window | CFP Parameters persisted |

**Pain points addressed:**  
- ❌ **Pain 1:** Too repetitive work to organize the call for papers.
- ✅ **Need 3:** Simple, intuitive interface that doesn't require training.

**Gap:** Automated multi-track CFP configuration deferred to Wave 2.

---

## Stage 3: Activation & Public Link Generation

**Trigger:** Fernando clicks "Publish Conference & Open CFP".

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Click "Open CFP" | Update Conference Status | Conference status transitions from `Draft` to `C4P Open` |
| 2 | System generates unique public URL | Expose Public CFP Endpoint | Public link copyable & active for speaker submissions |

**Pain points addressed:**  
- ❌ **Pain 2:** Lot of manual work to manage the conference with different sources of data.

**Gap:** Custom domain alias support deferred to Wave 3.

---

## Critical Path

**Minimum Happy Path:**

| # | Step | Stage |
| :--- | :--- | :--- |
| 1 | Log in to Admin Console | Stage 1 |
| 2 | Create Conference with Name & Dates | Stage 2 |
| 3 | Publish & Copy Public CFP Link | Stage 3 |

**Related journeys:**
- [Journey 2: Submitting a Talk](./journey-02-submitting-talk.md)
- [Journey 3: Selection & Program Creation](./journey-03-selection-and-program.md)

---

**Next Step:** In Step 7, we will sequence these features into the MVP Canvas to define the specific releases.
