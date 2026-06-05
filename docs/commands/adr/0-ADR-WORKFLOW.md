# ADR Generation Workflow

This document provides an overview of the complete ADR (Architectural Decision Record) generation workflow for SessioFlow.

---

## Workflow Overview

The ADR generation process consists of **5 sequential phases**, each with its own instruction document:

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

---

## Command Documents

| # | Document | Purpose | Output |
|---|----------|---------|--------|
| **0** | `0-ADR-WORKFLOW.md` | This overview document | N/A |
| **1** | `1-generate-adrs-from-inception.md` | Analyze inception artifacts and generate individual ADRs | `docs/adr/0XX-*.md` files |
| **2** | `2-ADR-validator.md` | Validate ADR quality against criteria | Quality assessment |
| **3** | `3-generate-adr-summary.md` | Create comprehensive ADR generation summary | `ADR_GENERATION_SUMMARY.md` |
| **4** | `4-generate-traceability-matrix.md` | Map ADRs to inception artifacts | `TRACEABILITY_MATRIX.md` |

---

## Templates

| Template | Location | Used By |
|----------|----------|---------|
| **Individual ADR Template** | `docs/adr/TEMPLATE.md` | All ADR files (001-014) |
| **Summary Template** | `docs/adr/TEMPLATE-ADR_GENERATION_SUMMARY.md` | ADR Generation Summary |
| **Traceability Template** | `docs/adr/TEMPLATE-TRACEABILITY_MATRIX.md` | Traceability Matrix |

---

## Phase Details

### Phase 1: Analyze Inception & Generate ADRs
**Command:** `1-generate-adrs-from-inception.md`

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
- `docs/adr/ADR_GENERATION_SUMMARY.md`

---

### Phase 4: Build Traceability Matrix
**Command:** `4-generate-traceability-matrix.md`

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
- `docs/adr/TRACEABILITY_MATRIX.md`

---

## Execution Order

### Recommended Workflow

```bash
# Step 1: Generate ADRs from inception
# Follow instructions in: docs/commands/adr/1-generate-adrs-from-inception.md

# Step 2: Validate each ADR
# Use criteria from: docs/commands/adr/2-ADR-validator.md

# Step 3: Generate summary
# Follow instructions in: docs/commands/adr/3-generate-adr-summary.md

# Step 4: Create traceability matrix
# Follow instructions in: docs/commands/adr/4-generate-traceability-matrix.md
```

### Dependencies

```
1-generate-adrs-from-inception.md
         ↓ (produces ADRs)
    2-ADR-validator.md
         ↓ (validates ADRs)
3-generate-adr-summary.md ←┐
         ↓                 │
4-generate-traceability-matrix.md ←┘
         ↓
  Final Deliverables
```

---

## Quality Gates

### Gate 1: ADR Generation Complete
- [ ] All ADRs generated from inception artifacts
- [ ] Each ADR follows `TEMPLATE.md` structure
- [ ] ADR numbering is sequential (001, 002, etc.)

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

---

## Artifacts Produced

| Artifact | Location | Description |
|----------|----------|-------------|
| Individual ADRs | `docs/adr/0XX-*.md` | Architectural decision records |
| ADR Template | `docs/adr/TEMPLATE.md` | Standard ADR format |
| Summary Template | `docs/adr/TEMPLATE-ADR_GENERATION_SUMMARY.md` | Summary report format |
| Traceability Template | `docs/adr/TEMPLATE-TRACEABILITY_MATRIX.md` | Matrix format |
| Generation Summary | `docs/adr/ADR_GENERATION_SUMMARY.md` | Comprehensive overview |
| Traceability Matrix | `docs/adr/TRACEABILITY_MATRIX.md` | ADR-to-inception mapping |

---

## Related Documentation

- **Lean Inception Artifacts**: `docs/inception/`
- **Project Guidelines**: `AGENTS.md`
- **ADR Validator**: `docs/commands/adr/2-ADR-validator.md`

---

## Maintenance

### Updating ADRs
1. Modify individual ADR as needed
2. Re-run validation (Phase 2)
3. Update summary (Phase 3) if categories change
4. Update traceability (Phase 4) if sources change

### Adding New ADRs
1. Determine next ADR number
2. Follow `1-generate-adrs-from-inception.md` for format
3. Validate with `2-ADR-validator.md`
4. Update summary to include new ADR
5. Add traceability section for new ADR

---

**Ready to Begin ADR Generation!** 🏗️

Start with Phase 1: `1-generate-adrs-from-inception.md`
