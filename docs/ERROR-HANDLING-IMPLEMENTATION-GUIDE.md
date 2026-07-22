# Error Handling Implementation Guide

## 📋 Executive Summary

This document provides a comprehensive guide to implementing clean, DDD-compliant error handling in SessioFlow. We're transitioning from the current antipattern (try/catch in both handlers and controllers with manual error mapping) to a cleaner pattern that preserves DDD boundaries while reducing duplication.

**Time to implement:** ~30-45 minutes if you have all knowledge packaged up and ready

## 🔍 The Problem: Current Antipatterns

### Current State
Your codebase has two main antipatterns based on the analysis in `conf-module-controllers-wow.md`:

```typescript
// applicationContext/create-conference.handler.ts (Antipattern)
export class CreateConferenceHandler {
  async execute(command): Promise<CreateConferenceResult> {
    try {
      // Business logic
      const conference = Conference.create({ ... });
      await repository.save(conference);
      return { success: true, data };
    } catch (error) {
      if (error instanceof CfpDatesInvalidError) {
        return { success: false, errors: [{ code: 'CFP_DATES_INVALID', message: error.message }] };
      }
      // ... catches ALL domain errors
      throw error;
    }
  }
}

// create-conference.controller.ts (Antipattern)
export async function createConferenceController(...) {
  try {
    // Auth, validation...
    const result = await commandHandler.execute(command);
    
    if (!result.success) {
      // Manual error mapping - ANTI-PATTERN #2
      let status = 400;
      if (error.code === 'SLUG_EXISTS') status = 409;
      if (error.code === 'FREE_TIER_LIMIT') status = 403;
      
      return NextResponse.json(...);
    }
    
    return NextResponse.json(...);
  } catch (error) {
    // Safety net - ANTI-PATTERN #1
    console.error(...);
    return NextResponse.json(...);
  }
}
```

### The Issues
1. **Duplicate try/catch** in both handlers AND controllers
2. **Manual error mapping** in controllers couples HTTP layer to domain error codes
3. **Controllers too heavy** - they handle both translation and safety net

## ✅ The Recommended Pattern

### DDD Error Flow

```
Value Object/Entity 
  → Throws DomainError (with error code)
  
Handler 
  → Pure, no try/catch (delegates to domain)
  
Controller 
  → Single try/catch for DOMAIN ERROR TRANSLATION
  → Maps DomainError → HTTP Response using error code
  
Route Handler (Safety Net) 
  → Only catches UNEXPECTED errors (infrastructure/runtime)
```

### Key Benefits

| Before | After |
|--------|-------|
| Handlers handle all domain errors | Handlers are pure (no try/catch) |
| Controllers manually map errors | Controllers only translate code → HTTP |
| Multiple try/catch blocks | Single try/catch in controller + safety net in route |
| API layer knows domain types | API layer knows only error codes |

## 🏗️ Architecture Changes

### Step 1: Unify Domain Errors with Base Class

All domain exceptions should extend a common `DomainError` base class that includes an error code.

**Create:** `/packages/modules/conference/src/domain/exceptions/domain-error.ts`

```typescript
export abstract class DomainError extends Error {
  public readonly code: string;
  
  constructor(code: string, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Update each domain exception:**

**Before:**
```typescript
export class CfpDatesInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CfpDatesInvalidError';
  }
}
```

**After:**
```typescript
import { DomainError } from './domain-error';

export class CfpDatesInvalidError extends DomainError {
  constructor(message: string) {
    super('CFP_DATES_INVALID', message);
  }
}
```

Apply this pattern to all domain exceptions:
- `CfpDatesInvalidError` → `super('CFP_DATES_INVALID', message)`
- `ConferenceNameTooShortError` → `super('NAME_TOO_SHORT', message)`
- `ConferenceFreeTierLimitError` → `super('FREE_TIER_LIMIT', message)`
- `SlugExistsError` → `super('SLUG_EXISTS', message)`
- etc.

### Step 2: Simplify Handler (Remove try/catch)

**Files to update:**
- `/packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts`
- `/packages/modules/conference/src/application/queries/get-conference/get-conference.handler.ts`

**Change:**

```typescript
export class CreateConferenceHandler {
  async execute(command: CreateConferenceCommand): Promise<Conference> {
    // NO try/catch! Let exceptions bubble up to controller
    const conference = Conference.create({ 
      name: command.input.name,
      description: command.input.description,
      organizerId: command.input.organizerId,
      cfpStartDate: new Date(command.input.cfpStartDate),
      cfpEndDate: new Date(command.input.cfpEndDate),
      maxSubmissions: command.input.maxSubmissions,
      requiresApproval: command.input.requiresApproval,
    });
    
    await this.repository.save(conference);
    return conference;
  }
}
```

**Important:** Handlers should throw domain exceptions directly for invariant violations. They don't need to convert to Result objects anymore.

### Step 3: Create Error Mapper Utility

**Create:** `/apps/backend/src/shared/infrastructure/error-mapper.js`

```typescript
// apps/backend/src/shared/infrastructure/error-mapper.ts
export function mapErrorCodeToHttpStatus(errorCode: string): number {
  switch (errorCode) {
    case 'UNAUTHORIZED':
    case 'AUTH_REQUIRED':
      return 401;
      
    case 'VALIDATION_ERROR':
      return 400;
      
    case 'CFP_DATES_INVALID':
    case 'NAME_TOO_SHORT':
      return 400;
      
    case 'SLUG_EXISTS':
      return 409;
      
    case 'FREE_TIER_LIMIT':
      return 403;
      
    case 'NOT_FOUND':
      return 404;
      
    default:
      return 500;
  }
}

export function mapDomainErrorToResponse(error: DomainError): Response {
  const status = mapErrorCodeToHttpStatus(error.code);
  
  const response = {
    error: {
      code: error.code,
      message: error.message,
    },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Step 4: Refactor Controllers (Centralized Translation)

**Files to update:**
- `/packages/modules/conference/src/interfaces/http/create-conference.controller.ts`
- `/packages/modules/conference/src/interfaces/http/get-conference.controller.ts`

**Before:**

```typescript
export async function createConferenceController(...) {
  try {
    // Auth check
    // Validation
    // Execute handler
    // Manual error mapping
    // Success response
  } catch (error) {
    // Safety net
  }
}
```

**After:**

```typescript
import { mapDomainErrorToResponse } from '@sessioflow/error-mapper';
import { DomainError } from '@sessioflow/conference/domain/exceptions/domain-error';

export async function createConferenceController(
  request: Request,
  commandHandler: CreateConferenceHandler,
  getAuthUser: () => Promise<{id: string} | undefined>,
): Promise<Response> {
  try {
    // 1. Authentication
    const user = await getAuthUser();
    if (!user) {
      throw new UnauthorizedError('UNAUTHORIZED', 'Authentication required');
    }

    // 2. Validation
    const body = await request.json();
    const parsed = ConferenceCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('VALIDATION_ERROR', 'Invalid request body', parsed.error);
    }

    // 3. Execute handler (may throw domain exceptions)
    const command = new CreateConferenceCommand({
      ...parsed.data,
      organizerId: user.id,
    });
    const conference = await commandHandler.execute(command);

    // 4. Success response
    return NextResponse.json(
      { data: conference },
      { status: 201 }
    );
  } catch (error) {
    // Centralized error translation - ONLY domain errors handled here
    if (error instanceof DomainError || (error instanceof Error && error.code)) {
      return mapDomainErrorToResponse(error as any);
    }
    
    // Unknown error - rethrow for route safety net
    throw error;
  }
}
```

### Step 5: Add Safety Net to Route Handlers

**Files to update:**
- `/apps/backend/src/interfaces/api/v1/conferences/route.ts`
- `/apps/backend/src/interfaces/api/v1/conferences/[id]/route.ts`

**Before:**

```typescript
export async function POST(request: NextRequest) {
  const controller = conferenceContainer.createConferenceController();
  return controller(request);
}
```

**After:**

```typescript
export async function POST(request: NextRequest) {
  try {
    const controller = conferenceContainer.createConferenceController();
    return await controller(request);
  } catch (error) {
    console.error('Route-level unhandled error:', error);
    
    // Only catches truly unexpected errors
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
```

## 📊 New Error Flow Visualization

```
Client Request
    ↓
Route Handler (Safety Net for EXPECTED errors)
    ↓
Controller (Translation Layer)
    ├─ Auth check → Throws if unauthorized
    ├─ Validation → Throws if invalid
    └─ Handler.execute() → May throw DomainError
    ↓
Controller Try/Catch:
    ├─ DomainError → Map to HTTP Response (400, 403, 409, etc.)
    └─ Unexpected Error → Rethrow
    ↓
Route Handler Try/Catch:
    └─ Unhandled Error → Map to HTTP 500
```

## 🧪 Testing Changes

### New Test Cases to Add

```typescript
// Test that domain exceptions are properly mapped
describe('createConferenceController error handling', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 400 for CFP dates invalid error', async () => {
    // Arrange
    const mockHandler = {
      execute: jest.fn().mockRejectedValueOnce(
        new CfpDatesInvalidError('End date must be after start date')
      )
    };
    const mockUser = { id: 'user-123' };
    const mockRequest = createMockRequest({ body: { cfpEndDate: '2024-01-01', cfpStartDate: '2025-01-01' } });

    // Act
    const response = await createConferenceController(
      mockRequest,
      mockHandler as any,
      async () => mockUser
    );

    // Assert
    expect(response.status).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: 'CFP_DATES_INVALID',
        message: 'End date must be after start date',
      },
    });
  });

  it('returns 409 for slug exists error', async () => {
    // ...
  });

  it('returns 403 for free tier limit error', async () => {
    // ...
  });

  it('rethrows unexpected errors to route safety net', async () => {
    // ...
  });
});
```

## 🔄 Refactoring Strategy

### Phase 1: Domain Error Consolidation (15 min)
1. Create `DomainError.ts` base class
2. Update all domain exception files to extend it
3. Ensure each has a consistent error code

### Phase 2: Error Mapper Creation (10 min)
1. Create `error-mapper.ts` utility
2. Implement `mapErrorCodeToHttpStatus()`
3. Implement `mapDomainErrorToResponse()`

### Phase 3: Handler Simplification (20 min)
1. Remove try/catch from `CreateConferenceHandler`
2. Remove try/catch from `GetConferenceHandler`
3. Let domain exceptions propagate

### Phase 4: Controller Transformation (30 min)
1. Update `create-conference.controller.ts`
2. Update `get-conference.controller.ts`
3. Add single try/catch for translation
4. Use error mapper for Response creation

### Phase 5: Route Safety Net (10 min)
1. Wrap POST/GET routes with try/catch
2. Only catch unexpected errors

### Phase 6: Testing (20 min)
1. Add unit tests for error mapping
2. Add integration tests for controllers
3. Update existing tests to match new behavior

## ⚠️ Important Notes

### What This Pattern Preserves
1. ✅ Domain invariants still throw exceptions
2. ✅ Handlers remain clean and focused
3. ✅ Controllers have meaningful singleton try/catch
4. ✅ API layer knows only error codes (no domain types)
5. ✅ Safety net for truly unexpected errors

### What This Pattern Avoids
1. ❌ Manual error mapping scattered across controllers
2. ❌ Duplicate try/catch in handlers and controllers
3. ❌ API layer coupling to domain exception classes
4. ❌ Result objects with error codes (use exceptions instead)

### Critical Dependencies
- Only `DomainError` class is shared between layers
- API layer knows only `code` and `message` properties
- Error mapping is centralized in `error-mapper.ts`

## 📝 Quick Reference: Key Changes

| File | Change |
|------|--------|
| `domain-error.ts` | Create base class |
| `*-error.ts` | Extend base class, add `code` |
| `*.handler.ts` | Remove try/catch |
| `*.controller.ts` | Single try/catch for translation |
| `error-mapper.ts` | Centralized mapping utility |
| `route.ts` | Safety net only |

## 🚨 Rollback Plan

If issues arise during implementation:

1. Partial implementation is sufficient - implement phases in order
2. Keep old try/catch in handlers as fallback
3. Error mapper can be added incrementally

## 🎯 Success Criteria

After implementation:
- Controllers have clean, single try/catch blocks
- Handlers are pure (no error handling)
- Error mapping is centralized in one place
- Route handlers only catch unexpected errors
- All domain exceptions have consistent error codes

## 📞 Questions During Implementation

If you encounter issues:
1. Check that all domain errors extend `DomainError`
2. Ensure error codes are unique and consistent
3. Verify error-mapper handles all expected cases
4. Test with each type of domain error

---

*Document maintained by SessioFlow Architecture Team*
