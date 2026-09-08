# Skill Decision & Autonomy Guidelines

Guide for designing agent skills (`SKILL.md`) and document templates that make smart autonomous decisions, record their rationale, and avoid unnecessary user interruptions.

---

## 1. The Problem: "Why does the LLM ask all the time?"

By default, LLMs and AI coding agents are trained with conversational safety biases: when facing minor ambiguities, unspecified details, or multiple valid technical options, they default to pausing execution and asking the user questions.

While asking is appropriate for high-risk, destructive actions, excessive questioning causes friction:

- It breaks agentic flow and autonomous execution loops.
- It forces the user to micromanage low-level implementation details.
- It creates conversational fatigue.

**Goal**: Enable skills to instruct the LLM to **decide autonomously using sensible defaults**, **proceed without interrupting**, and **"shed light" on decisions taken** by documenting them in a structured log for retrospective user review.

---

## 2. Established Repository Standard: The "Lack of Information Log"

This pattern is already standard in this repository across `.pi/skills/` and lived-in feature documents:

### Active Skills & Templates

1. **[.pi/skills/implement-flow/SKILL.md](../.pi/skills/implement-flow/SKILL.md)**:
   - **Step 2 (Feature Specs)**: Mandates logging all judgment calls, fallback ports, error code mappings, or tie-breakers in the `🧠 Agent Design Decisions & Assumptions` section.
   - **Step 3 (Flow Plan)**: Consolidates all architectural choices and runtime configurations into the same log.
2. **[templates/feature-specification.md](../.pi/skills/implement-flow/templates/feature-specification.md)**:
   - Standardizes the table format for per-feature decision logging.
3. **[templates/flow-development-plan.md](../.pi/skills/implement-flow/templates/flow-development-plan.md)**:
   - Standardizes the table format for flow-level decision tracking.
4. **[.pi/skills/modify-flow/templates/proposal.md](../.pi/skills/modify-flow/templates/proposal.md)**:
   - Uses `Scope of Change` with explicit `Out — needs decision` tags and an `Open Questions` section for intentional escalations.

### Real Codebase Example

In [feature-01-conference-creation-with-cfp.md](./product/bounded-contexts/conference/flows/features/feature-01-conference-creation-with-cfp.md), rather than pausing execution to prompt the user 13 times, the LLM logged decisions **D1 through D13** in this table:

| # | Topic / Area | Documentation State / Gap | Decision / Judgment Made | Status |
| :--- | :--- | :--- | :--- | :--- |
| D1 | Slug collision policy | Conflict between auto-suffix in BR and 409 in E2E | Hard-fail with `SlugExistsError` (409), no auto-suffixing — executable E2E contract wins | 📋 Proposed |
| D2 | Error transport | `ARCHITECTURE-RULES.md` mentions `Result<T>` but package only has exceptions | Domain throws `DomainError`; controller maps to HTTP response | 📋 Proposed |
| D3 | CfP start date boundary | VO doc says future; flow doc says `>= today` | Start date may be **today**, matching flow doc + E2E | 📋 Proposed |
| D7 | Welcome email / Outbox | Flow doc shows email; ADR-011-01 makes email optional | Out of scope for Wave 1: persist outbox events as `PENDING`, zero new infrastructure | 📋 Proposed |

---

## 3. The 3 Sections to Include in Skills & Templates

To achieve autonomous execution with full transparency, incorporate these three sections into your skills and templates:

### Section A: Autonomous Decisions & Sensible Defaults (Heuristics)

Provide an explicit lookup table of fallback heuristics so the LLM knows what to pick without asking:

```markdown
## Autonomous Decisions & Sensible Defaults

When requirements leave room for interpretation or when multiple valid implementations exist, **do NOT stop to ask the user**. Proceed autonomously using the following precedence:

| Decision Domain | Default Choice | Rationale / Heuristic |
| :--- | :--- | :--- |
| **Dependencies** | Use existing workspace dependencies | Avoid adding new packages unless strictly required |
| **Architecture** | Follow established DDD & project conventions | Consistency with existing codebase patterns |
| **Naming & Style** | Match surrounding files (kebab-case files, PascalCase classes) | Adhere to workspace linter and conventions |
| **Data Types** | Strict TypeScript domain Value Objects | Favor type safety and domain invariants over primitives |
| **Error Handling** | Throw domain-specific DomainErrors | Bubble up to controller error mappers |
```

---

### Section B: The "Lack of Information Log" (Shedding Light)

Direct the LLM to record every assumption and decision in a standard table format inside the generated artifact or plan:

```markdown
## 🧠 Agent Design Decisions & Assumptions (Lack of Information Log)
*Documents all judgment calls, assumptions, and tie-breakers made by the LLM for this feature.*

| # | Topic / Area | Documentation State / Gap | Decision / Judgment Made | Status |
|---|--------------|---------------------------|--------------------------|--------|
| D1 | [e.g. Error Mapping] | [What docs specified vs what was missing] | [Chosen solution / default] | 📋 Proposed / ✅ Approved |
| D2 | [e.g. Runtime Port]  | [Unspecified configuration detail]       | [Picked 3010 to match Next.js frontend] | 📋 Proposed / ✅ Approved |
```

---

### Section C: Escalation Boundaries (When to Decide vs. When to Ask)

Provide explicit rules distinguishing autonomous decisions from operations that require human approval:

```markdown
## Decision vs. Escalation Matrix

### ✅ Decide Autonomously (Proceed & Document in Output)
- Internal class/function signatures, private helpers, and refactoring
- Choosing between standard, non-breaking design patterns
- File structure and organization following existing conventions
- Writing unit and integration tests for new logic
- Edge-case handling that preserves backward compatibility
- Resolving document gaps using surrounding project context

### ⚠️ Stop and Ask the User (Escalate Before Proceeding)
- Destructive operations (dropping database tables, deleting modules, removing public APIs)
- Adding new external third-party dependencies or paid services
- Breaking changes to external API contracts or public routes
- Security or authentication strategy modifications
- Modifying immutable architectural test suites (`tests/unit/architecture/`)
```

---

## 4. Macro Decisions vs. Micro/Flow Decisions

| Scope | Mechanism | Managed By | Where It Lives |
| :--- | :--- | :--- | :--- |
| **Micro / Flow** | Lack of Information Log table | Feature specs & flow plans (`implement-flow`, `modify-flow`) | `features/feature-XX.md`, `[flow]-plan.md` |
| **Macro / Architecture** | Architecture Decision Records (ADRs) | Architecture team & `adr-manager` skill | `docs/adr/0XX-*.md`, [docs/adr/README.md](./adr/README.md) |

- When a micro decision establishes a repository-wide architectural precedent, escalate it to a proposed ADR using `/adr-manager`.
- Otherwise, keep it localized within the feature specification's Lack of Information Log.

---

## 5. Complete Drop-in Template for New Skills (`SKILL.md`)

```markdown
---
name: example-workflow-skill
description: Run an end-to-end task autonomously while logging architectural decisions.
---

# Example Workflow

## Autonomy Directive
Operate autonomously by default. When encountering ambiguous requirements or optional paths:
1. Apply the default heuristics below without stopping to query the user.
2. Complete the full execution workflow.
3. Record all decisions made in the `🧠 Agent Design Decisions & Assumptions (Lack of Information Log)` section.

## Sensible Defaults Matrix
- **Pattern Selection**: Use the existing domain/application/infrastructure layer pattern.
- **Validation**: Use Zod schemas matching existing contracts.
- **Naming**: Follow project conventions in `AGENTS.md`.

## Escalation Rules
Only pause to prompt the user if:
- A required database migration would cause irrecoverable data loss.
- A change breaks external public API contracts.

## Execution Steps
1. Inspect context and identify gaps.
2. Choose defaults according to the heuristics table.
3. Generate the document or code, including the Lack of Information Log.
```
