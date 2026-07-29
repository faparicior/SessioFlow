# Step 3: Personas Guidance & Template

## Goal
Define the primary persona(s) who will use the product. Understanding who we're building for is critical to making informed decisions in later steps.

## Directory Structure Strategy
Step 3 outputs to a folder: `docs/inception/3-personas/`

Create:
1. `docs/inception/3-personas/README.md` — Overview persona index table & Persona Validation checklist.
2. `docs/inception/3-personas/01-[persona-slug].md` — Primary Persona document (do not add `persona-` prefix).
3. `docs/inception/3-personas/02-[persona-slug].md` — Secondary Persona document (do not add `persona-` prefix).

---

## 1. Persona File Structure (`01-[persona-slug].md`)

```markdown
# [Primary / Secondary] Persona: [Persona Name / Role]

**Persona Name:** [Name and descriptive title]

| Attribute | Details |
| :--- | :--- |
| **Age & Demographics** | [e.g., 28-35 years old, urban professional] |
| **Role/Job Title** | [e.g., Volunteer Organizer / Speaker] |
| **Experience Level** | [e.g., 3-5 years experience, intermediate tech skills] |
| **Work Environment** | [e.g., Full remote, asynchronous work] |

### Goals & Motivations
- **Primary Goal:** [Primary goal]
- **Secondary Goal:** [Secondary goal]
- **What motivates them:** [Key motivator]

### Pain Points & Frustrations
- ❌ **Pain 1:** [First pain point]
- ❌ **Pain 2:** [Second pain point]
- ❌ **Pain 3:** [Third pain point]

### Needs & Expectations
- ✅ **Need 1:** [First need]
- ✅ **Need 2:** [Second need]
- ✅ **Need 3:** [Third need]

### Tech Savviness
- [ ] Beginner (needs hand-holding, prefers simple interfaces)
- [X] Intermediate (comfortable with standard tools, learns quickly)
- [ ] Advanced (power user, wants customization and shortcuts)

### Quote
> *"[A memorable quote capturing their mindset or main frustration]"*
```

---

## 2. Directory Index (`README.md`)

```markdown
# Step 3: Personas

## Persona Directory

| # | Persona | Type | Role | File |
|---|---------|------|------|------|
| 1 | **[Name]** | Primary Persona | [Role] | [01-[slug].md](./01-[slug].md) |
| 2 | **[Name]** | Secondary Persona | [Role] | [02-[slug].md](./02-[slug].md) |

## Persona Validation
- [ ] Is this persona clearly defined enough that the team can visualize them?
- [ ] Do the pain points align with the product vision from Step 1?
- [ ] Can we prioritize this persona over others for the MVP?
- [ ] Do we have enough detail to make design and feature decisions?
```