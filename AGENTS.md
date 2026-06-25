# SessioFlow Agent Guidelines

Runtime instructions for AI coding agents. See `docs/` for detailed documentation.

## 🛠️ Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Testing
npm test                 # Run all tests (Vitest)
npx vitest run           # Run Vitest tests
npx vitest run tests/unit/event/*.test.ts  # Single test file
npm run test:e2e         # Run Playwright E2E tests
npx playwright test tests/e2e/create-event.spec.ts  # Single E2E test

# Quality
npm run typecheck        # TypeScript type checking (tsgo)
npm run lint             # ESLint
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier formatting

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
src/
├── app/                    # Next.js routing only
├── domains/                # Business logic (vendor-agnostic)
│   └── event/
│       ├── entities/      # Event, Submission, Review
│       ├── value-objects/ # EventId, EventName, CfpDates
│       ├── services/      # Domain services
│       └── repositories/  # Repository interfaces
├── application/            # Use cases
│   └── event/             # CreateEvent, SubmitProposal
├── infrastructure/         # External implementations
│   ├── external/          # Auth0, Resend, Cloudflare R2
│   └── database/          # Supabase repositories
└── interfaces/            # Web and API entry points
    ├── web/               # Next.js pages
    └── api/               # RESTful endpoints

docs/                       # Documentation (ARCHITECTURE.md, ADRS.md, etc.)
tests/                      # Unit, integration, and E2E tests
```

## 💻 Code Style

### TypeScript
```typescript
// ✅ Good - Explicit types, arrow functions
interface Event {
  id: EventId;
  name: EventName;
  status: EventStatus;
}

export const createEvent = (input: CreateEventInput): Result<Event> => {
  const validated = eventCreateSchema.parse(input);
  return Result.ok(new Event(validated));
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
| Files (features) | kebab-case | `event-repository.ts` |

### Error Handling
```typescript
// ✅ Good - Zod validation + standardized errors
try {
  const validated = eventCreateSchema.parse(input);
  const event = await eventRepository.save(validated);
  return { success: true, data: event };
} catch (error) {
  if (error instanceof ZodError) {
    return { success: false, errors: error.flatten() };
  }
  console.error('DB error:', error);
  return { success: false, message: 'Database error occurred' };
}
```

## 🧪 Testing Guidelines

### Test Organization
- **Unit tests**: `tests/unit/[domain]/[feature].test.ts`
- **Integration tests**: `tests/integration/[feature].test.ts`
- **E2E tests**: `tests/e2e/[feature].spec.ts`

### Test Example
```typescript
// tests/unit/event/event-name.test.ts
import { describe, it, expect } from 'vitest';
import { EventName } from '@/domains/event/value-objects/event-name';

describe('EventName', () => {
  it('creates valid event name', () => {
    const result = EventName.create('Conference 2026');
    expect(result.isSuccess).toBe(true);
  });

  it('rejects too short name', () => {
    const result = EventName.create('Ab');
    expect(result.isFailure).toBe(true);
  });
});
```

## ✅ Definition of Done

A task is complete when ALL of the following pass:

1. ✅ `npx vitest run` exits 0 (all unit tests pass)
2. ✅ `npm run test:e2e` exits 0 (E2E tests pass)
3. ✅ `npm run lint` exits 0 (no linting errors)
4. ✅ `npm run typecheck` exits 0 (no type errors)
5. ✅ Code coverage ≥ 80% for new code
6. ✅ Changes committed with conventional commit format

## 📚 Documentation

| Topic | Location |
|-------|----------|
| Architecture (DDD) | `docs/ARCHITECTURE.md` |
| Architecture Decisions | `docs/adr/README.md` |
| Testing Strategy | `docs/TESTING.md` |
| API Design | `docs/API-DESIGN.md` |

## 🏛️ Architecture Principles

- **DDD Pattern**: Domain layer has no external dependencies
- **Repository Pattern**: Interfaces in domain, implementations in infrastructure
- **Value Objects**: Immutable, validated domain data (EventName, CfpDates)
- **Entities**: Domain objects with identity (EventId, SubmissionId)
- **Validation**: Zod schemas for all input validation
- **Type Safety**: TypeScript strict mode, no `any` types

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
- Check `src/domains/` for existing value objects or entities
- Look in `src/application/` for similar use cases
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

## 📝 Git Workflow

**Branch naming:**
- `feat/[short-description]` - New functionality
- `fix/[short-description]` - Bug fixes
- `chore/[short-description]` - Config changes

**Commit format:**
```
[type]: [description in imperative mood]

Examples:
feat: add event creation endpoint
fix: validate CFP dates in event form
chore: update dependencies
```

**PR requirements:**
- One logical change per PR
- Tests pass and coverage maintained
- Linting and type checking pass
- Conventional commit message

---

*Last updated: 2026-06-25*