# Implementation Plan: [Change Title]

* **Status:** 📋 Planned | 🔄 In Progress | ✅ Complete
* **Proposal:** [proposal.md](./proposal.md)

### Resolved Open Questions

Carry each row over from the proposal's Open Questions table with its resolution filled in — if any are still unresolved, resolve them before starting.

| # | Question | Resolution |
| :---: | :--- | :--- |
| 1 | [Question from proposal] | [How it was resolved] |
| 2 | [Question from proposal] | [How it was resolved] |

---

## 1. Pre-Implementation Checklist

- [ ] All Open Questions in `proposal.md` are answered
- [ ] Confirmed via a project-wide search that the Scope of Change table lists every real caller/usage site (not just the obvious ones)
- [ ] Concurrency, TOCTOU, and invariant integrity safeguards from `proposal.md` are addressed in the test and implementation plan
- [ ] Confirmed whether this repo has an architecture-decision-record or equivalent index relevant to this change — if none exist, note that and proceed on this repo's own documented conventions (e.g. its top-level agent/contributor guide) alone

---

## 2. Phases

Derive phases from the proposal's **Scope of Change** table — one phase per file/component cluster, ordered inside-out (core/domain logic → orchestration/application logic → infrastructure/persistence → interfaces), matching **this repo's actual layering**, whatever that is — do not impose a generic module template if the codebase is organized differently.

### Phase 1: [Core / domain logic change]

**Goal:** [What this phase achieves]

**Tasks:**
- [ ] Write/update tests for `[RealUnitName]` describing the new behaviour first (test-first if this repo follows TDD; otherwise match its existing test-authoring convention)
- [ ] Implement the change in `[real/path/to/source-file.ext]`
- [ ] Remove now-dead code identified in the proposal (functions, constants, unused params) — don't leave it commented out or behind a flag unless the proposal explicitly calls for a staged rollout

**Deliverables:**
- [ ] `[real/path/to/source-file.test.ext]` updated
- [ ] `[real/path/to/source-file.ext]` updated

### Phase 2: [Orchestration / application-layer change, if any]

**Goal:** [What this phase achieves]

**Tasks:**
- [ ] [...]

### Phase 3: Integration & Acceptance Tests

**Goal:** Verify the end-to-end behaviour described in the proposal's "Desired Behaviour" table, including concurrency safeguards and invariant protections.

**Tasks:**
- [ ] Update `[real/path/to/integration-or-acceptance-test.ext]` to match new behaviour
- [ ] Add a case for the specific edge case called out in the proposal (e.g. "zone/entity with zero matches now yields an empty result, not a fallback")
- [ ] Add tests for concurrency/TOCTOU mitigations (e.g. concurrent race condition handling, duplicate key / uniqueness collision mapping, optimistic locking conflict)

---

## 3. Validation

Use this repo's actual test/lint/typecheck commands — check its README or contributor guide (e.g. `CLAUDE.md`, `AGENTS.md`) rather than assuming a stack:

- [ ] `[repo's unit test command]` passes
- [ ] `[repo's integration/e2e test command]` passes
- [ ] `[repo's architecture/lint check command, if any]` passes (architecture boundaries unaffected)
- [ ] Manual/local verification if the change has an observable runtime effect (scheduled job output, API response, emitted event/message payload)

---

## 4. Documentation Update (after implementation ships)

Execute the "Impact on Existing Documentation" table from `proposal.md`. Update the existing files in place using whichever mechanism this repo already uses to author that kind of doc — do not create new doc files for a change to an already-documented flow/entity/rule.

| Doc | How to update | Status |
| :--- | :--- | :---: |
| `[business-rule-doc]` | [This repo's mechanism, e.g. a paired skill, or "hand-edit in place"] | 📋 |
| `[entity-doc]` | [Same] | 📋 |
| `[flow-doc]` | [Same] | 📋 |
| `[flow/documentation index, if one exists]` | Manual edit if the flow's summary/status needs updating | 📋 |

---

## 5. Rollout Notes

[Feature flag details if applicable, deployment order, any manual data backfill/migration steps identified as an Open Question in the proposal, and how to confirm the rollout worked (e.g. "next cron run should produce zero FREE rows for zones with no PAID contract").]

---

## 🔗 Related Documentation

- [Proposal](./proposal.md)
- [Flow NN: Name](../../bounded-contexts/[context]/flows/flow-NN-name.md)