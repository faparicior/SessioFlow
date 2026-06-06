# ADR Quick Reference Guide

## Overview

This guide provides a quick reference for working with Architecture Decision Records (ADRs) in SessioFlow.

---

## ADR Workflow Commands

| Command | When to Use | Template | Output |
|---------|-------------|----------|--------|
| **1-generate-adrs-from-inception.md** | Starting a new project or phase | `_templates/TEMPLATE.md` | Individual ADR files |
| **2-ADR-validator.md** | After creating each ADR | `_templates/TEMPLATE-ADR_VALIDATOR.md` | Quality assessment |
| **3-generate-adr-summary.md** | After generating all ADRs | `_templates/TEMPLATE-ADR_GENERATION_SUMMARY.md` | ADR_GENERATION_SUMMARY.md |
| **4-generate-traceability-matrix.md** | After validation | `_templates/TEMPLATE-TRACEABILITY_MATRIX.md` | TRACEABILITY_MATRIX.md |
| **5-analyze-adr-alternatives.md** | Every 6-12 months or before major features | `_templates/TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` + `_templates/TEMPLATE-EXECUTIVE_SUMMARY.md` | ADR_ALTERNATIVES_ANALYSIS.md + EXECUTIVE_SUMMARY.md |

---

## ADR Categories

| Category | ADR Numbers | Examples |
|----------|-------------|----------|
| Frontend Framework | 001 | Next.js, Remix, SvelteKit |
| Backend/Database | 002, 005 | Supabase, Firebase, PostgreSQL |
| Authentication | 004 | Magic Links, OAuth, Passkeys |
| API Design | 006 | REST, GraphQL, tRPC |
| Validation | 007 | Zod, Valibot, ArkType |
| Project Structure | 009 | Feature-based, Layered, DDD |
| Email/Communication | 011 | Resend, SendGrid, Mailgun |
| CI/CD | 012 | GitHub Actions, GitLab CI |
| Language/Type System | 013 | TypeScript, Flow |
| UI/UX | 014 | shadcn/ui, MUI, Chakra |

---

## ADR Status Values

| Status | Meaning |
|--------|---------|
| **Proposed** | Decision is proposed, awaiting review |
| **Accepted** | Decision has been approved |
| **Deprecated** | Decision is no longer recommended |
| **Superseded** | Decision has been replaced by another |

---

## When to Run Alternatives Analysis

✅ **Recommended Triggers:**
- Before starting Wave 2+ features
- After 6-12 months of development
- When onboarding senior developers
- When encountering technical limitations
- Quarterly architecture reviews
- Before major releases

⏰ **Recommended Cadence:**
- **Quarterly**: Quick scan of emerging trends (2-4 hours)
- **Bi-Annually**: Review 2-3 critical ADRs (8-12 hours)
- **Annually**: Full alternatives analysis (2-3 days)

---

## Quick Commands

### Generate New ADRs
```bash
# Follow the workflow
cd docs/commands/adr
# Read and follow: 1-generate-adrs-from-inception.md
```

### Validate ADRs
```bash
# Use validation criteria from
# 2-ADR-validator.md
```

### Analyze Alternatives
```bash
# Research current best practices
# Follow: 5-analyze-adr-alternatives.md
```

---

## ADR Quality Checklist

✅ **Before Finalizing an ADR:**
- [ ] All metadata fields complete
- [ ] Context is clear and unbiased
- [ ] At least 2-3 viable alternatives considered
- [ ] Decision is clearly justified
- [ ] Positive, negative, and risk consequences documented
- [ ] Traceability to inception artifacts included
- [ ] Follows TEMPLATE.md structure

✅ **Before Running Alternatives Analysis:**
- [ ] All existing ADRs inventoried
- [ ] Research includes 2025-2026 sources
- [ ] Multiple sources per decision
- [ ] Recommendations are actionable
- [ ] Emerging technologies identified

---

## File Locations

| File | Location |
|------|----------|
| ADRs | `docs/adr/0XX-*.md` |
| Templates | `_templates/TEMPLATE.md` |
| Commands | `docs/commands/adr/` |
| Inception Artifacts | `docs/inception/` |
| Analysis Output | `_reports/ADR_ALTERNATIVES_ANALYSIS.md` |
| Executive Summary | `_reports/EXECUTIVE_SUMMARY.md` |

---

## Common Scenarios

### Scenario 1: Starting a New Project
1. Run `1-generate-adrs-from-inception.md`
2. Validate with `2-ADR-validator.md`
3. Generate summary with `3-generate-adr-summary.md`
4. Create traceability with `4-generate-traceability-matrix.md`

### Scenario 2: Evaluating Current Stack
1. Run `5-analyze-adr-alternatives.md`
2. Review executive summary
3. Implement recommended changes
4. Update ADRs if decisions change

### Scenario 3: Adding Major Feature
1. Review relevant ADRs
2. Run alternatives analysis for affected areas
3. Create new ADRs for new decisions
4. Update traceability matrix

---

## Tips

💡 **Best Practices:**
- Keep ADRs concise but complete
- Focus on "why" not just "what"
- Document negative consequences honestly
- Link to specific inception artifacts
- Review periodically for relevance

🚫 **Common Mistakes:**
- Creating ADRs for obvious choices
- Not considering enough alternatives
- Ignoring negative consequences
- Forgetting to update status
- Missing traceability links

---

## Resources

- **ADR Templates**: `_templates/TEMPLATE.md`
- **Validation Criteria**: `docs/commands/adr/2-ADR-validator.md`
- **Alternatives Analysis**: `docs/commands/adr/5-analyze-adr-alternatives.md`
- **Current ADRs**: `docs/adr/0XX-*.md`

---

**Need Help?**
Refer to the detailed command documents in `docs/commands/adr/` for step-by-step instructions.
