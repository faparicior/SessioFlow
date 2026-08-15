# Testing Strategy

SessioFlow uses a comprehensive testing strategy with multiple layers.

## 🧪 Test Layers

### Unit Tests (Vitest)
- **Location**: `tests/unit/[domain]/[feature].test.ts`
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
- **Scope**: Repository implementations, database operations, and HTTP Controllers paired with real CQRS handlers (unmocked handler logic to prevent DTO schema drift)
- **Framework**: Vitest (+ Testcontainers or in-memory repositories)

```typescript
// tests/integration/modules/conference/conference-repository.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DrizzleConferenceRepository } from '@sessioflow/conference/infrastructure/database/conference.repository';

describe('DrizzleConferenceRepository', () => {
  let repository: DrizzleConferenceRepository;

  beforeAll(async () => {
    repository = new DrizzleConferenceRepository(testDbClient);
  });

  it('saves and retrieves conference', async () => {
    const conference = createTestConference();
    await repository.save(conference);
    const retrieved = await repository.findById(conference.id);
    expect(retrieved?.id.value).toEqual(conference.id.value);
  });
});
```

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
    await page.getByLabel('CfP Start Date').fill('2026-01-01');
    await page.getByLabel('CfP End Date').fill('2026-03-31');
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

# Run only unit tests (fast)
npx vitest run

# Run with coverage
npx vitest run --coverage

# Run single test file
npx vitest run tests/unit/modules/conference/domain/value-objects/conference-name.test.ts

# Run E2E tests
npm run test:e2e

# Run specific E2E test
npx playwright test tests/e2e/create-conference.spec.ts

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

**Entities:**
```typescript
describe('Conference entity', () => {
  it('validates CFP dates', () => {
    const conference = Conference.create({
      name: 'Test',
      cfpStartDate: new Date('2026-01-01'),
      cfpEndDate: new Date('2025-12-31') // Invalid: before start
    });
    
    expect(conference.isFailure).toBe(true);
  });
});
```

**Value Objects:**
```typescript
describe('ConferenceId value object', () => {
  it('generates valid UUID', () => {
    const id = ConferenceId.create();
    expect(id.value).toMatch(/^[0-9a-f-]{36}$/);
  });
});
```

**Repositories:**
```typescript
describe('ConferenceRepository', () => {
  it('enforces unique slugs', async () => {
    const conference1 = createConference({ slug: 'test-conference' });
    const conference2 = createConference({ slug: 'test-conference' });
    
    await repository.save(conference1);
    const result = await repository.save(conference2);
    
    expect(result.isFailure).toBe(true);
  });
});
```

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
- Mock external services
- Use test database
- Enable code coverage
- Run in parallel

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