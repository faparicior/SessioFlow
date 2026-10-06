# SDLC Skills Index

This document describes the Claude Code skills available in `.claude/skills/` — covering the full
lifecycle from product discovery through implementation, ongoing change management, and domain
navigation.

---

## Sequence Overview

There are two primary paths, depending on whether the flow already has documentation:

**Path A — new flow (nothing documented yet):**

```text
Phase 1 — Product Discovery & Slicing:
  ├─ Option A: /inception-workshop ──> docs/inception/
  └─ Option B: /user-story-mapping ──> docs/user-story-mapping/
  (Optional Bridge: Inception can feed directly into Story Mapping)
        ↓
/create-flow-documentation   Phase 2 — Flow Specs (how each journey works end-to-end)
        ↓
/create-entity-lifecycle     Phase 3 — Domain Model (entities, VOs, domain services, BRs, invariants)   [optional]
        ↓
/create-features             Phase 2b — Feature Specs (vertical slices, contracts, error mappings)  ← approval gate
        ↓
/implement-flow              Phase 4 — Implementation (TDD/DDD, layer by layer)     ← approval gates (plan, each phase)
```

**Path B — change to an already-documented flow (`/modify-flow`):** start with the triage tier.

```text
Triage (see Phase 5+)
 ├─ Light     one PR, one tweak        → implement test-first + edit the living doc in the same PR
 ├─ Standard  one slice, real choices  → proposal → plan → implement → sync docs
 └─ Full      several slices / repos / pauses
                 proposal (slices as Outlines) → /create-features for the next slice only (specs inside the proposal folder)
                 then, per slice:  resume ("still wanted?") → plan → implement → copy drafts into living docs
                 (a slice can be Discarded at any point; nothing in the living docs to revert)
                 after the last slice: grace-period
```

Inception is only revisited when the product itself changes (new personas, new differentiating features);
update the inception docs first, then follow path B.

**At any time:**

```text
/explore-domain              Understand the existing system (PO questions, onboarding, incident tracing)
/audit-docs                  Verify docs still match code (health check, pre-release sweep)
```

---

## How you invoke these skills (command-only by default)

Every SDLC skill carries `disable-model-invocation: true` in its `SKILL.md` frontmatter. The agent
therefore never sees them in its skill listing and cannot load one on its own — you invoke them
explicitly, and the full instructions load at that moment:

| Harness | Invoke with |
| ------- | ------------- |
| pi | `/skill:inception-workshop validate the vision` |
| Claude Code | `/inception-workshop validate the vision` |

Arguments after the command are appended to the skill body, so a phase, a bounded context, or a target
document can be passed in one line (`/skill:audit-docs the conference context`).

Two skills stay **auto-discoverable**, because their value is the agent noticing them:

| Skill | Why it stays automatic |
| ----- | ---------------------- |
| `reverse-engineer-domain` | you describe legacy code, you rarely say "reverse engineer" |
| `skill-creator` | you ask for a new skill, not for `/skill-creator` |

Flip either way by adding or removing that one frontmatter line, then check what the loader will
advertise (no dependencies, no build step):

```bash
shopt -s globstar
# command-only skills (hidden from the model)
grep -l  "disable-model-invocation: true" .agents/skills/**/SKILL.md | xargs -n1 dirname | xargs -n1 basename
# still auto-discoverable
grep -L  "disable-model-invocation: true" .agents/skills/**/SKILL.md | xargs -n1 dirname | xargs -n1 basename
```

> **Portability caveat.** `disable-model-invocation` is honored by pi, Claude Code and Cursor. Codex
> ignores it (open request: [openai/codex#29989](https://github.com/openai/codex/issues/29989); its own
> switch is `agents/openai.yaml` → `policy.allow_implicit_invocation: false`), and the Gemini CLI parser
> reads only `name` and `description`, so those two harnesses keep advertising these skills.

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

## Phase 2b — `/create-features`

**Purpose:** Break down an end-to-end User Flow document into sequentially numbered vertical feature specifications (`features/[journey-id]/feature-01-*.md`).

**Trigger:** A flow document from Phase 2 (`journey-XX-[name].md`) is complete and needs slicing into executable feature specifications before domain modeling or TDD.

### Inputs

- `docs/product/bounded-contexts/[context]/flows/journey-XX-name.md`
- Architecture references (`AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/adr/`)

### Output location

`docs/product/bounded-contexts/[context]/flows/features/[journey-id]/feature-[01]-[name].md`

### Each feature specification includes

- Functional & non-functional requirements (`F[X]-R[Y]`)
- HTTP error contract table (Domain Exception $\rightarrow$ Error Code $\rightarrow$ HTTP Status $\rightarrow$ message)
- Concurrency, TOCTOU & invariant integrity analysis (uniqueness, quotas, state races, outbox atomicity)
- Layer-by-layer implementation scope (Contracts, Domain, Application, Infrastructure, Interface)
- Lack of Information Log (`🧠 Agent Design Decisions & Assumptions`)

### Existing feature specs in this repo

| Bounded context | Feature | File |
|-----------------|---------|------|
| conference | Conference Creation with CfP (F1) | [`feature-01-conference-creation-with-cfp.md`](product/bounded-contexts/conference/flows/features/journey-01/feature-01-conference-creation-with-cfp.md) |
| conference | Conference Dashboard & CfP Link (F2) | [`feature-02-conference-dashboard-cfp-link.md`](product/bounded-contexts/conference/flows/features/journey-01/feature-02-conference-dashboard-cfp-link.md) |

---

## Phase 3 — `/create-entity-lifecycle`

**Purpose:** Document each domain entity as a full lifecycle specification once it emerges from the flows and features.

**Trigger:** One or more flows and feature specs reveal a domain entity worth formalising (recurring states, transitions, constraints).

### Recommended order within this phase

```
1. Write initial flows (Phase 2)
2. Slice into feature specifications (Phase 2b)
3. Entities, BRs and Invariants become visible with direct feature traceability
4. Document each entity lifecycle (Phase 3)
5. Write further flows that reference the documented entities
```

### Each entity document includes

- State machine (Mermaid state diagram)
- Lifecycle transitions with guards and actions
- Business rules (`BR-XXX`) extracted from entity behaviour
- Invariants (`INV-XXX`) extracted from entity constraints
- Value objects referenced

### Domain-service docs

Services that span aggregates or repositories are documented under
`docs/product/bounded-contexts/[context]/domain-services/[ServiceName].md` with a two-part template:
**Part A — Product View** (shipped behaviour in plain business language, decision paths, plus an
**A4 Pending Changes** table) and **Part B — Developer View** (collaborators, methods with status,
sequence diagrams, rules & invariants enforced, traceability). While a change is parked or in progress, the living doc only gets a one-sentence row in Part A4;
the planned rewrite lives in the change folder's `drafts/` and is copied over the living doc in the
PR that ships the slice (see `/modify-flow`).

### Existing entity docs in this repo

| Bounded context | Entity | File |
|-----------------|--------|------|
| conference | Conference (aggregate root) | [`entities/conference.md`](product/bounded-contexts/conference/entities/conference.md) |
| conference | CfpConfig | [`entities/cfp-config.md`](product/bounded-contexts/conference/entities/cfp-config.md) |

---

## Phase 4 — `/implement-flow`

**Purpose:** Implement each flow feature incrementally using hybrid TDD and DDD layering.

**Trigger:** Feature specifications from Phase 2b (and domain models from Phase 3) are ready and you want to plan and write production code for them.

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
| Flow development plan | `docs/product/bounded-contexts/[context]/flows/[flow-name]-plan.md`<br>*(or `docs/product/working-on/active/[change]/implementation-plan-sN.md` for `/modify-flow` slices)* |

*(Note: Feature specifications are created upstream in **Phase 2b via `/create-features`**)*

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
| `proposal.md` | Product rationale (As a / I want / So that), current vs desired behaviour citing real code, scope of change, delivery slices, open questions |
| `implementation-plan-sN.md` | Phased tasks derived from the proposal's scope, ordered by DDD layer, with test tasks per phase (one per slice) |

### Triage: how much ceremony?

Ask these first; if any answer is "yes", move up a tier:

1. Does it need more than one PR?
2. Does it touch an invariant, a data migration, or another repo?
3. Are there open business questions?
4. Will it be paused and resumed later?

| Tier | When | What you do |
|------|------|-------------|
| **Light** | One behaviour tweak, one PR, none of the above (e.g. change a threshold, add a validation) | No proposal folder. Short change note in the PR, test-first implementation, and edit the affected flow/entity/BR doc **in the same PR** |
| **Standard** | One slice, but with real design choices, an invariant or a migration | Single-slice proposal (no feature specs), then plan → implement → sync docs |
| **Full** | Several slices, several repos, or a long pause expected | Full chain below |

Whatever the tier, the living doc changes in the same PR as the code that makes it true.

### Workflow (Standard / Full)

```
1. Discover this repo's doc conventions and source layout
2. Read affected flow/entity/domain-service/BR docs
3. Verify against real source code (docs can be stale)
4. Write proposal.md (incl. Delivery Slices + Open Questions) — present to user, resolve open questions
   Plan light: later slices stay Outlines; detailed specs (/create-features, saved in the proposal
   folder) only for the slice about to start
   Not ready to build? Status = Parked, commit the proposal folder (docs-only PR is fine);
   planned text for living docs goes to drafts/, the living docs stay untouched
5. Resume (Step 2b) — read the slice table, ask "is this slice still wanted?", check its specs
   against today's code, record the commit in "Last checked against code", report drift
6. Write implementation-plan-sN.md for that slice only (code-level findings go here)
7. Implement the slice phase by phase, running real build/test commands; merge small PRs fast
8. In the same PR: copy that slice's drafts into the living docs, fill traceability, mark it Shipped
9. Repeat 5–8 per slice. A slice that becomes obsolete is Discarded (reason + date kept in the
   proposal, specs/drafts deleted, service-doc Pending Changes row removed). When every slice is
   Shipped or Discarded move the folder to grace-period
```

### Where things live

```text
docs/product/working-on/
├── active/<change>/
│   ├── proposal.md                   roadmap: slices (Detail level + Status), decisions, blockers, tickets
│   ├── features/                     detailed specs — only for specified slices
│   ├── drafts/                       planned text of living docs + README (draft → destination → slice)
│   └── implementation-plan-sN.md     written when slice N starts
└── grace-period/<change>/            shipped/closed; kept until stable, then purged
```

The proposal's **Delivery Slices** table is the ledger: which features ship together, which open
question blocks which slice, detail level, status, ship date and ticket/PR. It is the first thing
read on resume. Only shipped behaviour belongs in the living docs under `bounded-contexts/`;
everything not yet implemented (rationale, specs, drafts, open questions) stays in the change folder.
The one back-link is a domain-service doc's *Pending Changes* table.

### Existing proposals in this repo

No active proposals — proposals live under `docs/product/working-on/active/[change-name]/` once created.

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
| `/create-features` | A flow doc (Path A) or Full-tier proposal slice (Path B) needs to be sliced into feature specs with requirements, error contracts and concurrency analysis — approve before planning |
| `/create-entity-lifecycle` | A domain entity with states/transitions or a cross-aggregate domain service has emerged — need its lifecycle or service spec |
| `/implement-flow` | Feature specs are ready — need to plan and write production code for them, layer by layer (approval gates: plan & phases) |
| `/modify-flow` | Changing existing behaviour — triage (Light / Standard / Full), proposal, delivery slices, drafts, and in-place living doc sync |
| `/explore-domain` | Understanding what the system does — PO questions, onboarding, tracing an event, finding a rule |
| `/audit-docs` | Checking whether docs still match code — periodic health check, pre-release sweep, post-refactor |
| `/reverse-engineer-domain` | Extracting business rules and invariants from brownfield legacy code into docs/staging |
| `/prd-workshop` | *[Optional / Under Evaluation]* Drafting and validating formal Product Requirements Documents |

---

## Skill Files Location

```text
.agents/skills/ (canonical source, symlinked to .pi/skills/ and .claude/skills/)
├── sessioflow-sdlc/             # the SDLC pack — a grouping folder, no SKILL.md at this level
│   ├── guidelines/                # Shared SDLC conventions (traceability, rules, structures)
│   ├── inception-workshop/        # Phase 1a — Lean Inception discovery
│   ├── user-story-mapping/        # Phase 1b — User Story Mapping
│   ├── prd-workshop/              # Optional — draft and validate formal PRDs
│   ├── adr-create/                # Any time — draft a new ADR
│   ├── adr-amend/                 # Any time — amendments & impact analysis
│   ├── adr-validate/              # Any time — ADR quality & compliance audit
│   ├── adr-review-alternatives/   # Any time — alternatives & tech-currency review
│   ├── create-flow-documentation/ # Phase 2 — flow specs
│   ├── create-features/           # Phase 2b — feature specs & slicing
│   ├── create-entity-lifecycle/   # Phase 3 — domain model
│   ├── create-module/             # Phase 4 — scaffold a workspace package
│   ├── implement-flow/            # Phase 4 — code
│   ├── modify-flow/               # Phase 5+ — changes
│   ├── explore-domain/            # Any time — understand existing system
│   ├── audit-docs/                # Any time — verify docs vs. code
│   ├── agents-maintainer/         # Any time — keep AGENTS.md accurate
│   └── reverse-engineer-domain/   # Brownfield — extract rules from legacy code (auto-discoverable)
└── skill-creator/               # Authoring new skills (auto-discoverable)
```

The pack folder holds no `SKILL.md` of its own — a directory that contains one stops the recursive
scan, which would hide every skill inside it. Discovery of the grouped skills is verified in pi
(recursive) and Codex (recursive walk). Claude Code documents only `.claude/skills/<skill-name>/SKILL.md`,
so after moving a skill in or out, confirm with `/skills` that it still appears. The Gemini CLI glob is
`['SKILL.md', '*/SKILL.md']`, so it cannot see skills one level deeper than the skills root.
