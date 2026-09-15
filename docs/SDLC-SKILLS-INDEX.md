# SDLC Skills Index

This document describes the Claude Code skills available in `.claude/skills/` — covering the full
lifecycle from product discovery through implementation, ongoing change management, and domain
navigation.

---

## Sequence Overview

```text
Phase 1 — Product Discovery & Slicing (Equal Entry Points):
  ├─ Option A: /inception-workshop ──> docs/inception/
  └─ Option B: /user-story-mapping ──> docs/user-story-mapping/
  (Optional Bridge: Inception can feed directly into Story Mapping)
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

## Phase 1a — `/inception-workshop`

**Purpose:** Run the 8-step Lean Inception workshop to align business goals and define the MVP.

**Trigger:** Starting a new product or feature set from scratch with no existing documentation.

### Steps

| # | Step | Output file |
|---|------|-------------|
| 1 | Product Vision & Boundaries | `docs/inception/1-product-vision-and-boundaries.md` |
| 2 | Tradeoffs Board | `docs/inception/2-tradeoffs.md` |
| 3 | User Personas | `docs/inception/3-personas/` |
| 4 | Empathy Map | `docs/inception/4-empathy-map.md` |
| 5 | Feature Brainstorming | `docs/inception/5-brainstorming.md` |
| 6 | User Journey Mapping | `docs/inception/6-user-journeys/` |
| 7 | Features & Sequencing | `docs/inception/7-features-and-sequencing.md` |
| 8 | MVP Canvas | `docs/inception/8-mvp-canvas.md` |

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

### Move to Phase 1b or Phase 2 when

Steps 6 (User Journey) and 7 (Features & Sequencing) are complete.

---

## Phase 1b — `/user-story-mapping`

**Purpose:** Create a detailed, horizontal-to-vertical User Story Map (Jeff Patton methodology) with Backbone activities, INVEST story cards, and release slices.

**Trigger:** Either converting Lean Inception outputs into granular story maps, or running a story mapping workshop directly from scratch.

### Steps

| # | Step | Output file |
|---|------|-------------|
| 1 | Frame the Problem | `docs/user-story-mapping/1-frame-the-problem.md` |
| 2 | Map the Big Picture | `docs/user-story-mapping/2-map-the-big-picture.md` |
| 3 | Explore to Fill the Body | `docs/user-story-mapping/3-explore-to-fill-the-body.md` |
| 4 | Slice out a Release Strategy | `docs/user-story-mapping/4-slice-out-a-release-strategy.md` |
| 5 | Slice out a Learning Strategy | `docs/user-story-mapping/5-slice-out-a-learning-strategy.md` |
| 6 | Slice out a Development Strategy | `docs/user-story-mapping/6-slice-out-a-development-strategy.md` |

### Modes

- **`from-inception`** (bridge): Synthesize USM documents directly from `docs/inception/` artifacts using structured mapping rules.
- **`standalone`**: Facilitate the 6 steps step-by-step or in batch mode directly from user requirements.
- **`validate`**: Audit story depth, INVEST compliance, "fake" technical stories, and release slicing using validator rubrics.

### Move to Phase 2 when

Step 2 (Map Big Picture / Backbone) and Step 3 (Explore Body / Story Cards) are complete.

---

## Phase 2 — `/create-flow-documentation`

**Purpose:** Turn user journeys (from Inception) or story cards (from USM) into complete technical flow specifications.

**Trigger:** Inception Journeys / Sequencing are done, or USM Backbone / Story Cards are defined.

### Inputs

- `docs/inception/6-user-journeys/*.md` OR `docs/user-story-mapping/2-map-the-big-picture.md`
- `docs/inception/7-features-and-sequencing.md` OR `docs/user-story-mapping/3-explore-to-fill-the-body.md`

### Output location

`docs/product/bounded-contexts/[context]/flows/journey-XX-name.md`

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
| conference | Conference setup & CfP publication | [`journey-01-setup-conference.md`](product/bounded-contexts/conference/flows/journey-01-setup-conference.md) |

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
| conference | Conference (aggregate root) | [`entities/conference.md`](product/bounded-contexts/conference/entities/conference.md) |
| conference | CfpConfig | [`entities/cfp-config.md`](product/bounded-contexts/conference/entities/cfp-config.md) |

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
| Flow development plan | `docs/product/bounded-contexts/[context]/flows/[flow-name]-plan.md` |
| Feature specification | `docs/product/bounded-contexts/[context]/flows/features/feature-[name].md` |

### DDD layer structure (this repo)

```
packages/modules/[context]/
├── domain/            # Entities, value objects, repository interfaces, domain events
├── application/       # Command & query use cases (CQRS handlers)
├── infrastructure/    # Drizzle ORM repositories
├── interfaces/        # HTTP controllers
└── container.ts       # Module composition root
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

No active proposals — proposals live under `docs/product/working-on/[change-name]/` once created.

---

---

## At Any Time — `/explore-domain`

**Purpose:** Answer questions about the existing system — flows, entities, business rules, Outbox
events, and source code — without modifying anything.

**Trigger:** Any question about what the system does, how something works, or where to find
something. Used by POs for business-level explanations and by developers for onboarding or
incident tracing.

### 4 Modes

| Mode | Trigger phrase | Output |
|------|---------------|--------|
| `explain` | "what does X do?", "explain X", "how does X work?" | Narrative + Mermaid diagram + code pointers |
| `list-events` | "what events?", "event catalog", "what does this service publish?" | Full domain-event catalog (Outbox topics published + consumed) |
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
- **Bounded context** — e.g. "audit the conference context"
- **Doc type** — e.g. "check all business rules"
- **Single doc** — e.g. "is flow-02 still accurate?"

---

## Quick Command Reference

| Skill | When to use |
|-------|-------------|
| `/inception-workshop` | Starting a new product or epic — need to define vision, users, features, MVP |
| `/user-story-mapping` | Need granular horizontal backbone, INVEST story cards, and release slices (standalone or from inception) |
| `/create-flow-documentation` | Journeys / story cards are defined — need technical flow specs with diagrams and acceptance criteria |
| `/create-entity-lifecycle` | A domain entity with clear states/transitions has emerged — need its full lifecycle spec |
| `/implement-flow` | A flow doc is ready — need to write production code for it, layer by layer |
| `/modify-flow` | Changing existing behaviour — need a proposal, plan, and doc updates |
| `/explore-domain` | Understanding what the system does — PO questions, onboarding, tracing an event, finding a rule |
| `/audit-docs` | Checking whether docs still match code — periodic health check, pre-release sweep, post-refactor |

---

## Skill Files Location

```text
.agents/skills/ (canonical source, symlinked to .pi/skills/ and .claude/skills/)
├── inception-workshop/        # Phase 1a — Lean Inception discovery
├── user-story-mapping/        # Phase 1b — User Story Mapping
├── create-flow-documentation/ # Phase 2 — flow specs
├── create-entity-lifecycle/   # Phase 3 — domain model
├── implement-flow/            # Phase 4 — code
├── modify-flow/               # Phase 5+ — changes
├── explore-domain/            # Any time — understand existing system
└── audit-docs/                # Any time — verify docs vs. code
```
