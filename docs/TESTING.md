# Testing Strategy

SessioFlow uses a comprehensive testing strategy with multiple layers.

## 🧪 Test Layers

### Unit Tests (Vitest)
- **Location**: `tests/unit/[domain]/[feature].test.ts`
- **Scope**: Pure functions, utilities, value objects, Zod schemas
- **Framework**: Vitest
- **Run**: `npm test` or `npx vitest run`

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

### Integration Tests
- **Location**: `tests/integration/[feature].test.ts`
- **Scope**: Repository implementations, use cases with mocked dependencies
- **Framework**: Vitest + Testcontainers

```typescript
// tests/integration/event-repository.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SupabaseEventRepository } from '@/infrastructure/database/event-repository';

describe('SupabaseEventRepository', () => {
  let repository: SupabaseEventRepository;

  beforeAll(async () => {
    // Setup test database
    repository = new SupabaseEventRepository(testDbClient);
  });

  it('saves and retrieves event', async () => {
    const event = createTestEvent();
    await repository.save(event);
    const retrieved = await repository.findById(event.id);
    expect(retrieved).toEqual(event);
  });
});
```

### E2E Tests (Playwright)
- **Location**: `tests/e2e/[feature].spec.ts`
- **Scope**: Critical user journeys from browser perspective
- **Framework**: Playwright
- **Run**: `npm run test:e2e`

```typescript
// tests/e2e/create-event.spec.ts
import { test, expect } from '@playwright/test';

test('user can create an event', async ({ page }) => {
  await page.goto('/dashboard/events/new');
  
  await page.fill('[name="eventName"]', 'Tech Conference 2026');
  await page.fill('[name="cfpStartDate"]', '2026-01-01');
  await page.fill('[name="cfpEndDate"]', '2026-03-31');
  
  await page.click('[type="submit"]');
  
  await expect(page).toHaveURL(/\/events\/\w+/);
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
npx vitest run tests/unit/event/event-name.test.ts

# Run E2E tests
npm run test:e2e

# Run specific E2E test
npx playwright test tests/e2e/create-event.spec.ts

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
- ✅ Event creation and management
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
describe('Event entity', () => {
  it('validates CFP dates', () => {
    const event = Event.create({
      name: 'Test',
      cfpStartDate: new Date('2026-01-01'),
      cfpEndDate: new Date('2025-12-31') // Invalid: before start
    });
    
    expect(event.isFailure).toBe(true);
  });
});
```

**Value Objects:**
```typescript
describe('EventId value object', () => {
  it('generates valid UUID', () => {
    const id = EventId.create();
    expect(id.getValue()).toMatch(/^[0-9a-f-]{36}$/);
  });
});
```

**Repositories:**
```typescript
describe('EventRepository', () => {
  it('enforces unique slugs', async () => {
    const event1 = createEvent({ slug: 'test-event' });
    const event2 = createEvent({ slug: 'test-event' });
    
    await repository.save(event1);
    const result = await repository.save(event2);
    
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