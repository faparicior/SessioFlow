# CfP Configuration - Feature Specification

* **Parent Flow:** `journey-01-setup-conference.md`
* **Context:** Conference Bounded Context
* **Status:** 📋 Planned
* **Priority:** High

---

## 🎯 Overview

**Feature Description:** Allows organizers to configure the Call for Papers (CfP) submission window with start/end dates, submission limits, and approval requirements. Automatically transitions conference from DRAFT to CFP_OPEN state.

**User Value:** Enables organizers to set up a ready-to-use submission link that speakers can access to submit proposals.

**Flow Step:** Steps 11-17 in Journey 01 (publishing CfP and redirecting to dashboard)

---

## 📋 Requirements

### Functional Requirements
- [ ] Organizer can select CfP start date (must be >= today)
- [ ] Organizer can select CfP end date (must be > start date)
- [ ] System validates date range is valid (BR-001, INV-002)
- [ ] System warns if CfP window exceeds 180 days
- [ ] Organizer can set optional max submissions limit
- [ ] Organizer can toggle requires approval setting (default: true)
- [ ] System creates CfpConfig child entity with validated dates
- [ ] System transitions Conference from DRAFT to CFP_OPEN
- [ ] System generates public CfP URL (`{baseUrl}/cfp/{slug}`)
- [ ] System publishes `CfpOpened` domain event
- [ ] System triggers welcome email (async via Resend)

### Non-Functional Requirements
- [ ] Performance: API response <200ms (P95)
- [ ] Security: RLS policy ensures only organizer can publish CfP
- [ ] Validation: All dates validated with Zod schema
- [ ] Async Processing: Email sending is non-blocking
- [ ] Error Handling: Clear error messages for date validation failures

---

## 🏗️ Domain Model

### Entities Affected
| Entity | Role | Changes |
|--------|------|---------|
| `Conference` | Primary | Transition from DRAFT to CFP_OPEN |
| `CfpConfig` | Child | Create with submission window configuration |

### Value Objects
- `CfpStartDate` - Validated start date (must be >= today)
- `CfpEndDate` - Validated end date (must be > start date)
- `CfpStatus` - Status enum (ACTIVE, EXPIRED, CLOSED)
- `ConferenceStatus` - Updated from DRAFT to CFP_OPEN

### Domain Events (if any)
- `CfpOpened` - Triggered when CfP is published and conference becomes active

---

## 📦 Implementation Scope

### Files to Create/Modify

**Domain Layer:**
- [ ] `modules/conference/domain/value-objects/cfp-config.ts`
- [ ] `modules/conference/domain/value-objects/cfp-start-date.ts`
- [ ] `modules/conference/domain/value-objects/cfp-end-date.ts`
- [ ] `modules/conference/domain/value-objects/cfp-status.ts`
- [ ] `modules/conference/domain/events/cfp-opened.ts`
- [ ] `modules/conference/domain/exceptions/invalid-cfp-config-error.ts`
- [ ] `modules/conference/domain/services/conference-validation-service.ts`

**Application Layer:**
- [ ] `modules/conference/application/commands/publish-cfp/publish-cfp.command.ts`
- [ ] `modules/conference/application/commands/publish-cfp/publish-cfp.handler.ts`
- [ ] `modules/conference/application/commands/publish-cfp/publish-cfp.dto.ts`
- [ ] `modules/conference/application/dto/cfp-config-dto.ts`

**Infrastructure Layer:**
- [ ] `modules/conference/infrastructure/database/cfp-config-repository.ts`
- [ ] Email service adapter (Resend)
- [ ] Domain event publisher implementation

**Interface Layer:**
- [ ] `modules/conference/interfaces/api/v1/conferences/[conference-id]/publish-cfp.controller.ts`
- [ ] Zod validation schema for CfP configuration

---

## 🧪 Hybrid TDD Implementation

### Phase 0: Define E2E Contract (Outside-In)

**Step 1: Write E2E Test**
- [ ] Write E2E test for CfP publishing flow
- [ ] Document acceptance criteria from journey-01
- [ ] **Expected to FAIL initially** - defines the goal

### Phase 1-3: Build Inside-Out

**Step 2: Write Tests First**

**Unit Tests:**
- [ ] Test `CfpStartDate` validates date >= today
- [ ] Test `CfpEndDate` validates date > start date
- [ ] Test `CfpConfig` validates date range and duration
- [ ] Test `Conference.publishCfp()` transitions to CFP_OPEN
- [ ] Test `Conference` publishes `CfpOpened` event
- [ ] Test invalid date transitions throw errors
- [ ] Test edge cases (180-day warning, past dates)

**Integration Tests:**
- [ ] Test `PublishCfp` command with mocked repository
- [ ] Test state transition validation
- [ ] Test email service integration (mocked)
- [ ] Test repository saves CfpConfig correctly

**Step 3: Implement to Pass Tests**
- [ ] Implement CfpConfig value object with validation
- [ ] Implement CfpStartDate and CfpEndDate VOs
- [ ] Implement `Conference.publishCfp()` method
- [ ] Implement PublishCfp command and handler
- [ ] Implement email service adapter
- [ ] Make all tests pass

**Step 4: Refactor**
- [ ] Clean up code
- [ ] Maintain test coverage ≥95% for domain
- [ ] Document behaviors

### Phase 4: Validate E2E (Outside-In)

**Step 5: Run E2E Test**
- [ ] Run E2E test from Phase 0
- [ ] **Expected to PASS** - goal achieved!
- [ ] Fix any remaining issues

---

## 🔗 Dependencies

### Blocks
- [ ] This feature must be complete before: Journey 01 E2E validation
- [ ] This feature must be complete before: Submission feature

### Blocked By
- [ ] This feature requires: Conference Creation feature (Conference must exist in DRAFT state)
- [ ] This feature requires: Resend email service setup
- [ ] This feature requires: Domain event publisher infrastructure

---

## ✅ Acceptance Criteria

**Given** a conference exists in DRAFT state with valid CfP dates
**When** the organizer publishes the CfP
**Then** the conference transitions to CFP_OPEN state
**And** a CfpConfig is created with the specified dates
**And** the `CfpOpened` domain event is published
**And** a welcome email is sent (async)
**And** the user is redirected with a shareable CfP URL

### Test Scenarios
1. **Happy Path:** Valid dates publish CfP successfully
2. **End Before Start:** End date before start date shows validation error
3. **Past Start Date:** Start date in past shows validation error
4. **Extended Window:** Window >180 days shows warning, requires confirmation
5. **Invalid Conference:** Conference not in DRAFT state shows error
6. **Email Failure:** Email fails but conference still publishes (non-blocking)

---

## 📝 Implementation Notes

- **Date Validation:** Use Zod `refine` for cross-field validation (end > start)
- **Cfp URL Format:** `{baseUrl}/cfp/{slug}` (e.g., `https://sessioflow.app/cfp/my-conference-2026`)
- **Email Async:** Use background job queue or fire-and-forget with retry logic
- **State Transition:** `publishCfp()` only valid when status is DRAFT
- **Duration Limit:** Warn but allow >180 days with explicit confirmation
- **Default Values:** `requiresApproval` defaults to `true`, `maxSubmissions` defaults to unlimited

---

## 🔗 Related Documentation

- [Parent Flow Documentation](./journey-01-setup-conference.md)
- [Development Plan](./journey-01-setup-conference-plan.md)
- [Conference Entity Documentation](../entities/conference.md)
- [CfpConfig Value Object](../value-objects/cfp-config.md)
- [BR-001: CfP Dates Validation](../business-rules/BR-001-cfp-dates-validation.md)
- [INV-002: Cfp Date Order](../invariants/INV-002-cfp-date-order.md)
- [ADR-011: Email Service (Optional)](../../../adr/011-01-use-resend-email-amendment-optional-abstraction.md)

---

## 📊 Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| E2E Contract | 📋 | Write failing E2E test (Phase 0) |
| Tests Written | 📋 | Write unit/integration tests |
| Implementation | 📋 | Implement to pass tests |
| Refactoring | 📋 | Clean up while tests pass |
| E2E Validation | 📋 | Run E2E - should PASS |

---

*This feature spec is part of the Journey 01 development plan and follows Hybrid TDD (Outside-In + Inside-Out).*