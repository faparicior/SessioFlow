# [Feature Name] - Feature Specification

* **Parent Flow:** [Flow filename] (e.g., `journey-01-setup-event.md`)
* **Context:** [Bounded Context]
* **Status:** 📋 Planned | 🔄 In Progress | ✅ Complete
* **Priority:** High | Medium | Low

---

## 🎯 Overview

**Feature Description:** [Brief description of what this feature does]

**User Value:** [How this feature benefits users in the flow]

**Flow Step:** [Which step(s) of the flow this feature enables]

---

## 📋 Requirements

### Functional Requirements
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

### Non-Functional Requirements
- [ ] Performance: [e.g., API response <200ms]
- [ ] Security: [e.g., RLS policies, authorization]
- [ ] Accessibility: [if applicable]

---

## 🏗️ Domain Model

### Entities Affected
| Entity | Role | Changes |
|--------|------|---------|
| [Entity1] | [Primary/Related] | [Create/Update/Read] |
| [Entity2] | [Related] | [Create/Update/Read] |

### Value Objects
- [ValueObject1] - [purpose]
- [ValueObject2] - [purpose]

### Domain Events (if any)
- [EventName] - [when triggered]

---

## 📦 Implementation Scope

### Files to Create/Modify

**Domain Layer:**
- [ ] `domains/[context]/entities/[entity].[ext]`
- [ ] `domains/[context]/value-objects/[vo].[ext]`
- [ ] `domains/[context]/services/[service].[ext]`

**Application Layer:**
- [ ] `application/[context]/use-cases/[use-case].[ext]`
- [ ] `application/[context]/dto/[dto].[ext]`

**Infrastructure Layer:**
- [ ] `infrastructure/database/[entity]-repository.[ext]`
- [ ] Database migrations

**Interface Layer:**
- [ ] `interfaces/api/v1/[resource]/[handler].[ext]`
- [ ] `interfaces/web/[resource]/[view-component].[ext]`

---

## 🧪 Test-Driven Implementation

### Step 1: Write Tests First

**Unit Tests:**
- [ ] Test `[Entity]` creates with valid data
- [ ] Test `[Entity]` rejects invalid data
- [ ] Test `[ValueObject]` validation rules
- [ ] Test edge cases and boundary conditions

**Integration Tests:**
- [ ] Test `[UseCase]` with mocked dependencies
- [ ] Test repository integration

**E2E Tests:**
- [ ] Test complete flow step: [which step in the parent flow]
- [ ] Related to: [journey-XX-[name].md]

### Step 2: Implement to Pass Tests

- [ ] Implement domain objects
- [ ] Implement use cases
- [ ] Implement infrastructure
- [ ] Make all tests pass

### Step 3: Refactor

- [ ] Clean up code
- [ ] Maintain test coverage
- [ ] Document behavior

---

## 🔗 Dependencies

### Blocks
- [ ] This feature must be complete before: [Feature/Flow step]

### Blocked By
- [ ] This feature requires: [Feature/Entity/Infrastructure]

---

## ✅ Acceptance Criteria

**Given** [context]
**When** [action]
**Then** [expected outcome]

### Test Scenarios
1. [Scenario 1]
2. [Scenario 2]
3. [Edge case scenario]

---

## 📝 Implementation Notes

[Any technical decisions, constraints, or considerations]

---

## 🔗 Related Documentation

- [Parent Flow Documentation](./[flow-filename].md)
- [Development Plan](./[flow-filename]-plan.md)
- [Entity Documentation](../entities/[entity].md)
- [ADR References](../../adr/)

---

## 📊 Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| Tests Written | 📋 | Write tests first |
| Implementation | 📋 | Implement to pass tests |
| Refactoring | 📋 | Clean up while tests pass |
| Integration | 📋 | Integration tests |
| E2E | 📋 | End-to-end validation |

---

*This feature spec is part of the [Flow Name] development plan and follows Test-Driven Development.*