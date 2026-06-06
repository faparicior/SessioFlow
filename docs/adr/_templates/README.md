# ADR Templates

This directory contains all templates for working with Architecture Decision Records (ADRs) in SessioFlow.

## Available Templates

| Template | Purpose | When to Use |
|----------|---------|-------------|
| [`TEMPLATE.md`](./TEMPLATE.md) | Standard ADR format | Creating new ADRs |
| [`TEMPLATE-ADR_VALIDATOR.md`](./TEMPLATE-ADR_VALIDATOR.md) | Quality assessment | After creating each ADR |
| [`TEMPLATE-ADR_GENERATION_SUMMARY.md`](./TEMPLATE-ADR_GENERATION_SUMMARY.md) | Summary of ADR generation | After generating ADRs from inception |
| [`TEMPLATE-TRACEABILITY_MATRIX.md`](./TEMPLATE-TRACEABILITY_MATRIX.md) | Map ADRs to requirements | After generating ADRs |
| [`TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md`](./TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md) | Analyze alternatives | Every 6-12 months |
| [`TEMPLATE-EXECUTIVE_SUMMARY.md`](./TEMPLATE-EXECUTIVE_SUMMARY.md) | High-level summary | After alternatives analysis |

## Reference Documentation

| Document | Purpose |
|----------|---------|
| [`README_TEMPLATES.md`](./README_TEMPLATES.md) | Quick template reference guide |
| [`ADR_TEMPLATE_SYSTEM_SUMMARY.md`](./ADR_TEMPLATE_SYSTEM_SUMMARY.md) | Complete system overview |

## Usage

### Creating a New ADR

1. Copy `TEMPLATE.md` to `../0XX-decision-name.md`
2. Fill in all sections
3. Validate with `TEMPLATE-ADR_VALIDATOR.md`

### Running Alternatives Analysis

1. Follow instructions in `../../commands/adr/5-analyze-adr-alternatives.md`
2. Use `TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` for main document
3. Use `TEMPLATE-EXECUTIVE_SUMMARY.md` for executive summary

## Workflow

```
Generate ADRs → Validate → Create Summary → Build Traceability → (Periodically) Analyze Alternatives
    ↓              ↓             ↓                ↓                      ↓
  TEMPLATE.md   VALIDATOR   GENERATION_SUMMARY  TRACEABILITY   ALTERNATIVES_ANALYSIS + EXECUTIVE_SUMMARY
```

## File Locations

- **Templates:** This directory (`_templates/`)
- **Generated ADRs:** Parent directory (`../`)
- **Command Documents:** `../../commands/adr/`
- **Generated Reports:** Parent directory (`../`)

## Tips

✅ **DO:**
- Use templates consistently for all ADRs
- Fill in all sections completely
- Reference specific inception artifacts
- Document both positive and negative consequences

❌ **DON'T:**
- Skip sections without justification
- Use vague or ambiguous language
- Create ADRs for obvious choices
- Forget to validate ADRs

---

**Need Help?**
- Quick Reference: [`README_TEMPLATES.md`](./README_TEMPLATES.md)
- Complete System: [`ADR_TEMPLATE_SYSTEM_SUMMARY.md`](./ADR_TEMPLATE_SYSTEM_SUMMARY.md)
- Command Guides: `../../commands/adr/`
