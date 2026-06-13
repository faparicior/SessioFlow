---
name: inception-workshop
description: Facilitate Lean Inception workshops through 8 structured steps: Product Vision → Tradeoffs → Personas → Empathy Map → Brainstorming → User Journey → Features & Sequencing → MVP Canvas. Includes AI debate simulation for tradeoff analysis.
compatibility: Requires bash and pi subagent capability
---

# Inception Workshop Skill

Facilitate Lean Inception workshops through 8 structured steps: Product Vision → Tradeoffs → Personas → Empathy Map → Brainstorming → User Journey → Features & Sequencing → MVP Canvas.

## Commands

### Start Interactive Facilitation

**Template → Fill → Validate workflow:**

```bash
pi skill inception-workshop --mode facilitate --step [N]
```

**Options:**
- `--mode facilitate` - Interactive template→fill→validate (default)
- `--mode batch` - Generate all steps automatically
- `--mode tradeoff-generator` - Use AI debate to generate tradeoffs
- `--step [N]` - Start from specific step (1-8), default: 1

### Examples

```bash
# Start from Step 1 (default)
pi skill inception-workshop --mode facilitate

# Start from Step 6 (Journey Mapping)
pi skill inception-workshop --mode facilitate --step 6

# Generate all steps automatically
pi skill inception-workshop --mode batch --context "SessioFlow: Call-for-Papers platform"

# Use AI debate to generate tradeoffs (Step 2 only)
pi skill inception-workshop --mode tradeoff-generator

# Validate a completed step
pi skill inception-workshop --mode validate --step 1 --file docs/inception/1-product-vision-and-boundaries.md
```

## Workflow

### Facilitate Mode (Template → Fill → Validate)

```
┌─────────────┐
│   Step N    │
│  Template   │
└──────┬──────┘
       │
       v
┌─────────────┐
│ Create      │
│ Output File │
└──────┬──────┘
       │
       v
┌─────────────┐
│ User Fills  │
│ & Commits   │
└──────┬──────┘
       │
       v
┌─────────────┐
│   Validate  │
│  Against    │
│  Criteria   │
└──────┬──────┘
       │
       v
┌─────────────┐
│  Score ≥ 8? │──No──> Provide Feedback
└──────┬──────┘
       │ Yes
       v
┌─────────────┐
│ Proceed to  │
│ Step N+1    │
└─────────────┘
```

### Tradeoff Generator Mode (AI Debate)

**Special mode for Step 2 only** - Simulates stakeholder debate to generate tradeoff analysis:

```
┌─────────────────────┐
│ Read Vision (Step 1)│
└───────┬─────────────┘
        │
        v
┌─────────────────────┐
│ Simulate Debate:    │
│ - Product Owner     │
│ - User Advocate     │
│ - Tech Lead         │
│ - Agile Coach       │
└───────┬─────────────┘
        │
        v
┌─────────────────────┐
│ Generate Consensus  │
│ Trade-off Board     │
└───────┬─────────────┘
        │
        v
┌─────────────────────┐
│ Validate Against    │
│ Quality Criteria    │
└───────┬─────────────┘
        │
        v
┌─────────────────────┐
│ Output: 2-tradeoffs │
│ .md                 │
└─────────────────────┘
```

### Batch Mode

```bash
# All 8 steps generated automatically
pi skill inception-workshop --mode batch --context "Your product description"
```

## Step Mapping

| Step | Name | Template | Output | Validator | Special Mode |
|------|------|----------|--------|-----------|--------------|
| 1 | Product Vision & Boundaries | `templates/1-product-vision-and-boundaries.md` | `docs/inception/1-product-vision-and-boundaries.md` | `references/1-product-vision-boundary-validator.md` | - |
| 2 | Tradeoffs | `templates/2-tradeoffs.md` | `docs/inception/2-tradeoffs.md` | `references/2.2-tradeoff-validator.md` | ✅ **Tradeoff Generator** |
| 3 | Personas | `templates/3-personas.md` | `docs/inception/3-personas.md` | `references/3-personas-validator.md` | - |
| 4 | Empathy Map | `templates/4-empathy-map.md` | `docs/inception/4-empathy-map.md` | `references/4-empathy-map-validator.md` | - |
| 5 | Brainstorming | `templates/5-brainstorming.md` | `docs/inception/5-brainstorming.md` | `references/5-brainstorming-validator.md` | - |
| 6 | User Journey | `templates/6-user-journey-mapping.md` | `docs/inception/6-user-journey.md` | `references/6-user-journey-validator.md` | - |
| 7 | Features & Sequencing | `templates/7-features-and-sequencing.md` | `docs/inception/7-features-and-sequencing.md` | `references/7-features-and-sequencing-validator.md` | - |
| 8 | MVP Canvas | `templates/8-mvp-canvas-definition.md` | `docs/inception/8-mvp-canvas.md` | `references/8-mvp-canvas-definition-validator.md` | - |

## Tradeoff Generator Mode (Step 2 Special)

### What It Does

The Tradeoff Generator uses AI to **simulate stakeholder debate** and generate a consensus tradeoff board:

**Roles Simulated:**
1. **Product Owner (Business)** - Champions goals and values from vision
2. **User Advocate (UX)** - Represents user needs from the "Who" in vision
3. **Tech Lead (Engineering)** - Assesses technical constraints from "Is/Is Not"
4. **Agile Coach (Facilitator)** - Enforces the Golden Rule (one check per column)

### Process

1. **Analyze Vision** - Read Step 1 output to understand goals, users, and constraints
2. **Simulate Debate** - Roles argue for their priorities based on their perspective
3. **Resolve Conflicts** - Create strict 1-7 ranking where roles compromise
4. **Validate** - Self-audit against validator criteria before output
5. **Generate Output** - Create filled tradeoff template with consensus reasoning

### Output Structure

```markdown
# Step 2: Tradeoffs

## 1. Individual Perspectives

### Product Owner
- Initially prioritized: [X, Y, Z]
- Reasoning: Based on business goals from vision...

### User Advocate
- Initially prioritized: [A, B, C]
- Reasoning: Based on user needs from vision...

### Tech Lead
- Initially prioritized: [P, Q, R]
- Reasoning: Based on technical constraints...

## 2. Final Consensus Trade-off Board

| Qualities | 1 (Most Important) | 2 | 3 | 4 | 5 | 6 | 7 (Least Important) |
|-----------|-------------------|---|---|---|---|---|---------------------|
| Flexibility | | | ✓ | | | | |
| Time to Market | | ✓ | | | | | |
| Cost | ✓ | | | | | | |
| ... | | | | | | | |

## 3. Consensus Reasoning

The team agreed on [X] as most important because...

Key trade-offs made:
- Cost vs Scalability: Chose Cost because vision says "MVP"
- Flexibility vs Simplicity: Chose Simplicity because user is "non-technical"
```

### Usage

```bash
# Generate tradeoffs using AI debate
pi skill inception-workshop --mode tradeoff-generator

# Or using the script
.pi/skills/inception-workshop/facilitator.sh tradeoff
```

**Requirements:**
- Step 1 (Product Vision) must be completed first
- Reads: `docs/inception/1-product-vision-and-boundaries.md`
- Outputs: `docs/inception/2-tradeoffs.md`

## Output Structure

```
docs/inception/
├── 1-product-vision-and-boundaries.md    # Step 1 output
├── 2-tradeoffs.md                        # Step 2 output
├── 3-personas.md                         # Step 3 output
├── 4-empathy-map.md                      # Step 4 output
├── 5-brainstorming.md                    # Step 5 output
├── 6-user-journey.md                     # Step 6 output
├── 7-features-and-sequencing.md          # Step 7 output
└── 8-mvp-canvas.md                       # Step 8 output
```

## Validation Scoring

Each step is validated against criteria from the validator file:

| Score | Status | Action |
|-------|--------|--------|
| 9-10 | ✅ Excellent | Proceed to next step |
| 8-8.9 | ✅ Good | Proceed to next step |
| 6-7.9 | ⚠️ Needs Work | Provide feedback, user revises |
| < 6 | ❌ Poor | Provide detailed feedback, user revises |

## Integration with Flow Documentation

After completing Step 6 (User Journey), the skill can automatically generate flow specifications:

```bash
pi skill inception-workshop --mode generate-flows --from-step 6
```

This will:
1. Read the completed user journey
2. Extract MVP features from Step 7
3. Generate flow specifications using `docs/templates/product/flows.md`
4. Output to `docs/product/bounded-contexts/{context}/flows/`

## Configuration

### Bundled Assets

This skill includes all required templates and validators as bundled assets:

**Templates:** (in `templates/` directory)
- `templates/1-product-vision-and-boundaries.md`
- `templates/2-tradeoffs.md`
- `templates/3-personas.md`
- `templates/4-empathy-map.md`
- `templates/5-brainstorming.md`
- `templates/6-user-journey-mapping.md`
- `templates/7-features-and-sequencing.md`
- `templates/8-mvp-canvas-definition.md`

**Validators:** (in `references/` directory)
- `references/1-product-vision-boundary-validator.md`
- `references/2.2-tradeoff-validator.md`
- `references/3-personas-validator.md`
- `references/4-empathy-map-validator.md`
- `references/5-brainstorming-validator.md`
- `references/6-user-journey-validator.md`
- `references/7-features-and-sequencing-validator.md`
- `references/8-mvp-canvas-definition-validator.md`

**Tradeoff Generator:**
- `references/2.1-tradeoff-generator.md` - AI debate simulation prompt

**Additional References:**
- `references/0-inception-workshop.md` - Complete workshop guide
- `references/automate-inception.md` - Automation patterns
- `references/facilitate-step.md` - Step facilitation details
- `references/run-inception-chain.md` - Chain execution guide

### Output Directory

- `docs/inception/` - Created automatically if not exists

## Examples

### Interactive Facilitation

```
> pi skill inception-workshop --mode facilitate

Skill: Inception Workshop Facilitator

Step 1: Product Vision & Boundaries

I've created the template at:
  docs/inception/1-product-vision-and-boundaries.md

Template Structure:
```markdown
# Step 1: Product Vision & Boundaries

## Elevator Pitch
- **Problem:** [Fill this]
- **Solution:** [Fill this]
...
```

Please fill this document and commit when ready. Let me know when you want validation.

[User fills and commits]

> Ready for validation

Skill: Validating Step 1...

**Validation Results:**
✅ Elevator Pitch: Complete (5/5 components)
✅ Is/Is Not: Clear boundaries
⚠️ Metrics: Could be more specific

**Score: 8.5/10**

Step 1 is complete! Ready to proceed to Step 2: Tradeoffs? (yes/no)
```

### Tradeoff Generator (Step 2 Special)

```
> pi skill inception-workshop --mode tradeoff-generator

Skill: Tradeoff Generator (AI Debate Simulation)

Reading: docs/inception/1-product-vision-and-boundaries.md
Template: docs/templates/inception/2-tradeoffs.md
Validator: docs/commands/inception/2.2-tradeoff-validator.md

Simulating stakeholder debate...

🎭 **Product Owner:** "Based on the vision's goal of 'quick MVP launch', I prioritize Time to Market and Cost over Scalability."

🎭 **User Advocate:** "The 'Who' is 'busy event organizers' - they need Simplicity and Usability above all."

🎭 **Tech Lead:** "The 'Is/Is Not' says this is NOT a complex enterprise system, so I can accept lower Flexibility for faster delivery."

🎭 **Agile Coach:** "Remember the Golden Rule - only one check per column. Let's find consensus."

---

Generating consensus trade-off board...

✅ Tradeoff analysis complete!

**Generated:** docs/inception/2-tradeoffs.md

**Key Trade-offs Made:**
- Cost > Scalability (MVP focus from vision)
- Simplicity > Flexibility (Non-technical users)
- Time to Market > Perfect Architecture (Quick launch goal)

Ready to proceed to Step 3: Personas? (yes/no)
```

### Batch Generation

```
> pi skill inception-workshop --mode batch --context "SessioFlow: Call-for-Papers platform for event organizers"

Skill: Inception Workshop (Batch Mode)

Generating all 8 steps...

Step 1: Product Vision... ✅
Step 2: Tradeoffs... ✅
Step 3: Personas... ✅
Step 4: Empathy Map... ✅
Step 5: Brainstorming... ✅
Step 6: User Journey... ✅
Step 7: Features & Sequencing... ✅
Step 8: MVP Canvas... ✅

All steps completed!
Files created in docs/inception/

Validation Summary:
- Step 1: 9/10
- Step 2: 8.5/10
- Step 3: 9/10
- Step 4: 8/10
- Step 5: 8.5/10
- Step 6: 9/10
- Step 7: 8.5/10
- Step 8: 9/10

Average Score: 8.7/10
```

### Generate Flows from Journey

```
> pi skill inception-workshop --mode generate-flows --from-step 6

Skill: Generating Flow Specifications

Reading: docs/inception/6-user-journey.md
Reading: docs/inception/7-features-and-sequencing.md

Generating flows for MVP features:
- Journey 01: Setup Event... ✅
- Journey 02: Submit Proposal... ✅
- Journey 03: Review Sessions... ✅
- Journey 04: Acceptance & Logistics... ✅

Files created:
- docs/product/bounded-contexts/event/flows/journey-01-setup-event.md
- docs/product/bounded-contexts/submission/flows/journey-02-submit-proposal.md
- docs/product/bounded-contexts/review/flows/journey-03-review-sessions.md
- docs/product/bounded-contexts/scheduling/flows/journey-04-acceptance-logistics.md

All flows include:
- Sequence diagram (with error paths)
- Flowchart (decision points)
- State diagram (entity lifecycle)
- Step-by-step walkthrough
- Edge cases & validation rules
```

## Related Skills

- **Flow Generator** - Create detailed flow specifications from user stories
- **Business Rule Extractor** - Identify business rules and invariants from requirements
- **DDD Model Builder** - Generate domain model from inception outputs

---

**Version:** 1.0.0  
**Last Updated:** 2026-06-13
