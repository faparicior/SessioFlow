# Feature [01]: [Feature Name] - Feature Specification

* **Feature ID:** `F[01]`
* **Specification File:** `docs/product/bounded-contexts/[context]/flows/features/feature-[01]-[feature-name].md`
* **Parent Flow:** [Flow filename] (e.g., `journey-01-setup-conference.md`)
* **Bounded Context:** [Context Name] (e.g., `conference`)
* **Status:** 📋 Planned | 🔄 In Progress | ✅ Complete
* **Priority:** High | Medium | Low

> **Architecture Reference**: See `AGENTS.md` and `docs/ARCHITECTURE.md` for project folder layout, layer conventions, and verification commands.

---

## 🎯 Overview

**Feature Description:** [Brief description of what this feature does]

**User Value:** [How this feature benefits users in the flow]

**Flow Step:** [Which step(s) of the parent flow this feature implements]

---

## 📋 Requirements

### Functional Requirements
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

### Non-Functional Requirements
- [ ] Performance: [e.g., API response <200ms]
- [ ] Security: [e.g., authentication & authorization rules]
- [ ] Architecture: [DDD layer rules from docs/ARCHITECTURE.md]

---

## 🏗️ Domain Model

### Entities Affected
| Entity | Role | Changes |
|--------|------|---------|
| [Entity1] | Aggregate Root | [Create/Update/Read] |
| [ChildEntity] | Entity | [Create/Update/Read] |

### Value Objects
- `[ValueObjectName]` - [validation rules & purpose]
- `[ValueObjectName]` - [validation rules & purpose]

### Domain Events
- `[EventName]` - [when triggered, payload]

### Domain Exceptions
- `[ErrorName]` - [when thrown, error type]

---

## 📦 Implementation Scope by Layer
*(Consult `AGENTS.md` / `docs/ARCHITECTURE.md` for exact paths)*

- **Contracts / Schemas Layer**: [Data schemas / validation DTOs]
- **Domain Layer**: [Entities, Value Objects, Domain Events, Repository Interfaces]
- **Application Layer**: [Commands / Queries and their Handlers]
- **Infrastructure Layer**: [Repository implementations, Database schemas, Container wiring]
- **Interface Layer**: [HTTP Controllers, UI components, API route handlers]

---

## 🧪 TDD Execution Checklist

Follow the 4-step cycle: **1. First Test $\rightarrow$ 2. After Code $\rightarrow$ 3. After Architecture Tests $\rightarrow$ 4. Linter & Types**

- [ ] **1. Test First (Domain)**: Write unit tests for domain models (Expect FAIL)
- [ ] **2. Implement Code (Domain)**: Implement VOs & Entities to make tests PASS
- [ ] **3. Test First (Application)**: Write Command/Query handler tests with mocked dependencies
- [ ] **4. Implement Code (Application)**: Implement handlers & DTOs to make tests PASS
- [ ] **5. Architecture Check**: Run architecture verification from `AGENTS.md` (Must pass 0 errors)
- [ ] **6. Infrastructure & Container**: Implement repositories, database mappings, and container wiring
- [ ] **7. Interfaces**: Implement controllers and route handlers
- [ ] **8. Linter & Types**: Run project lint and typecheck commands from `AGENTS.md`

---

## ✅ Acceptance Criteria

**Scenario 1: Happy Path**
- **Given** [initial state]
- **When** [action taken]
- **Then** [expected result & state change]

**Scenario 2: Validation / Error Case**
- **Given** [invalid state or input]
- **When** [action taken]
- **Then** [expected domain error / rejection]

---

## 📊 Progress Tracking

| Layer | Status | Notes |
|-------|--------|-------|
| Domain Models & Tests | 📋 | Tests pass, invariants enforced |
| Application Handlers | 📋 | CQRS handlers implemented |
| Architecture Verification | 📋 | Arch checks pass |
| Infrastructure & Wiring | 📋 | Repositories & container wired |
| Interface & Routes | 📋 | Route handlers connected |
| Lint & Typecheck | 📋 | 0 errors |