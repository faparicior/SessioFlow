# Natural Language Commands for Inception Workshop Skill

This document lists all the natural language phrases that activate the Inception Workshop skill.

## Quick Reference

### 🚀 Start Workshop

| Natural Language | What It Does |
|------------------|--------------|
| "Start an inception workshop" | Begins Step 1 (Product Vision) |
| "Run a Lean Inception" | Begins Step 1 (Product Vision) |
| "Begin product discovery" | Begins Step 1 (Product Vision) |
| "Let's do an inception" | Begins Step 1 (Product Vision) |
| "Start the inception process" | Begins Step 1 (Product Vision) |

### 📝 Specific Steps

| Natural Language | What It Does |
|------------------|--------------|
| "Let's work on the personas" | Activates Step 3: Personas |
| "Create the empathy map" | Activates Step 4: Empathy Map |
| "Start user journey mapping" | Activates Step 6: User Journey |
| "Work on the product vision" | Activates Step 1: Product Vision |
| "Do the tradeoffs analysis" | Activates Step 2: Tradeoffs |
| "Brainstorm features" | Activates Step 5: Brainstorming |
| "Plan the feature sequencing" | Activates Step 7: Features & Sequencing |
| "Define the MVP canvas" | Activates Step 8: MVP Canvas |

### ⚖️ Tradeoff Generator (AI Debate)

| Natural Language | What It Does |
|------------------|--------------|
| "Generate tradeoffs using AI debate" | Runs stakeholder debate simulation |
| "Run the tradeoff debate" | Runs stakeholder debate simulation |
| "Analyze project trade-offs" | Runs stakeholder debate simulation |
| "Create the trade-off board" | Runs stakeholder debate simulation |

### 📊 Validation

| Natural Language | What It Does |
|------------------|--------------|
| "Validate the product vision" | Validates Step 1 |
| "Check if the personas are complete" | Validates Step 3 |
| "Review the user journey" | Validates Step 6 |
| "Validate the MVP canvas" | Validates Step 8 |
| "Check the tradeoffs" | Validates Step 2 |

### 🔄 Batch Generation

| Natural Language | What It Does |
|------------------|--------------|
| "Generate all inception steps" | Auto-generates all 8 steps |
| "Create the full workshop output" | Auto-generates all 8 steps |
| "Auto-generate inception docs" | Auto-generates all 8 steps |

### 🌊 Flow Generation

| Natural Language | What It Does |
|------------------|--------------|
| "Generate flows from the journey" | Creates flow specs from Step 6 |
| "Create flow specifications" | Creates flow specs from Step 6 |
| "Turn the journey into flows" | Creates flow specs from Step 6 |

---

## Complete Phrase List by Category

### Product Vision (Step 1)
- "Define the product vision"
- "Create the elevator pitch"
- "Set the vision and boundaries"
- "Work on the vision"
- "Define what we're building"

### Tradeoffs (Step 2)
- "Understand the trade-offs"
- "Prioritize qualities"
- "Create the trade-off board"
- "Analyze project constraints"
- "What are the trade-offs?"

### Personas (Step 3)
- "Define the personas"
- "Create user personas"
- "Who is our primary user?"
- "Define the target user"
- "Persona work"

### Empathy Map (Step 4)
- "Create an empathy map"
- "Understand the user better"
- "Map out user empathy"
- "What does the user think/feel?"
- "Empathy blueprint"

### Brainstorming (Step 5)
- "Brainstorm features"
- "Generate feature ideas"
- "What features should we build?"
- "Idea generation"
- "Feature discovery"

### User Journey (Step 6)
- "Map the user journey"
- "Create user flows"
- "Walk through the customer journey"
- "How does the user interact?"
- "Journey mapping"

### Features & Sequencing (Step 7)
- "Plan the release roadmap"
- "Sequence the features"
- "What goes in the MVP?"
- "Release planning"
- "Prioritize the roadmap"

### MVP Canvas (Step 8)
- "Define the MVP"
- "Create the MVP canvas"
- "What's our minimum viable product?"
- "MVP scope definition"
- "Define the cupcake"

---

## Context-Aware Activation

The skill can also be activated with contextual phrases:

| Context | Natural Language |
|---------|------------------|
| Starting fresh | "We need to define what we're building" → Step 1 |
| Already have vision | "Who are we building this for?" → Step 3 |
| Have personas | "What do they actually experience?" → Step 4 |
| Have features | "How do users actually use these?" → Step 6 |
| Have journey | "What should we build first?" → Step 7 |
| Have sequencing | "What's our MVP?" → Step 8 |

---

## Command-Line Equivalent

For reference, here's how natural language maps to CLI commands:

```bash
# Natural language → CLI equivalent

"Start an inception workshop"
→ pi skill inception-workshop --mode facilitate --step 1

"Work on the empathy map"
→ pi skill inception-workshop --mode facilitate --step 4

"Generate tradeoffs"
→ pi skill inception-workshop --mode tradeoff-generator

"Validate the user journey"
→ pi skill inception-workshop --mode validate --step 6 --file docs/inception/6-user-journey.md

"Generate all steps"
→ pi skill inception-workshop --mode batch --context "Your product description"

"Create flows from the journey"
→ pi skill inception-workshop --mode generate-flows --from-step 6
```

---

## Trigger Words

The skill monitors for these keywords in any conversation:

**Primary Triggers:**
- inception
- lean inception
- workshop
- product vision
- tradeoffs
- personas
- empathy map
- brainstorming
- user journey
- MVP canvas
- feature sequencing

**Secondary Triggers:**
- validate
- review
- check
- generate
- create
- define
- start
- run

When these words appear in context with product discovery activities, the skill can be activated naturally.

---

**Version:** 1.1.0  
**Last Updated:** 2026-06-13  
**Skill File:** `.pi/skills/inception-workshop/SKILL.md`
