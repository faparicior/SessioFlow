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
- [ ] `domains/[context]/entities/[entity].ts`
- [ ] `domains/[context]/value-objects/[vo].ts`
- [ ] `domains/[context]/services/[service].ts`

**Application Layer:**
- [ ] `application/[context]/use-cases/[use-case].ts`
- [ ] `application/[context]/dto/[dto].ts`

**Infrastructure Layer:**
- [ ] `infrastructure/database/[entity]-repository.ts`
- [ ] Database migrations

**Interface Layer:**
- [ ] `interfaces/api/v1/[resource]/route.ts`
- [ ] `interfaces/web/[resource]/page.tsx`

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Entity tests: [specific tests]
- [ ] Value object tests: [specific tests]
- [ ] Use case tests: [specific tests]

### Integration Tests
- [ ] Repository tests
- [ ] Use case integration tests

### E2E Tests
- [ ] Flow step: [which step in the parent flow]
- [ ] Related to: [journey-XX-[name].md]

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
| Domain | 📋 | |
| Infrastructure | 📋 | |
| Application | 📋 | |
| API | 📋 | |
| Frontend | 📋 | |
| Testing | 📋 | |

---

*This feature spec is part of the [Flow Name] development plan.*