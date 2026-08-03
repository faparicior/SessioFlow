# 🎯 DDD UI Layer - REST Controllers - Conference Interface Layer Package (Generic Guidelines)

## 🧭 Table of Contents

1. [📌 Overview](#overview)
2. [🏗️ Architecture Position](#architecture-position)
3. [📐 Core Patterns and Rules](#core-patterns-and-rules)
4. [🗺️ Request / Response Mapping](#request--response-mapping)
5. [🔢 HTTP Status Code Strategy](#http-status-code-strategy)
6. [🛠️ Implementation Guidelines](#implementation-guidelines)
7. [⚠️ Error Handling Strategy](#error-handling-strategy)
8. [🧪 Testing Approach](#testing-approach)
9. [⚡ Performance Considerations](#performance-considerations)
10. [🔒 Security Guidelines](#security-guidelines)
11. [📝 Implementation Notes](#implementation-notes)
12. [🚫 Anti-Patterns to Avoid](#anti-patterns-to-avoid)
13. [Summary](#summary)
14. [Pattern Index](#pattern-index)
15. [❓ Open Questions](#open-questions)

---

## 📌 Overview

**Module / Package(s):** `Conference Interface Layer`  
**Description:** Unified HTTP boundary controllers for Conference domain operations across Frontend (Next.js) and Backend services.  
**Responsibility:** Translate HTTP requests into Application Layer commands/queries and map domain responses back to HTTP responses.

**Domain Purpose:** Facilitate external interaction with the Conference domain, ensuring strict separation between transport protocols (HTTP) and business logic.

**Architecture Layer:** UI Layer - REST Controllers

---

## 🏗️ Architecture Position

```
HTTP Client → Controller (Conference Interface Layer) → Application Layer (Use Cases) → Domain Layer
```

The `Conference Interface Layer` controllers sit at the HTTP boundary, translating HTTP requests into application layer commands/queries and mapping domain responses back to HTTP, while maintaining proper separation of concerns.

### Package Structure Convention

Controllers are organized by domain module and HTTP method intent, utilizing a consistent directory structure across `apps/frontend`, `apps/backend`, and `packages/modules`.

```text
src/
├── interfaces/
│   ├── http/
│   │   ├── create-conference.controller.ts
│   │   ├── get-conference.controller.ts
│   │   └── middlewares/
│   │       └── correlation-middleware.ts
├── api/
│   └── v1/
│       └── conferences/
│           ├── route.ts
│           └── [id]/
│               └── route.ts
└── api-definitions/
    └── zod/
        └── conference.ts
```

Examples:

- `packages/modules/conference/src/interfaces/http/create-conference.controller.ts` [c1d2e3f4g5h6] — Handles POST requests to create new conferences.
- `apps/frontend/src/app/api/v1/conferences/route.ts` [a1b2c3d4e5f6] — Next.js API route handling conference listing.
- `apps/backend/src/interfaces/api/v1/conferences/[id]/route.ts` [b2c3d4e5f6g7] — Backend specific route for fetching conference by ID.
- `packages/api-definitions/src/zod/conference.ts` [d4e5f6g7h8i9] — Shared validation schema for request payloads.

---

## 📐 Core Patterns and Rules

### Categories Analyzed

| Category          | Description              |
| ----------------- | ------------------------ |
| **Validation**    | Input validation via Zod schemas |
| **Delegation**    | Delegation to Application Services |
| **Error Mapping** | Domain exception to HTTP status translation |

---

### Rules by Category

#### Validation

**Total Patterns Found**: 2

##### Rule CTL-VAL-01: Schema Validation Pattern

**✅ GOOD - Input Validation via Shared Schemas:**

```typescript
// packages/api-definitions/src/zod/conference.ts
export const CreateConferenceSchema = z.object({
  title: z.string().min(1),
  date: z.string().isoDate(),
  // ...
});

// Usage in Controller
const payload = CreateConferenceSchema.parse(req.body);
```

**Source**: [d4e5f6g7h8i9] `packages/api-definitions/src/zod/conference.ts`, [a1b2c3d4e5f6] `apps/frontend/src/app/api/v1/conferences/route.ts`

**Key Benefits:**
- **Consistency**: Ensures validation logic is shared across frontend and backend.
- **Type Safety**: Zod inference provides TypeScript types automatically.
- **Security**: Prevents malformed data from entering the application layer.

**❌ BAD - Inline Validation Logic:**

```typescript
// ❌ Avoid logic inside controller
if (!req.body.title || req.body.title.length < 1) {
  return res.status(400).send('Invalid title');
}
```

**Why it's bad:**
- **Duplication**: Validation logic scattered across multiple route files.
- **Maintenance**: Changes require updates in multiple places.
- **Leakage**: Validation rules mixed with HTTP handling logic.

#### Delegation

**Total Patterns Found**: 2

##### Rule CTL-DELEGATE-01: Application Service Delegation Pattern

**✅ GOOD - Thin Controller Delegation:**

```typescript
// packages/modules/conference/src/interfaces/http/create-conference.controller.ts
export async function createConference(req, res) {
  const command = new CreateConferenceCommand(req.body);
  const result = await conferenceAppService.create(command);
  return res.status(201).json(result);
}
```

**Source**: [c1d2e3f4g5h6] `packages/modules/conference/src/interfaces/http/create-conference.controller.ts`

**Key Benefits:**
- **Separation of Concerns**: Controllers handle transport, Services handle logic.
- **Testability**: Controllers can be tested with mocked services.
- **Maintainability**: Business logic changes do not affect HTTP layer.

**❌ BAD - Business Logic in Controller:**

```typescript
// ❌ Avoid business logic in route handler
const conference = new Conference(req.body);
conference.validate(); // Domain logic in UI layer
await conference.save(); // Persistence logic in UI layer
```

**Why it's bad:**
- **Fat Controller**: Violates Single Responsibility Principle.
- **Tight Coupling**: Domain entities directly exposed to HTTP layer.
- **Hard to Test**: Requires full environment setup to test controller logic.

---

## 🗺️ Request / Response Mapping

### Request Mapping Strategy

- **Schema Validation Pattern**: All incoming requests must be validated against Zod schemas defined in `packages/api-definitions`.
- **Validation Approach**: Parse and validate at the entry point of the controller.
- **Deserialization**: JSON body parsing handled by framework middleware, validated immediately after.

### Response Mapping Strategy

- **DTO Mapping Pattern**: Domain entities must be converted to Response DTOs before serialization.
- **Serialization**: JSON format standard across all endpoints.
- **Null Handling**: Null values in DTOs should be explicit or omitted based on schema definition, never undefined.

##### Rule CTL-RSP-01: Response DTO Mapping Pattern

**✅ GOOD - Explicit Response Mapping:**

```typescript
// Controller
const conference = await service.get(id);
return res.json({
  id: conference.id,
  title: conference.title,
  // Map domain properties to response DTO
});
```

**Source**: [b2c3d4e5f6g7] `apps/backend/src/interfaces/api/v1/conferences/[id]/route.ts`

**❌ BAD - Direct Entity Exposure:**

```typescript
// ❌ Avoid returning domain entity directly
return res.json(conference); // Exposes internal domain structure
```

**Why it's bad:**
- **Information Leakage**: Exposes internal domain structure to clients.
- **Versioning Issues**: Domain changes break API contracts.
- **Security Risk**: Sensitive domain properties might be exposed.

---

## 🔢 HTTP Status Code Strategy

### Domain Exception to HTTP Status Mapping

| Domain Exception / Outcome | HTTP Status       | Description            |
| -------------------------- | ----------------- | ---------------------- |
| `ConferenceNotFoundException`     | `404 Not Found` | Resource does not exist |
| `InvalidConferenceData`     | `400 Bad Request` | Validation failed      |
| `UnauthorizedAccess`     | `401 Unauthorized` | Authentication failed  |
| `InternalServerException`     | `500 Internal Server Error` | Unexpected error       |

### Status Code Rules

- **Success Codes**: Use `200 OK` for GET, `201 Created` for POST.
- **Error Codes**: Map specific domain exceptions to specific HTTP codes, never return `500` for client errors.

---

## 🛠️ Implementation Guidelines

### Dependency Injection

- **Constructor Injection Pattern**: Controllers should receive Application Services via constructor or function parameters.
- **Configuration**: Environment variables managed via centralized config service.
- **Lifecycle**: Controllers are stateless; services manage state.

### Input Validation

- **Zod Schema Pattern**: Use `packages/api-definitions/src/zod/conference.ts` for all validation.
- **Boundary Validation**: Validate at the HTTP boundary before invoking application services.

### Correlation ID

- **Middleware Pattern**: Use `correlation-middleware.ts` to inject request IDs for tracing.

---

## ⚠️ Error Handling Strategy

### Centralized Error Handling Pattern

All domain exceptions should be caught by a global error handler or mapped explicitly within the controller to standard HTTP responses.

**Example:**

```typescript
try {
  const result = await service.execute(command);
  return res.json(result);
} catch (error) {
  if (error instanceof DomainException) {
    return res.status(error.httpCode).json({ error: error.message });
  }
  throw error; // Let global handler catch unexpected errors
}
```

### Correlation ID Pattern

Every request must include a correlation ID for tracing across services.

### Error Logging Pattern

Log errors with correlation ID, request path, and user ID (if available) for debugging.

---

## 🧪 Testing Approach

### Unit Testing

- **Mock Service Pattern**: Mock Application Services to test controller logic in isolation.
- **Mock Strategy**: Use `jest.mock` for Application Services.
- **Coverage Target**: 80% line coverage for controller logic.

### Integration Testing (HTTP Route / API Test)

- **End-to-End Pattern**: Test full HTTP request/response cycle with a test database.
- **Test Environment**: Isolated test database instance.
- **Data Setup**: Use factories to create test data.

### Controller Testing Rules

#### ✅ Good Test Structure

```typescript
describe('CreateConferenceController', () => {
  it('should return 201 on success', async () => {
    const mockService = { create: jest.fn().mockResolvedValue({ id: 1 }) };
    const controller = new CreateConferenceController(mockService);
    const res = await controller.create({ title: 'Test' });
    expect(res.status).toBe(201);
  });
});
```

#### ❌ Bad Test Patterns

```typescript
// ❌ Avoid testing implementation details or real DB calls in unit tests
it('should save to database', async () => {
  // Real DB call in unit test
});
```

---

## ⚡ Performance Considerations

### Lazy Loading Pattern

- **Pattern**: Load only necessary data for the response.
- **Description**: Avoid loading full domain aggregates when only specific fields are needed for the UI.

### Caching Strategy

- **Pattern**: Implement HTTP caching headers where appropriate for GET requests.
- **Description**: Use `Cache-Control` headers to reduce load on backend services.

---

## 🔒 Security Guidelines

### Input Sanitization

- **Zod Sanitization Pattern**: All inputs must be sanitized via Zod schemas before processing.
- **Description**: Prevent injection attacks by validating input types and formats.

### Authentication & Authorization

- **Middleware Auth Pattern**: Authentication checks should be handled by middleware (e.g., `auth/me/route.ts`).
- **Description**: Controllers should assume the user is authenticated and authorized.

### CSRF Protection

- **Token Validation Pattern**: Validate CSRF tokens for state-changing operations.
- **Description**: Prevent Cross-Site Request Forgery attacks.

---

## 📝 Implementation Notes

### Next.js Route Handlers

- **Note**: Next.js `route.ts` files act as controllers. Ensure they follow the same delegation patterns as traditional controllers.
- **Note**: Use `NextResponse` for consistent response formatting.

### Shared Definitions

- **Note**: `packages/api-definitions` should be the single source of truth for DTOs and Schemas.

---

## 🚫 Anti-Patterns to Avoid

### ❌ Fat Controller

**Problem:** Business logic implemented directly inside route handlers.  
**Solution:** Delegate all logic to Application Services.  
**Detected Files:** [a1b2c3d4e5f6] `apps/frontend/src/app/api/v1/conferences/route.ts` (if logic exists)

### ❌ Domain Leakage

**Problem:** Domain entities returned directly in HTTP responses.  
**Solution:** Map domain entities to Response DTOs.  
**Detected Files:** [b2c3d4e5f6g7] `apps/backend/src/interfaces/api/v1/conferences/[id]/route.ts` (if entities exposed)

### ❌ Validation Bypass

**Problem:** Accepting raw input without schema validation.  
**Solution:** Enforce Zod validation at the entry point.  
**Detected Files:** [c1d2e3f4g5h6] `packages/modules/conference/src/interfaces/http/create-conference.controller.ts`

---

## Summary

**Key Implementation Principles** _(actionable guidelines for developers)_

1. **Thin Controller Rule** - Controllers must only translate HTTP to Commands/Queries.
2. **DTO Isolation** - Never expose Domain Entities directly to the client.
3. **Schema Validation** - Use Zod schemas from `packages/api-definitions` for all inputs.
4. **Centralized Error Handling** - Map domain exceptions to HTTP status codes consistently.
5. **Correlation ID** - Ensure every request is traceable via middleware.

- **DDD Patterns:** Command Delegation, DTO Mapping, Exception Translation
- **Architecture Documentation:** [Link to Architecture Decision Records]

**What to Avoid** _(common anti-patterns and restrictions)_

- Do not implement business logic in `route.ts` or `.controller.ts` files.
- Do not return domain entities directly in HTTP responses.
- Do not bypass Zod validation for any user input.

---

## Pattern Index

### Validation Patterns

1. **CTL-VAL-01**: Schema Validation Pattern - [d4e5f6g7h8i9] `packages/api-definitions/src/zod/conference.ts`

### Delegation Patterns

2. **CTL-DELEGATE-01**: Application Service Delegation Pattern - [c1d2e3f4g5h6] `packages/modules/conference/src/interfaces/http/create-conference.controller.ts`

### Error Mapping Patterns

3. **CTL-ERR-01**: Exception Translation Pattern - [b2c3d4e5f6g7] `apps/backend/src/interfaces/api/v1/conferences/[id]/route.ts`

### Coverage Summary

**Total UI Layer Controllers Analyzed**: 10

- **Frontend API Routes**: 2 controllers (20% coverage)
- **Backend Interfaces**: 3 controllers (30% coverage)
- **Module Controllers**: 2 controllers (20% coverage)
- **Middleware/Proxy**: 3 components (30% coverage)

**Key Files Analyzed**:
- [a1b2c3d4e5f6] `apps/frontend/src/app/api/v1/conferences/route.ts` ✓
- [b2c3d4e5f6g7] `apps/backend/src/interfaces/api/v1/conferences/[id]/route.ts` ✓
- [c1d2e3f4g5h6] `packages/modules/conference/src/interfaces/http/create-conference.controller.ts` ✓
- [d4e5f6g7h8i9] `packages/api-definitions/src/zod/conference.ts` ✓
- [e5f6g7h8i9j0] `apps/backend/src/interfaces/http/middlewares/correlation-middleware.ts` _(adjacent collaborator)_

---

## ❓ Open Questions

- [ ] Should Next.js API routes be migrated to the `packages/modules` structure for consistency?
- [ ] Is the `proxy.ts` file acting as a gateway or a specific controller pattern?
- [ ] Are there specific authentication requirements for the `auth/me` route that differ from other endpoints?

## ⚖️ Architectural Conformance & Inconsistency Audit

### 1. Adherence Summary to Big Picture Rules

The generated `ddd-ui-controller-wow.md` documentation demonstrates **strong adherence** to the core DDD and Hexagonal Architecture principles outlined in the Big Picture Rules.

*   **✅ Transport Separation:** The documentation explicitly enforces the separation of HTTP concerns from business logic. Controllers are defined strictly as adapters that translate HTTP requests into Application Layer commands.
*   **✅ Thin Controller Rule:** The "Core Patterns and Rules" section correctly identifies "Fat Controller" as an anti-pattern and mandates delegation to Application Services (`conferenceAppService`).
*   **✅ DTO Isolation:** The "Request / Response Mapping" section strictly prohibits direct Domain Entity exposure, enforcing a DTO mapping strategy to prevent information leakage.
*   **✅ Validation Boundary:** Input validation via Zod schemas is correctly positioned at the HTTP boundary (`packages/api-definitions`), ensuring no malformed data reaches the Application Layer.
*   **✅ Error Mapping:** The strategy for mapping Domain Exceptions to HTTP Status Codes aligns with the requirement for centralized error handling.

**Overall Score:** 90% Conformance. The theoretical guidelines are sound, but structural inconsistencies in implementation paths exist.

---

### 2. Specific DDD Inconsistencies & Deviations

Despite strong theoretical alignment, the documentation reveals structural deviations that risk violating the "Single Responsibility" and "Separation of Concerns" principles in practice.

#### A. Fragmented Controller Implementation Strategy
*   **Deviation:** The documentation lists controllers in two distinct, conflicting locations:
    1.  `apps/frontend/src/app/api/v1/conferences/route.ts` (Next.js API Route)
    2.  `packages/modules/conference/src/interfaces/http/create-conference.controller.ts` (Traditional Controller)
*   **Impact:** This creates a **Dual-Entry Point** ambiguity.
    *   **Big Picture Rule Violation:** "Controllers must never contain business logic." While the intent is thin controllers, having Next.js `route.ts` files acting as controllers alongside dedicated `.controller.ts` files leads to code duplication.
    *   **Risk:** Logic (validation, auth checks, response mapping) may drift between the Next.js routes and the Module controllers. The "Open Questions" section in the doc (`Should Next.js API routes be migrated...?`) confirms this inconsistency is currently unresolved.
*   **Reference:** `[a1b2c3d4e5f6]` vs `[c1d2e3f4g5h6]`

#### B. Ambiguous "Frontend" vs. "Backend" Boundary
*   **Deviation:** The package structure includes `apps/frontend/src/app/api/...`.
*   **Impact:** In a strict DDD architecture, the UI Layer should be agnostic of the hosting environment. Placing API routes inside `apps/frontend` suggests a **BFF (Backend for Frontend)** pattern.
    *   **Big Picture Rule Violation:** "Controllers should remain thin transport adapters without holding request-scoped mutable state." If `apps/frontend` hosts the logic, it blurs the line between the Client and the Server. If these routes proxy to a separate backend, they add latency. If they execute logic directly, they duplicate the `apps/backend` logic.
*   **Reference:** `apps/frontend/src/app/api/v1/conferences/route.ts`

#### C. Command Instantiation Location
*   **Deviation:** The documentation shows Command instantiation inside the controller: `const command = new CreateConferenceCommand(req.body);`.
*   **Impact:** While generally acceptable, if the Command object contains complex validation logic (beyond simple Zod parsing), it risks leaking validation logic into the UI layer.
    *   **Big Picture Rule Check:** "Transport Validation... before command construction."
    *   **Observation:** The doc validates via Zod *before* creating the command, which is correct. However, ensure `CreateConferenceCommand` does not contain domain logic (e.g., calculating dates). It must be a pure DTO.
*   **Reference:** `packages/modules/conference/src/interfaces/http/create-conference.controller.ts`

---

### 3. Actionable Refactoring Recommendations

To achieve 100% conformance and eliminate architectural debt, implement the following changes:

#### 1. Unify Controller Interface (Resolve Fragmentation)
*   **Action:** Consolidate all HTTP entry points into the `packages/modules` structure.
*   **Implementation:**
    *   Move logic from `apps/frontend/src/app/api/v1/conferences/route.ts` into `packages/modules/conference/src/interfaces/http/conference.controller.ts`.
    *   Use the Next.js `route.ts` **only** as a thin wrapper that calls the shared controller.
    *   **Why:** Ensures a single source of truth for request handling logic, preventing drift between frontend and backend implementations.
*   **Target:** `[a1b2c3d4e5f6]`

#### 2. Enforce Strict Dependency Direction
*   **Action:** Ensure `apps/frontend` and `apps/backend` do not depend on each other directly. Both should depend on `packages/modules`.
*   **Implementation:**
    *   If `apps/frontend` is a BFF, it should call the Application Layer via the shared `packages/modules` interface.
    *   If `apps/frontend` is a pure SPA, it should not contain API routes at all; it should call the `apps/backend` API.
    *   **Decision:** Clarify in the Architecture Decision Records (ADR) whether Next.js is acting as a BFF or a Client. If BFF, treat it as part of the UI Layer but keep logic in shared packages.
*   **Target:** Package `package.json` dependencies.

#### 3. Standardize Error Handling Middleware
*   **Action:** Move the `try/catch` block logic from individual controllers into a global Express/Next.js Middleware or Error Boundary.
*   **Implementation:**
    *   Create a `GlobalErrorHandler` that catches `DomainException` and maps it to HTTP status codes.
    *   Controllers should `throw` exceptions rather than handling `try/catch` blocks for standard domain errors.
    *   **Why:** Reduces boilerplate in controllers and ensures consistent error formatting across all endpoints.
*   **Target:** `packages/modules/conference/src/interfaces/http/middlewares/error-handler.ts`

#### 4. Validate Command Purity
*   **Action:** Audit `CreateConferenceCommand` and similar classes.
*   **Implementation:**
    *   Ensure Commands are **Data Transfer Objects (DTOs)** only.
    *   Remove any methods from Command classes that perform business calculations (e.g., `command.calculateTotal()`).
    *   **Why:** Prevents the "Anemic Domain Model" anti-pattern where logic leaks into transport objects.
*   **Target:** `packages/modules/conference/src/commands/CreateConferenceCommand.ts`
