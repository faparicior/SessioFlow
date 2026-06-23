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
│
└── _reports/                                       # Generated Reports
    ├── README.md                                   # Reports guide
    ├── ADR_ALTERNATIVES_ANALYSIS.md
    ├── ADR_GENERATION_SUMMARY.md
    ├── EXECUTIVE_SUMMARY.md
    └── TRACEABILITY_MATRIX.md
```

*Note: Templates and automation scripts are stored centrally inside the Pi Skill directory at `.pi/skills/adr-manager/`.*

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

### 3. Skill & Templates Directory (`.pi/skills/adr-manager/`)
All templates and command guides are bundled inside the `adr-manager` Pi Skill directory to keep the codebase clean and avoid duplication.

*   **Templates Location**: `.pi/skills/adr-manager/templates/`

| Template | Use For |
| :--- | :--- |
| `TEMPLATE.md` | Creating new individual ADRs |
| `TEMPLATE-ADR_VALIDATOR.md` | Validating ADR quality |
| `TEMPLATE-ADR_GENERATION_SUMMARY.md` | Summarizing ADR generation |
| `TEMPLATE-TRACEABILITY_MATRIX.md` | Creating traceability matrix |
| `TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` | Analyzing alternatives |
| `TEMPLATE-EXECUTIVE_SUMMARY.md` | Creating executive summary |
| `TEMPLATE-AMENDMENT.md` | Proposing an ADR amendment |

---

## Usage Patterns

### Creating a New ADR
1. **Trigger the generator mode via Pi CLI**:
   ```bash
   pi skill adr-manager --mode generate
   ```
2. **Edit and fill in the newly created ADR**.
3. **Validate using the validator mode**:
   ```bash
   pi skill adr-manager --mode validate --file docs/adr/0XX-your-decision.md
   ```

### Proposing an Amendment
1. **Trigger the amendment mode via Pi CLI**:
   ```bash
   pi skill adr-manager --mode amend --file docs/adr/0XX-original-adr.md
   ```
2. **Complete the generated template** and validate.

---

## References

### Command Guides (within Pi Skill)
*   **Workflow**: `.pi/skills/adr-manager/references/0-ADR-WORKFLOW.md`
*   **Generate ADRs**: `.pi/skills/adr-manager/references/1-generate-adrs-from-inception.md`
*   **Validate**: `.pi/skills/adr-manager/references/2-ADR-validator.md`
*   **Summary**: `.pi/skills/adr-manager/references/3-generate-adr-summary.md`
*   **Traceability**: `.pi/skills/adr-manager/references/4-generate-traceability-matrix.md`
*   **Alternatives**: `.pi/skills/adr-manager/references/5-analyze-adr-alternatives.md`
*   **Amendments**: `.pi/skills/adr-manager/references/7-generate-adr-amendment.md`

### Quick References
*   **Skill README**: `.pi/skills/adr-manager/README.md`

---

## Best Practices

✅ **DO:**
- Run the `adr-manager` Pi Skill to perform all operations.
- Reference templates stored inside `.pi/skills/adr-manager/templates/`.
- Maintain two-way linking when creating an Amendment.

❌ **DON'T:**
- Create ad-hoc template directories outside the Pi Skill.
- Modify active decisions without documenting them as Amendments or new ADRs.

---

## Navigation

| To Find... | Go To... |
| :--- | :--- |
| Individual ADRs & Amendments | `docs/adr/0XX-*.md` |
| Skill Configuration & Guide | `.pi/skills/adr-manager/` |
| Templates | `.pi/skills/adr-manager/templates/` |
| Command Guides | `.pi/skills/adr-manager/references/` |
| Analysis Reports | `docs/adr/_reports/` |

---

**Last Updated:** 2026-06-23
