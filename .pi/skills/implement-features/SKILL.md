---
name: implement-features
description: >-
  Implement new features following SessioFlow's DDD structure and development workflows.
  LOAD THIS SKILL when user mentions: implement feature, add feature, create feature, 
  develop feature, build feature, implement [feature name], add [feature name], 
  or any feature implementation task. Executes feature analysis, DDD implementation, 
  testing, and development plan updates.
---

# Implement Features Skill

This skill guides feature implementation through analysis, planning, and incremental development.

**Important**: Follow AGENTS.md for all code conventions, testing standards, and quality requirements.

### Step 1: Understand the Feature
- Read feature documentation in `docs/product/bounded-contexts/`
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

## 📝 Planning Template

**Development Plan Template**: `.pi/skills/implement-features/templates/development-plan.md`

Use this template to:
- Break features into incremental implementation phases
- Track progress and dependencies
- Define success criteria
- Document architectural decisions

*Note: Code should follow existing project patterns. Review `src/` and AGENTS.md for conventions.*

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| Development Plan | `docs/product/bounded-contexts/[context]/DEVELOPMENT-PLAN.md` |
| Feature Specs | `docs/product/bounded-contexts/[context]/README.md` |
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