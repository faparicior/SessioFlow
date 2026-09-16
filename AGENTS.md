# SessioFlow Agent Guidelines

Runtime instructions for AI coding agents. See `docs/` for detailed documentation.

## 🛠️ Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Testing
npm test                 # Run all tests (Vitest: unit + integration + architecture + interface)
npx vitest run tests/unit/modules/conference/domain/value-objects/conference-name.test.ts  # Single file
npx vitest run tests/integration   # Integration only (requires PostgreSQL up)
npx vitest run tests/backend       # Interface/controller tests only
npm run test:architecture          # Architecture suite only
npm run test:changed               # Run Vitest tests for Git modified files

# E2E (Playwright) — see ⚠️ side effects below
npm run test:e2e
npx playwright test tests/e2e/conference-setup.spec.ts --config=apps/frontend/playwright.config.ts  # Single spec

# Quality & Architecture
npm run check:arch       # Fast standalone architecture check (< 2s) — domain-layer rules ONLY
npm run check:arch packages/modules/conference # Scoped architecture check on target module/file
npm run typecheck        # TypeScript (turbo, 18 tasks)
npm run lint             # ⚠️ xo over apps/backend + apps/frontend ONLY — not ESLint, not packages/**
npm run lint:fix         # xo --fix (same scope)
npm run format:check      # Prettier gate over the repo (policy: see formatting note below)
npm run format            # Prettier-write everything Prettier owns (bounded by .prettierignore)

# Fast loops (full-suite runs take minutes — prefer these while iterating)
npx turbo typecheck --filter=@sessioflow/conference   # One package
npm run typecheck --workspace=apps/frontend           # One app
cd apps/frontend && npx xo src/app src/lib            # Frontend subtree (see Frontend section)

# Database
npm run db:generate      # Generate migration from schema
npm run db:migrate       # Apply migrations to database
npm run db:push          # Push schema directly (no migration file)
npm run db:studio        # Open Drizzle Studio (database GUI)
docker compose -f apps/backend/docker-compose.yml up -d   # Start local PostgreSQL (there is NO root compose file)

# Production build
npm run build            # Build Next.js app
npm run start            # Start production server
```

> **Container lifecycle is owned by the scripts (by design)**: `npm run test:e2e` = `npm run build`
> → `docker compose up -d` → Playwright → `docker compose down`; `npm run dev` follows the same
> up/trap-down pattern. Playwright's global setup (`tests/e2e/setup.ts`) polls PostgreSQL until it
> answers `SELECT 1` and applies migrations, so **E2E needs nothing pre-started** — and it leaves the
> stack *down* on purpose.
> Therefore integration tests, which reuse that same container, must either run **before** E2E or
> start it themselves: `docker compose -f apps/backend/docker-compose.yml up -d`.
>
> **Formatting policy** — **Prettier is the single formatter for the whole repo**:
> - Both app workspaces run xo with **`prettier: true`** (`apps/*/xo.config.ts`), which mounts
>   `eslint-plugin-prettier` and switches off xo's 180 `@stylistic` rules via
>   `eslint-config-prettier`. Verified fixed point: `xo --fix` output passes `prettier --check`, and
>   `prettier --write` output passes `xo`. **Never re-add `@stylistic` rules to an xo config** — that
>   is exactly what restarts the two-formatter loop.
> - `npm run format:check` must pass; run `npm run format` when it does not. **`printWidth` is 100**
>   (`.prettierrc.json`) — the width xo's `@stylistic/max-len` used to enforce; xo resolves that same
>   file and forwards it to `prettier/prettier`, so CLI and lint cannot diverge. Changing it is a
>   repo-wide mechanical pass (80→100 touched 86 files and removed 603 wrapping lines).
>   `.prettierignore` is the boundary: markdown belongs to markdownlint (`npm run lint:md`), and `.pi/`,
>   `.claude/`, `dist/`, `*.tsbuildinfo`, `**/drizzle/meta/`, lockfiles and skill-eval artifacts are
>   skipped.
> - `eslint-config-prettier` also drops 16 non-whitespace rules. Four of them were real opinions and
>   are **re-enabled** in `apps/*/xo.config.ts` because Prettier never rewrites what they check
>   (so there is no loop): `curly: ['error','all']`, `unicorn/no-nested-ternary`,
>   `arrow-body-style: ['error','as-needed']`, `prefer-arrow-callback`. The rest (`react/jsx-*-spacing`,
>   `unicorn/template-indent`, `no-unexpected-multiline`, …) are whitespace/ASI cases Prettier
>   satisfies by construction — do not re-enable them.
> - `packages/**` have **no** `lint` script (Prettier + typecheck only); enabling xo there is a
>   separate migration (measured: 26 violations in `packages/shared/domain` alone).

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
- Modifying architecture tests (`tests/unit/architecture/`) or changing architectural invariants
- Editing shared configuration: root `vitest.config.ts`, any `package.json`/`tsconfig.json`
  (workspace deps or project references), `docker-compose.yml`, `playwright.config.ts`, `.env*`
- Touching a file outside the flow plan's Affected Files Manifest (report it as a deviation)

**🚫 Never do:**
- Commit secrets or API keys
- Push directly to main branch
- Skip tests or linting
- Use `any` type without justification
- Touch `node_modules/` directory
- Over-engineer solutions - prefer simplicity
- Modify architecture tests (`tests/unit/architecture/`) to make failing code pass — always fix the application/domain code to satisfy architectural invariants

## 📁 Project Structure

```
sessioflow/
├── apps/
│   ├── frontend/               # Next.js web app (UI + Next.js App Router API Route Handlers)
│   └── backend/                # Standalone API Gateway / Microservice entrypoint
│
├── packages/
│   ├── api-definitions/        # Data-only API schemas & Zod validation (@sessioflow/api-definitions)
│   ├── modules/
│   │   ├── conference/         # DDD Conference Bounded Context (@sessioflow/conference)
│   │   │   ├── domain/         # Pure domain entities, value objects & interfaces
│   │   │   ├── application/    # Command & query use cases
│   │   │   ├── infrastructure/ # Drizzle ORM repository implementations
│   │   │   ├── interfaces/     # Primary HTTP Controller factories (createConferenceController)
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

### Frontend (`apps/frontend`) — linter is `xo`, not `eslint-config-next`

`npm run lint` runs **`xo`** (type-aware typescript-eslint + `unicorn` + `react` + `import-x` +
`promise`) over `apps/backend` and `apps/frontend`. Formatting is delegated to Prettier through the
`prettier/prettier` rule, so lint output doubles as a format check. A warm run takes seconds, a cold
type-graph run can take minutes — lint a subtree while iterating (`cd apps/frontend && npx xo src/app src/lib`).

Rules that bite UI code (verified by probe on this config, plus real Journey 01 failures):

| Rule | Rejects | Use instead |
| --- | --- | --- |
| `prettier/prettier` | anything Prettier would rewrite (quotes, spacing, wrapping) | `npm run format` or `npx xo --fix <path>` — never hand-format |
| `react/jsx-sort-props` | arbitrary prop order | shorthand → alphabetical → **callbacks last** |
| `react/jsx-no-leaked-render` | `{someMember && <X />}` on a member expression | `{value !== undefined && (<X />)}` (explicit comparison is accepted) |
| `react/boolean-prop-naming` | `flag` / `open` boolean props | `isOpen` / `hasCfp` (config regex `^(is|has)[A-Z]`) |
| `react/prefer-read-only-props` | mutable props type | mark props `readonly` |
| `unicorn/no-negated-condition` | `!cond ? a : b`, `if (!x) { … } else { … }` | swap the branches |
| `@typescript-eslint/naming-convention` | non-`UPPER_CASE` constants, non-PascalCase types/functions (`route.ts` already allows `GET`/`POST`) | follow the existing casing |
| `no-unsafe-call` / `no-unsafe-return` | *calling* a symbol imported through the `@/*` / `@frontend/*` alias (xo's type program cannot resolve it) | **relative** import for anything you call; aliases stay fine for JSX components |
| `promise/prefer-await-to-then` | `await response.json().catch(() => null)` | `try { … } catch { … }` |

> `unicorn/no-null` is **off** in `apps/*/xo.config.ts`, so `null` is legal in app code — prefer
> `undefined` for optional state anyway so `??` and optional chaining stay type-safe. Single-line
> ternaries are fine too (the old `@stylistic/multiline-ternary` rule is off with `prettier: true`).

```tsx
// ✅ Accepted by both xo and Prettier (valid, self-contained TSX)
function CfpNote({
  isOpen,
  errorMessage,
}: {
  readonly isOpen: boolean;
  readonly errorMessage?: string;
}) {
  const label = isOpen ? 'Submissions are open.' : 'Submissions are closed.';

  return (
    <form noValidate className="space-y-6" onSubmit={() => {}}>
      {label}
      {errorMessage !== undefined && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
```

> **Bracketed App Router paths**: `npx xo 'src/app/api/v1/conferences/[id]/route.ts'` either matches
> nothing (vacuously "clean") or crashes eslint's glob matcher. Pass the **directory** instead
> (`npx xo src/app`) — it recurses correctly. `npm run format:check` covers app TypeScript as well.

### Module Resolution & Build Artifacts

- `@sessioflow/*` package `exports` point at **`dist/`**, while `vitest.config.ts` aliases the same
  specifiers to **`src/`**: unit tests can pass while `npm run build` fails.
- After changing a package's public surface, rebuild it: `npx turbo build --filter=@sessioflow/<package>`.
- When deleting a stale `dist/`, delete the sibling `tsconfig.tsbuildinfo` as well — otherwise
  project-reference builds reuse masked declarations from the deleted output.

## 🧪 Testing Guidelines

### Test Organization
- **Unit tests**: `tests/unit/modules/[module]/[layer]/[feature].test.ts`
- **Interface/API tests**: `tests/backend/modules/[module]/interfaces/[transport]/[version]/[controller].test.ts`
- **Integration tests**: `tests/integration/modules/[module]/[feature].test.ts`
- **E2E tests**: `tests/e2e/[feature].spec.ts`

### 🎭 E2E Testing Architecture (Playwright)
- **Single Web Server (`apps/frontend` on port 3010)**: Playwright's `webServer` automatically launches `apps/frontend` (`next dev -p 3010`).
- **In-Process API Route Handlers**: Next.js App Router route handlers (`apps/frontend/src/app/api/v1/*`) directly invoke DDD module controllers from `@sessioflow/[module]/container.ts`.
- **🚫 Do NOT spawn `apps/backend` (port 3020)**: `apps/backend` is not needed or run during E2E tests. All `/api/v1/*` requests are served directly by `apps/frontend`.
- **Database Lifecycle**: the `npm run test:e2e` script owns the container (`docker compose up -d` before Playwright, `down` after). Global setup (`tests/e2e/setup.ts`) then waits for PostgreSQL, applies Drizzle migrations, and cleans test data. `tests/e2e/utils/cleanup.ts` ensures clean database state per test.

### Architecture Tests
- **Location**: `tests/unit/architecture/` (files: `ddd-boundaries.test.ts`, `response-conventions.test.ts`)
- **Framework**: ts-archunit — enforces DDD layer boundaries, CQRS conventions, and architectural invariants
- **Entry points**: `classes(p)` for class declarations, `functions(p)` for function exports, `modules(p)` for module imports, `slices(p)` for dependency cycles

> ⚠️ **Architecture tests are immutable guardrails**: AI agents must NEVER modify `tests/unit/architecture/` or relax rules to make failing code pass. When an architecture test fails, refactor your application/domain code to comply with DDD rules.

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

7. **Aggregate Roots vs Child Entities in domain/**
   - `classes(p).that().resideInFolder('**/domain/**')` matches all classes in `domain/` (Aggregate Roots, Child Entities, Value Objects, Domain Events, Domain Exceptions).
   - Rules specific to Aggregate Roots (such as `pullDomainEvents()`) exclude Value Objects (`/value-objects/`), Exceptions (`/exceptions/`), Events (`/events/`), and Child Entities (e.g. `cfp-config.ts`), because child entities emit events through their parent Aggregate Root rather than exposing event flush methods directly.
   - Tests scan TypeScript source files (`src/**/*.ts`); compiled declaration files (`.d.ts`) are build artifacts and do not exist in source paths.

**What each automated check really scans** (verified 2026-08-29):

| Check | Actual scope | Consequence |
| --- | --- | --- |
| `npm run check:arch` | `packages/modules/**/domain/**` only (VO / event / exception / isolation rules) | says nothing about application, infrastructure, interfaces or `apps/**` |
| `npm run test:architecture` | ts-archunit project = files reachable from `tests/**` plus forced `packages/modules/*/src/**/*.ts` | module `interfaces/**` and `infrastructure/**` **are** covered |
| *(none)* | `apps/**` (Next route handlers, UI) is in neither project | the `**/apps/**/api/**` rule matches 0 files and passes vacuously |

Before trusting a rule, prove it is not vacuous — inject the violation and watch that one test fail:

```bash
F=packages/modules/conference/src/interfaces/http/get-conference.controller.ts
cp "$F" /tmp/controller.bak
sed -i "1i import {ConferenceSlug} from '../domain/value-objects/conference-slug.js';" "$F"
npx vitest run tests/unit/architecture   # expect exactly 1 failure: the interfaces import rule
cp /tmp/controller.bak "$F"              # restore, then re-run to confirm green
```

### Test Example
```typescript
// tests/unit/modules/conference/value-objects/conference-name.test.ts
import { describe, it, expect } from 'vitest';
import { ConferenceName } from '@sessioflow/conference/domain/value-objects/conference-name';

describe('ConferenceName', () => {
  it('creates valid conference name', () => {
    const result = ConferenceName.create('Tech Conference 2026');
    expect(result.value).toBe('Tech Conference 2026');
  });

  it('rejects too short name', () => {
    expect(() => ConferenceName.create('Ab')).toThrow();
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
6. ✅ `npm run format:check` exits 0 (Prettier owns everything xo does not)
7. ✅ Code coverage ≥ 80% for new code
8. ✅ Changes committed with conventional commit format

## 📚 Documentation

| Topic | Location |
|-------|----------|
| Architecture (DDD) | `docs/ARCHITECTURE.md` |
| Architecture Rules & Invariants | `docs/ARCHITECTURE-RULES.md` |
| Architecture Decisions | `docs/adr/README.md` |
| Testing Strategy | `docs/TESTING.md` |
| API Design | `docs/API-DESIGN.md` |
| Logging & Observability | `docs/LOGGING.md` |

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
- Use `rg` (ripgrep) or file listing to search for existing implementations first
- Check `packages/modules/[context]/src/domain/` for existing value objects, entities, and repository interfaces
- Check `packages/modules/[context]/src/application/` for existing commands, queries, and handlers
- Check `docs/product/bounded-contexts/[context]/flows/` for existing feature specs and flow plans
- Review existing tests for patterns
- **Only create new code if nothing suitable exists**

### File Size Guidelines

- **Maximum 300 lines per file** (excluding tests)
- If a file exceeds this:
  - Extract related functionality into separate modules
  - Create value objects for complex data structures
  - Split into multiple focused files
- **Exception**: Test files can be larger if testing a single complex feature

## 🔐 Authentication, Storage & Outbox Events

- **Auth**: Auth0 with DDD abstraction (ADR-002, ADR-004)
- **Database**: Supabase PostgreSQL with DDD abstraction via Drizzle ORM (ADR-002, ADR-017)
- **Storage**: Supabase Storage with DDD abstraction (ADR-005)
- **Email**: Resend (optional, ADR-011-01) — dispatched asynchronously via Outbox domain events (`CfpOpenedEvent` $\rightarrow$ Outbox repository)
- **Business Limits**: Wave 1 (MVP) checks (e.g. Free Tier limit in BR-004) are evaluated directly via Repository count queries (e.g., `countActiveByOrganizerId`) before introducing separate billing modules.

See `docs/adr/README.md` for full decision history.

## 📦 New Module Package

Before scaffolding, **always check if `packages/modules/{context}/` already exists**. If creating a truly new bounded context, create it under `packages/modules/{context}/` using the `create-module` skill (`create-module`). It scaffolds `package.json`, `tsconfig.json`, `.gitignore`, and `container.ts` — the minimum wiring to make the folder a buildable workspace package.

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

*Last updated: 2026-08-29*