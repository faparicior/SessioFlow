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

This skill guides the implementation of new features following SessioFlow's development workflows.

---

## 🎯 Purpose

When the user asks to implement a feature, follow these steps:

1. **Analyze the feature requirements** - Read relevant documentation
2. **Check the development plan** - Identify the implementation phase
3. **Implement incrementally** - Follow the established DDD structure
4. **Test thoroughly** - Write unit tests for all new code
5. **Update the development plan** - Mark completed tasks

---

## 📋 Development Flow

### Step 1: Understand the Feature
- Read the feature documentation in `docs/product/bounded-contexts/`
- Identify which DDD layer(s) are affected
- Check the development plan for the implementation phase
- Refer to `docs/product/bounded-contexts/` for feature specifications

### Step 2: Follow Project Structure
- Review existing code in `src/` to understand established patterns
- Follow the project's architectural decisions (see `docs/adr/`)
- Maintain consistency with existing implementations

### Step 3: Implementation Order

**Recommended Progression**:
1. **Domain Layer** - Value objects, entities, domain services
2. **Domain Interfaces** - Repository interfaces, domain events, exceptions
3. **Infrastructure** - Repository implementations, external adapters
4. **Application** - Use cases with validation
5. **Interfaces** - API endpoints, frontend components
6. **Testing** - Unit, integration, and E2E tests

*Note: Adjust based on the specific feature requirements and existing patterns in the project.*

### Step 4: Validation & Testing
- All value objects must have validation tests
- Use Vitest for unit tests
- Run tests after each implementation step
- Update development plan with completed tasks
- Refer to `.pi/skills/implement-features/README.md` for detailed guidance

---

## 📝 Planning Template

**Development Plan Template**: `.pi/skills/implement-features/templates/development-plan.md`

Use this template to:
- Break features into incremental implementation phases
- Track progress and dependencies
- Define success criteria
- Document architectural decisions

*Note: Code should follow existing project patterns rather than generic templates. Review `src/` for established conventions.*

---

## 📚 Key Files

- Development Plan: `docs/product/bounded-contexts/[context]/DEVELOPMENT-PLAN.md`
- Feature README: `docs/product/bounded-contexts/[context]/README.md`
- Entities: `docs/product/bounded-contexts/[context]/entities/`
- Value Objects: `docs/product/bounded-contexts/[context]/value-objects/`

---

## ✅ Success Criteria

- All new code has appropriate test coverage
- Domain invariants are enforced
- API endpoints follow RESTful conventions