# ADR Directory Structure

This document describes the organization of the ADR (Architecture Decision Record) system in SessioFlow.

---

## Directory Structure

```
docs/adr/
├── 001-use-nextjs-as-frontend-framework.md         # Generated ADRs & Amendments
├── 002-use-supabase-for-backend-and-database.md
├── 002-supabase-backend-amendment-ddd-abstraction.md
├── 003-use-docker-compose-for-deployment.md
├── 004-implement-magic-link-authentication.md
├── 004-magic-link-authentication-amendment.md
├── 005-use-supabase-storage-for-files.md
├── 005-supabase-storage-amendment.md
├── 006-use-restful-api-design.md
├── 007-use-zod-for-validation.md
├── 008-implement-comprehensive-testing-strategy.md
├── 009-adopt-domain-driven-design-structure.md
├── 010-use-tailwind-css-for-styling.md
├── 011-use-resend-for-email-communications.md
├── 011-resend-email-amendment.md
├── 012-implement-ci-cd-with-github-actions.md
├── 013-adopt-typescript-with-strict-mode.md
├── 014-use-shadcn-ui-for-components.md
│
├── STRUCTURE.md                                    # This document
├── README.md                                       # Main ADR reference catalog
├── ADR-WORKFLOW.md                                 # Lifecycle, SDLC integration & rules
│
└── _reports/                                       # Generated Reports
    ├── README.md                                   # Reports guide
    ├── ADR_ALTERNATIVES_ANALYSIS.md
    ├── ADR_GENERATION_SUMMARY.md
    ├── EXECUTIVE_SUMMARY.md
    └── TRACEABILITY_MATRIX.md
```

*Note: Templates and automation scripts are stored centrally inside the Skill directory at `.agents/skills/sessioflow-sdlc/adr-manager/`.*

---

## File Categories

### 1. Generated ADRs & Amendments
Individual architectural decision records and refinement deltas.
*   **Location**: `docs/adr/0XX-*.md`
*   **Purpose**: Document specific technical decisions with context, options, and consequences.

---

### 2. Analysis Reports
Generated reports from ADR analysis and tracing workflows.
*   **Location**: `docs/adr/_reports/`
*   **Files**:
    *   `ADR_ALTERNATIVES_ANALYSIS.md` - Technical alternatives analysis
    *   `EXECUTIVE_SUMMARY.md` - Stakeholder executive summary
    *   `ADR_GENERATION_SUMMARY.md` - Initial set mapping summary
    *   `TRACEABILITY_MATRIX.md` - Tracing map to business goals
*   **Purpose**: Provide oversight, goal mapping, and tech stack health metrics.

---

### 3. Dedicated ADR Skills (`.agents/skills/sessioflow-sdlc/`)
Templates and operational logic are distributed into dedicated skills by intention:

| Skill | Path | Primary Role |
| :--- | :--- | :--- |
| `/create-adr` | `.agents/skills/sessioflow-sdlc/create-adr/` | Draft and catalog a new ADR |
| `/amend-adr` | `.agents/skills/sessioflow-sdlc/amend-adr/` | Propose an amendment or technical analysis |
| `/review-adr-alternatives` | `.agents/skills/sessioflow-sdlc/review-adr-alternatives/` | Web research & Tech Radar ecosystem review |
| `/validate-adr` | `.agents/skills/sessioflow-sdlc/validate-adr/` | Quality audit against compliance rubric |

---

## Usage Patterns

### Creating a New ADR
1. **Trigger the skill**:
   ```bash
   /create-adr
   ```
   Or conversational: *"Create a new ADR for Redis caching"*.
2. **Review & validate**:
   ```bash
   /validate-adr
   ```

### Proposing an Amendment
1. **Trigger the skill**:
   ```bash
   /amend-adr
   ```
   Or conversational: *"Amend ADR-016 for controller factories"*.
2. **Review two-way links**: Ensure `Amends` and `Amended By` are present.

### Researching Alternatives
1. **Trigger the review**:
   ```bash
   /review-adr-alternatives
   ```
   Or conversational: *"Review current alternatives for our tech stack"*.

---

## Best Practices

✅ **DO:**
- Use intention-based skills (`/create-adr`, `/amend-adr`, `/review-adr-alternatives`, `/validate-adr`).
- Maintain two-way linking when creating an Amendment.
- Adhere to the naming conventions in `guidelines/adr-naming-conventions.md`.

❌ **DON'T:**
- Silently modify accepted ADRs without an Amendment or successor.
- Leave sequence gaps in ADR numbering.

---

## Navigation

| To Find... | Go To... |
| :--- | :--- |
| Individual ADRs & Amendments | `docs/adr/0XX-*.md` |
| ADR Lifecycle & Management Guide | `docs/adr/ADR-WORKFLOW.md` |
| Create ADR Skill | `.agents/skills/sessioflow-sdlc/create-adr/` |
| Amend ADR Skill | `.agents/skills/sessioflow-sdlc/amend-adr/` |
| Review Alternatives Skill | `.agents/skills/sessioflow-sdlc/review-adr-alternatives/` |
| Validate ADR Skill | `.agents/skills/sessioflow-sdlc/validate-adr/` |
| Analysis Reports | `docs/adr/_reports/` |

---

**Last Updated:** 2026-09-16

