# Testing Strategy

SessioFlow uses a comprehensive testing strategy with multiple layers.

## ⚡ Facts First (read before writing a test)

These environment behaviors cost agents the most iterations:

| Fact | Consequence |
| --- | --- |
| `tests/setup.ts` replaces the global `Date` with a **frozen clock: `2026-07-28T00:00:00.000Z`** | every time-based rule is evaluated against that date — CfP dates must be later (`2026-08-17` works, `2026-01-01` throws); `Date.now()` and `new Date()` are both frozen, so never assert on elapsed time |
| Domain code **throws** `DomainError` subclasses | assert `expect(() => …).toThrow(…)`. There is **no** `Result` / `isFailure` wrapper in `@sessioflow/shared-domain` — examples using `.isFailure` are stale |
| `ConferenceId.create(...)` / `.fromData(...)` require a **UUID v4** string | pass a real UUID (`crypto.randomUUID()`); there is no zero-arg overload |
| `@sessioflow/*` resolves to **`src/`** in Vitest but to **`dist/`** when building | a green `vitest run` does not prove `npm run build` works |
| Vitest config: `environment: 'jsdom'`, `globals: true`, `include: tests/**/*.test.ts(x)`, `exclude: ['tests/frontend/**']` | files under `tests/frontend/` are never run by `npm test` |
| `fileParallelism: false` | integration test **files** run serially because they share the local PostgreSQL tables; the whole suite still finishes in ~30s |
| `@sessioflow/shared-database` reads `DATABASE_URL` **at import time** | integration tests must load `.env.local` before importing it — the fixture `tests/integration/modules/conference/utils/test-db.ts` does exactly that |
| `npm run test:e2e` = `npm run build` + `docker compose up` + playwright + **`docker compose down`** | PostgreSQL is left **down**; run `docker compose up -d` before integration tests afterwards |

### Test layers and how to run each one

| Layer | Path | Command | Needs DB |
| --- | --- | --- | --- |
| Unit (domain / application) | `tests/unit/modules/<module>/<layer>/**` | `npx vitest run tests/unit` | no |
| Architecture | `tests/unit/architecture/**` | `npm run test:architecture` | no |
| Interface (controllers, mocked handlers) | `tests/backend/**` | `npx vitest run tests/backend` | no |
| Integration (repositories, real handlers) | `tests/integration/**` | `npx vitest run tests/integration` | **yes** |
| E2E (browser) | `tests/e2e/*.spec.ts` | `npm run test:e2e` | managed by the script |

## 🧪 Test Layers

### Unit Tests (Vitest)
- **Location**: `tests/unit/modules/[module]/[layer]/[feature].test.ts`
- **Scope**: Pure functions, utilities, value objects, Zod schemas
- **Framework**: Vitest
- **Run**: `npm test` or `npx vitest run`

```typescript
// tests/unit/modules/conference/domain/value-objects/conference-name.test.ts
import { describe, it, expect } from 'vitest';
import { ConferenceName } from '@sessioflow/conference/domain/value-objects/conference-name';

describe('ConferenceName', () => {
  it('creates valid conference name', () => {
    const name = ConferenceName.create('Tech Conference 2026');
    expect(name.value).toBe('Tech Conference 2026');
  });

  it('rejects too short name', () => {
    expect(() => ConferenceName.create('Ab')).toThrow();
  });
});
```

### Integration Tests
- **Location**: `tests/integration/modules/[module]/[feature].integration.test.ts`
- **Scope**: repository implementations against the real local PostgreSQL, plus controllers wired to
  real (unmocked) CQRS handlers so DTO/contract drift cannot hide
- **Fixture**: `tests/integration/modules/[module]/utils/test-db.ts` loads `.env.local` **before**
  `@sessioflow/shared-database` is imported (that client reads `DATABASE_URL` at import time) and
  exports `testSql`, `cleanTables()`, `rowCount()` for assertions that bypass the repository layer
- **Run**: `docker compose up -d && npx vitest run tests/integration`
- **Isolation**: `cleanTables()` in `beforeEach`/`afterAll`, plus `fileParallelism: false` so test
  files never race on the shared `conferences` / `outbox_messages` tables

```typescript
// tests/integration/modules/conference/conference-repository.integration.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { DrizzleConferenceRepository } from '@sessioflow/conference/infrastructure/database/conference.repository';
import { cleanTables } from './utils/test-db';

describe('DrizzleConferenceRepository', () => {
  // No argument = the shared `db` client; an argument overrides it (transaction handle).
  const repository = new DrizzleConferenceRepository();

  beforeEach(async () => {
    await cleanTables();
  });

  it('saves and reconstitutes the aggregate from the schema', async () => {
    const conference = buildTestConference(); // factory: crypto.randomUUID() id + CfP dates after the frozen clock
    await repository.save(conference);

    const retrieved = await repository.findById(conference.id);

    expect(retrieved?.name.value).toBe(conference.name.value);
    expect(retrieved?.slug.value).toBe(conference.slug.value);
  });
});
```

> The ADR-017 outbox invariant (aggregate row + `outbox_messages` rows in **one** transaction) is
> covered by `tests/integration/modules/conference/outbox-pattern.integration.test.ts`, which forces
> a failure after the aggregate insert and asserts that nothing was committed.

### E2E Tests (Playwright)
- **Location**: `tests/e2e/[feature].spec.ts`
- **Scope**: Critical user journeys from browser perspective
- **Framework**: Playwright
- **Run**: `npm run test:e2e`

#### 🎭 E2E Testing Architecture & How It Works
- **Single WebServer (`apps/frontend` on port 3010)**: Playwright's `webServer` config automatically launches `apps/frontend` (`next dev -p 3010`).
- **In-Process API Route Handlers**: Next.js App Router route handlers (`apps/frontend/src/app/api/v1/*`) directly invoke DDD module controllers from `@sessioflow/[module]/container.ts` in-process.
- **🚫 Do NOT spawn `apps/backend`**: `apps/backend` (port 3020) is a standalone microservice gateway and is **NOT** needed or started for E2E tests. All `/api/v1/*` requests are served directly by `apps/frontend`.
- **Database Setup & Migrations (`tests/e2e/setup.ts`)**: Global setup connects to PostgreSQL via `postgres-js`, polls until the DB is ready, applies Drizzle migrations, and cleans up test records.
- **Per-Test Isolation (`tests/e2e/utils/cleanup.ts`)**: `deleteConferences()` runs in `test.beforeEach()` to ensure clean database state for every test case.

```typescript
// tests/e2e/conference-setup.spec.ts
import { test, expect } from '@playwright/test';
import { deleteConferences } from './utils/cleanup';

test.describe('Conference Setup E2E', () => {
  test.beforeEach(async ({ page }) => {
    await deleteConferences();
    await page.goto('/conferences/create');
  });

  test('user can create a conference', async ({ page }) => {
    await page.getByLabel('Conference Name').fill('Tech Conference 2026');
    await page.getByLabel('CfP Start Date').fill('2026-08-17');
    await page.getByLabel('CfP End Date').fill('2026-11-30');
    await page.getByRole('button', { name: /create conference/i }).click();

    await page.waitForURL(/\/conferences\/[\da-fA-F-]{36}$/);
    await expect(page.locator('code').first()).toBeVisible();
  });
});
```

## 📋 Test Commands

```bash
# Architecture Checks (Fast standalone check < 2s)
npm run check:arch
npm run test:architecture

# Run all tests
npm test

# Run a layer subset (fast)
npx vitest run tests/unit

# Run with coverage
npx vitest run --coverage

# Run single test file
npx vitest run tests/unit/modules/conference/domain/value-objects/conference-name.test.ts

# Run E2E tests (⚠️ builds everything and stops docker compose on exit)
npm run test:e2e

# Integration tests need PostgreSQL
docker compose up -d && npx vitest run tests/integration

# Run specific E2E test (config lives with the frontend app)
npx playwright test tests/e2e/conference-setup.spec.ts --config=apps/frontend/playwright.config.ts

# Run E2E with UI mode
npx playwright test --ui
```

## ✅ Definition of Done

A task is complete when ALL of the following pass:

1. ✅ Architecture rules pass: `npm run check:arch`
2. ✅ Unit tests pass: `npx vitest run`
3. ✅ Integration tests pass: `npx vitest run tests/integration`
4. ✅ E2E tests pass: `npm run test:e2e`
5. ✅ Linting passes: `npm run lint`
6. ✅ Type checking passes: `npm run typecheck`
7. ✅ Code coverage ≥ 80% for new code

## 🎯 Testing Guidelines

### What to Test

**Unit Tests:**
- ✅ Value objects and their validation
- ✅ Domain entities and business rules
- ✅ Pure utility functions
- ✅ Zod validation schemas
- ✅ Use case logic (with mocked repositories)

**Integration Tests:**
- ✅ Repository implementations
- ✅ Database queries and migrations
- ✅ External service integrations (with mocks)
- ✅ API endpoint controllers paired with real handlers (DTO schema drift validation)

**E2E Tests:**
- ✅ Critical user journeys
- ✅ Authentication flows
- ✅ Conference creation and management
- ✅ Submission workflows
- ✅ Review processes

### What NOT to Test

**Don't test:**
- ❌ Third-party libraries (they have their own tests)
- ❌ Simple getters/setters
- ❌ Framework boilerplate code
- ❌ Implementation details (test behavior, not internals)

### Testing DDD Components

```typescript
// Value Objects — immutable, self-validating, throw on invariant violation
describe('ConferenceName', () => {
  it('keeps the validated value', () => {
    expect(ConferenceName.create('Tech Conference 2026').value).toBe('Tech Conference 2026');
  });

  it('rejects invalid input instead of returning a failure object', () => {
    expect(() => ConferenceName.create('Ab')).toThrow();
  });
});

// Entities — transitions enforce the state machine and expose events to the outbox
describe('Conference.publishCfp', () => {
  it('emits a CFP_OPENED domain event', () => {
    const conference = buildTestConference();
    conference.publishCfp();

    expect(conference.pullDomainEvents().map(event => event.type)).toContain('CFP_OPENED');
  });

  it('refuses illegal transitions (INV-001)', () => {
    const conference = buildTestConference({ status: 'CFP_CLOSED' });
    expect(() => conference.publishCfp()).toThrow(InvalidStatusTransitionError);
  });
});

// Handlers — pure: mocked repository + fake transaction runner, no try/catch
it('persists the aggregate and its events in one transaction (ADR-017)', async () => {
  await handler.execute(command);

  expect(save).toHaveBeenCalledWith(expect.anything(), tx);
  expect(saveAll).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ type: 'CONFERENCE_CREATED' })]), tx);
});

// Controllers — web-standard Request/Response, handler mocked
it('returns 201 with the { data } envelope', async () => {
  const response = await createConferenceController(request, handler, async () => ({ id: organizerId }));

  expect(response.status).toBe(201);
  expect(await response.json()).toHaveProperty('data');
});
```

> **Never** write `expect(result.isFailure).toBe(true)` — the `Result` wrapper does not exist in
> `@sessioflow/shared-domain`. Domain errors are thrown and mapped by the controller.

## 📊 Coverage Requirements

| Area | Minimum Coverage |
|------|------------------|
| Domain layer | 90% |
| Application layer | 85% |
| Infrastructure layer | 80% |
| Utilities | 95% |
| Value objects | 100% |

## 🔧 Test Configuration

**Vitest config** (`vitest.config.ts`):
- `setupFiles: ['./tests/setup.ts']` — installs the frozen clock (see **Facts First**)
- `alias` maps `@sessioflow/*` (and `@backend`, `@frontend`) to **`src/`**, while `package.json`
  `exports` point at `dist/` — build separately to catch resolution regressions
- `fileParallelism: false` — integration files share the same PostgreSQL tables
- `coverage.provider: 'v8'` (`npx vitest run --coverage`)
- `exclude: ['tests/frontend/**']`

**Playwright config** (`playwright.config.ts`):
- Headless mode for CI
- Screenshots on failure
- Retry failed tests (2x)
- Timeout: 30 seconds per test

## 🚀 CI/CD Integration

All tests run automatically on:
- Pull requests
- Push to main branch
- Manual workflow dispatch

**Pipeline steps:**
1. Install dependencies
2. Run linter
3. Run type checker
4. Run unit + integration tests
5. Run E2E tests
6. Upload coverage report

## 📚 Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Code Style Guidelines](../AGENTS.md)
- [API Design](./API-DESIGN.md)