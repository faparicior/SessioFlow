# ADR Reports

This directory contains generated reports and analysis documents for Architecture Decision Records (ADRs).

## Available Reports

| Report | Purpose | Generated When |
|--------|---------|----------------|
| [`ADR_GENERATION_SUMMARY.md`](./ADR_GENERATION_SUMMARY.md) | Summary of ADR generation from inception | After initial ADR creation |
| [`TRACEABILITY_MATRIX.md`](./TRACEABILITY_MATRIX.md) | Maps ADRs to business requirements | After ADR generation |
| [`ADR_ALTERNATIVES_ANALYSIS.md`](./ADR_ALTERNATIVES_ANALYSIS.md) | Comprehensive analysis of ADR alternatives | Every 6-12 months |
| [`EXECUTIVE_SUMMARY.md`](./EXECUTIVE_SUMMARY.md) | High-level summary for stakeholders | After alternatives analysis |

## Report Categories

### Generation Reports
Created during initial ADR generation workflow:

- **ADR_GENERATION_SUMMARY.md** - Overview of all ADRs created, coverage analysis, and recommendations
- **TRACEABILITY_MATRIX.md** - Mapping of each ADR to inception artifacts (goals, constraints, personas, features)

### Analysis Reports
Created during periodic alternatives analysis:

- **ADR_ALTERNATIVES_ANALYSIS.md** - Detailed evaluation of each ADR against current best practices
- **EXECUTIVE_SUMMARY.md** - Stakeholder-friendly summary with key findings and recommendations

## Usage

### Accessing Reports

- **For quick overview:** Start with `EXECUTIVE_SUMMARY.md`
- **For detailed analysis:** Read `ADR_ALTERNATIVES_ANALYSIS.md`
- **For ADR coverage:** Check `ADR_GENERATION_SUMMARY.md`
- **For requirement mapping:** Review `TRACEABILITY_MATRIX.md`

### Generating New Reports

Follow the command documents:

1. **Generation Reports:**
   - `docs/commands/adr/3-generate-adr-summary.md`
   - `docs/commands/adr/4-generate-traceability-matrix.md`

2. **Analysis Reports:**
   - `docs/commands/adr/5-analyze-adr-alternatives.md`

## Report Lifecycle

```
Initial ADR Generation → Generate Summary + Traceability → (Every 6-12 months) → Alternatives Analysis + Executive Summary
       ↓                              ↓                                                        ↓
  ADRs Created              ADR_GENERATION_SUMMARY.md                                    ADR_ALTERNATIVES_ANALYSIS.md
                            TRACEABILITY_MATRIX.md                                       EXECUTIVE_SUMMARY.md
```

## File Naming Conventions

- Use uppercase with underscores: `REPORT_NAME.md`
- Include date in filename if versioned: `EXECUTIVE_SUMMARY_2026-Q1.md`
- Keep descriptive names for clarity

## Version Control

Reports are versioned with the ADRs they reference:

- **Generation Reports:** Updated when new ADRs are added
- **Analysis Reports:** Create new version quarterly or when significant changes occur

## Related Documentation

- **Templates:** `_templates/`
- **Command Guides:** `../../commands/adr/`
- **Individual ADRs:** `../0XX-*.md`

---

**Need Help?**
- Template Guide: `_templates/README_TEMPLATES.md`
- Command Guides: `../../commands/adr/`
