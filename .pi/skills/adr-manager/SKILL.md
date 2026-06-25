---
name: adr-manager
description: >-
  Manage Architectural Decision Records (ADRs) and Amendments.
  LOAD THIS SKILL when user mentions: adr, architecture decision record,
  create adr, validate adr, adr summary, traceability matrix,
  alternatives analysis, adr alternatives, challenge adr, adr amendment,
  amend adr, update adr, adr workflow.
  Executes generation, validation, summarization, traceability matrix,
  alternatives analysis, and amendment workflows.
---

# ADR Manager Skill

Standardize and automate the lifecycle of Architecture Decision Records (ADRs) and Amendments across the repository. This skill provides a set of structured commands/modes to guide the AI and developers through generation, validation, indexing, and alternatives analysis.

---

## Natural Language Activation

This skill can be triggered using conversational phrases instead of command-line flags. The system will automatically detect your intent and activate the appropriate mode.

### Natural Language Command Patterns

| Intent | Natural Language Examples | Mode Activated |
| :--- | :--- | :--- |
| **Generate ADR** | "Create a new ADR for Auth0", "Draft a frontend framework ADR" | `--mode generate` |
| **Validate ADR** | "Validate ADR-002", "Check the quality of ADR-004" | `--mode validate --file docs/adr/0XX-*.md` |
| **Summarize ADRs** | "Create the ADR summary report", "Summarize all ADRs" | `--mode summary` |
| **Build Traceability** | "Generate the traceability matrix", "Map ADRs to inception goals" | `--mode traceability` |
| **Analyze Alternatives** | "Research alternatives for our tech stack", "Run alternatives analysis" | `--mode alternatives` |
| **Update Main Index** | "Update the ADR index README", "Index the new ADRs" | `--mode index` |
| **Amend Existing ADR** | "Amend ADR-002 with DDD", "Create a database amendment" | `--mode amend --file docs/adr/0XX-*.md` |

---

## Command-Line Interface

### Run ADR Workflow Mode

```bash
pi skill adr-manager --mode [generate|validate|summary|traceability|alternatives|index|amend] [--file docs/adr/0XX-*.md] [--adr-id 0XX]
```

**Options:**
*   `--mode generate` - Interactively generate a new ADR from inception constraints or technical requirements.
*   `--mode validate` - Audit and validate the quality of a specific ADR file.
*   `--mode summary` - Compile the generation summary report across all ADRs.
*   `--mode traceability` - Rebuild the matrix mapping ADRs back to business/product goals.
*   `--mode alternatives` - Run the periodic alternatives analysis against current industry best practices.
*   `--mode index` - Re-index the catalog and update statistics in the main ADR README.
*   `--mode amend` - Draft and index a delta amendment for an existing decision.

---

## Workflows

### 1. Mode: Generate (`--mode generate`)
*   **Purpose**: Create a new ADR.
*   **Process**:
    1. Read the guidelines in `references/1-generate-adrs-from-inception.md`.
    2. Copy the template from `templates/TEMPLATE.md` to `docs/adr/0XX-your-decision-name.md`.
    3. Fill in context, considered options, pros/cons, and consequences.
    4. Auto-transition to `--mode validate` to check quality.

### 2. Mode: Validate (`--mode validate`)
*   **Purpose**: Audit an ADR for compliance.
*   **Process**:
    1. Read `references/2-ADR-validator.md`.
    2. Audit the target `--file` against the Checklist (Metadata, Context, Options, Outcome, Consequences).
    3. Score the ADR (High / Medium / Low). If < Medium, prompt the user for revision.

### 3. Mode: Summary (`--mode summary`)
*   **Purpose**: Compile the aggregated health report.
*   **Process**:
    1. Read `references/3-generate-adr-summary.md`.
    2. Analyze all active ADRs in `docs/adr/` against inception goals.
    3. Output the report to `docs/adr/_reports/ADR_GENERATION_SUMMARY.md` using `templates/TEMPLATE-ADR_GENERATION_SUMMARY.md`.

### 4. Mode: Traceability (`--mode traceability`)
*   **Purpose**: Track tech decisions against business vision.
*   **Process**:
    1. Read `references/4-generate-traceability-matrix.md`.
    2. Map every ADR to product goals, pain points, and MVP constraints.
    3. Save the matrix to `docs/adr/_reports/TRACEABILITY_MATRIX.md` using `templates/TEMPLATE-TRACEABILITY_MATRIX.md`.

### 5. Mode: Alternatives (`--mode alternatives`)
*   **Purpose**: Perform periodic reviews of the tech stack.
*   **Process**:
    1. Read `references/5-analyze-adr-alternatives.md`.
    2. Evaluate all active ADRs against the current technology landscape.
    3. Generate the comprehensive analysis in `docs/adr/_reports/ADR_ALTERNATIVES_ANALYSIS.md` using `templates/TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md`.
    4. Generate the stakeholder executive summary in `docs/adr/_reports/EXECUTIVE_SUMMARY.md` using `templates/TEMPLATE-EXECUTIVE_SUMMARY.md`.

### 6. Mode: Index (`--mode index`)
*   **Purpose**: Keep the ADR index up to date.
*   **Process**:
    1. Read `references/6-update-adr-readme.md`.
    2. Update the quick reference tables, status column, statistics block, and last-updated date in `docs/adr/README.md`.

### 7. Mode: Amend (`--mode amend`)
*   **Purpose**: Refine an existing decision.
*   **Process**:
    1. Read `references/7-generate-adr-amendment.md`.
    2. Identify the target ADR and create a new file named `{num}-01-{topic}-amendment-{type}.md`.
    3. Copy the template from `templates/TEMPLATE-AMENDMENT.md` and complete it.
    4. Set up the two-way links in the headers of both files (`Amends` / `Amended By`).
    5. Run `--mode index` to record the new amendment.

### 8. Mode: Analyze (`--mode analyze`)
*   **Purpose**: Create analysis documents for an ADR.
*   **Process**:
    1. Read `references/8-adr-naming-convention.md`.
    2. Identify the target ADR and create a new file named `{num}-02-{topic}-analysis-{subtype}.md`.
    3. Copy the template from `templates/TEMPLATE-ANALYSIS.md` and complete it.
    4. Run `--mode index` to record the new analysis.

---

## File Naming Conventions

### Standard ADR Format
```
{number}-{sequence}-{topic}.md
Example: 002-00-use-supabase-for-backend-and-database.md
```

### Amendment Format
```
{number}-{sequence}-{topic}-amendment-{type}.md
Example: 002-01-use-supabase-amendment-ddd-abstraction.md
```

### Analysis Format
```
{number}-{sequence}-{topic}-analysis-{subtype}.md
Example: 002-02-use-supabase-analysis-vendor-lock-in.md
```

### Impact Analysis Format
```
{number}-{sequence}-{topic}-impact-analysis.md
Example: 002-04-use-supabase-impact-analysis.md

Impact analyses document the effects of a decision or amendment on other ADRs and should be created when:
- A significant amendment is made (e.g., adding DDD abstraction)
- A decision affects multiple other decisions
- Cross-cutting concerns are identified
```

### Sequence Numbers
- `00` = Original ADR
- `01` = First amendment
- `02` = First analysis document
- `03` = Second analysis document
- `04` = Impact analysis
- Continue incrementing for additional documents

**Important:** Impact analyses (04) should be marked as "Completed" once all affected ADRs have been amended or documented.

### Status Values
| Status | Meaning | When to Use |
|--------|---------|-------------|
| **Proposed** | Under consideration | Initial creation, awaiting review |
| **Accepted** | Approved and active | Decision is approved for implementation |
| **Approved** | Same as Accepted | Alternative term for approved decisions |
| **Completed** | Analysis/Impact document finished | Impact analyses, summaries, reports |
| **Superseded** | Replaced by newer decision | Original decision has been amended or replaced |
| **Rejected** | Not adopted | Decision was considered but rejected |
| **Deprecated** | Obsolete | No direct replacement, but no longer valid |

**Note:** "Accepted" and "Approved" are interchangeable. Use "Approved" for decisions and "Accepted" for analyses.

### Bundled Assets

This skill includes all required templates and validators as bundled assets:


### Templates (in `templates/` directory)
*   `templates/TEMPLATE.md` - Standard ADR structure
*   `templates/TEMPLATE-ADR_VALIDATOR.md` - Validation checklist
*   `templates/TEMPLATE-ADR_GENERATION_SUMMARY.md` - Aggregated summary report
*   `templates/TEMPLATE-TRACEABILITY_MATRIX.md` - Goal traceability matrix
*   `templates/TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` - Technology alternative analysis
*   `templates/TEMPLATE-EXECUTIVE_SUMMARY.md` - Stakeholder presentation
*   `templates/TEMPLATE-AMENDMENT.md` - ADR Amendment structure

### References (in `references/` directory)
*   `references/0-ADR-WORKFLOW.md` - General lifecycle overview
*   `references/1-generate-adrs-from-inception.md` - Inception-to-ADR mapping guide
*   `references/2-ADR-validator.md` - Quality audit rules
*   `references/3-generate-adr-summary.md` - Summarization rules
*   `references/4-generate-traceability-matrix.md` - Business tracing rules
*   `references/5-analyze-adr-alternatives.md` - Stack evaluation rules
*   `references/6-update-adr-readme.md` - Indexing rules
*   `references/7-generate-adr-amendment.md` - Amendment proposal guidelines
*   `references/8-adr-naming-convention.md` - File naming conventions (NEW)

---

## Final Quality Checklist

Before completing any ADR manager task, verify:
*   [ ] The sequential number is correct.
*   [ ] The file is saved in `docs/adr/` with relative links.
*   [ ] The status is correctly updated in `docs/adr/README.md`.
*   [ ] If it is an amendment, both files are linked (`Amends` / `Amended By`).
*   [ ] The statistics block has been incremented.
