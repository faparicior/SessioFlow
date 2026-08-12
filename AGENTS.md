# SessioFlow Agent Guidelines

Runtime instructions for AI coding agents. See `docs/` for detailed documentation.

## 🛠️ Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Testing
npm test                 # Run all tests (Vitest)
npx vitest run           # Run Vitest tests
npx vitest run tests/unit/conference/*.test.ts  # Single test file
npm run test:e2e         # Run Playwright E2E tests
npx playwright test tests/e2e/create-conference.spec.ts  # Single E2E test

# Quality & Architecture
npm run check:arch       # Fast standalone architecture check (< 2s) for AI agents
npm run check:arch packages/modules/conference # Scoped architecture check on target module/file
npm run test:architecture # Run Vitest architecture test suite
npm run test:changed     # Run Vitest tests for Git modified files
npm run typecheck        # TypeScript type checking (tsgo)
npm run lint             # ESLint
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier formatting

# Database
npm run db:generate      # Generate migration from schema
npm run db:migrate       # Apply migrations to database
npm run db:push          # Push schema directly (no migration file)
npm run db:studio        # Open Drizzle Studio (database GUI)
docker compose up -d     # Start local PostgreSQL (Docker)

# Build
npm run build            # Build Next.js app
npm run start            # Start production server
```

## 🚦 Boundaries

**✅ Always do:**
- Run tests before commits
- Fix linting errors with `npm run lint:fix`
- Add type hints to all new functions
- Use Zod for input validation
- Follow DDD layer boundaries
- **Think before coding** - Plan and validate approach first
- **Search before creating** - Look for existing code first
- **Keep files small** - Maximum 300 lines per file

**⚠️ Ask first:**
- Database schema changes
- Adding new dependencies
- Changing authentication strategy
- Modifying API contracts

**🚫 Never do:**
- Commit secrets or API keys
- Push directly to main branch
- Skip tests or linting
- Use `any` type without justification
- Touch `node_modules/` directory
- Over-engineer solutions - prefer simplicity

## 📁 Project Structure

```
sessioflow/
├── apps/
│   ├── frontend/               # Next.js web app (UI + API Controllers)
│   └── backend/                # Standalone API Gateway / Microservice
│
├── packages/
│   ├── api-definitions/        # Data-only API schemas & Zod validation (@sessioflow/api-definitions)
│   ├── modules/
│   │   ├── conference/         # DDD Conference Bounded Context (@sessioflow/conference)
│   │   │   ├── domain/         # Pure domain entities, value objects & interfaces
│   │   │   ├── application/    # Command & query use cases
│   │   │   ├── infrastructure/ # Drizzle ORM repository implementations
│   │   │   └── container.ts    # Module Composition Root (Application & HTTP Controller factories)
│   │   └── [other-modules]/
│   └── shared/
│       ├── database/           # Drizzle ORM database client (@sessioflow/shared-database)
│       └── logging/            # Pino logger & AsyncLocalStorage context (@sessioflow/shared-logging)
│
├── docs/                       # Documentation & ADRs
└── tests/                      # Unit, integration, and Playwright E2E tests
```

## 💻 Code Style

### TypeScript
```typescript
// ✅ Good - Explicit types, arrow functions
interface Conference {
  id: ConferenceId;
  name: ConferenceName;
  status: ConferenceStatus;
}

export const createConference = (input: CreateConferenceInput): Result<Conference> => {
  const validated = conferenceCreateSchema.parse(input);
  return Result.ok(new Conference(validated));
};

// ❌ Bad - Implicit any, inconsistent style
const createEvent = (input) => {
  return new Event(input);
};
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CreateEventForm.tsx` |
| Functions | camelCase | `validateEventName()` |
| Constants | UPPER_SNAKE_CASE | `MAX_EVENT_NAME_LENGTH` |
| Types/Interfaces | PascalCase | `CreateEventInput`, `EventStatus` |
| Files (components) | PascalCase | `CreateEventForm.tsx` |
| Files (features) | kebab-case | `conference-repository.ts` |

### Error Handling
```typescript
// Domain objects throw DomainError on invariant violation
// Handlers are pure — no try/catch, exceptions propagate
// Controllers translate DomainError → HTTP response via error mapper
// Route handlers provide safety net for truly unexpected errors only

// ✅ Good - DomainError + single try/catch in controller
export async function createConferenceController(request, commandHandler) {
  try {
    const command = CreateConferenceCommand.from(request.body);
    const conference = await commandHandler.execute(command);
    return NextResponse.json({ data: conference }, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return mapDomainErrorToResponse(error);
    }
    throw error; // Route safety net catches this
  }
}
```

## 🧪 Testing Guidelines

### Test Organization
- **Unit tests**: `tests/unit/modules/[module]/[layer]/[feature].test.ts`
- **Interface/API tests**: `tests/backend/modules/[module]/interfaces/[transport]/[version]/[controller].test.ts`
- **Integration tests**: `tests/integration/modules/[module]/[feature].test.ts`
- **E2E tests**: `tests/e2e/[feature].spec.ts`

### Architecture Tests
- **Location**: `tests/unit/architecture/` (files: `ddd-boundaries.test.ts`, `response-conventions.test.ts`)
- **Framework**: ts-archunit — enforces DDD layer boundaries, CQRS conventions, and architectural invariants
- **Entry points**: `classes(p)` for class declarations, `functions(p)` for function exports, `modules(p)` for module imports, `slices(p)` for dependency cycles

**Critical ts-archunit patterns:**

1. **Function exports need `functions(p)`, not `classes(p)`**
   - Controllers are `export async function createConferenceController()` — function declarations
   - `classes(p)` only finds `class` declarations → returns zero matches for controllers
   - Use `functions(p).that().resideInFolder('**/interfaces/**').and().haveNameMatching(/controller$/i)` for controller rules

2. **Import-restriction rules require `modules(p)`**
   - `notImportFrom()` only exists on the `modules()` builder
   - For controller domain-import checks: `modules(p).that().resideInFolder('**/interfaces/**').and().haveNameMatching(/\.controller\.ts$/).should().notImportFrom('**/domain/**')`
   - For content-based checks on functions/classes, use `satisfy(defineCondition(...))` with file content reading

3. **Fluent builder is strict AND-only — no `.or()` between predicates**
   - `classes(p).that().predicateA().or().predicateB()` throws `is not a function`
   - All `.that()` predicates are implicitly ANDed; all `.should()` conditions are ANDed
   - For OR logic: write separate test blocks or filter inside a condition function

4. **Ghost DTOs require `p._project.addSourceFilesAtPaths(...)`**
   - ts-archunit follows TypeScript's import resolution — unimported files are invisible
   - The `.query.ts` file that handlers don't use never gets parsed
   - Force-load files at project creation: `p._project.addSourceFilesAtPaths('packages/modules/*/src/**/*.ts')`
   - Without this, domain-import and property-type checks on DTO files return zero results

5. **Use condition functions for file-content checks**
   ```typescript
   function controllerInstantiatesDto() {
     return defineCondition('controllerInstantiatesDto', (matchedFns: any[]) => {
       return matchedFns.map((fn: any) => {
         const relPath = getElementFile(fn);
         const content = readFileSync(relPath, 'utf-8');
         // Extract DTO name from import: import { CreateConferenceCommand } from ...
         const importMatch = content.match(/\{\s*(\w+)\s*\}\s*from\s*['"][^'"]*\.(command|query)/);
         if (!importMatch) return null;
         const dtoClass = importMatch[1];
         const hasInstantiate = new RegExp(`new\\s+${dtoClass}\\(`).test(content);
         if (!hasInstantiate) {
           return { rule: '...', element: stem, file: relPath, message: '...' };
         }
         return null;
       }).filter(Boolean) as any;
     });
   }
   ```

6. **Module-level rules use `modules(p)`, not `classes()` or `functions()`**
   - Layer isolation checks: `modules(p).that().resideInFolder('**/domain/**').should().onlyImportFrom(...)`
   - File-name filtering on modules: `.and().haveNameMatching(/\.controller\.ts$/)`
   - Import restrictions: `.should().notImportFrom('**/packages/modules/**/domain/**')`

### Test Example
```typescript
// tests/unit/conference/conference-name.test.ts
import { describe, it, expect } from 'vitest';
import { ConferenceName } from '@/modules/conference/domain/value-objects/conference-name';

describe('ConferenceName', () => {
  it('creates valid conference name', () => {
    const result = ConferenceName.create('Tech Conference 2026');
    expect(result.isSuccess).toBe(true);
  });

  it('rejects too short name', () => {
    const result = ConferenceName.create('Ab');
    expect(result.isFailure).toBe(true);
  });
});
```

## ✅ Definition of Done

A task is complete when ALL of the following pass:

1. ✅ `npm run check:arch` exits 0 (architecture rules pass)
2. ✅ `npx vitest run` exits 0 (all unit tests pass)
3. ✅ `npm run test:e2e` exits 0 (E2E tests pass)
4. ✅ `npm run lint` exits 0 (no linting errors)
5. ✅ `npm run typecheck` exits 0 (no type errors)
6. ✅ Code coverage ≥ 80% for new code
7. ✅ Changes committed with conventional commit format

## 📚 Documentation

| Topic | Location |
|-------|----------|
| Architecture (DDD) | `docs/ARCHITECTURE.md` |
| Architecture Rules & Invariants | `docs/ARCHITECTURE-RULES.md` |
| Architecture Decisions | `docs/adr/README.md` |
| Testing Strategy | `docs/TESTING.md` |
| API Design | `docs/API-DESIGN.md` |
| Coding Rules & Linting | `DEV-RULES.md` |

## 🏛️ Architecture Principles

- **DDD Pattern**: Domain layer has no external dependencies
- **Repository Pattern**: Interfaces in domain, implementations in infrastructure
- **Value Objects**: Immutable, validated domain data (EventName, CfpDates)
- **Entities**: Domain objects with identity (EventId, SubmissionId)
- **Validation**: Zod schemas for all input validation
- **Type Safety**: TypeScript strict mode, no `any` types

### ⚡ Fast Architecture Verification for AI Coding Agents

When creating or modifying domain code, AI agents **must verify DDD architecture rules** before declaring completion:

```bash
# Fast architecture check (< 2s) across monorepo:
npm run check:arch

# Scoped architecture check on created/edited module or file:
npm run check:arch packages/modules/conference
node scripts/check-architecture.mjs packages/modules/conference/src/domain/value-objects/conference-name.ts
```

**Architectural Invariants Automatically Enforced:**
1. **Domain Layer Isolation**: Domain modules must only import from domain, shared packages (`@sessioflow/shared-*`), or `node_modules`.
2. **Value Objects**: Must have `private constructor`, static factory (`create`/`fromString`), `get value()` getter, and `equals(other)` method. Domain entity properties & `create()` parameters must use Value Objects instead of raw primitives (`string`, `number`, `boolean`).
3. **Domain Events**: Reside in `domain/events/`, end with `Event`, define `type` + `timestamp`, and implement `toJSON()` serialization for Outbox persistence.
4. **Domain Exceptions**: Reside in `domain/exceptions/`, end with `Error`, and extend base `DomainError` / `EntityNotFoundError`.
5. **Repositories**: Interfaces live in `domain/`, implementations live in `infrastructure/` and reconstitute domain entities using `.fromData(...)` static factory methods.

## 🧠 Karpathy Principles for AI Agents

All AI agents working on this project must follow these 6 core principles:

| # | Principle | Core Rule | Prevents |
|---|-----------|-----------|----------|
| 1 | **Think Before Coding** | Surface assumptions, present alternatives, ask when confused | Coding the wrong solution |
| 2 | **Simplicity First** | Minimum code, no speculative features | Over-engineering, bloat |
| 3 | **Surgical Changes** | Touch only what you must, match existing style | Scope creep, drive-by refactors |
| 4 | **Goal-Driven Execution** | Define verifiable success criteria | Ambiguous outcomes, wasted iterations |
| 5 | **DRY & Reusability** | Never duplicate code, search before creating | Hardcoded styles, duplicated logic |
| 6 | **Code Organization** | Separate concerns, keep files <300 LOC | Monolithic files, unorganized code |

### Think Before Coding Workflow

**Before writing any code, agents must:**

1. **Understand the Task**
   - Restate the requirement in your own words
   - Identify any ambiguities or missing information
   - Ask clarifying questions if needed

2. **Plan the Solution**
   - Outline the approach step by step
   - Identify which files will be modified
   - Consider edge cases and error scenarios

3. **Check Existing Code**
   - Search for similar implementations
   - Review related ADRs and documentation
   - Look for reusable components

4. **Present Your Plan**
   - Share your approach before coding
   - Get confirmation if the task is complex
   - Adjust based on feedback

### Search-First Requirement

**Before creating new code:**
- Use `rg` (ripgrep) to search for similar functionality
- Check `src/modules/[context]/domain/` for existing value objects or entities
- Look in `src/modules/[context]/application/` for similar use cases
- Review existing tests for patterns
- **Only create new code if nothing suitable exists**

### File Size Guidelines

- **Maximum 300 lines per file** (excluding tests)
- If a file exceeds this:
  - Extract related functionality into separate modules
  - Create value objects for complex data structures
  - Split into multiple focused files
- **Exception**: Test files can be larger if testing a single complex feature

## 🔐 Authentication & Storage

- **Auth**: Auth0 with DDD abstraction (ADR-002, ADR-004)
- **Database**: Supabase PostgreSQL with DDD abstraction (ADR-002)
- **Storage**: Supabase Storage with DDD abstraction (ADR-005)
- **Email**: Resend (optional, ADR-011)

See `docs/ADRS.md` for full decision history.

## 📦 New Module Package

Create a new DDD module under `packages/modules/{context}/` using the `create-module` skill (`create-module`). It scaffolds `package.json`, `tsconfig.json`, `.gitignore`, and `container.ts` — the minimum wiring to make the folder a buildable workspace package.

---

## 📝 Git Workflow

**Branch naming:**
- `feat/[short-description]` - New functionality
- `fix/[short-description]` - Bug fixes
- `chore/[short-description]` - Config changes

**Commit format:**
```
[type]: [description in imperative mood]

Examples:
feat: add conference creation endpoint
fix: validate CFP dates in conference form
chore: update dependencies
```

**PR requirements:**
- One logical change per PR
- Tests pass and coverage maintained
- Linting and type checking pass
- Conventional commit message

---

*Last updated: 2026-06-25*