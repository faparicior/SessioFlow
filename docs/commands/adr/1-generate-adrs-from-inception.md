# Generate ADRs from Lean Inception Workshop

## Role

Act as a **Senior Software Architect** with expertise in **software engineering best practices**, **architectural decision-making**, and **Lean Inception methodology**. Your task is to analyze the Lean Inception workshop artifacts and extract architectural decisions that should be formally documented as Architectural Decision Records (ADRs).

---

## Your Mission

Review all Lean Inception files in the `docs/inception/` directory and generate comprehensive ADRs that capture the architectural and technical decisions implied by the workshop outcomes. These ADRs should bridge the gap between **business vision** and **technical implementation** from a Software Architect's perspective.

---

## Context: The Lean Inception Process

The Lean Inception workshop follows Paulo Caroli's methodology and consists of 8 sequential steps:

1. **Product Vision & Boundaries** - Elevator pitch, goals, and scope constraints
2. **Trade-offs** - Understanding business constraints (time, cost, quality, scope)
3. **Personas** - Target user profiles
4. **Empathy Map** - Deep dive into user needs, pains, and gains
5. **Brainstorming** - Feature ideation based on personas
6. **User Journey Mapping** - How users interact with the product
7. **Features & Sequencing** - Prioritization and release planning
8. **MVP Canvas Definition** - Final strategic blueprint for the first release

---

## Instructions

### Phase 1: Analyze the Inception Artifacts

Review all files in `docs/inception/` and extract:

1. **Technical Constraints** mentioned in:
   - Product boundaries ("IS NOT", "DOES NOT")
   - Trade-offs (cost, infrastructure, hosting)
   - MVP Canvas (technical enablers, risks)

2. **Architectural Drivers** from:
   - Product goals (performance, scalability expectations)
   - User pain points (from personas & empathy maps)
   - Feature requirements (from brainstorming & sequencing)

3. **Technology Implications** from:
   - MVP scope (what features need what tech)
   - User journeys (UX, frontend, backend needs)
   - Success metrics (monitoring, analytics requirements)

### Phase 2: Identify Architectural Decision Opportunities

Look for decisions needed in these categories:

#### Infrastructure & Deployment
- Hosting platform selection (based on cost constraints)
- Database technology (based on data model needs)
- Storage solutions (for files, media, user data)
- Scalability approach (based on load expectations)

#### Technology Stack
- Frontend framework (based on UX requirements)
- Backend framework (based on API needs)
- Authentication strategy (based on security & user types)
- State management (based on app complexity)

#### Development Workflow
- Testing strategy (based on quality requirements)
- CI/CD pipeline (based on deployment frequency)
- Branching strategy (based on team size & release cadence)
- Code quality tooling (linting, formatting, type-checking)

#### Architecture Patterns
- Project structure (based on scalability & maintainability)
- API design (REST, GraphQL, based on frontend needs)
- Data validation approach (based on security & UX)
- Error handling & logging strategy

#### Quality & Non-Functional Requirements
- Performance targets (from success metrics)
- Security measures (based on data sensitivity)
- Accessibility standards (from persona needs)
- Internationalization (from product scope)

### Phase 3: Generate ADRs

For **each identified architectural decision**, create an ADR following the template in `docs/adr/TEMPLATE.md`:

#### Mandatory ADR Quality Standards

1. **Context & Problem Statement**
   - Must be **value-neutral** and unbiased
   - Should reference specific pain points from inception (e.g., "Fernando spends too much time on manual data entry")
   - Include decision drivers that trace back to inception constraints (e.g., "$0/month infrastructure cost")

2. **Considered Options**
   - List **at least 2-3 viable alternatives** (no strawman options)
   - Options should reflect real-world choices (e.g., "Next.js vs. Remix vs. Vite + React")

3. **Decision Outcome**
   - **Chosen option** must align with inception constraints
   - **Justification** must reference decision drivers and inception context
   - **Consequences** must be honest (include negatives & risks)

4. **Pros and Cons Analysis**
   - Each option must have balanced pros/cons
   - Pros/cons should relate to inception metrics (e.g., "Good, because it enables <3min review time per session")

5. **Traceability**
   - Link each ADR back to inception artifacts:
     - "This addresses [Persona Name]'s pain: [quoted pain point]"
     - "This supports MVP Goal #X: [quoted goal]"
     - "This respects the constraint: [IS NOT / DOES NOT item]"

#### Metadata Requirements

- **Status**: Use "Proposed" for new ADRs
- **Date**: Use today's date (YYYY-MM-DD format)
- **Decision Makers**: Use "Product Team" or specific roles if mentioned in inception
- **Supersedes/Amended By**: Use "N/A" for new ADRs

#### Naming Convention

Use the format: `0XX-descriptive-name.md` where:
- `0XX` is the next available number in sequence (check existing ADRs)
- `descriptive-name` is kebab-case and clearly describes the decision

---

## Validation Process

After generating each ADR, **self-validate** using the criteria from `docs/commands/adr/1-ADR-validator.md`:

1. ✅ **Metadata & Formal Compliance** - All required fields present
2. ✅ **Context & Problem Statement** - Clear, objective, with explicit drivers
3. ✅ **Options & Analysis** - Multiple viable options with balanced analysis
4. ✅ **Decision Outcome** - Clear choice with logical justification
5. ✅ **Consequences** - Positive, negative, and risks explicitly listed
6. ✅ **Links & References** - Trace back to inception documents

If any ADR scores **Medium or Low** compliance, revise it before finalizing.

---

## Output Format

For each generated ADR, provide:

### 1. ADR File
- Full ADR content following the template
- Save to `docs/adr/0XX-decision-name.md`

### 2. Inception Traceability Matrix
For each ADR, document:

```markdown
## Traceability: ADR-0XX - [Title]

**Inception Sources:**
- **Product Goals**: [List relevant goals from Step 1]
- **Constraints**: [List relevant IS NOT / DOES NOT items]
- **Personas**: [Which persona(s) benefit from this decision]
- **Pain Points**: [Specific pains from empathy map]
- **Features**: [Features from Steps 5 & 7 that require this decision]
- **MVP Canvas**: [Relevant technical enablers or risks]

**Decision Alignment:**
- This decision directly supports: [specific MVP metrics]
- This decision mitigates: [specific risks from inception]
```

### 3. Summary Report

After generating all ADRs, provide:

```markdown
## ADR Generation Summary

**Total ADRs Generated**: X

### Coverage Analysis
- ✅ Infrastructure & Deployment: X ADRs
- ✅ Technology Stack: X ADRs
- ✅ Development Workflow: X ADRs
- ✅ Architecture Patterns: X ADRs
- ✅ Quality & NFRs: X ADRs

### Inception Alignment Score
- **Product Goals Coverage**: X/3 goals have supporting ADRs
- **Constraint Compliance**: All ADRs respect IS NOT / DOES NOT boundaries
- **Persona Pain Coverage**: X/Y persona pains directly addressed
- **MVP Risk Mitigation**: X/Y risks from MVP Canvas have architectural solutions

### Next Steps
- [ ] Review ADRs with product team
- [ ] Validate ADRs against inception artifacts
- [ ] Socialize ADRs with stakeholders
- [ ] Update status from "Proposed" to "Accepted" after approval
```

---

## Best Practices & Guardrails

### DO
✅ **Maintain Inception Perspective**: Every ADR should feel like a natural evolution of workshop decisions
✅ **Respect Constraints**: If inception says "$0/month", ADRs must honor this
✅ **Think Holistically**: Consider how decisions interact (e.g., Next.js + Vercel alignment)
✅ **Be Specific**: Reference actual inception quotes (e.g., "Andrea often submits on the go")
✅ **Balance Depth & Pragmatism**: ADRs should be thorough but not over-engineered for MVP scope

### DON'T
❌ **Don't introduce new requirements**: Only formalize what's implied by inception
❌ **Don't contradict inception**: If MVP Canvas says "Wave 2+", don't create ADRs for it
❌ **Don't use jargon without context**: Remember Fernando (the organizer) might read these
❌ **Don't create ADRs for obvious choices**: Only document decisions with real trade-offs
❌ **Don't ignore negative consequences**: Inception is honest about risks - ADRs should be too

---

## Example ADR Scenario

**From Inception Context:**
- **Constraint**: "Is simple, cost-effective, and easy to use" + "$0/month infrastructure"
- **Feature**: "Speaker Profile & Photo Upload" (MVP Canvas)
- **Pain**: Andrea needs to submit quickly and easily
- **Risk**: GDPR/Privacy compliance (MVP Canvas)

**Resulting ADR**: *002-use-supabase-for-backend*

**Why This Decision Needed an ADR:**
1. **Trade-off**: Self-hosted DB vs. managed BaaS
2. **Decision Drivers**: Cost constraint, ease of setup, image storage need, RLS for GDPR
3. **Options Considered**: Supabase, Firebase, Postgres on Fly.io
4. **Chosen**: Supabase (free tier, built-in auth, storage, RLS)
5. **Traceability**: Directly enables "photo upload", respects "$0/month", mitigates GDPR risk

---

## Final Checklist

Before submitting your ADR generation work:

- [ ] All inception files in `docs/inception/` have been reviewed
- [ ] Each ADR follows `docs/adr/TEMPLATE.md` structure exactly
- [ ] Each ADR passes `docs/commands/adr/2-ADR-validator.md` criteria (≥Medium compliance)
- [ ] Traceability matrix connects each ADR to specific inception artifacts
- [ ] No ADRs contradict inception constraints or scope
- [ ] Summary report shows comprehensive architectural coverage
- [ ] ADR numbering continues from existing sequence in `docs/adr/`
- [ ] Language is clear, objective, and accessible (not just for architects)

---

**Ready to Transform Inception into Architecture!** 🏗️

Remember: Great ADRs are like great inception artifacts - they tell a clear story of **WHY** we're building this way, not just **WHAT** we're building.
