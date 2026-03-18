# Feature: Collect Proposals (CfP)

**Feature ID**: FEAT-004  
**Category**: Content Management  
**Priority**: High  
**Status**: 📋 Planned  

**Related Specs**:
- [FEAT-001: Setup Event (Event Creation Wizard)](./feat-001-setup-event.md)
- [FEAT-002: User Authentication](./feat-002-user-authentication.md)
- [FEAT-003: Speaker Profile with Photo Upload](./feat-003-speaker-profile.md)
- [GB-VAL-001: Date Validation Rules](./_global-behaviours/validation/gb-val-001-date-validation.md)

---

## Description

Public Call for Papers form for speakers to submit session proposals to events. Supports single and co-speaker sessions, custom validation rules, and real-time submission limits. Provides both authenticated and anonymous submission flows.

---

## Background

```gherkin
Given an event is configured and open for proposals
And the event has a public CfP page at a unique URL
```

---

## Scenarios

### Scenario 1: Public CfP Page Access (Happy Path)

```gherkin
Feature: Access Public CfP Page

  Background:
    Given event "TechConf 2024" is open for proposals
    And event public UUID is "abc123def456"
    And CfP start date is in the past
    And CfP end date is in the future

  Scenario: Navigate to public CfP page
    When a user visits "sessioflow.com/cfp/abc123def456"
    Then the public CfP page should display
    And event name should show: "TechConf 2024"
    And event dates should be visible
    And "Call for Proposals" banner should display
    And submit proposal button should be prominent
    And speaker profile requirement should be shown
    And speakers can submit without being logged in
    And anonymous speakers can use "Continue with email" workflow
```

---

### Scenario 2: Session Proposal Submission (Authenticated Speaker)

```gherkin
Feature: Submit Proposal - Authenticated Speaker

  Background:
    Given Andrea is logged in as a speaker
    And Andrea has a complete profile
    And event "TechConf 2024" is open for proposals

  Scenario: Submit single-speaker proposal
    When Andrea clicks "Submit Proposal"
    Then proposal form should display
    And form fields should include:
      | Field | Type | Required |
      | Session Title | Text | Yes |
      | Session Type | Dropdown | Yes |
      | Duration | Dropdown | Yes |
      | Language | Dropdown | Yes |
      | Abstract | Text area | Yes |
      | Learning Outcomes | Text area | Yes |
      | Prerequisites | Text area | No |
      | Slides | URL | No |
      | Code Repository | URL | No |
    And Andrea's profile should pre-populate speaker info
    When Andrea fills:
      | Field | Value |
      | Session Title | Building Scalable React Apps |
      | Session Type | Talk |
      | Duration | 45 minutes |
      | Abstract | Learn best practices for building production-ready React applications with scalability in mind... |
    And submits the proposal
    Then submission should be created successfully
    And proposal status should be "submitted"
    And confirmation should display: "Your proposal has been submitted!"
    And confirmation email should be sent
    And Andrea can view the proposal in speaker dashboard
```

---

### Scenario 3: Session Proposal Submission (Anonymous Speaker)

```gherkin
Feature: Submit Proposal - Anonymous Speaker

  Background:
    Given an unauthenticated visitor
    And event "TechConf 2024" is open for proposals

  Scenario: Anonymous submission flow
    When visitor clicks "Submit Proposal"
    Then form should display without requiring login
    And visitor enters email to proceed
    And magic link should be sent for speaker identification
    And magic link allows profile pre-fill on return
    When visitor submits with email "guest@example.com"
    Then proposal is created linked to that email
    And profile can be completed later via email link
```

---

### Scenario 4: Co-Speaker Collaboration

```gherkin
Feature: Co-Speaker Sessions

  Background:
    Given event allows co-speakers
    AND an authenticated speaker with profile

  Scenario: Add co-speaker to proposal
    When speaker starts new proposal
    And selects "Add Co-Speaker"
    Then co-speaker invitation interface should appear
    And co-speaker email input should be required
    When co-speaker email is entered
    Then validation should check if email exists
    And if speaker exists, co-speaker is linked directly
    And if speaker doesn't exist, invitation email is sent
    And the invited speaker receives:
      | Email Content | Description |
      | Invitation Link | "You've been invited to co-present" |
      | Event Details | Event name and session title |
      | Accept/Decline Buttons | Action options |
    When invited speaker accepts
    Then co-speaker relationship is created
    And invitation email is sent to original presenter
```

---

### Scenario 5: Session Type Validation

```gherkin
Feature: Session Type Configuration

  Background:
    Given organizer configures event "TechConf 2024"

  Scenario: Organizer selects available session types
    When organizer configures event
    And selects session types:
      | Type | Duration |
      | Talk | 45 min |
      | Workshop | 90 min |
      | Lightning Talk | 10 min |
    Then only these options appear in CfP form
    And duration is auto-selected based on type
    And type selection is required

  Scenario: Workshop requires additional fields
    Given session type is "Workshop"
    When speaker selects workshop
    Then additional fields should appear:
      | Field | Description |
      | Materials Provided | "What will you provide?" |
      | Materials Needed | "What do you need from venue?" |
    And these fields become required for workshops
    And other types don't show these fields

  Scenario: Custom session types
    When organizer adds custom type "Panel Discussion"
    And sets duration to 60 minutes
    Then custom type appears in form options
    And speaker can select custom type
```

---

### Scenario 6: Submission Limits and Constraints

```gherkin
Feature: Submission Constraints

  Background:
    Given event has submission configuration

  Scenario: Single submission limit
    Given organizer set "max_submissions_per_speaker = 1"
    When speaker tries to submit second proposal
    Then validation should block submission
    And error should display: "You can only submit one proposal to this event"
    And original proposal should remain unchanged

  Scenario: Multiple submissions allowed
    Given event allows unlimited submissions
    When speaker submits proposal A
    Then speaker can submit proposal B
    And both proposals should be visible
    And speaker can manage each separately

  Scenario: Maximum 2 co-speakers
    Given event configuration
    When speaker tries to add third co-speaker
    Then validation should fail
    And error should display: "Maximum 2 co-speakers allowed"
    And additional co-speaker cannot be added
```

---

### Scenario 7: Abstract and Content Validation

```gherkin
Feature: Content Validation

  Background:
    Given speaker is filling proposal form

  Scenario: Abstract length validation
    When speaker enters abstract with 50 characters
    Then validation should fail
    And error should display: "Abstract must be 50-500 characters"
    And submission should be prevented

  Scenario: Required field validation
    When speaker leaves "Session Title" empty
    Then form should not submit
    And error should display: "Session title is required"
    And field should show red border

  Scenario: Learning outcomes required
    Given proposal type is "Talk"
    When speaker leaves "Learning Outcomes" empty
    Then validation should fail
    And error should display: "Learning outcomes required"
    And submission should be blocked

  Scenario: Prerequisites optional
    When speaker leaves "Prerequisites" empty
    Then proposal should still be valid
    And field should not show error
    And submission should succeed
```

---

### Scenario 8: Proposal Editing and Resubmission

```gherkin
Feature: Proposal Management

  Background:
    Given speaker has submitted proposal to event

  Scenario: Edit submitted proposal
    Given proposal status is "submitted"
    And event CfP is still open
    When speaker clicks "Edit Proposal"
    Then full proposal form should populate with current data
    And speaker can modify any field
    When speaker saves changes
    Then proposal should be updated
    And timestamp should show "Edited"
    And organizer sees updated version

  Scenario: Cannot edit after CfP closes
    Given event CfP end date has passed
    And proposal status is "submitted"
    When speaker attempts to edit
    Then edit interface should be disabled
    And message should display: "CfP is closed, no edits allowed"
    And save button should not be visible

  Scenario: Delete proposal before decision
    Given proposal status is "submitted"
    When speaker clicks "Delete Proposal"
    And confirms deletion
    Then proposal should be deleted
    And confirmation should display: "Proposal removed"
    And speaker can submit new proposal
    And organizer no longer sees this proposal
```

---

### Scenario 9: Public Proposal Visibility

```gherkin
Feature: Public Proposal Display

  Background:
    Given proposal is submitted and published

  Scenario: View published proposal on public page
    When attendee visits public event page
    Then all published proposals should be visible
    And session title should be displayed
    And speaker name should show (if profile complete)
    And session duration and type should be shown
    And session status "published" is required for visibility

  Scenario: Pending proposals invisible
    Given proposal status is "submitted" (not published)
    When attendee visits public page
    Then proposal should not appear
    And pending proposals should be hidden from public
    And only organizer can see pending proposals
```

---

### Scenario 10: Email Confirmation and Notifications

```gherkin
Feature: Submission Notifications

  Background:
    Given proposal submission

  Scenario: Confirmation email on submission
    When speaker submits proposal
    Then confirmation email should be sent
    And email should include:
      | Content | Description |
      | Event Name | "Your proposal for TechConf 2024" |
      | Session Title | Proposal title |
      | Submission Date | Timestamp of submission |
      | View Link | Link to view proposal status |
      | Expected Response | Timeline for decision |
    And email should be sent within 1 minute

  Scenario: Co-speaker invitation email
    Given co-speaker email invited
    When invitation sent
    Then email should include:
      | Content | Description |
      | Inviting Speaker | Name of person who invited |
      | Event Name | Conference name |
      | Session Title | Proposed talk title |
      | Accept Link | Link to accept invitation |
      | Decline Link | Link to decline (optional) |
    And invitation should expire in 7 days
    And unclaimed invitation is invalid after expiry
```

---

## Scenario Implementation

### Files

#### Backend/API
- `supabase/migrations/create_proposals.sql` - Proposals table schema
- `supabase/migrations/create_proposal_co_speakers.sql` - Co-speaker relationships
- `supabase/functions/process-form-submission.ts` - Form processing
- `lib/validations/proposal.ts` - Proposal form validation
- `supabase/functions/send-proposal-confirmation.ts` - Email notifications

#### Frontend Components
- `app/(public)/cfp/[uuid]/page.tsx` - Public CfP landing page
- `app/(public)/cfp/[uuid]/submit/page.tsx` - Proposal submission form
- `components/cfp/proposal-form.tsx` - Main form component
- `components/cfp/session-info.tsx` - Session type details
- `components/cfp/co-speaker-widget.tsx` - Co-speaker management
- `components/cfp/anonymous-flow.tsx` - Email collection for anonymous
- `features/speaker/dashboard/proposals-list.tsx` - Speaker proposal management

---

### Data Structures

```typescript
// Core proposal entity
export interface Proposal {
  id: string;
  event_id: string;
  speaker_id?: string;
  email?: string; // For anonymous submissions
  session_title: string;
  session_type: string;
  duration: number; // in minutes
  language: string;
  abstract: string; // HTML enriched
  learning_outcomes: string; // HTML enriched
  prerequisites?: string;
  slides_url?: string;
  code_repository_url?: string;
  status: 'submitted' | 'published' | 'accepted' | 'rejected' | 'waiting_for_co_speakers';
  speaker_bio?: string;
  speaker_email?: string;
  created_at: string;
  updated_at: string;
}

// Co-speaker relationship
export interface ProposalCoSpeaker {
  id: string;
  proposal_id: string;
  speaker_id?: string; // If existing user
  email: string; // Always stored
  status: 'invited' | 'accepted' | 'declined' | 'completed';
  invitation_token?: string;
  invited_at: string;
  accepted_at?: string;
}

// Proposal form input
export interface CreateProposalInput {
  sessionId: string;
  sessionTitle: string;
  sessionType: string;
  duration: number;
  language: string;
  abstract: string;
  learningOutcomes: string;
  prerequisites?: string;
  slidesUrl?: string;
  codeRepositoryUrl?: string;
  coSpeakers: Array<{ email: string; isExistingSpeaker?: boolean }>;
  email?: string; // For anonymous submissions
}

// Proposal public view
export interface ProposalPublicView {
  sessionId: string;
  sessionTitle: string;
  sessionType: string;
  duration: number;
  language: string;
  learningOutcomes: string;
  speakerName: string;
  speakerBio: string;
  status: 'accepted' | 'published'; // Only these visible publicly
}
```

---

### Validation Rules

| Rule | Field | Constraint | Error Message |
|------|-------|------------|---------------|
| Title Required | Session Title | Not empty, 10-150 chars | "Title must be 10-150 characters" |
| Description Required | Abstract | Not empty, 50-500 chars | "Abstract must be 50-500 characters" |
| Outcomes Required | Learning Outcomes | Not empty, 20-500 chars | "Learning outcomes must be 20-500 characters" |
| Session Type | Session Type | Required selection | "Please select a session type" |
| Duration Alignment | Duration | Must match session type | "Duration must be 45 minutes for Talks" |
| Co-Speaker Limit | Co-Speakers | Max 2 additional speakers | "Maximum 2 co-speakers allowed" |
| Email Format | Email/CfP Speakers | Valid email | "Please enter a valid email" |
| URL Format | Slides/Code | Valid URL | "Please enter a valid URL" |
| Submission Limit | Speaker Submissions | Respects event limit | "Submission limit reached" |
| Co-Presenter Email | Co-Speaker | Not already in proposal | "Email already added as co-speaker" |

---

## Implementation Notes

### Core Logic Pseudocode

```typescript
// Process proposal submission
async function createProposal(
  input: CreateProposalInput
): Promise<Proposal> {
  const { data: validated, error } = validateProposalInput(input);
  
  if (error) {
    throw new ValidationError(error);
  }
  
  // Check speaker submission limit
  if (input.speakerId) {
    const existingCount = await countProposalsBySpeaker(
      input.speakerId, 
      input.eventId
    );
    
    if (existingCount >= MAX_SUBMISSIONS) {
      throw new Error(
        `Maximum ${MAX_SUBMISSIONS} submissions allowed per speaker`
      );
    }
  }
  
  const proposalId = crypto.randomUUID();
  
  // Create proposal record
  const proposal = await db.proposals.insert({
    id: proposalId,
    event_id: input.eventId,
    speaker_id: input.speakerId,
    email: input.email,
    ...validated
  });
  
  // Create co-speaker relationships
  for (const coSpeaker of input.coSpeakers) {
    await db.proposalCoSpeakers.insert({
      proposal_id: proposalId,
      speaker_id: coSpeaker.isExistingSpeaker ? coSpeaker.speakerId : null,
      email: coSpeaker.email,
      status: coSpeaker.isExistingSpeaker ? 'completed' : 'invited',
      invitation_token: coSpeaker.isExistingSpeaker 
        ? null 
        : generateInvitationToken()
    });
    
    // Send invitation email if new co-speaker
    if (!coSpeaker.isExistingSpeaker) {
      await sendCoSpeakerInvitation({
        email: coSpeaker.email,
        proposalId,
        invitationToken: generateInvitationToken()
      });
    }
  }
  
  // Confirm submission
  await sendSubmissionConfirmation({
    email: input.speakerId 
      ? await getUserEmail(input.speakerId)
      : input.email,
    proposalId,
    eventId: input.eventId
  });
  
  return proposal;
}

// Process co-speaker invitation accept
async function acceptCoSpeakerInvitation(
  token: string,
  speakerEmail: string
): Promise<void> {
  const invitation = await findInvitationByToken(token);
  
  if (!invitation) {
    throw new Error("Invalid or expired invitation");
  }
  
  // Verify email matches
  if (invitation.email !== speakerEmail) {
    throw new Error("Invitation token mismatch");
  }
  
  // Find or create speaker user
  let speaker = await db.users.where({ email: speakerEmail }).first();
  
  if (!speaker) {
    speaker = await db.users.insert({
      email: speakerEmail,
      role: 'speaker'
    });
  }
  
  // Update invitation status
  await db.proposalCoSpeakers.update(
    { id: invitation.id },
    { 
      speaker_id: speaker.id,
      status: 'accepted',
      accepted_at: new Date().toISOString()
    }
  );
  
  // Notify primary speaker
  await notifyPrimarySpeakerOfAcceptance(invitation.proposalId);
}
```

---

### UI Components

```tsx
// Public CfP page
export function CfpLandingPage({ event }: { event: Event }) {
  const isCfpOpen = isCfpPeriodOpen(event);
  
  if (!isCfpOpen) {
    return (
      <div className="cfp-closed">
        <h1>Call for Proposals Closed</h1>
        <p>Proposals are no longer being accepted for {event.name}</p>
      </div>
    );
  }
  
  return (
    <div className="cfp-landing">
      <HeroBanner>
        <h1>{event.name} - Call for Proposals</h1>
        <p>Submit your talk, workshop, or panel discussion</p>
        <CfpDates events={event} />
      </HeroBanner>
      
      <ActionSection>
        <SubmitProposalButton onClick={openSubmissionForm} />
        <InfoBlock>
          <p>Deadline: {event.cfp_end_date}</p>
          <p>Max submissions: {event.max_submissions || 'unlimited'}</p>
        </InfoBlock>
      </ActionSection>
    </div>
  );
}

// Proposal submission form
export function ProposalSubmissionForm({ eventId }: { eventId: string }) {
  const [formData, setFormData] = useForm<CreateProposalInput>({
    sessionId: generateId(),
    sessionTitle: '',
    sessionType: '',
    duration: 45,
    language: 'english',
    abstract: '',
    learningOutcomes: '',
    prerequisites: '',
    slidesUrl: '',
    codeRepositoryUrl: ''
  });
  
  const [coSpeakers, setCoSpeakers] = useState<
    Array<{ email: string; isExistingSpeaker?: boolean; id?: string }>
  >([]);
  
  const onSubmit = async (data: CreateProposalInput) => {
    try {
      await createProposal({
        ...data,
        eventId,
        coSpeakers,
        speakerId: getCurrentUser()?.id
      });
      showSuccessMessage('Proposal submitted successfully!');
      navigate('/cfp/confirmation', { 
        state: { proposalId: data.sessionId }
      });
    } catch (error) {
      showErrorMessage(error.message);
    }
  };
  
  return (
    <Form onSubmit={onSubmit} data={formData}>
      <SessionTitleField 
        value={formData.sessionTitle}
        onChange={setFieldValue('sessionTitle')}
        minLength={10}
        maxLength={150}
      />
      
      <SessionTypeSelector
        value={formData.sessionType}
        onChange={(type) => {
          setFieldValue('sessionType', type);
          setFieldValue('duration', getSessionDuration(type));
        }}
        types={event.availableSessionTypes}
      />
      
      <AbstractField
        value={formData.abstract}
        onChange={setFieldValue('abstract')}
        min={50}
        max={500}
        maxLength={300}
      />
      
      <LearningOutcomesField
        value={formData.learningOutcomes}
        onChange={setFieldValue('learningOutcomes')}
      />
      
      <CoSpeakersSection
        coSpeakers={coSpeakers}
        onAddCoSpeaker={addCoSpeaker}
        onRemoveCoSpeaker={removeCoSpeaker}
        onInvite={(email) => addCoSpeaker(email)}
      />
      
      <OptionalFields>
        <SlidesUrlField value={formData.slidesUrl} onChange={setField} />
        <CodeRepoUrlField value={formData.codeRepositoryUrl} onChange={setField} />
      </OptionalFields>
      
      <SubmitButton disabled={!isValid(form)} type="submit">
        Submit Proposal
      </SubmitButton>
    </Form>
  );
}

// Co-speaker widget
export function CoSpeakersSection({ coSpeakers, onAddCoSpeaker }: CoSpeakersProps) {
  const [newCoSpeakerEmail, setNewCoSpeakerEmail] = useState('');
  
  const handleAdd = () => {
    if (newCoSpeakerEmail) {
      onAddCoSpeaker(newCoSpeakerEmail);
      setNewCoSpeakerEmail('');
    }
  };
  
  const canAddMore = coSpeakers.length < 2;
  
  return (
    <section className="co-speakers-section">
      <h3>Co-Speakers</h3>
      
      <CoSpeakerList>
        {coSpeakers.map((speaker) => (
          <CoSpeakerItem key={speaker.id || speaker.email}>
            <UserAvatar email={speaker.email} />
            <span>{speaker.email}</span>
            <RemoveButton onClick={() => onRemoveCoSpeaker(speaker.id)} />
          </CoSpeakerItem>
        ))}
      </CoSpeakerList>
      
      <AddCoSpeakerForm
        email={newCoSpeakerEmail}
        onChange={setNewCoSpeakerEmail}
        onSubmit={handleAdd}
        disabled={!canAddMore}
      />
      
      {coSpeakers.length >= 2 && (
        <Notice>Maximum 2 co-speakers allowed</Notice>
      )}
    </section>
  );
}
```

---

### Security Considerations

| Concern | Mitigation |
|---------|------------|
| SQL Injection | Use parameterized queries via Supabase client |
| CSRF Protection | Supabase handles CSRF automatically |
| Proposal Spam | Rate limiting: max 5 proposals per hour per IP |
| Content Validation | Sanitize HTML in abstract and outcomes |
| Unauthorized Access | RLS: speakers can only see/edit own proposals |
| Anonymous Email | Validate email format, prevent abuse with rate limiting |
| Co-Speaker Hijacking | Invitation tokens must match email verification |
| XSS Prevention | Escape all proposal content on display |
| DDoS Protection | Cloudflare or similar CDN protection |

---

## Testing Strategy

### Unit Tests (`tests/unit/proposal-validation.test.ts`)

- [ ] Abstract length validation (50-500 chars)
- [ ] Learning outcomes validation (20-500 chars)
- [ ] Session type/duration matching
- [ ] Co-speaker count validation (max 2)
- [ ] Email format validation
- [ ] URL format validation
- [ ] Submission limit enforcement logic

### Feature Tests (`tests/features/proposal-submission.test.tsx`)

- [ ] Proposal form submission (authenticated)
- [ ] Proposal form submission (anonymous)
- [ ] Co-speaker invitation flow
- [ ] Co-speaker already existing speaker handling
- [ ] Session type selection and duration update
- [ ] Field validation feedback in real-time
- [ ] Form data persistence on error
- [ ] Draft saving and resuming

### Integration Tests (`tests/integration/proposal-api.test.ts`)

- [ ] Proposal creation in database
- [ ] Co-speaker relationship creation
- [ ] Invitation email generation
- [ ] Submission confirmation email
- [ ] Speaker submission limit checking
- [ ] Anonymous vs authenticated distinction

### E2E Tests (`tests/e2e/proposal-flow.spec.ts`)

- [ ] Complete public CfP page flow
- [ ] Anonymous speaker submission
- [ ] Authenticated speaker submission
- [ ] Co-speaker invitation and acceptance
- [ ] Proposal editing before CfP close
- [ ] Proposal deletion
- [ ] Submission limit enforcement
- [ ] Validation error display and recovery

---

## Acceptance Criteria

- [ ] Public CfP page accessible via unique UUID URL
- [ ] Event dates and information display correctly
- [ ] CFP status prevents submission when closed
- [ ] Authenticated speakers can submit proposals
- [ ] Anonymous speakers can submit with email
- [ ] Profile photo requirement enforced when configured
- [ ] Session type selection updates duration automatically
- [ ] Workshop type shows additional required fields
- [ ] Co-speaker invitation flow works for new speakers
- [ ] Co-speaker linking works for existing speakers
- [ ] Maximum 2 co-speakers enforced
- [ ] Submission limits per speaker enforced
- [ ] Abstract validates 50-500 character range
- [ ] Learning outcomes validate 20-500 character range
- [ ] Proposal confirmation email sent within 1 minute
- [ ] Co-speaker invitation email sent with unique token
- [ ] Invitations expire after 7 days
- [ ] Editing disabled after CFP closes
- [ ] Proposal deletion works before organizer decision
- [ ] All 10 scenarios pass in automated test suite

---

**Implementation Priority**: 
1. Proposal database schema (Day 1-2)
2. Public CfP page (Day 3-4)
3. Proposal form with validation (Day 5-6)
4. Co-speaker invitation system (Day 7-8)
5. Email notifications (Day 9-10)
6. Anonymous submission flow (Day 11-12)
7. Integration and E2E tests (Day 13-14)

**Estimated Effort**: 2-3 weeks for 2 developers

**Next Related Feature**: FEAT-005: Review & Score Sessions (Wave 2)
