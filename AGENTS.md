# Agent Guidelines for SessioFlow

This document provides guidelines for agentic coding agents operating on the SessioFlow project.

## 📦 Project Overview

SessioFlow is a Call-for-Papers (CfP) platform built with Next.js. This repository contains documentation, specs, and AI agent commands for guiding development.

## 🛠️ Build, Lint & Test Commands

### Setup Dependencies
```bash
# Install dependencies (run from project root)
npm install

# Or with Bun
bun install
```

### Development
```bash
npm run dev          # Start Next.js dev server
```

### Testing (Single Test File)
```bash
npm test              # Run all tests
npx vitest run        # Run Vitest unit tests
npx vitest run tests/unit/feature-name.test.ts  # Single file
npx vitest run --reporter=verbose tests/unit/feature-name.test.ts  # Verbose output
```

### E2E Testing (Playwright)
```bash
npm run test:e2e      # Run all E2E tests
npx playwright test --grep "feature name"  # Filter by test name
npx playwright test tests/e2e/specific.spec.ts  # Single test file
```

### Type Checking
```bash
npm run typecheck     # Run TypeScript type checking (tsgo)
```

### Linting
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format        # Run Prettier formatting
```

### Building for Production
```bash
npm run build         # Build Next.js app
npm run start         # Start production server
```

## 📖 Code Style Guidelines

### Project Structure (Feature-Based Colocation)
```
app/           # Routing only (page.tsx, layout.tsx, route.ts)
components/    # Shared UI components (Button, Input, etc.)
features/      # Feature-domain code:
  - auth/      # Login, signup, auth hooks
  - cfp/       # Submission forms, validation
  - dashboard/ # Dashboard layout, tables
lib/           # Utilities, database client, generic helpers
types/         # TypeScript interfaces and types
tests/         # Unit, integration, and E2E tests
```

### Imports

1. **Order**: Third-party → Built-in → Local imports
2. **Group**: Blank line between groups
3. **Type**: Use named imports, avoid `import * as`
4. **Paths**: Use absolute imports (`@/features/cpf/...`)

```typescript
// ✅ Good
import { useState } from 'react';
import { z } from 'zod';
import { db } from '@/lib/client';
import { CreateEventForm } from '@/features/events/create-event-form';
```

```typescript
// ❌ Bad
import * as React from 'react';
import { z } from 'zod';
import db from '../../lib/client';
```

### Formatting

1. **Tabs**: Use spaces (2 spaces per indent)
2. **Semicolons**: Required
3. **Quotes**: Single quotes for strings
4. **Trailing commas**: Yes, in objects/arrays
5. **Max line length**: 100 characters
6. **File extensions**: `.tsx` for React components

### TypeScript

1. **Strict mode**: Enable, no `any` types (except with `// eslint-disable-next-line` justification)
2. **Interfaces**: Use `interface` for public APIs, `type` for unions/primitives
3. **Export**: Always explicitly export: `export const`, `export function`
4. **Function types**: Use arrow functions for callbacks, `function` keyword for declarations

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

export const createUser = (data: CreateUserInput): User => {
  return { id: '1', name: data.name };
};
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CreateEventForm.tsx` |
| Functions | camelCase | `validateEventName()` |
| Constants | UPPER_SNAKE_CASE | `MAX_EVENT_NAME_LENGTH` |
| Files | PascalCase (components),kebab-case (features) | `CreateEventForm.tsx`, `feature-auth` |
| Types | PascalCase | `CreateEventInput`, `EventStatus` |

### Error Handling

1. **Zod validation**: Use for all input validation
2. **Try/catch**: Wrap async operations (DB calls, API requests)
3. **Error messages**: User-facing messages in UI, log technical details
4. **Consistent errors**: Return standardized error shapes

```typescript
// ✅ Good
try {
  const validated = eventCreateSchema.parse(input);
  return await db.insert('events', validated);
} catch (error) {
  if (error instanceof ZodError) {
    return { success: false, errors: error.flatten() };
  }
  console.error('DB error:', error);
  return { success: false, message: 'Database error occurred' };
}
```

### Testing Strategy

#### Unit Tests (Vitest)
- **Location**: `tests/unit/[feature]/[component].test.ts`
- **Scope**: Pure functions, utilities, Zod schemas
```typescript
// tests/unit/event-validation.test.ts
import { describe, it, expect } from 'vitest';
import { eventCreateSchema } from '@/lib/validations/event';

describe('eventCreateSchema', () => {
  it('validates correct input', () => {
    const result = eventCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
```

#### Feature Tests
- **Location**: `tests/features/[feature-name].test.tsx`
- **Scope**: Component behavior, user flows within components
- Use React Testing Library for component rendering

#### E2E Tests (Playwright)
- **Location**: `tests/e2e/[feature].spec.ts`
- **Scope**: Critical user journeys (e.g., "Submit proposal", "Create event")
- Test from browser perspective

#### Test File Naming
- Unit: `*.test.ts`
- Component: `*.test.tsx`
- E2E: `*.spec.ts`

### Global Behaviors
Refer to `docs/specs/bdd/_global-behaviours/` for:
- Date validation rules (GB-VAL-001)
- Navigation patterns (GB-NAV-001)
- Error handling conventions

### Data Contracts
- See `docs/specs/bdd/_shared/contracts.md` for shared interfaces
- Zod schemas in `lib/validations/` define input contracts

### References for Agents
- **Test Runner**: `npm test` (Vitest + Playwright via `package.json`)
- **Linting Config**: See project's `.eslintrc.cjs` (Next.js + Prettier config)
- **BDD Specs**: `docs/specs/bdd/feat-*.md` files
- **Implement Feature**: Read `IMPLEMENTING_FEATURES.md` before coding

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
