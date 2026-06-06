# ADR Directory Structure

This document describes the organization of the ADR (Architecture Decision Record) system in SessioFlow.

---

## Directory Structure

```
docs/adr/
├── 001-use-nextjs-as-frontend-framework.md         # Generated ADRs
├── 002-use-supabase-for-backend-and-database.md
├── 003-use-docker-compose-for-deployment.md
├── 004-implement-magic-link-authentication.md
├── 005-use-supabase-storage-for-files.md
├── 006-use-restful-api-design.md
├── 007-use-zod-for-validation.md
├── 008-implement-comprehensive-testing-strategy.md
├── 009-use-feature-based-project-structure.md
├── 010-use-tailwind-css-for-styling.md
├── 011-use-resend-for-email-communications.md
├── 012-implement-ci-cd-with-github-actions.md
├── 013-adopt-typescript-with-strict-mode.md
├── 014-use-shadcn-ui-for-components.md
│
├── STRUCTURE.md                                    # This document
├── README.md                                       # Quick reference
│
└── _reports/                                       # Generated Reports
    ├── README.md                                   # Reports guide
    ├── ADR_ALTERNATIVES_ANALYSIS.md
    ├── ADR_GENERATION_SUMMARY.md
    ├── EXECUTIVE_SUMMARY.md
    └── TRACEABILITY_MATRIX.md
│
└── _templates/                                     # Template Directory
    ├── README.md                                   # Template Guide
    ├── TEMPLATE.md                                 # Individual ADR Template
    ├── TEMPLATE-ADR_VALIDATOR.md                   # Quality Validation
    ├── TEMPLATE-ADR_GENERATION_SUMMARY.md          # Generation Summary
    ├── TEMPLATE-TRACEABILITY_MATRIX.md             # Traceability Matrix
    ├── TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md       # Alternatives Analysis
    └── TEMPLATE-EXECUTIVE_SUMMARY.md               # Executive Summary
```

---

## File Categories

### 1. Generated ADRs (001-014)
Individual architectural decision records following the `TEMPLATE.md` format.

**Location:** `docs/adr/0XX-*.md`

**Purpose:** Document specific architectural decisions with context, options, and consequences.

---

### 2. Analysis Reports
Generated reports from ADR analysis workflows.

**Location:** `docs/adr/_reports/`

**Files:**
- `ADR_ALTERNATIVES_ANALYSIS.md` - Comprehensive alternatives analysis
- `EXECUTIVE_SUMMARY.md` - Executive summary of alternatives analysis
- `ADR_GENERATION_SUMMARY.md` - Summary of ADR generation process
- `TRACEABILITY_MATRIX.md` - Mapping of ADRs to requirements

**Purpose:** Provide oversight and analysis of the ADR set.

---

### 3. Templates Directory (`_templates/`)
All templates for creating and managing ADRs.

**Why `_templates/`?**
- Hidden from main file listing (underscore prefix)
- Clearly separates templates from generated content
- Easy to reference in command documents
- Scales well as the number of ADRs grows

**Templates:**

| Template | Use For |
|----------|---------|
| `TEMPLATE.md` | Creating new individual ADRs |
| `TEMPLATE-ADR_VALIDATOR.md` | Validating ADR quality |
| `TEMPLATE-ADR_GENERATION_SUMMARY.md` | Summarizing ADR generation |
| `TEMPLATE-TRACEABILITY_MATRIX.md` | Creating traceability matrix |
| `TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` | Analyzing alternatives |
| `TEMPLATE-EXECUTIVE_SUMMARY.md` | Creating executive summary |

**Reference Docs:**
- `README.md` - Template directory guide
- `README_TEMPLATES.md` - Quick reference for all templates
- `ADR_TEMPLATE_SYSTEM_SUMMARY.md` - Complete system overview

---

## Usage Patterns

### Creating a New ADR

```bash
# 1. Copy template
cp docs/adr/_templates/TEMPLATE.md docs/adr/015-decision-name.md

# 2. Edit and fill in the ADR
# 3. Validate with TEMPLATE-ADR_VALIDATOR.md
```

### Running Alternatives Analysis

```bash
# 1. Follow command: docs/commands/adr/5-analyze-adr-alternatives.md
# 2. Use templates:
#    - _templates/TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md
#    - _templates/TEMPLATE-EXECUTIVE_SUMMARY.md
# 3. Output to: _reports/ADR_ALTERNATIVES_ANALYSIS.md
```

---

## References

### Command Documents
- **Workflow:** `docs/commands/adr/0-ADR-WORKFLOW.md`
- **Generate ADRs:** `docs/commands/adr/1-generate-adrs-from-inception.md`
- **Validate:** `docs/commands/adr/2-ADR-validator.md`
- **Summary:** `docs/commands/adr/3-generate-adr-summary.md`
- **Traceability:** `docs/commands/adr/4-generate-traceability-matrix.md`
- **Alternatives:** `docs/commands/adr/5-analyze-adr-alternatives.md`

### Quick References
- **Templates Guide:** `docs/adr/_templates/README_TEMPLATES.md`
- **System Overview:** `docs/adr/_templates/ADR_TEMPLATE_SYSTEM_SUMMARY.md`
- **Template Directory:** `docs/adr/_templates/README.md`

---

## Best Practices

✅ **DO:**
- Use templates consistently
- Keep templates in `_templates/` directory
- Reference templates using `_templates/TEMPLATE-*.md`
- Generate reports in the main `docs/adr/` directory
- Maintain clear separation between templates and generated content

❌ **DON'T:**
- Store templates in the main ADR directory
- Mix templates with generated ADRs
- Hard-code template paths (use `_templates/` prefix)
- Create ADRs without validation

---

## Navigation

| To Find... | Go To... |
|------------|----------|
| Individual ADRs | `docs/adr/0XX-*.md` |
| Templates | `docs/adr/_templates/` |
| Reports | `docs/adr/_reports/` |
| Command Guides | `docs/commands/adr/` |
| Analysis Reports | `docs/adr/` (root) |
| Template Help | `docs/adr/_templates/README.md` |

---

**Last Updated:** 2026-06-06
