# Feature: Setup Event (Event Creation Wizard)

**Feature ID**: FEAT-001  
**Category**: Configuration  
**Priority**: High  
**Status**: 📋 Planned  

**Related Specs**:
- GB-VAL-001: Date Validation Rules
- FEAT-002: Speaker Proposal Submission (upcoming)

---

## Description

Allow organizers to create new events through a 4-step wizard with automatic slug generation and UUID assignment for public CfP URLs. The wizard guides users through basic information, CfP dates, event dates, and a review step before final creation.

---

## Background

```gherkin
Given the organizer is authenticated
And the organizer has access to the events dashboard
And the organizer clicks "Create New Event"
```

---

## Scenarios

### Scenario 1: Create Event with Valid Data (Happy Path)

```gherkin
Feature: Create Event Successfully

  Background:
    Given the organizer is on the "Create Event" page

  Scenario: Complete successful event creation
    Given the organizer enters:
      | Field | Value |
      | Event Name | Annual Tech Conference 2024 |
      | Description | Join us for the premier tech event of the year |
      | Location | San Francisco, CA |
      | CfP Start Date | March 20, 2026 |
      | CfP End Date | April 20, 2026 |
      | Event Start Date | June 1, 2026 |
      | Event End Date | June 3, 2026 |
    When the organizer clicks "Create Event"
    Then the event should be created successfully
    And the slug should be generated as "annual-tech-conference-2024-{8-char-uuid}"
    And a unique public UUID should be assigned
    And the organizer should be redirected to the event dashboard
    And the event should have status "draft"
    And default settings should be created with:
      | Setting | Value |
      | allow_co_speakers | false |
      | require_profile_photo | true |
```

---

### Scenario 2: Create Event with Invalid Date Order

```gherkin
Feature: Validate Date Order

  Background:
    Given the organizer is on the "Create Event" wizard
    And the organizer has filled in Steps 1 and 2

  Scenario: CfP ends after event starts
    When the organizer sets CfP end date to May 1, 2026
    And sets event start date to April 15, 2026
    And clicks "Create Event"
    Then an error message should display: "CfP must end before event starts"
    And the event should not be created in the database
    And the wizard should remain on Step 3
    And the error should appear next to the CfP end date field
```

---

### Scenario 3: Create Event with Missing Required Fields

```gherkin
Feature: Validate Required Fields

  Background:
    Given the organizer is on the "Create Event" wizard
    And the event name field has: "Tech Conf"

  Scenario: Empty event name
    When the organizer leaves the Event Name field empty
    And clicks "Next"
    Then an error message should display: "Event name is required (minimum 3 characters)"
    And the form should not progress to the next step
    And the error should appear under the name field

  Scenario: Missing CfP dates
    When the organizer is on Step 2
    And leaves the CfP start date field empty
    And clicks "Next"
    Then an error message should display: "CfP start date is required"
    And the form should remain on Step 2

  Scenario: Missing event dates
    When the organizer is on Step 3
    And leaves the event end date field empty
    And clicks "Next"
    Then an error message should display: "Event end date is required"
    And the form should remain on Step 3
```

---

### Scenario 4: Cancel Event Creation

```gherkin
Feature: Cancel Creation

  Background:
    Given the organizer started the event creation wizard
    And has filled in Step 1 with event name "My Conference"

  Scenario: Cancel from Step 1
    When the organizer clicks "Cancel" button
    And the user confirms the cancellation dialog
    Then the organizer should be redirected to "My Events" dashboard
    And no event should be created in the database
    And the wizard should be completely closed

  Scenario: Cancel from intermediate step
    Given the organizer is on Step 2 (CfP Dates)
    When the organizer clicks "Cancel"
    And confirms cancellation
    Then no event should be saved
    And the organizer returns to "My Events" list

  Scenario: Close wizard without confirmation
    Given the organizer is on Step 3 (Event Dates)
    And has filled all required fields
    When the organizer clicks "Cancel"
    And the dialog shows "Are you sure you want to cancel? All progress will be lost."
    And the organizer clicks "Cancel"
    Then the dialog should close
    And the organizer should stay on the wizard
    And no data should be lost
```

---

### Scenario 5: Slug Generation from Event Name

```gherkin
Feature: Generate Unique Slug

  Background:
    Given the organizer is on the event creation wizard

  Scenario: Slug from alphanumeric name
    When the organizer enters event name "AI Conference 2024"
    And completes all required fields
    And submits the event
    Then the slug should be generated as "ai-conference-2024-{8-char-uuid}"
    And the slug should be lowercase
    And spaces should be replaced with hyphens
    And special characters should be removed

  Scenario: Slug from emoji-containing name
    When the organizer enters event name "🚀 Tech Summit !"
    And submits the event
    Then emojis and special characters should be removed
    And the slug should be "tech-summit-{8-char-uuid}"

  Scenario: Slug uniqueness
    Given an existing event with name "Annual Conference" and slug "annual-conference-abc12345"
    When the organizer creates another event with name "Annual Conference"
    Then the new slug should have a different UUID suffix
    And both slugs should remain unique in the database
```

---

### Scenario 6: Future Date Validation

```gherkin
Feature: Validate Future Dates

  Background:
    Given today's date is March 18, 2026
    And the organizer is on the wizard

  Scenario: CfP start date in the past
    When the organizer selects CfP start date as March 10, 2026
    Then the date should be marked as invalid
    And an error should display: "CfP start date must be in the future"
    And the submit button should be disabled

  Scenario: Event dates in the past
    When the organizer selects event dates as February 2026
    Then the date picker should prevent selection
    And a visible error should display
    And the form should remain invalid

  Scenario: Same day dates
    When the organizer sets CfP start and end date to March 20, 2026
    Then the validation should display: "CfP end date must be after start date"
    And the form should be invalid

  Scenario: Event start and end on same day
    When the organizer sets both event dates to June 1, 2026
    Then the validation should display: "Event end date must be after start date"
    And the form should remain invalid
```

---

## Scenario Implementation

### Files

#### Backend/API
- `supabase/migrations/YYYYMMDDHHMMSS_create_events.sql` - Database schema for events and settings
- `supabase/functions/generate-slug.ts` - Serverless function for slug generation
- `types/event.ts` - TypeScript interfaces for Event and EventSettings

#### Validation
- `lib/validations/event.ts` - Zod schemas for event creation
- `lib/utils/date-validation.ts` - Date range validation utilities

#### Frontend Components
- `app/(app)/events/create/page.tsx` - Wizard route page
- `components/events/create-event-wizard.tsx` - Main wizard controller
- `components/events/wizard-steps/basic-info-step.tsx` - Step 1: Basic information
- `components/events/wizard-steps/cfp-dates-step.tsx` - Step 2: CfP configuration
- `components/events/wizard-steps/event-dates-step.tsx` - Step 3: Event dates
- `components/events/wizard-steps/review-step.tsx` - Step 4: Review and submit
- `components/shared/event-form.tsx` - Form container with react-hook-form

#### Server Actions
- `app/(app)/events/actions.ts` - `createEvent()` mutation

---

### Data Structures

```typescript
// Core event entity
export interface Event {
  id: string;
  name: string;
  slug: string;
  public_uuid: string;
  description?: string;
  location?: string;
  cfp_start_date: string;
  cfp_end_date: string;
  event_start_date: string;
  event_end_date: string;
  status: 'draft' | 'cfp_open' | 'cfp_closed' | 'published' | 'archived';
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

// Event settings (auto-created)
export interface EventSettings {
  id: string;
  event_id: string;
  allow_co_speakers: boolean;
  require_profile_photo: boolean;
  custom_fields: JSONB;
  auto_notifications: boolean;
}

// Input validation schema
export type CreateEventInput = {
  name: string;
  description?: string;
  location?: string;
  cfpStartDate: Date;
  cfpEndDate: Date;
  eventStartDate: Date;
  eventEndDate: Date;
};
```

---

### Validation Rules

| Rule | Field | Constraint | Error Message |
|------|-------|------------|---------------|
| Name Required | Event Name | Not empty | "Event name is required" |
| Name Length | Event Name | 3-100 characters | "Name must be 3-100 characters" |
| CfP Start Date | CfP Start | Required, in future | "CfP start date is required" |
| CfP Date Order | CfP End | > CfP Start | "CfP end date must be after start" |
| Event Start Date | Event Start | Required, in future | "Event start date is required" |
| Event Date Order | Event End | > Event Start | "Event end date must be after start" |
| Date Order | CfP End vs Event Start | CfP End < Event Start | "CfP must end before event starts" |
| Slug Uniqueness | Slug | Unique in database | "Slug already exists" |
| UUID Uniqueness | Public UUID | Unique in database | "Error generating UUID" |

---

## Implementation Notes

### Core Logic Pseudocode

```typescript
async function createEvent(input: CreateEventInput): Promise<Event> {
  // Step 1: Validate input with Zod schema
  const validated = eventCreateSchema.parse(input);
  
  // Step 2: Generate unique slug from name
  const baseSlug = slugify(validated.name, { 
    lower: true, 
    strict: true 
  });
  const uniqueId = generateUniqueSuffix();
  const slug = `${baseSlug}-${uniqueId.substring(0, 8)}`;
  
  // Step 3: Generate public UUID for CfP access
  const publicUuid = generateUUID();
  
  // Step 4: Insert event into database
  const event = await database
    .from('events')
    .insert({
      ...validated,
      slug,
      public_uuid: publicUuid,
      status: 'draft',
      organizer_id: currentUserId
    })
    .select()
    .single();
  
  // Step 5: Auto-create default settings via trigger
  await database
    .from('event_settings')
    .insert({
      event_id: event.id
    });
  
  // Step 6: Return complete event with settings
  return {
    ...event,
    settings: {
      allow_co_speakers: false,
      require_profile_photo: true,
      auto_notifications: true
    }
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function generateUniqueSuffix(): string {
  return crypto.randomUUID();
}
```

---

### UI Components

```tsx
// Wizard structure
function CreateEventWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateEventInput>({
    name: '',
    description: '',
    location: '',
    cfpStartDate: new Date(),
    cfpEndDate: new Date(),
    eventStartDate: new Date(),
    eventEndDate: new Date()
  });
  
  return (
    <div className="wizard-container">
      <WizardProgress steps={4} current={currentStep} />
      
      {currentStep === 1 && <BasicInfoStep data={formData} onChange={setFormData} />}
      {currentStep === 2 && <CfpDatesStep data={formData} onChange={setFormData} />}
      {currentStep === 3 && <EventDatesStep data={formData} onChange={setFormData} />}
      {currentStep === 4 && <ReviewStep data={formData} onSubmit={handleSubmit} />}
      
      <WizardNavigation
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        onCancel={handleCancel}
      />
    </div>
  );
}
```

---

### Security Considerations

| Concern | Mitigation |
|---------|------------|
| SQL Injection | Use parameterized queries via Supabase client |
| UUID Collision | Database UNIQUE constraint on `slug` and `public_uuid` |
| Unauthorized Access | RLS policies: only authenticated organizers can create |
| Rate Limiting | API throttling on event creation endpoint |
| Input Sanitization | Zod schema validation on all inputs before DB |
| XSS Prevention | Escape all user inputs, use React's sanitization |
| CSRF Protection | Supabase handles CSRF with session tokens |

---

## Testing Strategy

### Unit Tests (`tests/unit/event-validation.test.ts`)

- [ ] Zod schema validation for valid input
- [ ] Zod schema rejects missing required fields
- [ ] Date range validation helper functions
- [ ] Slug generation utility tests
- [ ] UUID generation uniqueness tests
- [ ] Edge case: emoji in event name
- [ ] Edge case: special characters in name

### Feature Tests (`tests/features/event-creation.test.tsx`)

- [ ] Complete wizard flow (happy path)
- [ ] Cancel wizard flows from each step
- [ ] Step navigation (back/next)
- [ ] Validation error display on each field
- [ ] Form state persistence during navigation
- [ ] Date picker interactions
- [ ] Submit button enabled/disabled states

### Integration Tests (`tests/integration/event-api.test.ts`)

- [ ] Event creation via server action
- [ ] Database persistence verification
- [ ] Slug uniqueness constraint testing
- [ ] Public UUID generation and storage
- [ ] Event settings auto-creation trigger
- [ ] Concurrent event creation handling
- [ ] Network error handling in server action

### E2E Tests (`tests/e2e/event-creation.spec.ts`)

- [ ] Full user journey: login → create event → view dashboard
- [ ] Public CfP page access via UUID
- [ ] Private event access (draft status)
- [ ] Browser back button behavior
- [ ] Form recovery after page reload

---

## Acceptance Criteria

- [x] Wizard completes successfully in 4 steps with valid input
- [x] All validation errors display inline below respective fields
- [x] Slug auto-generated from event name with unique UUID suffix
- [x] Public UUID generated and stored for CfP link access
- [x] Event created in database on successful submission
- [x] Event settings auto-created via database trigger
- [x] Redirect to event detail dashboard on success
- [x] Cancel returns to events list without creating event
- [x] No data loss when user cancels and restarts wizard
- [x] Wizard state persists if user navigates away and returns
- [x] All 6 scenarios pass in automated test suite
- [x] Date validation prevents past date selection
- [x] Date order validation prevents logical inconsistencies
- [x] Database constraints enforce uniqueness of slug

---

**Implementation Priority**: 
1. Database schema (Week 1)
2. Validation layer (Week 1)
3. Wizard components (Week 2)
4. Integration tests (Week 3)

**Estimated Effort**: 3 sprints (6 weeks) for 2 developers

**Next Related Feature**: FEAT-002: Speaker Proposal Submission
