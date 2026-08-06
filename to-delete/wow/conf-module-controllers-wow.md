# 🎯 DDD UI Layer - REST Controllers - conference Package

> **Instructions**: This document defines the REST Controller patterns and guidelines for the `conference` package following DDD architectural principles.
>
> **Related templates**: `template-ddd-event-consumer-wow.md` | `template-ddd-scheduler-wow.md`

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
4. [🗺️ Request / Response Mapping](#-request--response-mapping)
5. [🔢 HTTP Status Code Strategy](#-http-status-code-strategy)
6. [🛠️ Implementation Guidelines](#-implementation-guidelines)
7. [⚠️ Error Handling Strategy](#-error-handling-strategy)
8. [🧪 Testing Approach](#-testing-approach)
9. [⚡ Performance Considerations](#-performance-considerations)
10. [🔒 Security Guidelines](#-security-guidelines)
11. [📝 Implementation Notes](#-implementation-notes)
12. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
13. [Summary](#summary)
14. [Pattern Index](#pattern-index)

---

## 📌 Overview

**Package:** `@sessioflow/conference`  
**Description:** Conference domain module for creating and managing conferences  
**Responsibility:** REST API endpoints for conference operations

**Domain Purpose:** Manage conference lifecycle including creation, retrieval, and configuration (CfP)

**Architecture Layer:** UI Layer - REST Controllers

---

## 🏗️ Architecture Position

```
HTTP Client → Controller (conference) → Application Layer (CQRS handlers) → Domain Layer
```

The `conference` controllers sit at the HTTP boundary, translating HTTP requests into application layer commands/queries and mapping domain responses back to HTTP, while maintaining proper separation of concerns.

### Package Structure Convention

- **Controller files**: `*.controller.ts` in `packages/modules/conference/src/interfaces/http/`
- **DTO schemas**: `*.schema.ts` in `packages/modules/conference/src/interfaces/http/`
- **App Router entrypoints**: `route.ts` in `apps/backend/src/interfaces/api/v1/`
- **Command/Query handlers**: `application/commands/` and `application/queries/`

Examples:

- `packages/modules/conference/src/interfaces/http/create-conference.controller.ts`
- `packages/modules/conference/src/interfaces/http/get-conference.controller.ts`
- `packages/modules/conference/src/interfaces/http/conference-create.schema.ts`
- `apps/backend/src/interfaces/api/v1/conferences/route.ts`

---

## 📐 Core Patterns and Rules

### Categories Analyzed

| Category          | Description              |
| ----------------- | ------------------------ |
| **Request Handling** | HTTP request parsing, parameter binding, validation |
| **Response Mapping** | HTTP response construction, status code decisions |
| **Error Handling**   | Exception and error code handling |
| **Security**         | Authentication and authorization |

---

### Rules by Category

#### Request Handling Patterns

**Total Patterns Found**: 3

##### Rule 1: Boundary Validation Pattern

**✅ GOOD - Zod schema validation at HTTP boundary:**

```typescript
const body = await request.json();
const parsed = ConferenceCreateSchema.safeParse(body);

if (!parsed.success) {
  return NextResponse.json(
    {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: z.treeifyError(parsed.error),
      },
    },
    {status: 400},
  );
}
```

**Source**: [a1b2c3d4e5f6] create-conference.controller.ts

**Key Benefits:**
- **Type Safety**: Ensures request structure matches expected schema
- **Early Validation**: Rejects invalid data before application layer processing
- **Rich Error Details**: Returns structured validation errors with field-level details
- **Consistent Validation**: Single source of truth for request validation rules

##### Rule 2: CQRS Command Construction Pattern

**✅ GOOD - Extract command from parsed data and dependencies:**

```typescript
const command = new CreateConferenceCommand({
  ...parsed.data,
  organizerId: user.id,
});
```

**Source**: [a1b2c3d4e5f6] create-conference.controller.ts

**Key Benefits:**
- **Clean Separation**: Controller bridges HTTP and application layers
- **Minimal Transformation**: Only adds contextual data (e.g., user ID)
- **Immutable Commands**: Creates immutable command objects
- **Single Responsibility**: Delegates processing to command handler

##### Rule 3: Route Parameter Extraction

**✅ GOOD - Explicit route parameter in function signature:**

```typescript
export async function getConferenceController(
  request: NextRequest,
  conferenceId: string,  // Extracted from URL path
  queryHandler: GetConferenceHandler,
  getAuthUser: () => Promise<{id: string} | undefined>,
): Promise<Response>
```

**Source**: [f6e5d4c3b2a1] get-conference.controller.ts

**Key Benefits:**
- **Framework-Assisted**: Router handles URL parameter extraction
- **Type Safety**: Route parameters are typed and validated
- **Clean Signature**: No manual parsing of query strings or path params

---

#### Response Mapping Patterns

**Total Patterns Found**: 3

##### Rule 1: Success Response Wrapping Pattern

**✅ GOOD - Success response wrapped in `data` envelope with appropriate status:**

```typescript
return NextResponse.json({data: responseDto}, {status: 201});
```

**Source**: [a1b2c3d4e5f6] create-conference.controller.ts

**Key Benefits:**
- **Consistent API Structure**: All responses have a predictable envelope
- **Clear Success Indicator**: `data` field indicates success
- **HTTP Semantics**: Proper status codes (201 for create, 200 for read)
- **Clean Separation**: Data is isolated from metadata

##### Rule 2: Error Response Structure Pattern

**✅ GOOD - Errors structured with code, message, and optional details:**

```typescript
return NextResponse.json(
  {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: z.treeifyError(parsed.error),
    },
  },
  {status: 400},
);
```

**Source**: [a1b2c3d4e5f6] create-conference.controller.ts

**Key Benefits:**
- **Machine-Readable**: Error codes can be programmatically handled
- **Human-Readable**: Clear message for debugging/UI
- **Extensible**: Optional `details` field for complex errors
- **Consistency**: All errors follow same structure

##### Rule 3: Null/Empty Handling Pattern

**✅ GOOD - Explicit null check with 404 response:**

```typescript
if (!result.data) {
  return NextResponse.json(
    {error: {code: 'NOT_FOUND', message: 'Conference not found'}},
    {status: 404},
  );
}
```

**Source**: [f6e5d4c3b2a1] get-conference.controller.ts

**Key Benefits:**
- **Explicit Intent**: Clearly signals resource absence
- **Standard HTTP**: Uses proper 404 status code
- **Consistent Structure**: Error format matches other errors

---

#### Input Validation Patterns

**Total Patterns Found**: 1

##### Rule 1: Zod Schema Validation Pattern

**✅ GOOD - Cross-cutting validation using Zod schemas:**

```typescript
const parsed = ConferenceCreateSchema.safeParse(body);
if (!parsed.success) {
  // Return validation error response
}
```

**Source**: [a1b2c3d4e5f6] create-conference.controller.ts

**Key Benefits:**
- **Type-Safe Validation**: Lean, TypeScript-native validation
- **Reusable Schemas**: Validation rules encapsulated in ZOD schemas
- **Runtime Validation**: Schema validated at runtime
- **Error Transformations**: Can transform errors to API-friendly format

---

#### Error Handling Patterns

**Total Patterns Found**: 2 (mostly anti-patterns)

##### Rule 1: Inline Exception Handling (ANTI-PATTERN)

**❌ BAD - Individual controllers handling exceptions locally:**

```typescript
try {
  // business logic
} catch (error) {
  console.error('Conference creation error:', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    {status: 500},
  );
}
```

**Source**: [a1b2c3d4e5f6] create-conference.controller.ts, [f6e5d4c3b2a1] get-conference.controller.ts

**Why it's bad:**
- **Violates Separation of Concerns**: Controllers should not know about error translation
- **Inconsistent Error Handling**: Each controller has its own try/catch logic
- **Duplicated Code**: Error response structure repeated across many controllers
- **Hard to Test**: Need to test error handling in every controller

**Recommendation**: Create a centralized error handler using global middleware or exception filter.

##### Rule 2: Manual Error Code to HTTP Status Mapping (ANTI-PATTERN)

**❌ BAD - Controllers manually map domain error codes to HTTP status codes:**

```typescript
const error = result.errors![0];
let status = 400;

if (error.code === 'SLUG_EXISTS') {
  status = 409;
} else if (error.code === 'FREE_TIER_LIMIT') {
  status = 403;
}

return NextResponse.json(
  {error: {code: error.code, message: error.message}},
  {status},
);
```

**Source**: [a1b2c3d4e5f6] create-conference.controller.ts

**Why it's bad:**
- **Tight Coupling**: Controllers exposed to domain error codes
- **Breach of Layer Boundaries**: Error translation belongs in application or infrastructure layer
- **Maintenance Burden**: Error mapping logic scattered across controllers
- **Inconsistent Mapping**: Different controllers may map same code differently

**Recommendation**: Create a centralized error adapter that maps domain exceptions to HTTP status codes.

---

#### Security Patterns

**Total Patterns Found**: 2

##### Rule 1: Authentication Check Pattern

**✅ GOOD - Authentication performed at controller entry point:**

```typescript
const user = await getAuthUser();
if (!user) {
  return NextResponse.json(
    {error: {code: 'UNAUTHORIZED', message: 'Authentication required'}},
    {status: 401},
  );
}
```

**Source**: [a1b2c3d4e5f6] create-conference.controller.ts, [f6e5d4c3b2a1] get-conference.controller.ts

**Key Benefits:**
- **Early Authentication**: Rejects unauthenticated requests before processing
- **Consistent Security**: All protected endpoints require authentication
- **Clear Error Message**: Immediate feedback for unauthorized access
- **Decoupled Auth**: Authentication logic abstracted behind `getAuthUser()` dependency

---

## 🗺️ Request / Response Mapping

### Request Mapping Strategy

- **Route Parameters**: Framework handles URL parameter extraction (e.g., `conferenceId: string`)
- **Query Parameters**: Not used in analyzed controllers
- **Request Body**: Parsed with `request.json()` then validated with Zod schema (`ConferenceCreateSchema.safeParse()`)
- **Validation Approach**: Schema validation at boundary before application layer
- **Deserialization**: JSON parsing + Zod schema validation

### Response Mapping Strategy

- **Success Envelope**: All success responses wrapped in `{data: ...}` object
- **Error Envelope**: All errors wrapped in `{error: {code, message, details?}}` object
- **Serialization**: `NextResponse.json()` with explicit status code
- **Null Handling**: Explicit null check returns 404 with `{error: {...}}`
- **HTTP Status**: 
  - 201 for create operations
  - 200 for read operations
  - 400 for validation errors
  - 401 for unauthorized access
  - 404 for not found
  - 403/409 based on domain error codes
  - 500 for unexpected errors

---

## 🔢 HTTP Status Code Strategy

### Domain Exception to HTTP Status Mapping

| Domain Exception / Outcome | HTTP Status       | Description            |
| -------------------------- | ----------------- | ---------------------- |
| `UNAUTHORIZED`             | 401 Unauthorized  | User not authenticated  |
| `VALIDATION_ERROR`         | 400 Bad Request   | Request body validation failed |
| `SLUG_EXISTS`              | 409 Conflict      | Conference slug already taken |
| `FREE_TIER_LIMIT`          | 403 Forbidden     | Exceeded free tier limits |
| `NOT_FOUND`                | 404 Not Found     | Conference not found |
| `INTERNAL_ERROR`           | 500 Internal Error| Unexpected server error |

### Status Code Rules

- **201 Created**: Successful create operation returns status 201
- **400 Bad Request**: Validation errors, invalid parameters
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: Resource explicitly requested but does not exist
- **409 Conflict**: Business rule violation that conflicts with existing state
- **403 Forbidden**: Permission or quota enforcement
- **500 Internal Server Error**: Unhandled exceptions, database errors

---

## 🛠️ Implementation Guidelines

### Dependency Injection

- **Pattern**: Controllers receive dependencies as function parameters
- **Configuration**: `commandHandler`, `queryHandler`, `getAuthUser` passed in as dependencies
- **Lifecycle**: Next.js handles dependency injection via route handlers

### Input Validation

- **Pattern**: Zod schemas at controller boundary
- **Boundary Validation**: All request bodies validated against schemas before processing
- **Validation Reusability**: Schemas can be imported and reused across controllers

---

## ⚠️ Error Handling Strategy

### Current Approach: Inline Try/Catch (ANTI-PATTERN)

**Description**: Individual controllers wrap business logic in try/catch blocks and construct error responses directly.

**Example:**

```typescript
try {
  const result = await commandHandler.execute(command);
  // handle result
} catch (error) {
  console.error('Conference creation error:', error);
  return NextResponse.json(
    {error: {code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'}},
    {status: 500},
  );
}
```

**Problems:**
- Duplicated error handling code across controllers
- Inconsistent error response structures
- Controllers exposed to unexpected exceptions
- No centralized logging or monitoring

### Recommended Approach: Centralized Error Handler

**Create a global middleware/exception filter that:**
1. Catches all exceptions from the request lifecycle
2. Maps domain exceptions to HTTP status codes
3. Logs errors centrally
4. Returns consistent error responses

**Benefits:**
- Single responsibility for each layer
- Consistent error handling across the API
- Easier to test and maintain
- Better observability through centralized logging

---

## 🧪 Testing Approach

### Unit Testing

- **Pattern**: Test application service handlers independently
- **Mock Strategy**: Mock domain repository and external dependencies
- **Coverage Target**: 80%+ for application layer logic

### Integration Testing (E2E / API Testing)

- **Pattern**: Test controller boundaries via HTTP endpoints
- **Test Environment**: Next.js test server with mocked handlers
- **Data Setup**: In-memory databases or test fixtures

### Controller Testing Rules

#### ✅ Good Test Structure

```typescript
// tests/backend/conference.controller.test.ts
describe('createConferenceController', () => {
  it('returns 201 on successful conference creation', async () => {
    // Arrange
    const mockHandler = mockResponse({success: true, data: conferenceData});
    const mockUser = {id: 'user-123'};
    const mockRequest = createMockRequest({body: validConferenceData});

    // Act
    const response = await createConferenceController(
      mockRequest,
      mockHandler,
      () => Promise.resolve(mockUser),
    );

    // Assert
    expect(response.status).toBe(201);
    expect(response.json()).toEqual({data: conferenceData});
  });

  it('returns 400 on validation error', async () => {
    // Arrange
    const mockHandler = mockResponse({success: true});
    const mockUser = {id: 'user-123'};
    const mockRequest = createMockRequest({body: invalidData});

    // Act
    const response = await createConferenceController(
      mockRequest,
      mockHandler,
      () => Promise.resolve(mockUser),
    );

    // Assert
    expect(response.status).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
  });
});
```

#### ❌ Bad Test Patterns

```typescript
// ❌ Bad: Testing implementation instead of behavior
it('calls commandHandler.execute', async () => {
  await createConferenceController(...);
  expect(commandHandler.execute).toHaveBeenCalled();
});

// ❌ Bad: Testing that individual try/catch succeeds
it('catches errors', async () => {
  await expect(createConferenceController(...)).rejects.toThrow();
});
```

---

## ⚡ Performance Considerations

### Request Validation Performance

- Zod schemas provide efficient runtime validation with good performance characteristics
- Schema compilation is cached, so validation is fast after initial compilation
- Consider adding caching for heavy validation logic if needed

### Database Query Optimization

- Controllers should rely on application layer for efficient query design
- Indicate pagination needs in application layer rather than implementing in controllers
- Use `SELECT` projections to avoid loading unnecessary data

### Response Compression

- Next.js automatically compresses responses via `NextResponse.json()`
- Consider enabling gzip/brotli for larger payloads

---

## 🔒 Security Guidelines

### Input Sanitization

- **Pattern**: All user input validated against strict Zod schemas before processing
- **Description**: Zod schemas ensure only expected data types and structures are accepted
- **Boundary Validation**: No data should reach application layer without validation

### Authentication & Authorization

- **Pattern**: `getAuthUser()` dependency provides authenticated user context
- **Description**: Authentication check occurs at controller entry point
- **Authorization**: Implicitly handled by `getAuthUser()` - only authenticated users can proceed

### CSRF Protection

- **Not Implemented**: Current Next.js controllers may rely on framework-level CSRF protection
- **Recommendation**: Verify Next.js built-in CSRF tokens are properly configured

### Best Practices

- **Never trust client-side validation**: Always validate on server
- **Use HTTPS**: All endpoints must use HTTPS in production
- **Sanitize error messages**: Never expose stack traces or internal details to clients
- **Rate limiting**: Implement rate limiting at the infrastructure layer

---

## 📝 Implementation Notes

### Pattern ID Management

Follow pattern ID conventions:
- `CTL-REQ-XX`: Request handling patterns
- `CTL-RSP-XX`: Response mapping patterns
- `CTL-VAL-XX`: Validation patterns
- `CTL-ERR-XX`: Error handling patterns
- `CTL-SEC-XX`: Security patterns

### Related Documentation

- Hotwire: `CONFERENCES`, `CFPS`, `VERSIONS`, `CALLS`, `DATE_TIME_HELPERS`, `CONSTANTS`
- Architecture: `docs/ADRS.md` for architectural decisions
- DDD: `packages/modules/conference/` for domain layers

---

## 🚫 Anti-Patterns to Avoid

### ❌ Inline Try/Catch in Controllers

**Problem:** Controllers are responsible for HTTP mechanics only. Including try/catch blocks in controllers creates tight coupling, makes error handling inconsistent, and violates DDD layer boundaries.

**Solution:** Implement a centralized error handler (global middleware/exception filter) that catches and translates all exceptions across the API layer.

### ❌ Manual Error Code to HTTP Status Mapping

**Problem:** Controllers should not be aware of domain exception codes or how to map them to HTTP status codes. This creates tight coupling between the HTTP layer and domain logic.

**Solution:** Create an error adapter layer that maps domain exceptions to HTTP status codes, or use a centralized exception handler.

### ❌ Domain Objects in Request/Response

**Problem:** Using domain entities directly as API request/response bodies exposes internal domain structure to clients and creates tight coupling.

**Solution:** Use dedicated DTOs (boundary objects) that are specifically designed for API communication.

### ❌ Business Logic in Controllers

**Problem:** Controllers should only translate, validate, and delegate. Any business logic in controllers violates the thin controller principle.

**Solution:** Move all business logic to application service handlers or domain model methods.

---

## Summary

**Key Implementation Principles** _(actionable guidelines for developers)_

1. **Thin Controller Principle**: Controllers only translate HTTP requests to commands/queries and map responses back to HTTP
2. **Validation Gate**: All request bodies must be validated with Zod schemas before reaching application layer
3. **Consistent Response Envelope**: Always wrap data in `{data: ...}` and errors in `{error: {code, message, details?}}`
4. **Authentication at Boundary**: Always check authentication at the start of protected endpoints
5. **No Inline Exception Handling**: Use centralized error handler; never put try/catch in controllers

**What to Avoid** _(common anti-patterns and restrictions)_

- Inline try/catch in controllers
- Manual HTTP status code mapping from domain errors
- Domain objects as API request/response bodies
- Business logic in controller handlers
- Skipping validation at the boundary
- Hardcoding error messages or status codes

---

## Pattern Index

### Request Handling Patterns

CTL-REQ-01: Boundary Validation Pattern - [a1b2c3d4e5f6] create-conference.controller.ts
CTL-REQ-02: CQRS Command Construction Pattern - [a1b2c3d4e5f6] create-conference.controller.ts
CTL-REQ-03: Route Parameter Extraction Pattern - [f6e5d4c3b2a1] get-conference.controller.ts

### Response Mapping Patterns

CTL-RSP-01: Success Response Wrapping Pattern - [a1b2c3d4e5f6] create-conference.controller.ts
CTL-RSP-02: Error Response Structure Pattern - [a1b2c3d4e5f6] create-conference.controller.ts
CTL-RSP-03: Null/Empty Handling Pattern - [f6e5d4c3b2a1] get-conference.controller.ts

### Input Validation Patterns

CTL-VAL-01: Zod Schema Validation Pattern - [a1b2c3d4e5f6] create-conference.controller.ts

### Error Handling Patterns

CTL-ERR-01: Inline Exception Handling (ANTI-PATTERN) - [a1b2c3d4e5f6] create-conference.controller.ts
CTL-ERR-02: Manual Error Code Mapping (ANTI-PATTERN) - [a1b2c3d4e5f6] create-conference.controller.ts

### Security Patterns

CTL-SEC-01: Authentication Check Pattern - [a1b2c3d4e5f6] create-conference.controller.ts, [f6e5d4c3b2a1] get-conference.controller.ts

### Coverage Summary

**Total UI Layer Controllers Analyzed**: 2
**Key Files Analyzed**:

- [a1b2c3d4e5f6] create-conference.controller.ts ✓
- [f6e5d4c3b2a1] get-conference.controller.ts ✓

---

## ❓ Open Questions

- [ ] Should we create a centralized error handler middleware?
- [ ] Are Zod schemas sufficient for all validation needs, or should we consider adding addtional cross-cutting validation?
- [ ] Should authentication be handled at a middleware level rather than in each controller?
- [ ] Is there a need for a separate exception translation layer instead of handling in controllers?
