# Journey 01: Setup Conference (C4P Configuration)

## 🛡️ ADR Compliance Checklist
After generating the flow document, review the project's Architecture Decision Records (ADRs) to ensure alignment with established architectural decisions.

- [x] Entity mutations use domain methods rather than direct property setters
- [x] State transitions match entity lifecycle state machine
- [x] Domain events are published on state changes
- [x] Repository pattern is used for data access
- [x] Input validation uses schema validation

## 📋 Overview
* **As a:** Conference Organizer (Fernando)
* **I want to:** Create a new conference and configure its Call for Papers (CfP) settings
* **So that:** I can share a submission link with potential speakers and start collecting proposals
* **Source:** Inception Step 6 - User Journey Mapping (Journey 1)
* **Related Feature:** Setup Conference (C4P Configuration) from Wave 1 (MVP)
* **Impacted Entities:** 
  * [Conference Entity](../entities/conference.md) (e.g., `Conference` created with `DRAFT` -> `CFP_OPEN` status)
  * [CfpConfig Entity](../entities/cfp-config.md) (e.g., `CfpConfig` created with submission dates and settings)
* **Bounded Context:** Conference

---

## 🗺️ Visual Flow & Sequence
*Maps the sequence of user actions, domain behavior, and system reactions for Journey 1. Follows DDD patterns per ADR-009. Includes error paths and alternative flows.*

```mermaid
sequenceDiagram
    autonumber
    actor Organizer
    participant UI as Frontend
    participant API as Application Service
    participant Domain as Conference Aggregate
    participant DB as Repository
    participant Email as Email Service

    Note over Organizer, Email: Journey 01: Setup Conference Flow

    Organizer->>UI: Click "Create New Conference"
    UI->>API: GET /auth/me
    API-->>UI: Return organizerId

    Organizer->>UI: Fill conference form<br/>(name, dates, description)
    UI->>UI: Client-side Zod validation
    
    rect rgb(232, 245, 233)
        note right of UI: Happy Path - All Valid
        Organizer->>UI: Click "Create Conference"
        UI->>API: POST /api/v1/conferences
        API->>API: Validate payload with Zod
        API->>DB: Check slug uniqueness
        DB-->>API: Slug available
        
        API->>Domain: Conference.create(id, data)
        Note over Domain: Conference state: DRAFT
        API->>Domain: Conference.publishCfp()
        Note over Domain: Conference state: CFP_OPEN<br/>CfpConfig created: ACTIVE
        
        Domain->>Domain: Publish ConferenceCreated<br/>CfpOpened events
        API->>DB: Save Conference aggregate
        DB-->>API: Persisted
        
        API->>Email: Send welcome email (async)
        API-->>UI: 201 Created + CfP URL
        UI-->>Organizer: Redirect to Dashboard<br/>with CfP link
    end

    rect rgb(255, 235, 238)
        note right of UI: Error Path - Validation Failed
        Organizer->>UI: Submit invalid data
        UI->>API: POST /api/v1/events
        API->>API: Validate payload
        API-->>UI: 400 Bad Request + errors
        UI-->>Organizer: Show inline errors
    end

    rect rgb(255, 235, 238)
        note right of API: Error Path - Duplicate Slug
        API->>DB: Check slug uniqueness
        DB-->>API: Slug exists
        API-->>UI: 409 Conflict
        UI-->>Organizer: Suggest alternative slug
    end

    rect rgb(255, 235, 238)
        note right of Domain: Error Path - Business Rule Violation
        API->>Domain: Conference.create()
        Domain->>Domain: Check free tier limit
        Domain-->>API: FreeTierLimitExceeded
        API-->>UI: 403 Forbidden + upgrade prompt
    end

    Note over Organizer, Email: Domain Conferences Published
    Note right of Domain: ConferenceCreated → Analytics<br/>CfpOpened → Welcome Email
```

---

## 🏃‍♂️ Step-by-Step Walkthrough (Happy Path)

| Step | User Action | System Reaction | Domain/Entity Impact |
| :--- | :--- | :--- | :--- |
| **1** | Clicks "Create New Conference" button in dashboard | Loads conference creation form with validation schema | None (UI Level) |
| **2** | — | GET /auth/me - Verify authentication | None (Security) |
| **3** | — | Returns user session with organizerId | None (Security) |
| **4** | Enters conference name, description, and logo URL | Client-side validates using Zod schema in real-time | None (UI Level) |
| **5** | Selects CfP start and end dates via date picker | Validates end date is after start date, prevents past dates | None (UI Level) |
| **6** | Clicks "Create Conference" submit button | Shows loading state, sends POST request with payload | None (UI Level) |
| **7** | — | **Application Service:** Validates all fields against Zod schema | None (Validation) |
| **8** | — | **Repository:** Check slug uniqueness (findBySlug) | None (Validation) |
| **9** | — | **Domain Layer:** `ConferenceId.generate()` creates UUIDv4 | New ConferenceId |
| **10** | — | **Domain Layer:** `Conference.create(id, validatedData)` creates Conference in `DRAFT` state | `Conference` → `DRAFT` |
| **11** | — | **Domain Layer:** `Conference.publishCfp()` transitions Conference to `CFP_OPEN` | `Conference` → `CFP_OPEN` |
| **12** | — | **Domain Layer:** `CfpConfig` child entity created with validated dates | `CfpConfig` → `ACTIVE` |
| **13** | — | **Domain Layer:** Publishes `ConferenceCreated` and `CfpOpened` domain events | Domain Conferences Published |
| **14** | — | **Repository:** `ConferenceRepository.save()` persists Conference and CfpConfig | Database Persisted |
| **15** | — | **Application Service:** Triggers welcome email (async) via Resend | External Service |
| **16** | — | Returns 201 Created with Conference and CfP URL | Response Sent |
| **17** | Views success notification | Redirects to Conference Dashboard with pre-populated CfP link | None (UI Level) |

---

## ✅ Acceptance Criteria & Scenarios

### Scenario 1: Successful Conference Creation (Happy Path)
* **Given** the organizer is authenticated and on the dashboard,
* **When** they fill out all required conference fields and submit the form,
* **Then** the system creates a `Conference` record with `DRAFT` status,
* **And** calls `Conference.publishCfp()` to transition to `CFP_OPEN` status,
* **And** creates a linked `CfpConfig` with the specified submission window in `ACTIVE` state,
* **And** publishes `ConferenceCreated` and `CfpOpened` domain events,
* **And** redirects the user to the Conference Dashboard with a shareable CfP link.

### Scenario 2: Minimal Conference Setup
* **Given** the organizer wants to quickly set up a CfP,
* **When** they enter only the required fields (conference name, CfP start/end dates),
* **Then** the system creates the conference with default settings for optional fields,
* **And** the CfP is immediately ready to accept submissions.

---

## ⚠️ Edge Cases, Errors, & Boundary Conditions

### 1. Business Logic Failures

| What If | System Handling | Domain Method | Entity Impact |
|---------|-----------------|---------------|---------------|
| User selects CfP end date before start date | Display inline validation error *"End date must be after start date"*, prevent form submission | `CfpConfig.validateDates()` throws `InvalidCfpConfigError` | No lifecycle change; no entities created |
| Conference name contains special characters or is too long | Sanitize input, truncate to max 100 characters, display warning | `ConferenceName.create()` validates and sanitizes | `Conference` created with sanitized name |
| User tries to create more than 5 active conferences (free tier limit) | Display upgrade prompt with pricing information | `CreateConference.execute()` checks subscription tier | No lifecycle change; `Conference` not created |
| Slug already exists in database | Display error *"Conference name already taken, try a different name"* | `ConferenceRepository.findBySlug()` returns existing conference | No lifecycle change; `Conference` not created |

### 2. Technical Failures

| What If | System Handling | Domain Impact |
|---------|-----------------|---------------|
| Database connection fails during Conference creation | Rollback any partial writes, display generic error message *"Unable to create conference. Please try again."*, log error to monitoring service | No entities created; transaction aborted |
| Slug generation produces a duplicate (two conferences with same name) | Append numeric suffix (e.g., `my-conference-2`), retry up to 3 times | `Conference` created with unique slug |
| Welcome email fails to send | Log error, continue with successful response (email is best-effort) | `Conference` and `CfpConfig` persisted; email queued for retry |

### 3. Validation Boundary Conditions

| What If | System Handling | Domain Method | Entity Impact |
|---------|-----------------|---------------|---------------|
| CfP window is set for more than 180 days | Warn user that extended windows may reduce submission quality, require confirmation | `CfpConfig.validateDates()` checks duration | `CfpConfig` created with extended dates after confirmation |
| User tries to create conference with a date in the past | Block submission with error *"Conference dates must be in the future"* | `CfpStartDate.create()` validates future date | No lifecycle change; no entities created |
| User is not authorized (organizerId mismatch) | Return 403 Forbidden, log security violation | RLS policy prevents access | No entities created |

---

## 🛠️ Technical Notes & Validation Rules

### RESTful API Endpoint (ADR-006)

```
POST /api/v1/events
Content-Type: application/json
Authorization: Bearer {jwt}

Request Body:
{
  "name": "string (required, 3-100 characters)",
  "description": "string (optional, max 1000 characters)",
  "logoUrl": "string (optional, valid URL)",
  "cfpStartDate": "ISO 8601 date (required, must be >= today)",
  "cfpEndDate": "ISO 8601 date (required, must be > cfpStartDate)",
  "maxSubmissions": "integer (optional, default: unlimited)",
  "requiresApproval": "boolean (optional, default: true)"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "status": "CFP_OPEN",
  "cfpConfig": {
    "startDate": "ISO 8601 date",
    "endDate": "ISO 8601 date",
    "status": "ACTIVE"
  },
  "cfpUrl": "https://sessioflow.app/cfp/{slug}"
}
```

### Zod Validation Schema (ADR-007)

```typescript
const eventCreateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  cfpStartDate: z.coerce.date(),
  cfpEndDate: z.coerce.date(),
  maxSubmissions: z.number().int().positive().optional(),
  requiresApproval: z.boolean().default(true)
}).refine(data => data.cfpEndDate > data.cfpStartDate, {
  message: "End date must be after start date"
});
```

### Database Constraints (ADR-002 - Supabase)

| Constraint | Description |
|------------|-------------|
| `events.slug` | UNIQUE across all events |
| `events.organizerId` | FOREIGN KEY to `users.id` with RLS policy |
| `cfp_configs.eventId` | FOREIGN KEY to `events.id` with CASCADE delete |

### Row-Level Security (ADR-002)

```sql
-- RLS Policy: Organizer can only create events for their own account
CREATE POLICY "Organizers can create events"
ON events FOR INSERT
WITH CHECK (organizer_id = auth.uid());
```

### Generated Fields

| Field | Value |
|-------|-------|
| `slug` | URL-safe version of event name (e.g., "My Conference 2026" → "my-event-2026") |
| `cfpUrl` | `{baseUrl}/cfp/{slug}` (e.g., `https://sessioflow.app/cfp/my-event-2026`) |
| `status` | `CFP_OPEN` upon creation (after `publishCfp()` call) |

### Enforced Business Rules

* [BR-001](../business-rules/BR-001-cfp-dates-validation.md): CfP Dates Must Be Valid
* [BR-002](../business-rules/BR-002-conference-name-validation.md): Conference Name Must Meet Requirements
* [BR-003](../business-rules/BR-003-slug-uniqueness.md): Conference Slug Must Be Unique
* [BR-004](../business-rules/BR-004-free-tier-conference-limit.md): Free Tier Conference Creation Limit

### Enforced Invariants

* [INV-002](../invariants/INV-002-cfp-date-order.md): Cfp End Date Must Be After Start Date
* [INV-003](../invariants/INV-003-slug-uniqueness.md): Conference Slug Must Be Unique Across All Conferences

### Domain Conferences Published

| Conference | Triggered By | Side Effects |
|-------|--------------|--------------|
| `ConferenceCreated` | `Conference.create()` | Log event creation, initialize analytics |
| `CfpOpened` | `Conference.publishCfp()` | Send welcome email to organizer, notify subscribers |

---

## 🔄 Alternative Flow (Flowchart)

Shows decision points and error handling paths:

```mermaid
flowchart TB
    Start([Organizer Starts]) --> Form[Fill Conference Form]
    Form --> Validate{Client Validation}
    
    Validate -->|Invalid| Error1[Show Inline Errors]
    Error1 --> Form
    
    Validate -->|Valid| Submit[Submit Form]
    Submit --> ServerValidate{Server Validation}
    
    ServerValidate -->|Invalid| Error2[Return Validation Errors]
    Error2 --> Form
    
    ServerValidate -->|Valid| CheckSlug{Slug Unique?}
    CheckSlug -->|No| Error3[Suggest Alternative]
    Error3 --> Form
    
    CheckSlug -->|Yes| CreateConference[Create Conference Aggregate]
    CreateConference --> PublishCfp[Publish CfP]
    
    PublishCfp --> CheckTier{Free Tier Limit?}
    CheckTier -->|Exceeded| Error4[Show Upgrade Prompt]
    Error4 --> EndFail([Create Failed])
    
    CheckTier -->|OK| SaveDB[(Save to Database)]
    SaveDB --> PublishConferences[Publish Domain Conferences]
    
    PublishConferences --> SendEmail[Send Welcome Email]
    SendEmail --> Success[Redirect to Dashboard]
    
    Success --> EndSuccess([CfP Link Generated])
    
    style CreateConference fill:#e1f5fe
    style PublishCfp fill:#e8f5e9
    style PublishConferences fill:#fff3e0
    style Success fill:#c8e6c9
    style Error1 fill:#ffcdd2
    style Error2 fill:#ffcdd2
    style Error3 fill:#ffcdd2
    style Error4 fill:#ffcdd2
```

---

## 📊 Entity State Diagram

Shows the Conference entity lifecycle:

```mermaid
stateDiagram-v2
    [*] --> NotCreated
    NotCreated --> Draft: Create Conference
    Draft --> CfpOpen: publishCfp()
    CfpOpen --> CfpClosed: closeCfp()
    CfpClosed --> CfpOpen: reopenCfp()
    CfpOpen --> Published: publishSchedule()
    CfpClosed --> Published: publishSchedule()
    Published --> Completed: eventEnds
    
    note right of Draft
        Conference created with
        basic details
    end note
    
    note right of CfpOpen
        CfP active, accepting
        submissions
    end note
    
    note right of Published
        Schedule published,
        speakers notified
    end note
    
    style Draft fill:#e3f2fd
    style CfpOpen fill:#c8e6c9
    style CfpClosed fill:#fff9c4
    style Published fill:#e1bee7
```

---

## 📝 Mermaid Diagram & Walkthrough Consistency

This flow document follows the consistency guidelines:

1. **Step Numbering:** Each step in the walkthrough table corresponds to a logical action in the Mermaid diagram
2. **Sequence Alignment:** The order of steps matches the sequence shown in the Mermaid diagram
3. **Completeness:** Every major action in the Mermaid diagram has a corresponding step in the walkthrough
4. **Detail Level:** The walkthrough provides additional detail for each Mermaid interaction
5. **Numbering Strategy:** Sequential numbering (1-17) where each number represents a distinct action/interaction

## 🔗 Linked Documentation

| Document | Relationship |
|----------|--------------|
| [Conference Entity](../entities/event.md) | Conference entity lifecycle and state machine |
| [CfpConfig Entity](../entities/cfp-config.md) | CfpConfig child entity lifecycle |
| [ConferenceId Value Object](../value-objects/event-id.md) | Conference identifier value object |
| [ConferenceStatus Value Object](../value-objects/event-status.md) | Conference status enum value object |
| [ADR-002: Use Supabase for Backend](../../../../adr/002-00-use-supabase-for-backend-and-database.md) | Supabase and RLS decision |
| [ADR-006: Use RESTful API Design](../../../../adr/006-use-restful-api-design.md) | RESTful API design decision |
| [ADR-007: Use Zod for Validation](../../../../adr/007-use-zod-for-validation.md) | Zod validation strategy |
| [ADR-009: Adopt DDD Structure](../../../../adr/009-adopt-domain-driven-design-structure.md) | DDD architecture decision |
