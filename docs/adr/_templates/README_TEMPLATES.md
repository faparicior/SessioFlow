# ADR Templates Reference Guide

This document provides an overview of all templates available for working with Architecture Decision Records (ADRs) in SessioFlow.

---

## Available Templates

| Template | Location | Purpose | When to Use |
|----------|----------|---------|-------------|
| **Individual ADR** | `TEMPLATE.md` | Standard ADR format | Creating new ADRs |
| **Alternatives Analysis** | `TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` | Comprehensive analysis of ADR alternatives | Periodic review (6-12 months) |
| **Executive Summary** | `TEMPLATE-EXECUTIVE_SUMMARY.md` | High-level summary for stakeholders | After completing alternatives analysis |
| **Validator** | `TEMPLATE-ADR_VALIDATOR.md` | Quality assessment for ADRs | After creating each ADR |
| **Generation Summary** | `TEMPLATE-ADR_GENERATION_SUMMARY.md` | Summary of ADR generation process | After generating ADRs from inception |
| **Traceability Matrix** | `TEMPLATE-TRACEABILITY_MATRIX.md` | Map ADRs to inception artifacts | After generating ADRs |

---

## Template Details

### 1. Individual ADR Template

**File:** `TEMPLATE.md`  
**Purpose:** Standard format for recording individual architectural decisions

**Use When:**
- Creating a new architectural decision record
- Documenting a significant technical decision
- Need to capture decision context and rationale

**Key Sections:**
- Context & Problem Statement
- Considered Options
- Decision Outcome
- Pros and Cons Analysis
- Links & References

**See Also:** `docs/commands/adr/1-generate-adrs-from-inception.md`

---

### 2. ADR Alternatives Analysis Template

**File:** `TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md`  
**Purpose:** Comprehensive evaluation of existing ADRs against current best practices

**Use When:**
- Conducting periodic architecture review (every 6-12 months)
- Before starting major new features
- When encountering technical limitations
- As part of quarterly architecture reviews

**Key Sections:**
- Executive Summary
- Summary Table (all ADRs)
- Detailed Analysis (per ADR)
- Cross-Cutting Themes
- Recommendations Summary
- Emerging Technologies to Watch

**See Also:** `docs/commands/adr/5-analyze-adr-alternatives.md`

**Output:** `ADR_ALTERNATIVES_ANALYSIS.md`

---

### 3. Executive Summary Template

**File:** `TEMPLATE-EXECUTIVE_SUMMARY.md`  
**Purpose:** High-level summary for stakeholders and leadership

**Use When:**
- Presenting alternatives analysis to non-technical stakeholders
- Need quick overview of architecture health
- Requesting approval for recommendations

**Key Sections:**
- Overall Assessment
- Key Findings
- Top 5 Recommendations
- Risk Assessment
- Cost Implications
- Next Steps

**See Also:** `docs/commands/adr/5-analyze-adr-alternatives.md`

**Output:** `EXECUTIVE_SUMMARY.md`

---

### 4. ADR Validator Template

**File:** `TEMPLATE-ADR_VALIDATOR.md`  
**Purpose:** Quality assessment for individual ADRs

**Use When:**
- After creating a new ADR
- Reviewing existing ADRs for quality
- Before socializing ADRs with stakeholders

**Key Sections:**
- Validation Criteria (6 criteria)
- Quality Scoring
- Detailed Assessment
- Recommendations
- Sign-off

**See Also:** `docs/commands/adr/2-ADR-validator.md`

**Output:** Quality assessment (High/Medium/Low)

---

### 5. ADR Generation Summary Template

**File:** `TEMPLATE-ADR_GENERATION_SUMMARY.md`  
**Purpose:** Summary report after generating ADRs from inception

**Use When:**
- After completing initial ADR generation
- Need to document architectural coverage
- Presenting ADRs to stakeholders

**Key Sections:**
- Coverage Analysis
- Inception Alignment Score
- ADR Inventory
- Key Themes
- Recommendations

**See Also:** `docs/commands/adr/3-generate-adr-summary.md`

**Output:** `ADR_GENERATION_SUMMARY.md`

---

### 6. Traceability Matrix Template

**File:** `TEMPLATE-TRACEABILITY_MATRIX.md`  
**Purpose:** Map ADRs to inception artifacts and business requirements

**Use When:**
- Need to show how ADRs align with business goals
- Demonstrating requirement coverage
- Auditing decision rationale

**Key Sections:**
- ADR-to-Goal Mapping
- Constraint Compliance
- Persona Pain Coverage
- Feature Alignment
- Risk Mitigation

**See Also:** `docs/commands/adr/4-generate-traceability-matrix.md`

**Output:** `TRACEABILITY_MATRIX.md`

---

## Quick Reference

### Creating a New ADR

```markdown
1. Copy `TEMPLATE.md`
2. Fill in all sections
3. Validate with `TEMPLATE-ADR_VALIDATOR.md`
4. Save as `docs/adr/0XX-decision-name.md`
```

### Running Alternatives Analysis

```markdown
1. Follow `docs/commands/adr/5-analyze-adr-alternatives.md`
2. Use `TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` for main document
3. Use `TEMPLATE-EXECUTIVE_SUMMARY.md` for executive summary
4. Save both to `docs/adr/`
```

### Validating an ADR

```markdown
1. Open `TEMPLATE-ADR_VALIDATOR.md`
2. Assess each criterion (High/Medium/Low)
3. Calculate overall quality score
4. Document recommendations
5. Sign-off
```

---

## Template Usage Workflow

### Initial Project Setup

```
Start → Generate ADRs (use TEMPLATE.md)
       ↓
   Validate ADRs (use TEMPLATE-ADR_VALIDATOR.md)
       ↓
  Generate Summary (use TEMPLATE-ADR_GENERATION_SUMMARY.md)
       ↓
Create Traceability (use TEMPLATE-TRACEABILITY_MATRIX.md)
       ↓
  ADRs Complete ✅
```

### Periodic Review

```
Every 6-12 Months → Analyze Alternatives
                    ↓
         Use TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md
                    ↓
         Create EXECUTIVE_SUMMARY.md
                    ↓
         Implement Recommendations
                    ↓
         Update ADRs if needed
                    ↓
         Review Complete ✅
```

---

## Best Practices

### When Using Templates

✅ **DO:**
- Fill in all sections completely
- Use specific, evidence-based statements
- Maintain consistent formatting
- Link to relevant documentation
- Update status when decisions change

❌ **DON'T:**
- Skip sections without justification
- Use vague or ambiguous language
- Copy templates without customization
- Forget to update linked documents
- Leave metadata incomplete

### Template Customization

You can customize templates for your needs:
- Add sections specific to your organization
- Modify scoring criteria
- Add additional validation checks
- Include organization-specific requirements

**But maintain:**
- Core ADR structure (context, options, decision, consequences)
- Quality assessment criteria
- Traceability requirements

---

## File Locations

| Template | Full Path |
|----------|-----------|
| Individual ADR | `docs/adr/TEMPLATE.md` |
| Alternatives Analysis | `docs/adr/TEMPLATE-ADR_ALTERNATIVES_ANALYSIS.md` |
| Executive Summary | `docs/adr/TEMPLATE-EXECUTIVE_SUMMARY.md` |
| Validator | `docs/adr/TEMPLATE-ADR_VALIDATOR.md` |
| Generation Summary | `docs/adr/TEMPLATE-ADR_GENERATION_SUMMARY.md` |
| Traceability Matrix | `docs/adr/TEMPLATE-TRACEABILITY_MATRIX.md` |

---

## Related Documentation

- **ADR Workflow:** `docs/commands/adr/0-ADR-WORKFLOW.md`
- **Generate ADRs:** `docs/commands/adr/1-generate-adrs-from-inception.md`
- **Validate ADRs:** `docs/commands/adr/2-ADR-validator.md`
- **Generate Summary:** `docs/commands/adr/3-generate-adr-summary.md`
- **Traceability:** `docs/commands/adr/4-generate-traceability-matrix.md`
- **Analyze Alternatives:** `docs/commands/adr/5-analyze-adr-alternatives.md`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-06 | Initial template set created |

---

**Need Help?**
Refer to the specific command document for detailed instructions on using each template.
