# SDLC Skills Index

This document describes the Claude Code skills available in `.claude/skills/` — covering the full
lifecycle from product discovery through implementation, ongoing change management, and domain
navigation.

---

## Sequence Overview

```
/inception-workshop          Phase 1 — Product Discovery (what to build)
        ↓
/create-flow-documentation   Phase 2 — Flow Specs (how each feature works)
        ↓
/create-entity-lifecycle     Phase 3 — Domain Model (entities, BRs, invariants)
        ↓
/implement-flow              Phase 4 — Implementation (TDD/DDD, layer by layer)
        ↓
/modify-flow                 Phase 5+ — Ongoing Changes (proposal → plan → code → docs)

At any time:
/explore-domain              Understand the existing system (PO questions, onboarding, incident tracing)
/audit-docs                  Verify docs still match code (health check, pre-release sweep)
```

---

## Phase 1 — `/inception-workshop`

**Purpose:** Run the 8-step Lean Inception workshop to align business goals and define the MVP.

**Trigger:** Starting a new product or feature set from scratch with no existing documentation.

### Steps

| # | Step | Output file |
|---|------|-------------|
| 1 | Product Vision & Boundaries | `etc/docs/inception/1-product-vision-and-boundaries.md` |
| 2 | Tradeoffs Board | `etc/docs/inception/2-tradeoffs.md` |
| 3 | User Personas | `etc/docs/inception/3-personas/` |
| 4 | Empathy Map | `etc/docs/inception/4-empathy-map.md` |
| 5 | Feature Brainstorming | `etc/docs/inception/5-brainstorming.md` |
| 6 | User Journey Mapping | `etc/docs/inception/6-user-journeys/` |
| 7 | Features & Sequencing | `etc/docs/inception/7-features-and-sequencing.md` |
| 8 | MVP Canvas | `etc/docs/inception/8-mvp-canvas.md` |

### Modes

- **Interactive** (step by step): facilitate one step at a time, validate before advancing.
- **Batch** (all 8 at once): provide a product description and generate everything automatically.
- **Tradeoff generator** (step 2 only): simulates a debate between 4 stakeholders (PO, User Advocate, Tech Lead, Agile Coach) to produce a consensus tradeoff board.

### Validation scoring

| Score | Status | Action |
|-------|--------|--------|
| 9–10 | Excellent | Proceed immediately |
| 8–8.9 | Good | Proceed |
| 6–7.9 | Needs work | Revise, then type `ready` |
| < 6 | Poor | Critical edits required |

### Move to Phase 2 when

Steps 6 (User Journey) and 7 (Features & Sequencing) are complete.

---

## Phase 2 — `/create-flow-documentation`

**Purpose:** Turn each user journey into a complete technical flow specification.

**Trigger:** Steps 6 and 7 of the inception are done.

### Inputs

- `etc/docs/inception/6-user-journeys/*.md`
- `etc/docs/inception/7-features-and-sequencing.md`

### Output location

`etc/docs/product/bounded-contexts/[context]/flows/journey-XX-name.md`

### Each flow document includes

- 3 Mermaid diagrams: sequence diagram, flowchart, state lifecycle
- Step-by-step walkthrough table
- Acceptance criteria (Gherkin format)
- Edge cases (business, technical, validation)
- Technical notes (API contracts, DB constraints)
- Business rules (`BR-XXX`) and invariants (`INV-XXX`)
- Domain events documented

### Existing flows in this repo

| Bounded context | Flow | File |
|-----------------|------|------|
| mandate | FC Pro Cartera seller mandate creation | [`flow-01-fcpro-cartera-seller-mandate.md`](product/bounded-contexts/mandate/flows/flow-01-fcpro-cartera-seller-mandate.md) |
| mandate | External mandate ingestion (Hanok) | [`flow-02-external-mandate-ingestion.md`](product/bounded-contexts/mandate/flows/flow-02-external-mandate-ingestion.md) |
| captacion | FC Pro Cartera agency lifecycle | [`flow-03-fcpro-cartera-agency-lifecycle.md`](product/bounded-contexts/captacion/flows/flow-03-fcpro-cartera-agency-lifecycle.md) |
| captacion | Mandatos Vendedor agency lifecycle | [`flow-04-mandatos-vendedor-agency-lifecycle.md`](product/bounded-contexts/captacion/flows/flow-04-mandatos-vendedor-agency-lifecycle.md) |
| captacion | Mandatos Vendedor second shift | [`flow-05-mandatos-vendedor-second-shift.md`](product/bounded-contexts/captacion/flows/flow-05-mandatos-vendedor-second-shift.md) |

---

## Phase 3 — `/create-entity-lifecycle`

**Purpose:** Document each domain entity as a full lifecycle specification once it emerges from the flows.

**Trigger:** One or more flows in Phase 2 reveal a domain entity worth formalising (recurring states, transitions, constraints).

### Recommended order within this phase

```
1. Write initial flows (Phase 2)
2. Entities become visible in the flows
3. Document each entity lifecycle
4. Write further flows that reference the documented entities
```

### Each entity document includes

- State machine (Mermaid state diagram)
- Lifecycle transitions with guards and actions
- Business rules (`BR-XXX`) extracted from entity behaviour
- Invariants (`INV-XXX`) extracted from entity constraints
- Value objects referenced

### Existing entity docs in this repo

| Bounded context | Entity | File |
|-----------------|--------|------|
| mandate | Mandato | [`entities/Mandato.md`](product/bounded-contexts/mandate/entities/Mandato.md) |
| mandate | ExternalMandate | [`entities/ExternalMandate.md`](product/bounded-contexts/mandate/entities/ExternalMandate.md) |
| captacion | FcProCarteraContract | [`entities/FcProCarteraContract.md`](product/bounded-contexts/captacion/entities/FcProCarteraContract.md) |
| captacion | FcProCaptacionContract | [`entities/FcProCaptacionContract.md`](product/bounded-contexts/captacion/entities/FcProCaptacionContract.md) |
| captacion | DatavenuesOneContract | [`entities/DatavenuesOneContract.md`](product/bounded-contexts/captacion/entities/DatavenuesOneContract.md) |
| captacion | LeadsCaptacionContract | [`entities/LeadsCaptacionContract.md`](product/bounded-contexts/captacion/entities/LeadsCaptacionContract.md) |

---

## Phase 4 — `/implement-flow`

**Purpose:** Implement each flow feature incrementally using hybrid TDD and DDD layering.

**Trigger:** A flow document from Phase 2 is ready and you want to write production code for it.

### Implementation order (hybrid TDD)

```
1. Write E2E test (fails) — defines the goal
2. Write domain tests (fails) — defines the core
3. Implement domain layer
4. Write use case / application tests (fails)
5. Implement application layer
6. Write integration tests (fails)
7. Implement infrastructure layer
8. Write API/controller tests (fails)
9. Implement API layer → E2E test passes
```

### Planning artefacts created per flow

| Artefact | Location |
|----------|----------|
| Flow development plan | `etc/docs/product/bounded-contexts/[context]/flows/[flow-name]-plan.md` |
| Feature specification | `etc/docs/product/bounded-contexts/[context]/flows/features/feature-[name].md` |

### DDD layer structure (this repo)

```
src/main/java/com/adevinta/msreadacquisition/
├── domain/          # Entities, value objects, repository interfaces, domain services
├── application/     # Use cases, application services
└── infrastructure/  # Kafka consumers/producers, Feign clients, repositories, controllers
```

---

## Phase 5+ — `/modify-flow`

**Purpose:** Propose, plan, implement, and document a change to behaviour that is **already documented**.

**Trigger:** Any time existing flow, entity, or business rule behaviour needs to change.

### What the skill produces

| Artefact | Purpose |
|----------|---------|
| `proposal.md` | Product rationale (As a / I want / So that), current vs desired behaviour citing real code, scope of change, open questions |
| `implementation-plan.md` | Phased tasks derived from the proposal's scope, ordered by DDD layer, with test tasks per phase |

### Workflow

```
1. Discover this repo's doc conventions and source layout
2. Read affected flow/entity/BR docs
3. Verify against real source code (docs can be stale)
4. Write proposal.md — present to user, resolve open questions
5. Write implementation-plan.md
6. Implement phase by phase, running real build/test commands
7. Update original docs in place (no parallel new files)
```

### Existing proposals in this repo

| Change | Proposal | Plan |
|--------|----------|------|
| Disable free FC Pro Cartera agencies | [`proposal.md`](product/working-on/disable-free-fcpro-cartera-agencies/proposal.md) | [`implementation-plan.md`](product/working-on/disable-free-fcpro-cartera-agencies/implementation-plan.md) |
| Change mandate to new funnel | [`modify-fotocasa-funnel-fc-pro-cartera.md`](product/working-on/change-mandate-to-new-funnel/modify-fotocasa-funnel-fc-pro-cartera.md) | — |
| Anonymise valuations on GDPR deletion | [`proposal.md`](product/working-on/anonymise-valuations-on-gdpr-deletion/proposal.md) | [`implementation-plan.md`](product/working-on/anonymise-valuations-on-gdpr-deletion/implementation-plan.md) |

---

---

## At Any Time — `/explore-domain`

**Purpose:** Answer questions about the existing system — flows, entities, business rules, Kafka
events, and source code — without modifying anything.

**Trigger:** Any question about what the system does, how something works, or where to find
something. Used by POs for business-level explanations and by developers for onboarding or
incident tracing.

### 4 Modes

| Mode | Trigger phrase | Output |
|------|---------------|--------|
| `explain` | "what does X do?", "explain X", "how does X work?" | Narrative + Mermaid diagram + code pointers |
| `list-events` | "what Kafka events?", "event catalog", "what does this service publish?" | Full Kafka event catalog (consumed + produced) |
| `trace-flow` | "what happens when X?", "trace X", "walk me through event X" | Step-by-step call chain from entry to side effects |
| `find-rule` | "find rule for X", "what enforces X?", "is there a rule that…?" | Matching BRs/INVs + code file + confirmed/stale status |

Mode is detected automatically. Audience (PO vs. developer) adapts the response style.

---

## At Any Time — `/audit-docs`

**Purpose:** Systematically verify that documentation is still aligned with the real source code.
Produces a drift report — does not fix anything.

**Trigger:** Any time you want a health check on the living docs: after heavy feature sprints,
before a release, after a refactor, or when onboarding someone who needs to trust the docs.

### Verdict Levels

| Verdict | Meaning | Typical action |
|---------|---------|---------------|
| ✅ Confirmed | Doc matches code exactly | None |
| ⚠️ Stale | Doc is inaccurate (wrong value, renamed ref, missing step) | Hand-edit doc or `/modify-flow` |
| ❌ Missing | Doc references code that no longer exists | `/modify-flow` |
| ➕ Undocumented | Code behaviour with no doc | `/create-entity-lifecycle` or `/create-flow-documentation` |

### Scope Options

- **Full** — all bounded contexts, all doc types
- **Bounded context** — e.g. "audit the mandate context"
- **Doc type** — e.g. "check all business rules"
- **Single doc** — e.g. "is flow-02 still accurate?"

---

## Quick Command Reference

| Skill | When to use |
|-------|-------------|
| `/inception-workshop` | Starting a new product or epic — need to define vision, users, features, MVP |
| `/create-flow-documentation` | Journeys are defined — need technical flow specs with diagrams and acceptance criteria |
| `/create-entity-lifecycle` | A domain entity with clear states/transitions has emerged — need its full lifecycle spec |
| `/implement-flow` | A flow doc is ready — need to write production code for it, layer by layer |
| `/modify-flow` | Changing existing behaviour — need a proposal, plan, and doc updates |
| `/explore-domain` | Understanding what the system does — PO questions, onboarding, tracing an event, finding a rule |
| `/audit-docs` | Checking whether docs still match code — periodic health check, pre-release sweep, post-refactor |

---

## Skill Files Location

```
.claude/skills/
├── inception-workshop/        # Phase 1 — discovery
├── create-flow-documentation/ # Phase 2 — flow specs
├── create-entity-lifecycle/   # Phase 3 — domain model
├── implement-flow/            # Phase 4 — code
├── modify-flow/               # Phase 5+ — changes
├── explore-domain/            # Any time — understand existing system
└── audit-docs/                # Any time — verify docs vs. code
```
