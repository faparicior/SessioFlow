# Feature: Conference Core (Value Objects + Aggregate Root)

* **Parent Flow:** `journey-01-setup-conference.md`
* **Context:** Conference (Bounded Context)
* **Status:** 📋 Planned
* **Priority:** High
* **Plan Phase:** 1 — Core Domain

---

## 🎯 Overview

**Feature Description:** Implement all value objects and the `Conference` aggregate root with its full state machine. This is the foundational domain model that all other layers depend on.

**User Value:** Enables the conference organizer to represent a conference in the system with validated identity, name, slug, and lifecycle state.

**Flow Steps:** Steps 9-11 of the journey (domain creation, state transition to CFP_OPEN).

---

## 📋 Requirements

### Functional Requirements
- [ ] `ConferenceId` generates a unique UUIDv4 on creation
- [ ] `ConferenceName` validates 3-100 characters, sanitizes input
- [ ] `ConferenceSlug` generates URL-safe slug from name, validates format
- [ ] `ConferenceStatus` is an immutable enum: `DRAFT`, `CFP_OPEN`, `CFP_CLOSED`, `PUBLISHED`, `COMPLETED`
- [ ] `CfpConfigStatus` is an immutable enum: `ACTIVE`, `INACTIVE`, `CLOSED`
- [ ] `Conference.create()` produces an aggregate in `DRAFT` state with valid initial data
- [ ] `Conference.publishCfp()` transitions `DRAFT` → `CFP_OPEN`, creates `CfpConfig`
- [ ] `Conference.closeCfp()` transitions `CFP_OPEN` → `CFP_CLOSED`
- [ ] `Conference.reopenCfp()` transitions `CFP_CLOSED` → `CFP_OPEN`
- [ ] `Conference.publishSchedule()` transitions `CFP_OPEN` or `CFP_CLOSED` → `PUBLISHED`
- [ ] `Conference.conferenceDatePassed()` transitions `PUBLISHED` → `COMPLETED`
- [ ] No direct state mutation — all transitions go through domain methods
- [ ] Aggregate includes both `Conference` and child `CfpConfig`

### Non-Functional Requirements
- [ ] Domain layer has zero external dependencies (no Supabase, no Auth0)
- [ ] All value objects are immutable
- [ ] State transitions are enforced by the domain model, not by callers

---

## 🏗️ Domain Model

### Value Objects

| Value Object | Purpose | Validation Rules |
|--------------|---------|-----------------|
| `ConferenceId` | Unique identifier | UUIDv4 format |
| `ConferenceName` | Display name | 3-100 chars, no raw HTML |
| `ConferenceSlug` | URL-safe identifier | alphanumeric + hyphens only |
| `ConferenceStatus` | Lifecycle state | Enum: DRAFT, CFP_OPEN, CFP_CLOSED, PUBLISHED, COMPLETED |
| `CfpConfigStatus` | CfP configuration state | Enum: ACTIVE, INACTIVE, CLOSED |
| `CfpDates` | Submission window | end > start, start not in past |

### Entity: Conference (Aggregate Root)

**Role:** Primary entity. Represents a conference with its full lifecycle. Owns the `CfpConfig` child.

**State Machine:**
```
DRAFT → CFP_OPEN → CFP_CLOSED ⇄ (reopen) → PUBLISHED → COMPLETED
```

**Domain Methods:**
| Method | Precondition | Postcondition | Events |
|--------|-------------|---------------|--------|
| `publishCfp()` | status = DRAFT | status = CFP_OPEN, CfpConfig created | ConferenceCreated, CfpOpened |
| `closeCfp()` | status = CFP_OPEN | status = CFP_CLOSED, CfpConfig.closed = true | CfpClosed |
| `reopenCfp()` | status = CFP_CLOSED | status = CFP_OPEN | CfpReopened |
| `publishSchedule()` | status = CFP_OPEN or CFP_CLOSED | status = PUBLISHED | SchedulePublished |
| `conferenceDatePassed()` | status = PUBLISHED | status = COMPLETED | ConferenceCompleted |

### Domain Events
- `ConferenceCreated` — published when Conference is first created
- `CfpOpened` — published when `publishCfp()` transitions to CFP_OPEN
- `CfpClosed` — published when `closeCfp()` transitions to CFP_CLOSED
- `CfpReopened` — published when `reopenCfp()` transitions back to CFP_OPEN

---

## 📦 Implementation Scope

### Files to Create

**Value Objects (6):**
- [ ] `src/domain/conference/value-objects/conference-id.ts` — UUID generation
- [ ] `src/domain/conference/value-objects/conference-name.ts` — name validation
- [ ] `src/domain/conference/value-objects/conference-slug.ts` — slug generation + validation
- [ ] `src/domain/conference/value-objects/conference-status.ts` — status enum
- [ ] `src/domain/conference/value-objects/cfp-config-status.ts` — CfP status enum
- [ ] `src/domain/conference/value-objects/cfp-dates.ts` — date pair with validation

**Entities (2):**
- [ ] `src/domain/conference/conference.ts` — aggregate root with state machine
- [ ] `src/domain/conference/cfp-config.ts` — child entity (created by this feature in Phase 2)

### File Dependencies
- `CfpDates` is required by `Conference.create()` and `CfpConfig`
- `ConferenceId`, `ConferenceName`, `ConferenceStatus` are required by `Conference.create()`
- `CfpConfigStatus` is required by `CfpConfig` entity

---

## 🧪 Testing Strategy

### Unit Tests

**ConferenceId:**
- [ ] Generates valid UUIDv4 format
- [ ] Different instances are different values

**ConferenceName:**
- [ ] Accepts names 3-100 characters
- [ ] Rejects names < 3 characters
- [ ] Rejects names > 100 characters
- [ ] Sanitizes special characters

**ConferenceSlug:**
- [ ] Generates slug from name ("My Conference 2026" → "my-conference-2026")
- [ ] Validates alphanumeric + hyphens only
- [ ] Rejects empty slug

**ConferenceStatus:**
- [ ] Enum contains all 5 expected values
- [ ] Immutable (cannot be modified after creation)

**CfpDates:**
- [ ] Accepts valid date pairs (end > start, both in future)
- [ ] Rejects end date before start date
- [ ] Rejects start date in the past
- [ ] Validates max 180-day window

**Conference (aggregate):**
- [ ] `create()` produces DRAFT state
- [ ] `publishCfp()` transitions DRAFT → CFP_OPEN, creates CfpConfig
- [ ] `closeCfp()` transitions CFP_OPEN → CFP_CLOSED
- [ ] `reopenCfp()` transitions CFP_CLOSED → CFP_OPEN
- [ ] `publishCfp()` throws when already CFP_OPEN (invalid transition)
- [ ] Direct state property mutation is prevented
- [ ] `conferenceDatePassed()` transitions PUBLISHED → COMPLETED

### Test Coverage Target
- Value objects: 100%
- Conference entity: 95%+
- State transitions: all 5 transitions + 3 invalid transition guards

---

## 🔗 Dependencies

### Blocks
- [ ] Phase 2 — Domain Interfaces (repository depends on domain entities)
- [ ] Phase 3 — Application use cases (CreateConference depends on Conference.create())
- [ ] Phase 4 — API endpoints (route handler depends on use case)
- [ ] Phase 5 — Frontend (form submits to API that uses use case)

### Blocked By
- None (Phase 1 is the foundation)

---

## ✅ Acceptance Criteria

**Given** a valid conference name, description, and CfP dates
**When** I call `Conference.create(id, name, description, cfpDates)`
**Then** the Conference is created in `DRAFT` state with all fields set

**Given** a Conference in `DRAFT` state
**When** I call `conference.publishCfp()`
**Then** the status transitions to `CFP_OPEN` and a `CfpConfig` is created in `ACTIVE` state
**And** `CfpOpened` event is published

**Given** a Conference in `CFP_OPEN` state
**When** I call `conference.closeCfp()`
**Then** the status transitions to `CFP_CLOSED`

**Given** any Conference in a non-DRAFT state
**When** I call `conference.publishCfp()`
**Then** it throws an `InvalidConferenceError` (invalid transition)

---

## 📝 Implementation Notes

- Follow ADR-009: all mutations via domain methods, never via public setters
- Value objects use constructor validation — invalid values throw at construction time
- `Conference.create()` is a static factory that returns a `Result<Conference>` or throws
- `CfpConfig` will be created as part of `publishCfp()` — the Conference aggregate owns it
- Use TypeScript `enum` for status values (simple, no runtime cost)

---

## 🔗 Related Documentation

- [Parent Flow](../journey-01-setup-conference.md)
- [Conference Entity Doc](../../entities/conference.md)
- [CfpConfig Entity Doc](../../entities/cfp-config.md)
- [BR-001](../../business-rules/BR-001-cfp-dates-validation.md) — CfP Dates Must Be Valid
- [BR-002](../../business-rules/BR-002-conference-name-validation.md) — Conference Name Requirements
- [INV-001](../../invariants/INV-001-state-transition-validity.md) — State Transition Validity
- [INV-002](../../invariants/INV-002-cfp-date-order.md) — Cfp End Date After Start Date
- [ADR-009](../../../../adr/009-adopt-domain-driven-design-structure.md) — DDD Structure

---

## 📊 Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| Domain — Value Objects | 📋 | 6 VOs |
| Domain — Conference Entity | 📋 | Aggregate root + state machine |
| Domain — CfpConfig Entity | 📋 | Created in Phase 2 |
| Tests — Unit | 📋 | ~20+ test cases |

---

*This feature spec is part of the [Journey 01: Setup Conference](../journey-01-setup-conference-plan.md) development plan.*