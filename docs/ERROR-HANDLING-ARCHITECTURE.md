# Error Handling Architecture for SessioFlow

## 🎯 Philosophy

Error handling in SessioFlow follows Domain-Driven Design (DDD) principles with a clean separation of concerns. The goal is to enforce domain invariants through exceptions at the domain layer, translate them to HTTP responses at the application boundary, and provide a safety net for truly unexpected errors.

## 📐 Architecture Layers

### Layer 1: Domain Layer (Value Objects & Entities)
**Responsibility:** Enforce business invariants and rules
**Behavior:** Throw exceptions when invariants are violated

```typescript
// Example: Value Object
export class ConferenceName {
  static create(value: string): ConferenceName {
    if (value.length < 3) {
      throw new ConferenceNameTooShortError('Name must be at least 3 characters');
    }
    return new ConferenceName(value);
  }
}

// Example: Entity
export class Conference {
  static create(data: CreateConferenceData): Conference {
    if (new Date(data.cfpEndDate) <= new Date(data.cfpStartDate)) {
      throw new CfpDatesInvalidError('End date must be after start date');
    }
    return new Conference(data);
  }
}
```

### Layer 2: Application Layer (Use Case Handlers)
**Responsibility:** Orchestrate domain objects to fulfill use cases
**Behavior:** NO try/catch - pure business logic, exceptions propagate to controllers

```typescript
export class CreateConferenceHandler {
  async execute(command: CreateConferenceCommand): Promise<Conference> {
    // Pure implementation - no error handling
    const name = ConferenceName.create(command.name);
    const conference = Conference.create({ ...command });
    await this.repository.save(conference);
    return conference;
  }
}
```

### Layer 3: Interface Layer (Controllers)
**Responsibility:** Translate HTTP requests to commands and validate business rules
**Behavior:** Single try/catch block for DOMAIN ERROR TRANSLATION

```typescript
export async function createConferenceController(...) {
  try {
    // 1. Authentication & Validation (throw errors)
    // 2. Create command
    // 3. Execute handler (may throw DomainError)
    
    return NextResponse.json({ data: conference }, { status: 201 });
  } catch (error) {
    // Centralized error translation: DomainError → HTTP Response
    if (error instanceof DomainError) {
      return mapDomainErrorToResponse(error);
    }
    // Unknown error: rethrow for route safety net
    throw error;
  }
}
```

### Layer 4: Route Handlers (API Endpoints)
**Responsibility:** Expose controllers as HTTP endpoints
**Behavior:** Safety net for UNEXPECTED errors only

```typescript
export async function POST(request: NextRequest) {
  try {
    const controller = conferenceContainer.createConferenceController();
    return await controller(request);
  } catch (error) {
    // Only catches errors that weren't handled in controller
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected error' } },
      { status: 500 }
    );
  }
}
```

## 🔗 Error Translation Flow

```
HTTP Request
    ↓
Route Handler (Safety Net)
    ├─ Try/Except for UNEXPECTED errors only
    ↓
Controller (Translation Layer)
    ├─ Try/Catch: DOMAIN ERROR TRANSLATION
    ├─ Maps DomainError → HTTP Response (4xx, 4xx)
    └─ Rethrows unexpected errors → Route safety net
    ↓
Use Case Handler (Pure)
    ├─ Calls Domain Objects
    └─ Lets exceptions propagate
    ↓
Domain Objects (Value Objects, Entities)
    ├─ Throw DomainError on invariant violation
    └─ Error includes code + message
```

## 🎨 Error Codes Convention

All domain errors have a **consistent code** for HTTP mapping:

| Domain Error Code | HTTP Status | Meaning |
|-------------------|-------------|---------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `CFP_DATES_INVALID` | 400 | CfP dates are invalid |
| `NAME_TOO_SHORT` | 400 | Conference name too short |
| `SLUG_EXISTS` | 409 | Conference slug already taken |
| `FREE_TIER_LIMIT` | 403 | Exceeded free tier limit |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## 🛠️ Implementation Components

### 1. DomainError Base Class
**File:** `/packages/modules/conference/src/domain/exceptions/domain-error.ts`

```typescript
export abstract class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### 2. Error Mapper Utility
**File:** `/apps/backend/src/shared/infrastructure/error-mapper.ts`

```typescript
export function mapErrorCodeToHttpStatus(errorCode: string): number {
  switch (errorCode) {
    case 'UNAUTHORIZED':
    case 'AUTH_REQUIRED':
      return 401;
    case 'VALIDATION_ERROR':
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

### 3. Route Safety Net
**File:** Any `route.ts` in `/apps/backend/src/interfaces/api/v1/`

```typescript
export async function POST(request: NextRequest) {
  try {
    const controller = conferenceContainer.createConferenceController();
    return await controller(request);
  } catch (error) {
    console.error('Route-level unhandled error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
```

## 🔒 Boundary Preservation

### What This Design Achieves

1. **Domain Independence**: Domain layer knows nothing about HTTP, controllers, or external concerns
2. **API Layer Independence**: API layer knows only error codes (strings), not domain exception classes
3. **Error Localization**: All error mapping happens in one place (error mapper)
4. **Safety Net**: Only truly unexpected errors reach route handlers
5. **Clean Handlers**: Use case handlers focus on business logic, not error handling

### Dependencies

```
Route Handlers → Controllers → Handlers → Domain
    ↓              ↓           ↓        ↓
   (no deps)   (error mapper) (none)  (pure)
```

## 🧪 Testing Strategy

### Unit Tests
- Test domain exceptions inherit from `DomainError`
- Test error mapper maps codes to correct HTTP status codes
- Test controllers translate errors correctly
- Test handlers throw expected domain exceptions

### Integration Tests
- Test full request/response cycle
- Verify domain exceptions result in proper HTTP responses
- Verify safety net catches unexpected errors

## 📋 Migration Checklist

For each new feature/module:

- [ ] Create `DomainError` subclasses for invariant violations
- [ ] Ensure handlers don't have try/catch blocks
- [ ] Implement controller translation with single try/catch
- [ ] Add route safety net
- [ ] Add tests for error mapping
- [ ] Update error mapper if new error codes exist

## 🚨 Common Pitfalls

1. **Don't catch domain errors in handlers** - let them propagate
2. **Don't map errors in multiple places** - use error mapper
3. **Don't rethrow domain errors in controllers** - translate them
4. **Don't forget safety net** - catch unexpected errors at route level

## 📚 Related Documentation

- [ERROR-HANDLING-IMPLEMENTATION-GUIDE.md](./ERROR-HANDLING-IMPLEMENTATION-GUIDE.md) - Step-by-step implementation
- [API-DESIGN.md](./API-DESIGN.md) - API design guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [CONF-MODULE-CONTROLLERS-WOW.md](../@to-delete/wow/conf-module-controllers-wow.md) - Current state analysis

## ✅ Summary

This error handling strategy provides:
- **DDD-compliant** error flow that respects domain boundaries
- **Clean separation** between translated errors and unexpected errors
- **Centralized error mapping** for consistency and maintainability
- **Safety net** for infrastructure/runtime failures
- **Minimal duplication** across the codebase

---

*For implementation details, see ERROR-HANDLING-IMPLEMENTATION-GUIDE.md*
