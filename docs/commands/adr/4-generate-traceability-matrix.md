# Generate ADR Traceability Matrix

## Role

Act as a **Senior Software Architect** with expertise in **requirements traceability**, **architectural documentation**, and **systems thinking**. Your task is to create a comprehensive traceability matrix that maps each ADR back to its source artifacts in the Lean Inception workshop.

---

## Your Mission

Review all ADR files in the `docs/adr/` directory and create a **Traceability Matrix** that:

1. **Links** each ADR to specific inception artifacts (goals, constraints, personas, pains, features, risks)
2. **Demonstrates** decision alignment with business requirements
3. **Provides** evidence for why each architectural decision was made
4. **Enables** impact analysis when requirements change
5. **Supports** stakeholder understanding of architectural rationale

---

## Context: Why Traceability Matters

Traceability is critical for:

- **Accountability**: Every decision must have a business justification
- **Impact Analysis**: When requirements change, know which ADRs are affected
- **Onboarding**: New team members understand WHY decisions were made
- **Audit & Compliance**: Documented rationale for architectural choices
- **Continuous Improvement**: Review decisions against actual outcomes

---

## Instructions

### Phase 1: Inventory ADRs and Source Artifacts

#### Step 1.1: List All ADRs
Scan `docs/adr/` and collect:
- ADR number (001, 002, etc.)
- ADR title
- Brief description of the decision

#### Step 1.2: Review Inception Artifacts
Examine all files in `docs/inception/`:
- **Step 1**: Product Vision & Boundaries (goals, IS/IS NOT, DOES/DOES NOT)
- **Step 2**: Trade-offs (priority ranking of constraints)
- **Step 3**: Personas (user profiles and characteristics)
- **Step 4**: Empathy Maps (pains, gains, needs, fears)
- **Step 5**: Brainstorming (feature ideas)
- **Step 6**: User Journey Maps (user interaction flows)
- **Step 7**: Features & Sequencing (prioritized feature list)
- **Step 8**: MVP Canvas (vision, risks, enablers, metrics)

---

### Phase 2: Extract Traceability Links for Each ADR

For **each ADR**, extract the following from the ADR content:

#### 2.1 Product Goals
Find references to specific product goals:
- Quote the exact goal from inception
- Identify which goal(s) the ADR supports
- Document the alignment

**Example:**
```markdown
**Product Goals**:
- Goal 1: "Reduce session organization time by 50% compared to manual tools"
- Goal 3: "Enable 80% of users to run on free-tier infrastructure ($0/month)"
```

#### 2.2 Constraints
Identify constraints the ADR respects or addresses:
- **IS** statements (positive attributes)
- **IS NOT** statements (negative constraints)
- **DOES** statements (functional requirements)

**Example:**
```markdown
**Constraints**:
- "IS NOT: Expensive to host" (Cost constraint)
- "IS: Simple to use" (Usability priority)
```

#### 2.3 Personas
List which personas benefit from this decision:
- Persona name
- Persona characteristics relevant to the decision
- How the decision addresses persona needs

**Example:**
```markdown
**Personas**:
- Fernando (Intermediate tech savviness, needs intuitive interface)
- Andrea (Intermediate tech savviness, needs mobile access)
```

#### 2.4 Pain Points
Extract specific pain points addressed:
- Quote the exact pain from empathy map
- Identify which persona experiences it
- Show how the ADR mitigates it

**Example:**
```markdown
**Pain Points**:
- Fernando: "Lot of manual work to manage the event with different sources of data"
- Andrea: "Difficult to find a smooth an easy way to create a session proposal"
```

#### 2.5 Features
Identify features that require this decision:
- Feature name from brainstorming/sequencing
- Priority level (Must-have, Should-have, Could-have)
- How the ADR enables the feature

**Example:**
```markdown
**Features**:
- Collect Proposals (CfP) - Must-have
- User Authentication - Must-have
- Speaker Profile (Photo Upload) - Must-have
```

#### 2.6 User Journeys
Reference relevant user journey steps:
- Journey number and name
- Specific step that relates to the decision
- How the decision improves the journey

**Example:**
```markdown
**User Journey 2**:
- "Andrea creates an account or logs in: User Authentication: Magic Link / Social Login"
```

#### 2.7 MVP Canvas
Extract MVP Canvas elements:
- Technical enablers referenced
- Risks mitigated
- Success metrics supported

**Example:**
```markdown
**MVP Canvas**:
- Technical Enablers: "Database Schema for Events, Proposals, and Profiles"
- Risks: "GDPR/Privacy compliance"
- Mitigation: "Row-Level Security (RLS) for data privacy"
```

---

### Phase 3: Document Decision Alignment

For each ADR, explicitly state:

#### 3.1 Direct Support
```markdown
**Decision Alignment:**
- This decision directly supports: [Specific goal/metric from inception]
```

#### 3.2 Risk Mitigation
```markdown
- This decision mitigates: [Specific risk from MVP Canvas or identified in inception]
```

---

### Phase 4: Create Summary Tables

#### 4.1 ADR-to-Source Mapping Table
Create a summary table showing primary and secondary sources for each ADR:

| ADR Number | ADR Title | Primary Source | Secondary Sources |
|------------|-----------|----------------|-------------------|
| 001 | Use Next.js | Product Goals (1, 3) | Trade-offs, Personas |
| 002 | Use Supabase | MVP Canvas (Enablers) | Trade-offs, Constraints |
| ... | ... | ... | ... |

#### 4.2 Coverage Analysis Tables

**Product Goals Coverage:**
| Goal | Description | ADRs Supporting | Coverage % |
|------|-------------|-----------------|------------|
| Goal 1 | Reduce organization time by 50% | 001, 002, 003, 007 | 100% |
| Goal 2 | Achieve 4/5 ease-of-use rating | 001, 004, 010 | 100% |
| Goal 3 | Enable $0/month infrastructure | 002, 003, 005, 012 | 100% |

**Constraint Compliance:**
| Constraint | ADRs Addressing | Compliance Status |
|------------|-----------------|-------------------|
| IS NOT: Hard to use | 001, 004, 007, 010 | ✅ Compliant |
| IS NOT: Expensive | 002, 003, 005, 011, 012 | ✅ Compliant |
| IS: Simple to use | 001, 004, 007, 010, 013 | ✅ Compliant |

**Persona Pain Coverage:**
| Persona | Total Pains | Pains Addressed | Coverage % |
|---------|-------------|-----------------|------------|
| Fernando | 7 | 7 | 100% |
| Andrea | 6 | 6 | 100% |

**MVP Risk Mitigation:**
| Risk | Mitigating ADRs | Mitigation Status |
|------|-----------------|-------------------|
| Data Quality | 007, 013, 008 | ✅ Mitigated |
| Usability | 001, 010, 004 | ✅ Mitigated |
| Cost | 002, 003, 012 | ✅ Mitigated |

---

### Phase 5: Analyze Coverage

#### 5.1 Product Goals Coverage
- Count how many goals have supporting ADRs
- Identify any goals without ADR support
- Calculate coverage percentage

#### 5.2 Constraint Compliance
- Verify all IS/IS NOT/DOES statements are addressed
- Flag any constraints without ADR coverage
- Document compliance status

#### 5.3 Persona Pain Point Coverage
- Count total pain points across all personas
- Count how many pains have addressing ADRs
- Calculate coverage percentage

#### 5.4 MVP Risk Mitigation
- List all risks from MVP Canvas
- Identify mitigating ADRs for each risk
- Calculate mitigation coverage

---

## Output Format

Generate a markdown document following the template in `docs/adr/TEMPLATE-TRACEABILITY_MATRIX.md`:

### 1. Header
```markdown
# ADR Traceability Matrix

**Template Version:** 1.0
**Template:** docs/adr/TEMPLATE-TRACEABILITY_MATRIX.md
**Based On:** Lean Inception Workshop Methodology
**Purpose:** Maps each ADR to inception artifacts for complete traceability
```

### 2. Individual ADR Traceability Sections
For each ADR (001, 002, etc.):
```markdown
## Traceability: ADR-XXX - [Title]

**Inception Sources:**
- **Product Goals**: [Quotes and references]
- **Constraints**: [Relevant constraints]
- **Personas**: [Affected personas]
- **Pain Points**: [Specific pains addressed]
- **Features**: [Features enabled]
- **User Journey [X]**: [Relevant journey steps]
- **MVP Canvas**: [Enablers, risks, metrics]

**Decision Alignment:**
- This decision directly supports: [Specific goal/metric]
- This decision mitigates: [Specific risk]
```

### 3. Summary Table
```markdown
## Summary of Inception Alignment

| ADR Number | ADR Title | Primary Source | Secondary Sources |
|------------|-----------|----------------|-------------------|
| 001 | [Title] | [Primary] | [Secondaries] |
| ... | ... | ... | ... |
```

### 4. Coverage Analysis
```markdown
## Coverage Analysis

### Product Goals Coverage
- Goal 1: [X] ADRs directly support
- Goal 2: [X] ADRs directly support
- Goal 3: [X] ADRs directly support

### Constraint Compliance
- [Constraint 1]: [X] ADRs respect
- [Constraint 2]: [X] ADRs respect
- [Constraint 3]: [X] ADRs respect

### Persona Pain Point Coverage
- [Persona 1]: [X] ADRs address [X] pains
- [Persona 2]: [X] ADRs address [X] pains

### MVP Risk Mitigation
- [Risk 1]: [X] ADRs provide mitigation
- [Risk 2]: [X] ADRs provide mitigation
```

### 5. Next Steps
```markdown
## Next Steps

- [ ] Review ADRs with product team for business alignment
- [ ] Validate ADRs against inception artifacts for completeness
- [ ] Socialize ADRs with stakeholders for buy-in
- [ ] Update status from "Proposed" to "Accepted" after approval
- [ ] Create implementation tasks linked to each ADR
- [ ] Schedule ADR review after MVP completion to assess decisions
```

---

## Quality Standards

### ✅ DO
- **Be Specific**: Quote exact text from inception artifacts
- **Be Complete**: Include all traceability sources for each ADR
- **Be Accurate**: Only claim traceability that exists in the ADR text
- **Be Organized**: Use consistent formatting across all ADR sections
- **Be Quantitative**: Use numbers and percentages in coverage analysis

### ❌ DON'T
- **Don't Fabricate**: Only include traceability that actually exists
- **Don't Genericize**: Use actual quotes, not placeholders
- **Don't Skip ADRs**: Every ADR needs a traceability section
- **Don't Overclaim**: Be honest about partial coverage
- **Don't Ignore Gaps**: Document any uncovered goals/constraints/pains

---

## Validation Checklist

Before finalizing the traceability matrix:

- [ ] All ADRs have individual traceability sections
- [ ] Each ADR references specific inception artifacts
- [ ] Product goals are quoted accurately from inception
- [ ] Constraints are correctly identified and categorized
- [ ] Persona pain points are traced to specific ADRs
- [ ] User journeys are referenced where applicable
- [ ] MVP Canvas elements are included (enablers, risks, metrics)
- [ ] Summary table is complete and accurate
- [ ] Coverage analysis includes all required metrics
- [ ] Coverage percentages are calculated correctly
- [ ] Document follows `TEMPLATE-TRACEABILITY_MATRIX.md` structure

---

## Example ADR Traceability Section

```markdown
## Traceability: ADR-001 - Use Next.js as Frontend Framework

**Inception Sources:**
- **Product Goals**:
  - Goal 1: "Reduce session organization time by 50% compared to manual tools"
  - Goal 3: "Enable 80% of users to run on free-tier infrastructure ($0/month)"
- **Constraints**:
  - "IS NOT: Hard to use" (Usability priority)
  - "IS NOT: Expensive to host" (Cost constraint)
  - "IS: Web Application" (Technology type)
- **Personas**:
  - Fernando (Intermediate tech savviness, needs intuitive interface)
  - Andrea (Intermediate tech savviness, needs mobile access)
- **Pain Points**:
  - Fernando: "Lot of manual work to manage the event with different sources of data"
  - Andrea: "Difficult to find a smooth an easy way to create a session proposal"
- **Features**:
  - Collect Proposals (CfP) - Must-have
  - User Authentication - Must-have
  - Speaker Profile (Photo Upload) - Must-have
- **User Journey 1**:
  - "Andrea browses the call for papers: Public Landing Page: Responsive design"
- **MVP Canvas**:
  - Technical Enablers: "Setup defined tech stack (Next.js + Tailwind + Database)"

**Decision Alignment:**
- This decision directly supports: MVP Goal of <3ms page load for smooth user experience
- This decision mitigates: Risk of complex architecture that exceeds volunteer capabilities
```

---

## Final Deliverable

Save the generated traceability matrix to: **`docs/adr/TRACEABILITY_MATRIX.md`**

Ensure it follows the template structure and includes complete traceability for every ADR with accurate references to inception artifacts.

---

**Ready to Map Decisions to Their Origins!** 🔗

Remember: Great traceability shows the **complete story** of how business needs drive technical decisions, creating a clear audit trail from vision to implementation.
