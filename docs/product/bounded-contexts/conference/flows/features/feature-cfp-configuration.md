# Feature: CfP Configuration (Child Entity + Date Validation)

* **Parent Flow:** `journey-01-setup-conference.md`
* **Context:** Conference (Bounded Context)
* **Status:** 📋 Planned
* **Priority:** High
* **Plan Phase:** 1 — Core Domain

---

## 🎯 Overview

**Feature Description:** Implement the `CfpConfig` child entity and its date validation logic. This entity represents the Call for Papers configuration — the submission window with start/end dates and associated settings.

**User Value:** Allows the organizer to define when speakers can submit proposals, with automatic validation that the submission window is properly configured.

**Flow Steps:** Steps 4-5, 11-12 of the journey (CfP date selection, CfpConfig creation).

---

## 📋 Requirements

### Functional Requirements
- [ ] `CfpConfig` stores submission window dates, max submissions, and approval settings
- [ ] `CfpConfig.validateDates()` enforces end > start and max 180-day window
- [ ] `CfpConfig.activate()` transitions config to `ACTIVE` state
- [ ] `CfpConfig.deactivate()` transitions config to `INACTIVE` state
- [ ] `CfpConfig.close()` transitions config to `CLOSED` state
- [ ] `CfpConfig` can only be created as a child of a `Conference`
- [ ] Config status is immutable once set to `CLOSED`
- [ ] Extended windows (>180 days) are allowed but require explicit confirmation flag

### Non-Functional Requirements
- [ ] CfpConfig has no external dependencies
- [ ] All methods enforce invariants at the entity level
- [ ] Parent Conference reference is set at construction time

---

## 🏗️ Domain Model

### Entity: CfpConfig

**Role:** Child entity of `Conference` aggregate. Represents the CfP submission window configuration.

**State Machine:**
```
ACTIVE ⇄ INACTIVE → CLOSED (terminal)
```

**Properties:**
| Property | Type | Description |
|----------|------|-------------|
| `id` | `CfpConfigId` | Unique identifier |
| `conferenceId` | `ConferenceId` | Parent conference (immutable) |
| `startDate` | `Date` | CfP opens (validated) |
| `endDate` | `Date` | CfP closes (validated, must be > start) |
| `status` | `CfpConfigStatus` | Current state |
| `maxSubmissions` | `number \| null` | Unlimited if null |
| `requiresApproval` | `boolean` | Default: true |

**Domain Methods:**
| Method | Precondition | Postcondition |
|--------|-------------|---------------|
| `validateDates()` | dates are set | Throws `InvalidCfpConfigError` if invalid |
| `activate()` | status = INACTIVE | status = ACTIVE |
| `deactivate()` | status = ACTIVE | status = INACTIVE |
| `close()` | status = ACTIVE or INACTIVE | status = CLOSED |

**Invariants:**
- `INV-002`: end date must be after start date
- Config cannot be reactivated once closed
- Max 180-day submission window (configurable with confirmation)

---

## 📦 Implementation Scope

### Files to Create

**Entity:**
- [ ] `src/domain/conference/cfp-config.ts` — CfpConfig child entity

**Value Objects (if not created in Conference Core feature):**
- [ ] Already covered in `feature-conference-core.md` (CfpConfigStatus, CfpDates)

**Exception:**
- [ ] `src/domain/conference/exceptions/invalid-cfp-config-error.ts` — invalid CfP config data

### File Dependencies
- Depends on value objects from `feature-conference-core.md`:
  - `ConferenceId`, `CfpConfigStatus`
- Depends on domain exceptions from Phase 2:
  - `InvalidCfpConfigError`

---

## 🧪 Testing Strategy

### Unit Tests

**CfpConfig:**
- [ ] Creates with valid dates and default settings
- [ ] `validateDates()` passes with valid date range
- [ ] `validateDates()` throws on end <= start
- [ ] `validateDates()` throws on >180 day window (without confirmation)
- [ ] `validateDates()` passes with >180 day window when confirmation flag is set
- [ ] `activate()` transitions INACTIVE → ACTIVE
- [ ] `activate()` throws when already ACTIVE
- [ ] `deactivate()` transitions ACTIVE → INACTIVE
- [ ] `close()` transitions ACTIVE → CLOSED
- [ ] `close()` transitions INACTIVE → CLOSED
- [ ] `close()` throws when already CLOSED (terminal state)
- [ ] Cannot be reactivated after closing

### Test Coverage Target
- 100% coverage (entity is small and fully deterministic)

---

## 🔗 Dependencies

### Blocks
- [ ] Phase 3 — Use cases (CreateConference calls CfpConfig during publishCfp())
- [ ] Phase 3 — Infrastructure (database schema depends on entity shape)

### Blocked By
- [ ] `feature-conference-core.md` — ConferenceId, CfpConfigStatus must exist first

---

## ✅ Acceptance Criteria

**Given** a valid start date and end date
**When** I create a `CfpConfig` with those dates
**Then** the config is created in `ACTIVE` state with default settings (maxSubmissions=null, requiresApproval=true)

**Given** a CfpConfig with end date before start date
**When** I call `validateDates()`
**Then** it throws `InvalidCfpConfigError`

**Given** a CfpConfig in CLOSED state
**When** I call `activate()`
**Then** it throws an error (terminal state cannot be reactivated)

**Given** a CfpConfig in ACTIVE state
**When** I call `close()`
**Then** the status transitions to CLOSED

---

## 📝 Implementation Notes

- CfpConfig is a child of the Conference aggregate — it is created by `Conference.publishCfp()`, not directly instantiated by callers
- `validateDates()` should be called during construction, not lazily
- The 180-day limit is a soft constraint (allowable with explicit confirmation) to support long CfP windows when needed
- `maxSubmissions: null` means unlimited (not 0 or Infinity)

---

## 🔗 Related Documentation

- [Parent Flow](../journey-01-setup-conference.md)
- [CfpConfig Entity Doc](../../entities/cfp-config.md)
- [BR-001](../../business-rules/BR-001-cfp-dates-validation.md) — CfP Dates Must Be Valid
- [INV-002](../../invariants/INV-002-cfp-date-order.md) — Cfp End Date After Start Date
- [ADR-009](../../../../adr/009-adopt-domain-driven-design-structure.md) — DDD Structure

---

## 📊 Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| Entity: CfpConfig | 📋 | Child entity |
| Exception: InvalidCfpConfigError | 📋 | Created in Phase 2 |
| Tests — Unit | 📋 | ~12 test cases |

---

*This feature spec is part of the [Journey 01: Setup Conference](../journey-01-setup-conference-plan.md) development plan.*