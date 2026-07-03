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

### Step 0: Read ADR Index First
- **Always start** by reading `docs/adr/README.md` to understand the complete ADR landscape
- Use the ADR index to identify which ADRs are relevant to your task
- Read specific ADRs in detail based on what the index reveals
- **Do not assume** specific ADR numbers - let the index guide your discovery
- Pay special attention to:
  - Core Technology Stack ADRs
  - Architecture Decisions (DDD, CQRS, etc.)
  - Authentication & Storage strategies
  - Data Access patterns

### Step 1: Understand the Flow
- Read flow documentation in `docs/product/bounded-contexts/[context]/flows/`
- Identify which DDD layer(s) are affected
- Check development plan for implementation phase

### Step 2: Review Existing Patterns
- Search `src/` for similar implementations (`rg` command)
- Review relevant ADRs identified from the index
- Follow conventions in AGENTS.md

### Step 3: Implement Incrementally (Hybrid TDD)

**Hybrid Approach** (Outside-In + Inside-Out):

1. **Define E2E Contract** (Outside)
   - Write E2E test that describes complete user journey
   - Document acceptance criteria from flow documentation
   - This test will FAIL initially (defines the goal)

2. **Build Domain Core** (Inside-Out)
   - Write tests for value objects → Implement → Verify
   - Write tests for entities → Implement → Verify
   - Write tests for domain services → Implement → Verify

3. **Build Application Layer** (Inside-Out - CQRS Pattern)
   - Write command tests (with mocked repository) → Implement → Verify
   - Write query tests (with mocked repository) → Implement → Verify
   - Write repository interface tests (mocked) → Implement → Verify
   - **Follow CQRS Pattern** (Commands for writes, Queries for reads)
   - Create Response DTOs for API contracts

4. **Build Infrastructure** (Inside-Out)
   - Write integration tests for repository → Implement → Verify
   - Implement database schema and migrations

5. **Build Interface Layer** (Outside-In)
   - Write API tests → Implement → Verify
   - Write UI component tests → Implement → Verify

6. **Validate E2E** (Outside)
   - Run the E2E test from Step 1
   - Fix any failing tests
   - Verify complete user journey works

**Hybrid TDD Workflow:**
```
1. Write E2E test (fails) - defines the goal
2. Write domain tests (fails) - defines the core
3. Implement domain → E2E still fails (missing layers)
4. Write use case tests (fails)
5. Implement use cases → E2E still fails (missing infrastructure)
6. Write integration tests (fails)
7. Implement infrastructure → E2E still fails (missing API/UI)
8. Write API/UI tests (fails)
9. Implement API/UI → E2E PASSES!
```

**Module-Based Organization with CQRS:**
```
src/
├── modules/                    # Feature modules (bounded contexts)
│   ├── [module-name]/          # e.g., conference, event, submission
│   │   ├── domain/             # Domain layer for this module
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── services/
│   │   │   └── repositories/   # Interface
│   │   ├── application/        # Application layer with CQRS
│   │   │   ├── commands/       # Write operations (Create, Update, Delete)
│   │   │   │   └── [command-name]/
│   │   │   │       ├── [command-name].command.ts
│   │   │   │       ├── [command-name].handler.ts
│   │   │   │       └── [command-name].dto.ts
│   │   │   ├── queries/        # Read operations (Get, List, Search)
│   │   │   │   └── [query-name]/
│   │   │   │       ├── [query-name].query.ts
│   │   │   │       ├── [query-name].handler.ts
│   │   │   │       └── [query-name].dto.ts
│   │   │   └── dto/            # Shared DTOs
│   │   ├── infrastructure/     # Implementations for this module
│   │   │   └── database/
│   │   └── interfaces/         # API/UI for this module
│   │       └── api/
│   └── [module-name]/
└── shared/                     # Cross-cutting concerns
    ├── domain/                 # Shared VOs, exceptions
    └── infrastructure/         # Shared database client, etc.
```

**CQRS Principles:**
- **Commands are verbs**: `CreateConference`, `UpdateConference`, `DeleteConference`
- **Queries are nouns**: `GetConference`, `ListConferences`, `SearchSubmissions`
- **Commands change state**: They have side effects and return success/failure
- **Queries read state**: They have no side effects and return data
- **Response DTOs**: Separate from domain entities, optimized for API needs
- **Handlers are single-responsibility**: One command/query per handler

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

**Template:** `.pi/skills/implement-flow/templates/feature-specification.md`

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

**Templates:**
- Flow Plan Template: `.pi/skills/implement-flow/templates/flow-development-plan.md`
- Feature Spec Template: `.pi/skills/implement-flow/templates/feature-specification.md`

**Reference**: See AGENTS.md for code style, testing guidelines, and definition of done.

---

## ✅ Success Criteria

- **ADR Compliance**: All relevant ADRs identified from index and followed
- Follows AGENTS.md definition of done
- Development plan updated with completed tasks
- CQRS pattern implemented correctly (commands vs queries separated)
- Response DTOs created for API contracts
- All tests pass (`npm test`)
- Linting passes (`npm run lint`)
- Type checking passes (`npm run typecheck`)