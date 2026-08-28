---
name: modify-flow
description: >-
  Propose and plan a change to an already-documented flow, entity, or business rule — as opposed to
  create-flow-documentation / create-entity-lifecycle, which document a flow for the first time.
  USE THIS SKILL when the user mentions: modify flow, change existing behaviour, disable/remove a feature,
  proposal for a change, modification proposal, change request, "how do we document this change",
  update the business rule, or any request to alter behaviour that already has a shipped flow/entity/BR doc
  under a bounded-context-style docs tree. Language- and framework-agnostic. Produces a proposal.md
  (product rationale + current vs desired behaviour + real-code scope), an implementation-plan.md (phased,
  grounded in whatever layering this specific codebase actually uses), then updates the original
  flow/entity/business-rule docs in place once implemented.
---

# Modify Flow Skill

You are an expert Technical Product Manager and System Architect operating on a codebase that already has
living DDD-style documentation for its flows, entities, and business rules — typically (but not always)
organized under a `bounded-contexts/{context}/{flows,entities,business-rules,invariants}/` tree. Your job is
to turn a requested behaviour change into a **proposal**, then an **implementation plan**, and — only after
the code change is verified — into updates to the **original** flow/entity/business-rule docs. Never create
parallel/duplicate documentation for something that already has a doc; update it in place.

This skill is deliberately **language- and framework-agnostic**. It doesn't assume Kotlin, Gradle, Spring,
or any specific test runner, feature-flag system, or file layout. Every technical reference in the produced
documents must be *this specific codebase's* real file paths, real function/class names, and real commands —
discovered fresh each time, never assumed from a template or from a different project.

This skill exists because many repos either have no modification-proposal convention at all, or default to
a generic template (e.g. a boilerplate feature-spec/dev-plan pair) that doesn't match how the rest of that
repo's documentation is actually organized. Before using this skill's templates verbatim, check Step 0 —
if the target repo already has its own flow/entity/BR documentation convention (e.g. via
`create-flow-documentation` / `create-entity-lifecycle`-style skills), follow *that* repo's convention for
Step 5 instead of inventing a new shape.

---

## 📋 Input Context

Before writing anything, gather:

- **What should change:** [Plain description of the desired behaviour delta, in the user's own words]
- **Which flow(s)/entity(ies)/business rule(s) it touches:** search this repo's product/flow documentation
  tree — do not assume a path, find it (see Step 0 and Step 1)
- **Real code location:** the actual functions/classes/modules that implement the current behaviour — never
  describe scope in terms of a generic template's placeholder paths; use this codebase's real layering,
  whatever language and directory structure it actually uses

---

## Step 0: Discover This Repo's Conventions (Do This First, Every Time)

Do not assume any of the following — they vary per repo and must be (re)discovered each time this skill
runs:

1. **Docs location & shape:** find where flow/entity/business-rule documentation actually lives (grep for
   terms like "flow", "business rule", "bounded context", "entity lifecycle" across the repo's docs
   directories). Note the exact folder structure and file naming convention in use.
2. **Language & source layout:** identify the implementation language(s) and how source is organized
   (e.g. layered `domain/application/infrastructure`, feature-first modules, monorepo packages — whatever
   it actually is).
3. **Test/build/lint commands:** find the real commands from the repo's own README, contributor guide
   (`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`), or build config — never assume `npm test` or `./gradlew`
   or any other stack's defaults.
4. **Feature-flag system, if any:** check whether the repo already has one (any name — Unleash, LaunchDarkly,
   a config toggle, an env var convention) before assuming a new one is needed.
5. **Existing modification-proposal precedent:** check whether the repo already has a "proposal" or
   "change request" convention (an `openspec/`-style folder, an ADR process, a "working docs" folder) — if
   so, prefer reusing that shape over this skill's templates; if not, use `templates/proposal.md` /
   `templates/implementation-plan.md` as-is.

---

## Step 1: Ground the Change in Reality Before Writing Anything

1. Read this repo's root flow/documentation index (whatever Step 0 found) — identify which flow(s) this
   change affects.
2. Read the affected flow doc(s), entity doc(s), and business rule doc(s). These are usually **derived**
   docs — extracted from an earlier upstream source (a journey, a brainstorming/feature-scoping pass).
3. **Do not trust the docs alone** — grep/read the real source files the docs point to (function/class
   names). Docs can be stale; the code is truth. If you're using an Explore-style agent for this, ask it to
   report the actual current logic, not just summarize the doc.
4. **Trace every derived doc back to its upstream source, and check that source for staleness too** — not
   just for context. If this repo has upstream product docs (journeys, personas, brainstorming/feature-
   scoping docs), the derived flow/entity/BR doc almost never repeats the full upstream content verbatim —
   the upstream doc typically has its own copy of the same fact (a formula, a step, a diagram) that will
   also go stale if this change ships. Read every upstream doc a derived doc links back to and check
   line-by-line whether it states the current (pre-change) behaviour as fact. Two distinct outcomes:
   - **Living upstream doc that states current behaviour as present-tense fact** (e.g. a journey's
     step-by-step table) → goes stale, must be edited. List it.
   - **Frozen historical record of a past decision** (e.g. a workshop/brainstorming artifact scoping the
     original feature) → do **not** rewrite; it's a record of what was decided *then*. Instead, the
     *derived* doc's changelog/history section should forward-link to this proposal so a reader tracing
     the frozen record forward can find the reversal. Note this distinction explicitly in the proposal —
     don't silently skip the frozen doc, and don't silently rewrite it either.
5. While reading upstream docs, also note who is affected (personas) and whether this reverses or extends
   an already-scoped feature — this feeds Section 1 (Product Rationale), not just Section 7.
6. Check whether a feature flag already exists for this behaviour (per Step 0's finding) — state explicitly
   in the proposal whether one exists or would need to be created.
7. **Perform Concurrency, TOCTOU & Invariant Impact Analysis** — evaluate if modifying this flow introduces
   new race conditions, check-then-act vulnerabilities, or alters domain invariant enforcements (e.g. database-level
   unique indexes, optimistic locking versioning, aggregate consistency boundaries, or transaction isolation).

---

## Step 2: Write the Proposal

Use `templates/proposal.md`. Save it next to wherever this repo keeps in-progress/pre-implementation
product docs, if such a place exists (Step 0). If not, propose a location such as a `workin-on/` or
`proposals/` folder alongside the existing flow documentation tree, and confirm it with the user before
writing there.

Name the folder/file with a kebab-case slug matching the git branch name where possible.

### Structure & Formatting Rules

- **Section 1, "Product Rationale," stays product-shaped like this repo's own persona/journey docs (if it
  has them)** — this is the one section that should NOT default to a table:
  - `As a / I want to / So that` — always bullets, matching this repo's own Overview/journey style if one
    exists. Never tabulate a 3-line narrative statement.
  - **Personas Affected** — a table (`Persona | Current Experience | Experience After This Change`).
    Link to this repo's own persona docs if it has them; otherwise describe the affected user/role inline.
  - **Business Value & Why It Matters** — a table (`Aspect | Detail`). Even though these often start as a
    handful of prose bullets, convert them to a table once there are 2+ items that share the same
    "aspect → explanation" shape — it's more scannable and matches the rest of the document.
  - **Known Gaps Introduced** — bullets, not a table. A single flagged gap doesn't benefit from a table
    (one-row tables just add visual noise); omit the section entirely if there's no new gap.
- **Section 4, "🛡️ Concurrency, TOCTOU & Invariant Integrity Analysis"** — must evaluate whether the
  modified flow changes check-then-act sequences, concurrent state changes, uniqueness guarantees, or
  requires new database/locking constraints to protect domain invariants.
- **All other sections default to tables** (Current Behaviour, Desired Behaviour, Why, Scope of Change,
  Impact on Existing Documentation, Open Questions). Prefer `Aspect/Step | Detail` or `Before | After`
  shaped tables over paragraphs — match whatever this repo's existing docs already favor for enumerable
  content (check a couple of its existing flow/entity docs first). Rule of thumb: if you're about to write
  2 or more bullet points that share the same implicit column structure (a label and an explanation, a
  before and an after), make it a table instead.
- **Cite real file paths and function/method names in every technical section** — no
  `[EntityName]`-style placeholders in the delivered document (placeholders are only for the template
  itself).
- **Number sections sequentially** and keep the numbering consistent if you add/remove a section — don't
  leave two sections sharing the same number.
- Link every affected BR/entity/flow doc using relative markdown links, and add this proposal to their
  eventual update list (the "Impact on Existing Documentation" section).
- **Split "Impact on Existing Documentation" into two groups if this repo has upstream product docs**:
  derived bounded-context/flow docs (always edited) vs. upstream inception-style docs (journeys/personas —
  edited only where they state current behaviour as present-tense fact; brainstorming/feature-scoping
  artifacts left untouched as frozen history, per Step 1.4). Don't collapse these into one table — a
  reader deciding what to touch needs the "why" for each group, and the "leave alone" decisions need to be
  as visible as the "edit this" ones.
- If the proposal reverses part of an already-shipped feature, say so explicitly and link the original
  feature-scoping doc if this repo has one — don't silently contradict a shipped decision.

### Before Finalizing

- [ ] Every code reference has been verified against the actual source file, not assumed
- [ ] Every derived doc's upstream source has been traced and checked for staleness (Step 1.4) — not just
      read for context
- [ ] Concurrency, TOCTOU, and invariant risks evaluated in Section 4
- [ ] Open Questions table captures every undecided fork (rollout strategy, dead-code removal scope,
      migration/backfill needs) — do not resolve these on the user's behalf
- [ ] Ask the user to confirm or resolve Open Questions before moving to the implementation plan

---

## Step 3: Write the Implementation Plan

Only after the proposal's Open Questions are resolved. Use `templates/implementation-plan.md`. Save it
alongside the proposal, in the same folder.

- Phases must be derived from the proposal's **Scope of Change** table — one phase per real
  file/component, ordered **inside-out** matching this specific codebase's actual layering, whatever that
  is (do not impose domain/application/infrastructure, CQRS modules, MVC, or any other template if the
  repo is organized differently — use Step 0's findings).
- Each phase follows this repo's own test-authoring convention (test-first if it does TDD; otherwise match
  its existing pattern), then implement, then remove dead code identified in the proposal (no
  commented-out code, no orphaned flags unless staged rollout was an explicit decision in the proposal).
- Ensure integration and acceptance test phases include cases for concurrency/TOCTOU mitigations and invariant guards.
- Include a Documentation Update section listing exactly which existing docs get touched and with which
  mechanism this repo uses to (re)generate them, if any (e.g. a paired "create entity/flow documentation"
  skill) — otherwise state that the docs will be hand-edited in place. Never plan to create a new doc file
  for something that already has one.

---

## Step 4: Implement

Follow this repo's own documented conventions (its `CLAUDE.md`/`AGENTS.md`/README, or equivalent) rather
than any generic process — skip steps that assume infrastructure this repo doesn't have (e.g. an ADR index)
unless Step 0 confirmed it exists. Work phase by phase from the implementation plan, checking off tasks as
they complete. Run this repo's real validation commands (found in Step 0) before marking a phase done.

---

## Step 5: Update the Original Docs (Post-Implementation)

Once the change is implemented and verified:

1. Update each affected doc **in place**, using whichever mechanism this repo already uses to author that
   kind of doc (Step 0) — e.g. if it has a paired skill for generating entity/business-rule/flow docs,
   re-invoke that skill on the existing file rather than writing free-hand.
2. Do **not** create new rule/invariant IDs for a modified rule unless the change is genuinely a new rule
   coexisting with the old one — a change that replaces the old formula updates the same rule doc, keeping
   its ID, and gets a dated entry in that doc's history/changelog section if it has one.
3. **Update both layers identified in the proposal's split "Impact on Existing Documentation" section** —
   the derived docs AND the living upstream docs (journeys/personas) that stated the old behaviour as
   present-tense fact. Updating only the derived layer and leaving a stale journey/persona doc behind is an
   incomplete change. Leave frozen brainstorming/feature-scoping artifacts untouched, as decided in the
   proposal — do not retroactively edit history.
4. Update this repo's flow/documentation index only if the change makes an existing summary/status/table
   row inaccurate.
5. Mark the implementation plan's Documentation Update table complete.

---

## 📚 Bundled Resources

| Template | Purpose |
|----------|---------|
| `templates/proposal.md` | Modification proposal — product rationale + current/desired behaviour + real-code scope |
| `templates/implementation-plan.md` | Phased implementation plan derived from the proposal's scope table |

## 🔗 Related Skills

If this repo has skills for first-time flow/entity documentation (any name — e.g.
`create-flow-documentation`, `create-entity-lifecycle`), treat them as the authority for Step 5: reuse their
document structure and, where applicable, invoke them directly to regenerate an existing doc rather than
hand-editing it.

---

**Version:** 1.1 — generalized to be language- and framework-agnostic; no longer assumes a specific repo's
stack, folder names, or sibling skills.