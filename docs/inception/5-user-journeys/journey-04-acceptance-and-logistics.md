# 🗺️ Journey 4: Acceptance & Logistics

**Persona:** [Andrea (Speaker)](../3-personas/03-andrea-speaker.md) & [Fernando (Organizer)](../3-personas/01-fernando-organizer.md)  
**Main Goal:** Send automated acceptance communications, allow speakers to confirm attendance, and provide speaker travel/logistics guidelines.

> **Context note:** Triggers after program selection is complete. Asynchronous email delivery via Resend integrated with a dedicated Speaker Portal landing page.

---

## Overview Visualization

```
[Fernando (Organizer)]              [SessioFlow System]                   [Andrea (Speaker)]
          │                                  │                                    │
          │── [Trigger Acceptance Emails] ─> │ Stage 1: Automated Communication   │
          │                                  │  · Sends email via Resend ────────>│ [Receives "Accepted" Email]
          │                                  │                                    │
          │                                  │ Stage 2: Speaker Portal Access     │
          │                                  │  · Clicks link in email ──────────>│ [Opens Speaker Portal]
          │                                  │                                    │
          │                                  │ Stage 3: Attendance Confirmation   │
          │                                  │  · Confirms attendance ───────────>│ [Status -> Confirmed]
          │                                  │                                    │
          │                                  │ Stage 4: Logistics & Travel Info   │
          │                                  │  · Displays hotel/travel guide ───>│ [Views Travel Info]
```

---

## Lifecycle Overview

| Stage | Trigger | Persona's Action | System Response |
| :--- | :--- | :--- | :--- |
| **1. Notification** | Fernando triggers notifications | System dispatches emails | Delivers acceptance emails with unique confirmation links |
| **2. Portal Access** | Andrea opens email link | Clicks "Confirm Session & Travel Info" | Validates token and opens Speaker Portal |
| **3. Confirmation** | Andrea reviews talk schedule slot | Clicks "Confirm Attendance" button | Updates speaker status to `Confirmed` in Fernando's dashboard |
| **4. Logistics** | Andrea views dashboard | Reads hotel discount codes & venue info | Renders travel, accommodation, and AV setup instructions |

---

## Stage 1: Automated Speaker Communication

**Trigger:** Fernando clicks "Send Speaker Notifications" in the admin console.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Trigger Batch Notification | Automate Speaker Communications | Enqueues email jobs for accepted speakers |
| 2 | Resend API Dispatch | Email Integration | Delivers personalized acceptance email with secure portal token |

**Pain points addressed:**  
- **Fernando:** Reduces administrative communication overhead by 70%.

**Gap:** Customizable email templates editor deferred to Wave 2.

---

## Stage 2: Speaker Portal Access

**Trigger:** Andrea opens the acceptance email and clicks the personalized portal link.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Click Email Portal Token Link | Authentication & Navigation | Validates session token |
| 2 | Render Speaker Dashboard | Speaker Travel & Info Dashboard | Display talk schedule, status, and action buttons |

**Pain points addressed:**  
- ❌ **Andrea's Pain 3:** Hard to find conference information and travel guides.

**Gap:** None for MVP.

---

## Stage 3: Attendance Confirmation

**Trigger:** Andrea confirms she can present at the scheduled time.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Click "Confirm Attendance" | Confirm Speaker Attendance | Speaker status updated to `Confirmed` |
| 2 | Dashboard Sync | Admin Status Sync | Fernando sees Andrea's confirmed status live in admin grid |

**Pain points addressed:**  
- ❌ **Fernando's Pain 2:** Eliminates tracking confirmations in spreadsheets.

**Gap:** Automated reminder for unconfirmed speakers deferred to Wave 2.

---

## Stage 4: Travel & Logistics Guidelines

**Trigger:** Andrea views the logistics tab on her speaker dashboard.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | Navigate to "Travel & Venue Info" | Speaker Travel & Info Dashboard | Renders hotel promo codes, venue address & map |
| 2 | View Slide Specifications & AV Guide | Speaker Guidelines | Displays slide resolution (16:9), HDMI info, and speaker room details |

**Pain points addressed:**  
- ✅ **Andrea's Need 1:** Single point with all information about conference, discounts, and hotel recommendations.

**Gap:** Expense reimbursement upload form deferred to Wave 3.

---

## Critical Path

**Minimum Happy Path:**

| # | Step | Stage |
| :--- | :--- | :--- |
| 1 | Dispatch Acceptance Emails | Stage 1 |
| 2 | Speaker Accesses Portal via Link | Stage 2 |
| 3 | Speaker Confirms Attendance | Stage 3 |
| 4 | Speaker Reviews Travel & Venue Info | Stage 4 |

**Related journeys:**
- [Journey 2: Submitting a Talk](./journey-02-submitting-talk.md)
- [Journey 3: Selection & Program Creation](./journey-03-selection-and-program.md)

---

**Next Step:** In Step 7, we will sequence these features into the MVP Canvas to define the specific releases.
