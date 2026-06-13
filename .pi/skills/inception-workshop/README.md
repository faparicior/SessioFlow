# Inception Workshop Skill

A pi skill for facilitating Lean Inception workshops through 8 structured steps.

## Quick Start

### Interactive Mode (Recommended)

```bash
# Start the facilitator
pi skill inception-workshop

# Or run the script directly
.pi/skills/inception-workshop/facilitator.sh
```

### Tradeoff Generator (Step 2 Special)

```bash
# Use AI debate to generate tradeoffs
pi skill inception-workshop tradeoff

# Or using the script
.pi/skills/inception-workshop/facilitator.sh tradeoff
```

### Batch Mode

```bash
# Generate all steps automatically
pi skill inception-workshop batch "Your product description here"
```

## How It Works

### Interactive Mode Flow

```
┌─────────────────────────────────────┐
│  1. Agent creates template file     │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  2. You fill the markdown file      │
│     and commit to git               │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  3. Agent validates against         │
│     quality criteria                │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  4. If valid (≥8/10) → Next step   │
│     If invalid → Provide feedback   │
└─────────────────────────────────────┘
```

## Usage

### Start Interactive Facilitation

```bash
# Start from Step 1
pi skill inception-workshop

# Start from a specific step
pi skill inception-workshop 6

# Using the script directly
.pi/skills/inception-workshop/facilitator.sh
```

### Tradeoff Generator (Step 2 Special)

**Use AI debate simulation** to generate tradeoff analysis:

```bash
# Generate tradeoffs using AI debate
pi skill inception-workshop tradeoff

# Or using the script
.pi/skills/inception-workshop/facilitator.sh tradeoff
```

**What it does:**
- Reads Step 1 (Product Vision)
- Simulates debate between 4 stakeholders (PO, User Advocate, Tech Lead, Agile Coach)
- Generates consensus tradeoff board with strict 1-7 ranking
- Validates against quality criteria

**Requirements:**
- Step 1 must be completed first
- Outputs: `docs/inception/2-tradeoffs.md`

### Batch Generation

```bash
# Generate all 8 steps at once
pi skill inception-workshop batch "SessioFlow: Call-for-Papers platform for event organizers"

# Or using the script
.pi/skills/inception-workshop/facilitator.sh batch "Your product context"
```

### Validate a Specific Step

```bash
# Validate Step 1
pi skill inception-workshop validate 1

# Or using the script
.pi/skills/inception-workshop/facilitator.sh validate 1
```

## Step Reference

| # | Step Name | Template | Output |
|---|-----------|----------|--------|
| 1 | Product Vision & Boundaries | `1-product-vision-and-boundaries.md` | `1-product-vision-and-boundaries.md` |
| 2 | Tradeoffs | `2-tradeoffs.md` | `2-tradeoffs.md` |
| 3 | Personas | `3-personas.md` | `3-personas.md` |
| 4 | Empathy Map | `4-empathy-map.md` | `4-empathy-map.md` |
| 5 | Brainstorming | `5-brainstorming.md` | `5-brainstorming.md` |
| 6 | User Journey | `6-user-journey-mapping.md` | `6-user-journey.md` |
| 7 | Features & Sequencing | `7-features-and-sequencing.md` | `7-features-and-sequencing.md` |
| 8 | MVP Canvas | `8-mvp-canvas-definition.md` | `8-mvp-canvas.md` |

## File Locations

**Templates:** `templates/` (bundled with skill)  
**References:** `references/` (bundled with skill)  
**Outputs:** `docs/inception/` (created at runtime)

## Integration with Flow Documentation

After completing Step 6 (User Journey), you can automatically generate flow specifications:

```bash
pi subagent << 'EOF'
Read docs/inception/6-user-journey.md and docs/inception/7-features-and-sequencing.md

For each MVP feature:
1. Create flow specification using docs/templates/product/flows.md
2. Include 3 diagrams (sequence, flowchart, state)
3. Extract business rules and invariants
4. Output to docs/product/bounded-contexts/{context}/flows/
EOF
```

## Validation Scoring

| Score | Status | Action |
|-------|--------|--------|
| 9-10 | ✅ Excellent | Proceed to next step |
| 8-8.9 | ✅ Good | Proceed to next step |
| 6-7.9 | ⚠️ Needs Work | Provide feedback, revise |
| < 6 | ❌ Poor | Detailed feedback, revise |

## Examples

### Tradeoff Generator (AI Debate Simulation)

```
> pi skill inception-workshop tradeoff

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

### Interactive Session

```
> pi skill inception-workshop

🚀 Starting Step 1...

========================================
  Step 1: Product Vision & Boundaries
========================================

📄 Template Structure:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: Product Vision & Boundaries

## Elevator Pitch
- **Problem:** [Fill this]
- **Solution:** [Fill this]
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 YOUR TURN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please fill the document at:
  docs/inception/1-product-vision-and-boundaries.md

When ready for validation, type: ready
```

### Batch Mode Output

```
> pi skill inception-workshop batch "SessioFlow platform"

🤖 Batch Mode: Generating all 8 steps...

Step 1: 1-product-vision-and-boundaries.md... ✓
Step 2: 2-tradeoffs.md... ✓
Step 3: 3-personas.md... ✓
Step 4: 4-empathy-map.md... ✓
Step 5: 5-brainstorming.md... ✓
Step 6: 6-user-journey.md... ✓
Step 7: 7-features-and-sequencing.md... ✓
Step 8: 8-mvp-canvas.md... ✓

🎉 All 8 steps generated successfully!
```

## Requirements

- Templates must exist in `docs/templates/inception/`
- Validators must exist in `docs/commands/inception/`
- Output directory `docs/inception/` will be created automatically

## Related Documentation

- [Inception Workshop Guide](../../docs/commands/inception/0-inception-workshop.md)
- [Flow Documentation Structure](../../docs/product/guidelines/flow-documentation-structure.md)
- [Templates](../../docs/templates/inception/)
- [Validators](../../docs/commands/inception/)

---

**Version:** 1.0.0  
**Last Updated:** 2026-06-13
