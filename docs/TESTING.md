# Testing Strategy

SessioFlow uses a comprehensive testing strategy with multiple layers.

## 🧪 Test Layers

### Unit Tests (Vitest)
- **Location**: `tests/unit/[domain]/[feature].test.ts`
- **Scope**: Pure functions, utilities, value objects, Zod schemas
- **Framework**: Vitest
- **Run**: `npm test` or `npx vitest run`

```typescript
// tests/unit/conference/conference-name.test.ts
import { describe, it, expect } from 'vitest';
import { ConferenceName } from '@/domains/conference/value-objects/conference-name';

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

### Integration Tests
- **Location**: `tests/integration/[feature].test.ts`
- **Scope**: Repository implementations, use cases with mocked dependencies
- **Framework**: Vitest + Testcontainers

```typescript
// tests/integration/conference-repository.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SupabaseConferenceRepository } from '@/infrastructure/database/conference-repository';

describe('SupabaseConferenceRepository', () => {
  let repository: SupabaseConferenceRepository;

  beforeAll(async () => {
    // Setup test database
    repository = new SupabaseConferenceRepository(testDbClient);
  });

  it('saves and retrieves conference', async () => {
    const conference = createTestConference();
    await repository.save(conference);
    const retrieved = await repository.findById(conference.id);
    expect(retrieved).toEqual(conference);
  });
});
```

### E2E Tests (Playwright)
- **Location**: `tests/e2e/[feature].spec.ts`
- **Scope**: Critical user journeys from browser perspective
- **Framework**: Playwright
- **Run**: `npm run test:e2e`

```typescript
// tests/e2e/create-conference.spec.ts
import { test, expect } from '@playwright/test';

test('user can create a conference', async ({ page }) => {
  await page.goto('/dashboard/conferences/new');
  
  await page.fill('[name="conferenceName"]', 'Tech Conference 2026');
  await page.fill('[name="cfpStartDate"]', '2026-01-01');
  await page.fill('[name="cfpEndDate"]', '2026-03-31');
  
  await page.click('[type="submit"]');
  
  await expect(page).toHaveURL(/\/conferences\/\w+/);
  await expect(page.locator('h1')).toContainText('Tech Conference 2026');
});
```

## 📋 Test Commands

```bash
# Run all tests
npm test

# Run only unit tests (fast)
npx vitest run

# Run with coverage
npx vitest run --coverage

# Run single test file
npx vitest run tests/unit/conference/conference-name.test.ts

# Run E2E tests
npm run test:e2e

# Run specific E2E test
npx playwright test tests/e2e/create-conference.spec.ts

# Run E2E with UI mode
npx playwright test --ui
```

## ✅ Definition of Done

A task is complete when ALL of the following pass:

1. ✅ Unit tests pass: `npx vitest run`
2. ✅ Integration tests pass: `npx vitest run tests/integration`
3. ✅ E2E tests pass: `npm run test:e2e`
4. ✅ Linting passes: `npm run lint`
5. ✅ Type checking passes: `npm run typecheck`
6. ✅ Code coverage ≥ 80% for new code

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
- ✅ API endpoint handlers

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
    expect(id.getValue()).toMatch(/^[0-9a-f-]{36}$/);
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