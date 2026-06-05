# Generate ADR Generation Summary

## Role

Act as a **Senior Software Architect** with expertise in **documentation synthesis**, **architectural decision analysis**, and **technical communication**. Your task is to analyze all generated ADRs and create a comprehensive summary report that demonstrates architectural coverage, inception alignment, and quality validation.

---

## Your Mission

Review all ADR files in the `docs/adr/` directory (excluding templates and summary documents) and generate a **comprehensive ADR Generation Summary** that:

1. **Categorizes** ADRs by domain (Infrastructure, Technology Stack, Development Workflow, etc.)
2. **Validates** quality against ADR validator criteria
3. **Measures** alignment with product goals, constraints, and persona needs
4. **Documents** key architectural themes and trade-offs
5. **Provides** actionable recommendations for next steps

---

## Context: The ADR Generation Process

This summary is the **final output** of the ADR generation workflow:

1. **Phase 1**: Analyze inception artifacts → `1-generate-adrs-from-inception.md`
2. **Phase 2**: Generate individual ADRs → `docs/adr/0XX-*.md` files
3. **Phase 3**: Validate ADR quality → `2-ADR-validator.md`
4. **Phase 4**: **Create summary report** ← YOU ARE HERE
5. **Phase 5**: Create traceability matrix → `4-generate-traceability-matrix.md`

---

## Instructions

### Phase 1: Inventory All ADRs

Scan the `docs/adr/` directory and collect:

1. **List all ADR files** (exclude: `TEMPLATE.md`, `TEMPLATE-*.md`, `ADR_GENERATION_SUMMARY.md`, `TRACEABILITY_MATRIX.md`)
2. **Extract metadata** from each ADR:
   - ADR number (e.g., 001, 002)
   - Title
   - Status (Proposed, Accepted, etc.)
   - Date
   - Decision domain/category

3. **Count total ADRs** generated

---

### Phase 2: Categorize ADRs by Domain

Organize ADRs into these categories (adjust as needed based on actual content):

#### Infrastructure & Deployment
- Hosting platform decisions
- Deployment automation
- CI/CD pipeline choices
- Containerization strategy

#### Technology Stack
- Frontend framework
- Backend framework
- Database technology
- Styling approach
- Third-party services

#### Development Workflow
- Testing strategy
- Code organization
- Type system decisions
- Tooling choices

#### Architecture Patterns
- API design approach
- Data validation strategy
- Authentication pattern
- State management

#### Quality & Non-Functional Requirements
- Security measures
- Performance targets
- Accessibility standards
- User experience decisions

---

### Phase 3: Measure Inception Alignment

For each product goal, identify which ADRs support it:

#### Product Goals Coverage
Review the inception document (`docs/inception/`) and extract:
- **Goal 1**: [Description]
- **Goal 2**: [Description]
- **Goal 3**: [Description]

For each goal, list which ADRs directly support it by referencing goal-related language in the ADR context.

#### Constraint Compliance
Review constraints from inception:
- **IS** statements (positive attributes)
- **IS NOT** statements (negative constraints)
- **DOES** statements (functional requirements)

For each constraint, identify which ADRs explicitly respect or address it.

#### Persona Pain Point Coverage
For each persona (Fernando, Andrea, etc.):
- List their pain points from the empathy map
- Identify which ADRs address each pain point
- Calculate coverage percentage (X/Y pains addressed)

#### MVP Risk Mitigation
Review MVP Canvas risks:
- List each identified risk
- Identify which ADRs provide mitigation strategies
- Calculate mitigation coverage (X/Y risks addressed)

---

### Phase 4: Validate ADR Quality

Apply the validator criteria from `docs/commands/adr/2-ADR-validator.md` to each ADR:

| Criteria | Description | Pass/Fail |
|----------|-------------|-----------|
| Metadata | All required fields present | ✅/❌ |
| Context | Clear, objective problem statement | ✅/❌ |
| Options | Multiple viable alternatives | ✅/❌ |
| Decision | Clear choice with justification | ✅/❌ |
| Consequences | Pros, cons, risks listed | ✅/❌ |
| Links | References to source artifacts | ✅/❌ |

Create a validation table showing compliance for each ADR.

---

### Phase 5: Identify Key Architectural Themes

Analyze all ADRs to identify overarching themes:

1. **Cost Optimization**: Decisions that respect the $0/month constraint
2. **Simplicity First**: Decisions prioritizing simplicity over advanced features
3. **Developer Experience**: Decisions optimizing for volunteer productivity
4. **User-Centered Design**: Decisions tracing back to persona needs
5. **Risk Mitigation**: Decisions addressing identified MVP risks

For each theme:
- Describe the theme
- List which ADRs embody it
- Explain the strategic rationale

---

### Phase 6: Generate Recommendations

Based on the analysis, provide actionable next steps:

#### Immediate Actions
1. Review ADRs with product team
2. Socialize with stakeholders
3. Update status from "Proposed" to "Accepted"

#### Implementation Planning
4. Create implementation tasks
5. Prioritize by dependencies
6. Estimate effort

#### Future Considerations
7. Schedule ADR review after MVP
8. Track decision outcomes
9. Update or deprecate as needed

#### Documentation Maintenance
10. Link to implementation code
11. Track amendments
12. Maintain traceability

---

## Output Format

Generate a markdown document following the template in `docs/adr/TEMPLATE-ADR_GENERATION_SUMMARY.md` with these sections:

### 1. Header
```markdown
# ADR Generation Summary

**Generated:** [YYYY-MM-DD]
**Source:** [Inception Artifacts Location]
**Template:** docs/adr/TEMPLATE.md
**Validator:** docs/commands/adr/2-ADR-validator.md
**Summary Template:** docs/adr/TEMPLATE-ADR_GENERATION_SUMMARY.md
```

### 2. Executive Summary
- Total ADRs generated
- Brief overview of coverage

### 3. Coverage Analysis
- Breakdown by category with ADR counts
- List of ADRs in each category

### 4. Inception Alignment Score
- Product Goals Coverage table
- Constraint Compliance table
- Persona Pain Coverage tables
- MVP Risk Mitigation table

### 5. ADR Quality Validation
- Validation table with criteria compliance
- Validation criteria explanation

### 6. Decision Categories Breakdown
- Detailed analysis of each category
- Key trade-offs and cost impacts

### 7. Key Architectural Themes
- Theme descriptions
- ADR alignment with themes
- Strategic rationale

### 8. Traceability Summary
- Overview of source artifact references
- Total references by artifact type

### 9. Recommendations for Next Steps
- Categorized action items

### 10. Appendix: ADR Index
- Table of all ADRs with metadata

---

## Quality Standards

### ✅ DO
- **Be Comprehensive**: Include all ADRs in the analysis
- **Be Specific**: Reference exact ADR numbers and titles
- **Be Quantitative**: Use numbers and percentages for coverage
- **Be Honest**: Include negative consequences and risks
- **Be Traceable**: Link every claim to specific ADR content

### ❌ DON'T
- **Don't Skip ADRs**: Every generated ADR must be included
- **Don't Genericize**: Use actual ADR content, not placeholders
- **Don't Overstate**: Be accurate about coverage (e.g., "5/7 goals" not "all goals")
- **Don't Ignore Negatives**: Document trade-offs and risks honestly
- **Don't Forget Templates**: Reference the template used for generation

---

## Validation Checklist

Before finalizing the summary:

- [ ] All ADRs in `docs/adr/` have been inventoried
- [ ] Each ADR is categorized into at least one domain
- [ ] Product goals coverage is accurately measured
- [ ] Constraint compliance is documented for each constraint
- [ ] Persona pain points are traced to specific ADRs
- [ ] MVP risks have corresponding mitigation ADRs
- [ ] Quality validation table includes all ADRs
- [ ] Key architectural themes are identified and explained
- [ ] Recommendations are actionable and specific
- [ ] ADR index is complete and accurate
- [ ] Document follows `TEMPLATE-ADR_GENERATION_SUMMARY.md` structure

---

## Example Output Structure

```markdown
# ADR Generation Summary

**Generated:** 2026-06-05
**Source:** Lean Inception Workshop Artifacts (docs/inception/)
**Template:** docs/adr/TEMPLATE.md
**Validator:** docs/commands/adr/2-ADR-validator.md
**Summary Template:** docs/adr/TEMPLATE-ADR_GENERATION_SUMMARY.md

---

## Executive Summary

**Total ADRs Generated:** 14

This ADR generation effort analyzed all 8 steps of the Lean Inception workshop...

---

## Coverage Analysis

### ✅ Infrastructure & Deployment: 2 ADRs
- **ADR-003**: Use Docker Compose for Deployment
- **ADR-012**: Implement CI/CD with GitHub Actions

[Continue with all categories...]
```

---

## Final Deliverable

Save the generated summary to: **`docs/adr/ADR_GENERATION_SUMMARY.md`**

Ensure it follows the template structure and includes all required sections with accurate data extracted from the actual ADR files.

---

**Ready to Synthesize Architectural Decisions!** 📊

Remember: A great summary tells the story of **WHY** these decisions were made and **HOW** they align with business goals, not just **WHAT** was decided.
