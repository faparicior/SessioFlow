# ADR Workflow

This document provides an overview of the complete ADR (Architectural Decision Record) workflow for SessioFlow, including both generation and analysis processes.

---

## Workflow Overview

The ADR lifecycle consists of **two workflows**: initial generation and ongoing analysis.

### ADR Generation Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ADR GENERATION WORKFLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Analyze Inception → 2. Generate ADRs → 3. Validate Quality     │
│         ↓                      ↓                      ↓            │
│  4. Create Summary → 5. Build Traceability Matrix                  │
│         ↓                      ↓                                    │
│  Final Deliverables: ADR_GENERATION_SUMMARY.md +                    │
│                      TRACEABILITY_MATRIX.md                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### ADR Analysis Workflow (Ongoing)

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ADR ALTERNATIVES ANALYSIS                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Inventory ADRs → 2. Research Alternatives → 3. Evaluate        │
│         ↓                      ↓                      ↓            │
│  4. Identify Themes → 5. Generate Recommendations                   │
│         ↓                                                             │
│  Final Deliverables: ADR_ALTERNATIVES_ANALYSIS.md +                 │
│                      EXECUTIVE_SUMMARY.md                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Command Documents

### ADR Generation Commands

| # | Document | Purpose | Output |
|---|----------|---------|--------|
| **0** | `0-ADR-WORKFLOW.md` | This overview document | N/A |
| **1** | `1-generate-adrs-from-inception.md` | Analyze inception artifacts and generate individual ADRs | `docs/adr/0XX-*.md` files (use `_templates/TEMPLATE.md`) |
| **2** | `2-ADR-validator.md` | Validate ADR quality against criteria | Quality assessment (use `_templates/TEMPLATE-ADR_VALIDATOR.md`) |
| **3** | `3-generate-adr-summary.md` | Create comprehensive ADR generation summary | `ADR_GENERATION_SUMMARY.md` (use `_templates/TEMPLATE-ADR_GENERATION_SUMMARY.md`) |
| **4** | `4-generate-traceability-matrix.md` | Map ADRs to inception artifacts | `TRACEABILITY_MATRIX.md` (use `_templates/TEMPLATE-TRACEABILITY_MATRIX.md`) |
| **6** | `6-update-adr-readme.md` | Update README.md index with new/modified ADRs | Updated `docs/adr/README.md` |

### ADR Analysis Commands

| # | Document | Purpose | Output |
|---|----------|---------|--------|
| **5** | `5-analyze-adr-alternatives.md` | Research current alternatives and best practices for existing ADRs | `ADR_ALTERNATIVES_ANALYSIS.md` + `EXECUTIVE_SUMMARY.md` (use `_templates/TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` + `_templates/TEMPLATE-EXECUTIVE_SUMMARY.md`) |

---

## Templates

| Template | Location | Used By |
|----------|----------|---------|
| **Individual ADR Template** | `_templates/TEMPLATE.md` | All ADR files (001-014) |
| **Summary Template** | `_templates/TEMPLATE-ADR_GENERATION_SUMMARY.md` | ADR Generation Summary |
| **Traceability Template** | `_templates/TEMPLATE-TRACEABILITY_MATRIX.md` | Traceability Matrix |

---

## Phase Details

### Phase 1: Analyze Inception & Generate ADRs
**Command:** `1-generate-adrs-from-inception.md`

**Templates:**
- `_templates/TEMPLATE.md` - Individual ADR format

**Input:**
- Lean Inception workshop artifacts (`docs/inception/`)

**Process:**
1. Review all 8 steps of Lean Inception
2. Extract technical constraints and architectural drivers
3. Identify decision opportunities
4. Generate ADRs following `TEMPLATE.md`

**Output:**
- Individual ADR files: `docs/adr/0XX-decision-name.md`

---

### Phase 2: Validate ADR Quality
**Command:** `2-ADR-validator.md`

**Template:**
- `_templates/TEMPLATE-ADR_VALIDATOR.md` - Quality assessment template

**Input:**
- Generated ADR files from Phase 1

**Process:**
1. Check metadata completeness
2. Validate context clarity
3. Assess options analysis
4. Review decision justification
5. Verify consequences documentation
6. Confirm traceability links

**Output:**
- Quality assessment for each ADR (High/Medium/Low)

---

### Phase 3: Generate Summary Report
**Command:** `3-generate-adr-summary.md`

**Template:**
- `_templates/TEMPLATE-ADR_GENERATION_SUMMARY.md` - Summary report format

**Input:**
- All validated ADR files
- ADR validator results

**Process:**
1. Inventory all ADRs
2. Categorize by domain
3. Measure inception alignment
4. Validate quality metrics
5. Identify architectural themes
6. Generate recommendations

**Output:**
- `_reports/ADR_GENERATION_SUMMARY.md`

---

### Phase 4: Build Traceability Matrix
**Command:** `4-generate-traceability-matrix.md`

**Template:**
- `_templates/TEMPLATE-TRACEABILITY_MATRIX.md` - Traceability matrix format

**Input:**
- All validated ADR files
- Inception artifacts

**Process:**
1. Extract traceability links for each ADR
2. Map to product goals, constraints, personas, pains, features, risks
3. Document decision alignment
4. Create summary tables
5. Analyze coverage metrics

**Output:**
- `_reports/TRACEABILITY_MATRIX.md`

---

### Phase 5: Analyze ADR Alternatives
**Command:** `5-analyze-adr-alternatives.md`

**Input:**
- Existing ADR files (`docs/adr/0XX-*.md`)
- Current technology landscape and best practices

**Templates:**
- `_templates/TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` - Main analysis document
- `_templates/TEMPLATE-EXECUTIVE_SUMMARY.md` - Executive summary

**Process:**
1. Inventory all ADRs by category
2. Research current alternatives and emerging technologies
3. Evaluate each decision against 2025-2026 best practices
4. Identify cross-cutting themes and patterns
5. Generate actionable recommendations

**Output:**
- `_reports/ADR_ALTERNATIVES_ANALYSIS.md` - Comprehensive analysis
- `_reports/EXECUTIVE_SUMMARY.md` - Executive summary with key findings

**When to Run:**
- Before starting major new features (Wave 2+)
- After 6-12 months of development
- When onboarding senior developers
- When encountering technical limitations
- As part of quarterly architecture reviews

---

## Execution Order

### Initial ADR Generation (Project Start)

```bash
# Step 1: Generate ADRs from inception
# Follow instructions in: docs/commands/adr/1-generate-adrs-from-inception.md

# Step 2: Validate each ADR
# Use criteria from: docs/commands/adr/2-ADR-validator.md

# Step 3: Update README index
# Follow instructions in: docs/commands/adr/6-update-adr-readme.md

# Step 4: Generate summary
# Follow instructions in: docs/commands/adr/3-generate-adr-summary.md

# Step 5: Create traceability matrix
# Follow instructions in: docs/commands/adr/4-generate-traceability-matrix.md
```

### Ongoing ADR Analysis (Periodic)

```bash
# Run periodically (quarterly, bi-annually, or before major releases)
# Follow instructions in: docs/commands/adr/5-analyze-adr-alternatives.md
```

---

## Dependencies

```
1-generate-adrs-from-inception.md
         ↓ (produces ADRs)
    2-ADR-validator.md
         ↓ (validates ADRs)
3-generate-adr-summary.md ←┐
         ↓                 │
4-generate-traceability-matrix.md ←┘
         ↓
  Initial Deliverables

         ↓ (after 6-12 months or before major features)
5-analyze-adr-alternatives.md
         ↓
  Analysis Deliverables
```

---

## Quality Gates

### Gate 1: ADR Generation Complete
- [ ] All ADRs generated from inception artifacts
- [ ] Each ADR follows `_templates/TEMPLATE.md` structure
- [ ] ADR numbering is sequential (001, 002, etc.)
- [ ] `docs/adr/README.md` index is updated with new ADR

### Gate 2: Quality Validation Passed
- [ ] Each ADR scores ≥ Medium on validator criteria
- [ ] All required metadata fields are present
- [ ] Each ADR has 2-3 viable options considered
- [ ] Consequences (positive, negative, risks) are documented

### Gate 3: Summary Complete
- [ ] All ADRs included in coverage analysis
- [ ] Product goals coverage measured
- [ ] Constraint compliance documented
- [ ] Persona pain coverage calculated
- [ ] MVP risk mitigation assessed
- [ ] Key themes identified
- [ ] Recommendations provided

### Gate 4: Traceability Complete
- [ ] Each ADR has traceability section
- [ ] All inception sources referenced
- [ ] Decision alignment documented
- [ ] Summary tables completed
- [ ] Coverage analysis included
- [ ] Next steps defined

### Gate 5: Alternatives Analysis Complete
- [ ] All ADRs evaluated against current best practices
- [ ] Research includes 2025-2026 sources
- [ ] Each decision has alternatives comparison
- [ ] Recommendations are actionable and prioritized
- [ ] Emerging technologies identified for monitoring
- [ ] Executive summary provides clear overview

---

## Artifacts Produced

| Artifact | Location | Description |
|----------|----------|-------------|
| Individual ADRs | `docs/adr/0XX-*.md` | Architectural decision records |
| ADR Template | `_templates/TEMPLATE.md` | Standard ADR format |
| Summary Template | `_templates/TEMPLATE-ADR_GENERATION_SUMMARY.md` | Summary report format |
| Traceability Template | `_templates/TEMPLATE-TRACEABILITY_MATRIX.md` | Matrix format |
| Generation Summary | `_reports/ADR_GENERATION_SUMMARY.md` | Comprehensive overview |
| Traceability Matrix | `_reports/TRACEABILITY_MATRIX.md` | ADR-to-inception mapping |
| Alternatives Analysis | `_reports/ADR_ALTERNATIVES_ANALYSIS.md` | Current best practices evaluation |
| Executive Summary | `_reports/EXECUTIVE_SUMMARY.md` | High-level findings and recommendations |

---

## Related Documentation

- **Lean Inception Artifacts**: `docs/inception/`
- **Project Guidelines**: `AGENTS.md`
- **ADR Validator**: `docs/commands/adr/2-ADR-validator.md`
- **ADR Analysis Guide**: `docs/commands/adr/5-analyze-adr-alternatives.md`

---

## Maintenance

### Updating ADRs
1. Modify individual ADR as needed
2. Re-run validation (Phase 2)
3. Update summary (Phase 3) if categories change
4. Update traceability (Phase 4) if sources change
5. Consider running alternatives analysis (Phase 5) for major changes

### Adding New ADRs
1. Determine next ADR number
2. Follow `1-generate-adrs-from-inception.md` for format
3. Validate with `2-ADR-validator.md`
4. Update `docs/adr/README.md` index:
   - Add new ADR to the Quick Reference table
   - Add to appropriate category section
   - Update statistics (total count)
   - Update "Last Updated" date
5. Update summary to include new ADR
6. Add traceability section for new ADR

### Periodic Review
1. Run `5-analyze-adr-alternatives.md` every 6-12 months
2. Update ADRs if better alternatives are found
3. Document rationale for keeping current decisions
4. Track emerging technologies for future consideration
5. Review and update `docs/adr/README.md` categories if needed

---

**Ready to Begin ADR Workflow!** 🏗️

- **Starting a new project?** Begin with Phase 1: `1-generate-adrs-from-inception.md`
- **Reviewing existing ADRs?** Start with Phase 5: `5-analyze-adr-alternatives.md`
