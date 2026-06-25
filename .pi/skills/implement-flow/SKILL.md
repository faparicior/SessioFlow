---
name: implement-flow
description: >-
  Implement features following SessioFlow's DDD structure, flow-driven development, and workflows.
  LOAD THIS SKILL when user mentions: implement feature, add feature, create feature, 
  develop feature, build feature, implement [feature name], add [feature name], 
  implement flow, develop flow, flow journey, or any feature/flow implementation task. 
  Executes feature analysis, flow-driven DDD implementation, testing, and development plan updates.
---

# Implement Flow Skill

This skill guides feature implementation through flow-driven analysis, planning, and incremental development.

**Important**: Follow AGENTS.md for all code conventions, testing standards, and quality requirements.

### Step 1: Understand the Flow
- Read flow documentation in `docs/product/bounded-contexts/[context]/flows/`
- Identify which DDD layer(s) are affected
- Check development plan for implementation phase

### Step 2: Review Existing Patterns
- Search `src/` for similar implementations (`rg` command)
- Review relevant ADRs in `docs/adr/`
- Follow conventions in AGENTS.md

### Step 3: Implement Incrementally

**Recommended Progression**:
1. **Domain Layer** - Value objects, entities, domain services
2. **Domain Interfaces** - Repository interfaces, domain events, exceptions
3. **Infrastructure** - Repository implementations, external adapters
4. **Application** - Use cases with validation
5. **Interfaces** - API endpoints, frontend components
6. **Testing** - Unit, integration, and E2E tests

*Note: Adjust based on feature requirements and existing patterns.*

### Step 4: Validate & Update
- Run tests: `npm test`
- Check linting: `npm run lint`
- Verify types: `npm run typecheck`
- Update development plan with completed tasks

---

## 📝 Planning Templates

### Flow-Level Plan

**Location:** Created alongside flow markdown files

**Naming Convention:** `[flow-filename]-plan.md`

**Example:** For `journey-01-setup-event.md`, create `journey-01-setup-event-plan.md`

**Purpose:** Track implementation of ALL features within a flow, validate E2E completion, and manage dependencies between features.

### Feature-Level Specification

**Location:** `docs/product/bounded-contexts/[context]/flows/features/`

**Naming Convention:** `feature-[feature-name].md`

**Example:** `feature-event-basics.md`, `feature-cfp-management.md`

**Purpose:** Define individual feature requirements, implementation scope, and acceptance criteria within a flow.

**Template:** `.pi/skills/implement-flow/templates/feature-spec.md`

---

**Workflow:**
1. Read flow documentation
2. Create feature specifications for each feature in the flow
3. Create flow-level development plan that tracks all features
4. Implement features incrementally, updating both feature spec and flow plan

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| Flow Development Plan | `docs/product/bounded-contexts/[context]/flows/[flow-name]-plan.md` |
| Feature Specification | `docs/product/bounded-contexts/[context]/flows/features/feature-[name].md` |
| Flow Documentation | `docs/product/bounded-contexts/[context]/flows/[flow-name].md` |
| AGENTS.md | **Project conventions and quality standards** |
| ADRs | `docs/adr/` - Architectural decisions |

**Reference**: See AGENTS.md for code style, testing guidelines, and definition of done.

---

## ✅ Success Criteria

- Follows AGENTS.md definition of done
- Development plan updated with completed tasks
- All tests pass (`npm test`)
- Linting passes (`npm run lint`)
- Type checking passes (`npm run typecheck`)