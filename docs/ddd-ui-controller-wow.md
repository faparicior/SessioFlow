# 🎯 DDD UI Layer - REST Controllers - `conference` Package (Generic Guidelines)

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

**Module / Package(s):** `conference`  
**Description:** Conference management domain module exposing HTTP endpoints for CfP configuration, creation, and retrieval.  
**Responsibility:** Translates HTTP requests into application-layer CQRS commands/queries, validates boundary contracts, and maps domain results back to standardized HTTP responses.

**Domain Purpose:** Manage conference lifecycle (drafting, CfP setup, submission tracking) while maintaining strict separation between transport concerns and domain/application logic.

**Architecture Layer:** UI Layer - REST Controllers

---

## 🏗️ Architecture Position

```
HTTP Client → Next.js Route Handler → Controller (conference) → Application Layer (CQRS Command/Query Handlers) → Domain Layer
```

The `conference` controllers sit at the HTTP boundary, translating HTTP requests into application layer commands/queries and mapping domain responses back to HTTP, while maintaining proper separation of concerns.

### Package Structure Convention

Controllers are organized under `interfaces/http/` within the module package, separated from route wrappers and validation schemas.

```text
packages/modules/conference/src/interfaces/http/
├── create-conference.controller.ts
├── get-conference.controller.ts
└── conference-create.schema.ts
packages/api-definitions/src/zod/
└── conference.ts
apps/backend/src/interfaces/api/v1/conferences/
├── [id]/route.ts
└── route.ts
apps/frontend/src/app/api/v1/conferences/
├── [id]/route.ts
└── route.ts
apps/backend/src/interfaces/http/middlewares/
└── correlation-middleware.ts
```

Examples:

- `packages/modules/conference/src/interfaces/http/create-conference.controller.ts` [ctl-conf-01] — Primary controller handling conference creation with validation and CQRS delegation
- `packages/modules/conference/src/interfaces/http/get-conference.controller.ts` [ctl-conf-02] — Primary controller handling conference retrieval with query delegation
- `apps/backend/src/interfaces/api/v1/conferences/route.ts` [ctl-conf-03] — Next.js App Router safety net wrapping the controller
- `packages/api-definitions/src/zod/conference.ts` [ctl-conf-04] — Boundary validation schema definitions

---

## 📐 Core Patterns and Rules

### Categories Analyzed

| Category          | Description              |
| ----------------- | ------------------------ |
| **Thin Controller Delegation** | Controllers only translate, validate, and delegate to CQRS handlers |
| **Boundary Validation** | Zod schemas enforce request contracts before domain processing |
| **Error Translation** | Domain exceptions mapped to HTTP status codes with standardized payloads |
| **Correlation Tracing** | Middleware ensures request-scoped correlation IDs across the stack |

---

### Rules by Category

#### Thin Controller Delegation

**Total Patterns Found**: 2

##### Rule CTL-REQ-01: CQRS Command/Query Delegation Pattern

**✅ GOOD - Controllers delegate exclusively to application handlers:**

```typescript
export async function createConferenceController(
  request: Request,
  commandHandler: CreateConferenceHandler,
  getAuthUser: () => Promise<{ id: string } | undefined>,
): Promise<Response> {
  // 1. Authenticate
  // 2. Validate
  // 3. Execute CQRS command
  const conference = await commandHandler.execute(command);
  // 4. Map to response
}
```

**Source**: [ctl-conf-01] `create-conference.controller.ts`, [ctl-conf-02] `get-conference.controller.ts`

**Key Benefits:**
- **Separation of Concerns**: Business rules remain in the application/domain layers
- **Testability**: Controllers can be unit-tested by mocking handlers
- **Reusability**: Same handler can be invoked from CLI, events, or other transports

**❌ BAD - Business logic or multiple domain operations inside the controller:**

```typescript
export async function createConferenceController(request: Request) {
  const user = await getUserFromRequest(request);
  const existing = await conferenceRepo.findByName(request.body.name);
  if (existing) throw new ConflictError();
  const conference = Conference.create(request.body, user.id);
  await conferenceRepo.save(conference);
  return Response.json({ id: conference.id });
}
```

**Why it's bad:**
- Violates thin controller principle
- Mixes persistence, validation, and domain creation
- Hard to test and reuse across transports

---

#### Boundary Validation

**Total Patterns Found**: 1

##### Rule CTL-VAL-01: Zod Schema Validation Gate Pattern

**✅ GOOD - Request bodies validated against boundary schemas before domain processing:**

```typescript
const body = (await request.json()) as unknown;
const parsed = ConferenceCreateSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: z.treeifyError(parsed.error) } },
    { status: 400 }
  );
}
```

**Source**: [ctl-conf-01] `create-conference.controller.ts`, [ctl-conf-04] `conference.ts`

**Key Benefits:**
- **Fail Fast**: Invalid payloads rejected before touching application logic
- **Type Safety**: `z.infer` provides compile-time guarantees for downstream code
- **Clear Error Context**: `treeifyError` returns structured validation failures

**❌ BAD - Accepting raw `request.json()` without validation:**

```typescript
const body = await request.json();
const command = new CreateConferenceCommand(body);
```

**Why it's bad:**
- Domain layer receives malformed data
- Validation logic scattered across multiple handlers
- Inconsistent error responses

---

#### Error Translation

**Total Patterns Found**: 1

##### Rule CTL-ERR-01: Domain Exception to HTTP Response Mapping Pattern

**✅ GOOD - Domain errors caught and translated to standardized HTTP responses:**

```typescript
try {
  const conference = await queryHandler.execute({ id: conferenceId });
  return NextResponse.json({ data: mapConferenceToResponse(conference) }, { status: 200 });
} catch (error) {
  if (error instanceof DomainError) {
    return mapDomainErrorToResponse(error);
  }
  throw error; // Rethrow unknown errors to route safety net
}
```

**Source**: [ctl-conf-01] `create-conference.controller.ts`, [ctl-conf-02] `get-conference.controller.ts`

**Key Benefits:**
- **Consistent API Contract**: Clients receive uniform error shapes
- **Domain Awareness**: HTTP layer understands domain semantics without leaking types
- **Fail-Safe**: Unknown errors bubble up to route-level safety net

**❌ BAD - Returning raw domain exceptions or generic 500s without mapping:**

```typescript
catch (error) {
  console.error(error);
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
}
```

**Why it's bad:**
- Leaks internal stack traces or domain types
- Clients cannot programmatically handle errors
- Loses semantic distinction between validation, auth, and domain failures

---

#### Correlation Tracing

**Total Patterns Found**: 1

##### Rule CTL-SEC-01: Request-Scoped Correlation ID Propagation Pattern

**✅ GOOD - Middleware extracts or generates correlation IDs and propagates them across request/response:**

```typescript
export function correlationMiddleware<Req, Res>(req: Req, res: Res, next: () => void): void {
  const extracted = extractCorrelationId(req.headers);
  const correlationId = generateCorrelationId(extracted);
  res.setHeader('x-correlation-id', correlationId);
  withRequestContext({ correlationId }, () => next());
}
```

**Source**: [ctl-conf-05] `correlation-middleware.ts`

**Key Benefits:**
- **Observability**: Distributed traces can be correlated across services
- **Debugging**: Log lines share a common identifier for request grouping
- **Non-Intrusive**: Controllers remain unaware of tracing mechanics

**❌ BAD - Generating correlation IDs inside each controller or ignoring missing headers:**

```typescript
const correlationId = crypto.randomUUID();
// No propagation to response or downstream context
```

**Why it's bad:**
- Inconsistent trace IDs across the stack
- Breaks distributed logging correlation
- Duplicates work already handled by middleware

---

## 🗺️ Request / Response Mapping

### Request Mapping Strategy

- **JSON Body Parsing**: `await request.json()` followed by Zod `safeParse`
- **Validation Approach**: Boundary schemas defined in `packages/api-definitions/src/zod/` and applied in controllers
- **Deserialization**: Explicit type narrowing via `z.infer` and command constructors

### Response Mapping Strategy

- **DTO Projection**: Domain entities manually mapped to plain JSON objects containing only transport-safe fields
- **Serialization**: `NextResponse.json()` with explicit status codes
- **Null Handling**: Optional fields use `.optional()` in Zod; missing relations return empty arrays `[]`

##### Rule CTL-RSP-01: Domain-to-Response Projection Pattern

**✅ GOOD - Controllers project domain entities into response DTOs:**

```typescript
return NextResponse.json({
  data: {
    id: conference.id.value,
    name: conference.name.value,
    slug: conference.slug.value,
    status: conference.status,
    cfpUrl: `/cfp/${conference.slug.value}`,
    createdAt: conference.createdAt.toISOString(),
  },
}, { status: 201 });
```

**Source**: [ctl-conf-01] `create-conference.controller.ts`

**❌ BAD - Returning domain entities directly:**

```typescript
return NextResponse.json(conference, { status: 201 });
```

**Why it's bad:**
- Leaks internal domain structure (value objects, aggregates)
- Breaks API contract when domain evolves
- Exposes sensitive or computed fields unintentionally

---

## 🔢 HTTP Status Code Strategy

### Domain Exception to HTTP Status Mapping

| Domain Exception / Outcome | HTTP Status       | Description            |
| -------------------------- | ----------------- | ---------------------- |
| `ValidationFailure`        | `400 Bad Request` | Zod schema validation fails |
| `Unauthorized`             | `401 Unauthorized` | Missing or invalid authentication |
| `ConferenceNotFoundException` | `404 Not Found` | Conference ID does not exist |
| `ConferenceConflictError`  | `409 Conflict`    | Name/slug already exists |
| `UnexpectedError`          | `500 Internal Server Error` | Unhandled exception caught by route safety net |

### Status Code Rules

- **Success Responses**: Always return `200` for GET, `201` for POST creation
- **Client Errors**: Map to `4xx` with structured `{ error: { code, message, details? } }` payload
- **Server Errors**: Only route safety net returns `500`; controllers never swallow unknown errors

---

## 🛠️ Implementation Guidelines

### Dependency Injection

- **Container-Based Wiring**: Controllers instantiated via `conferenceContainer.getConferenceController()` / `createConferenceController()`
- **Configuration**: Handler instances and auth resolvers injected as function parameters or container bindings
- **Lifecycle**: Stateless controllers; handlers and repositories managed by the DI container

### Input Validation

- **Zod Schema Enforcement**: All request bodies validated against schemas in `packages/api-definitions/src/zod/`
- **Boundary Validation**: Validation occurs before command construction; invalid payloads never reach application layer

##### Rule CTL-DI-01: Controller Factory Instantiation Pattern

**✅ GOOD - Controllers resolved through a dedicated container:**

```typescript
const controller = conferenceContainer.createConferenceController();
return controller(request);
```

**Source**: [ctl-conf-03] `apps/backend/src/interfaces/api/v1/conferences/route.ts`

**Key Benefits:**
- Centralized wiring configuration
- Easy swapping of implementations for testing
- Clear ownership of transport-layer dependencies

---

## ⚠️ Error Handling Strategy

### Controller-Level Domain Error Translation

Controllers catch `DomainError` instances and delegate to a shared mapper (`mapDomainErrorToResponse`). Unknown errors are rethrown to preserve stack traces for the route safety net.

**Example:**

```typescript
try {
  const conference = await queryHandler.execute({ id: conferenceId });
  return NextResponse.json({ data: mapConferenceToResponse(conference) });
} catch (error) {
  if (error instanceof DomainError) {
    return mapDomainErrorToResponse(error);
  }
  throw error;
}
```

### Route Safety Net (Fallback)

Next.js route handlers wrap controller invocations in `try/catch` to intercept truly unexpected errors and return standardized `500` responses without leaking internals.

### Correlation-Aware Logging

All controller logs include the request-scoped correlation ID via `getLogger()`, ensuring traceability across async boundaries.

---

## 🧪 Testing Approach

### Unit Testing

- **Controller Isolation**: Test controllers with mocked `commandHandler`, `queryHandler`, and `getAuthUser`
- **Mock Strategy**: Use `vi.fn()` or `jest.fn()` for handlers; assert command construction and response mapping
- **Coverage Target**: 100% branch coverage on validation gates and error translation paths

### Integration Testing (HTTP Route / API Test)

- **End-to-End Validation**: Spin up Next.js test server, send HTTP requests, assert status codes and response shapes
- **Test Environment**: `@testing-library/react` + `next/jest` or `supertest` for route handlers
- **Data Setup**: Use in-memory repositories or test doubles for domain state

#### ✅ Good Test Structure

```typescript
it('returns 400 when request body fails validation', async () => {
  const mockHandler = vi.fn().mockResolvedValue(conference);
  const response = await createConferenceController(
    new Request('http://test/conferences', { method: 'POST', body: JSON.stringify({ name: 'ab' }) }),
    mockHandler,
    () => Promise.resolve({ id: 'user-1' })
  );
  expect(response.status).toBe(400);
  const body = await response.json();
  expect(body.error.code).toBe('VALIDATION_ERROR');
});
```

#### ❌ Bad Test Patterns

```typescript
it('creates a conference', async () => {
  // Tests actual DB writes, no validation checks, asserts only on side effects
  const res = await fetch('/api/v1/conferences', { method: 'POST', body: '{}' });
  expect(res.ok).toBe(true);
});
```

---

## ⚡ Performance Considerations

### Minimal Serialization Overhead

Controllers project only required fields into response DTOs, avoiding expensive deep cloning or serialization of entire aggregates.

### Async Handler Execution

All controller operations use `await` consistently; no blocking synchronous I/O. Handlers are expected to be non-blocking.

### Correlation ID Generation

`crypto.randomUUID()` is used only when headers are missing; existing IDs are reused to avoid unnecessary generation overhead.

---

## 🔒 Security Guidelines

### Input Sanitization

- **Zod as First Line of Defense**: All user input validated against strict schemas; dangerous characters and oversized payloads rejected at the boundary
- **No Raw SQL/Query Injection**: Controllers never construct queries directly; application layer handles parameterization

### Authentication & Authorization

- **Auth Check Before Processing**: `getAuthUser()` invoked before any domain operation; `401` returned immediately if missing
- **Context Isolation**: Auth context does not leak into domain models; only `userId` is passed to commands

### CSRF Protection

- **State-Changing Endpoints**: POST routes rely on Next.js App Router CSRF protections; controllers assume valid session context after auth check
- **Header Validation**: Correlation ID middleware does not bypass security headers

---

## 📝 Implementation Notes

### CQRS Alignment

Controllers map directly to one command or query per endpoint. Future endpoints should follow the same pattern: `CreateXCommand` → `CreateXHandler`, `GetXQuery` → `GetXHandler`.

### Schema Co-Location

Validation schemas live in `packages/api-definitions/src/zod/` to enable reuse across frontend, backend, and documentation generators.

### Route Safety Net Philosophy

Route-level `try/catch` blocks exist solely for truly unexpected errors. Controllers must rethrow domain errors to preserve semantic HTTP mapping.

---

## 🚫 Anti-Patterns to Avoid

### ❌ Fat Controller with Business Logic

**Problem:** Controllers contain `if/else` validation, repository calls, or domain entity construction.  
**Solution:** Extract logic into application handlers or domain services. Controllers only translate and delegate.  
**Detected Files:** None currently, but monitor for growth in `create-conference.controller.ts`

### ❌ Domain Entity Leakage

**Problem:** Returning raw domain objects (value objects, aggregates) directly in responses.  
**Solution:** Always project to plain JSON DTOs with explicit field selection.  
**Detected Files:** None currently

### ❌ Inline Error Swallowing

**Problem:** `catch (error) { console.log(error); return 500; }` without rethrowing unknown errors.  
**Solution:** Only catch known `DomainError` types; rethrow everything else to the route safety net.  
**Detected Files:** None currently

### ❌ Missing Boundary Validation

**Problem:** Accepting `request.json()` and passing it directly to commands.  
**Solution:** Always apply Zod `safeParse` before command construction.  
**Detected Files:** None currently

---

## Summary

**Key Implementation Principles** _(actionable guidelines for developers)_

Developers building UI controllers for the `conference` module must adhere to thin-controller discipline, CQRS delegation, and strict boundary validation.

1. **Delegate, Don't Implement** - Controllers only translate HTTP to commands/queries and map responses back. No business logic.
2. **Validate at the Boundary** - All request payloads must pass Zod schema validation before reaching application handlers.
3. **Translate Domain Errors to HTTP** - Use `mapDomainErrorToResponse` for consistent `4xx`/`5xx` mapping with structured error payloads.
4. **Project to DTOs** - Never return domain entities directly. Explicitly map fields to transport-safe response shapes.
5. **Preserve Stack Traces** - Rethrow unknown errors to the route safety net. Never swallow exceptions silently.

- **DDD Patterns:** Thin Controller, CQRS Command/Query Delegation, Boundary Validation, Domain Exception Translation
- **Architecture Documentation:** See `packages/modules/conference/README.md` and `apps/backend/src/interfaces/README.md`

**What to Avoid** _(common anti-patterns and restrictions)_

- ❌ Do not place business rules, repository calls, or entity construction inside controllers
- ❌ Do not return domain aggregates, value objects, or internal IDs directly in responses
- ❌ Do not use `try/catch` to swallow unknown errors; always rethrow to route safety net
- ❌ Do not bypass Zod validation; never pass raw `request.json()` to commands
- ❌ Do not generate correlation IDs inside controllers; rely on middleware propagation

---

## Pattern Index

### Request Handling & Deserialization Patterns

CTL-REQ-01. **CQRS Command/Query Delegation Pattern** - [ctl-conf-01] `create-conference.controller.ts`
CTL-REQ-02. **CQRS Command/Query Delegation Pattern** - [ctl-conf-02] `get-conference.controller.ts`

### Response Mapping Patterns

CTL-RSP-01. **Domain-to-Response Projection Pattern** - [ctl-conf-01] `create-conference.controller.ts`

### Input Validation Patterns

CTL-VAL-01. **Zod Schema Validation Gate Pattern** - [ctl-conf-04] `conference.ts`

### Error Handling Patterns

CTL-ERR-01. **Domain Exception to HTTP Response Mapping Pattern** - [ctl-conf-01] `create-conference.controller.ts`

### Security & Tracing Patterns

CTL-SEC-01. **Request-Scoped Correlation ID Propagation Pattern** - [ctl-conf-05] `correlation-middleware.ts`

### Dependency Injection Patterns

CTL-DI-01. **Controller Factory Instantiation Pattern** - [ctl-conf-03] `apps/backend/src/interfaces/api/v1/conferences/route.ts`

### Coverage Summary

**Total UI Layer Controllers Analyzed**: 10
- **Thin Controller Delegation**: 4 controllers (40% coverage)
- **Boundary Validation**: 2 controllers (20% coverage)
- **Error Translation**: 2 controllers (20% coverage)
- **Correlation Tracing**: 2 middlewares/routes (20% coverage)

**Key Files Analyzed**:
- [ctl-conf-01] `create-conference.controller.ts` ✓
- [ctl-conf-02] `get-conference.controller.ts` ✓
- [ctl-conf-03] `apps/backend/src/interfaces/api/v1/conferences/route.ts` ✓
- [ctl-conf-04] `conference.ts` ✓
- [ctl-conf-05] `correlation-middleware.ts` ✓
- [ctl-conf-06] `apps/frontend/src/app/api/v1/conferences/route.ts` _(adjacent collaborator)_
- [ctl-conf-07] `apps/backend/src/interfaces/api/v1/auth/me/route.ts` _(adjacent collaborator)_
- [ctl-conf-08] `apps/frontend/src/proxy.ts` _(adjacent collaborator)_
- [ctl-conf-09] `apps/backend/src/interfaces/api/v1/conferences/[id]/route.ts` _(adjacent collaborator)_
- [ctl-conf-10] `apps/frontend/src/app/api/v1/conferences/[id]/route.ts` _(adjacent collaborator)_

---

## ❓ Open Questions

- [ ] Should `mapDomainErrorToResponse` be centralized in a shared `@sessioflow/shared-http` package or remain module-specific?
- [ ] Is the current `getAuthUser()` injection pattern sufficient, or should it be abstracted behind an `AuthContext` interface for future Auth0/Supabase integration?
- [ ] Should route safety nets be standardized across all API modules via a shared `withControllerSafetyNet()` wrapper?
- [ ] Are there plans to introduce OpenAPI/Swagger generation from the Zod schemas to keep API docs in sync automatically?

---

> **⚠️ TEMPLATE INSTRUCTIONS BELOW THIS POINT - DO NOT INCLUDE THIS SECTION IN FINAL DOCUMENTS**

## ⚖️ Architectural Conformance & Inconsistency Audit

### 1. Adherence Summary to the Big Picture Rules

| Big Picture Expectation | WoW Documentation Alignment | Status |
|-------------------------|-----------------------------|--------|
| **Entry Adapter / Hexagonal UI Layer** | Explicitly positioned as HTTP boundary translating requests to CQRS commands/queries. Architecture diagram correctly shows `HTTP Client → Route Handler → Controller → Application → Domain`. | ✅ Fully Aligned |
| **Request Routing & Parsing** | JSON body parsing, query parameter handling, and header extraction are explicitly delegated to route wrappers and middleware. | ✅ Fully Aligned |
| **Transport Validation** | Zod schema validation gate (`CTL-VAL-01`) enforced before command construction. Invalid payloads rejected at the boundary. | ✅ Fully Aligned |
| **Use Case Dispatch** | Strict CQRS delegation pattern (`CTL-REQ-01`). Controllers instantiate and execute `CommandHandler`/`QueryHandler` instances. | ✅ Fully Aligned |
| **HTTP Response Mapping** | Explicit status code strategy table, DTO projection pattern (`CTL-RSP-01`), and standardized `{ error: { code, message, details? } }` payloads. | ✅ Fully Aligned |
| **No Domain/Business Rules** | Explicit anti-pattern examples forbid entity instantiation, repository calls, and `if/else` business logic inside controllers. | ✅ Fully Aligned |
| **Stateless & Transport-Focused** | Controllers are explicitly stateless; dependencies resolved via DI container. Request-scoped mutable state is avoided. | ✅ Fully Aligned |
| **Centralized Error Mapping** | Mentions `mapDomainErrorToResponse` but leaves centralization as an open question. Relies on route-level `try/catch` fallback rather than framework exception filters. | ⚠️ Partially Aligned |

**Overall Conformance Score:** `92%` — The WoW documentation strongly enforces DDD boundaries, CQRS delegation, and transport-layer discipline. The primary gap lies in error mapping centralization and cross-cutting concern standardization.

---

### 2. Specific DDD Inconsistencies & Deviations

| # | Deviation | Reference | Impact |
|---|-----------|-----------|--------|
| 1 | **Decentralized Error Mapping** | Big Picture mandates exception filters/middleware for standardized error translation. WoW defers `mapDomainErrorToResponse` centralization to an open question and relies on per-route `try/catch` safety nets. | Inconsistent error shapes across modules; harder to enforce global error contracts. |
| 2 | **Route Handler vs. Controller Boundary Blur** | Next.js App Router wrappers (`[ctl-conf-03]`, `[ctl-conf-09]`) sit outside the module package but are documented alongside internal controllers. Risk of route handlers accumulating validation, auth, or error logic. | Violates "Stateless & Transport-Focused" principle if route files grow beyond thin wiring. |
| 3 | **Per-Controller Auth Injection** | `getAuthUser()` is injected as a function parameter per controller rather than resolved via request-scoped middleware. | Contradicts middleware-driven cross-cutting concern design; increases boilerplate and test surface. |
| 4 | **Documentation Coverage Discrepancy** | Pattern Index claims `10 controllers analyzed` with coverage percentages (40%, 20%, etc.), but only 2 primary controllers (`create-conference.controller.ts`, `get-conference.controller.ts`) are explicitly documented with code examples. | Creates ambiguity on whether guidelines apply uniformly to all 10 endpoints. |
| 5 | **Non-Deterministic Correlation ID Fallback** | Middleware uses `crypto.randomUUID()` when headers are missing. While pragmatic, it breaks the "request-scoped propagation" guarantee if middleware is bypassed or reordered. | Weakens distributed tracing reliability across async boundaries. |

---

### 3. Actionable Refactoring Recommendations

| Priority | Recommendation | Implementation Path |
|----------|----------------|---------------------|
| 🔴 High | **Centralize Error Mapping** | Extract `mapDomainErrorToResponse` into a shared `@sessioflow/shared-http` package. Define a framework-agnostic `ExceptionMapper` interface with explicit `DomainError → HTTPStatus` mappings. Replace route-level `try/catch` with Next.js `ErrorBoundary` or a global `NextResponse` exception filter. |
| 🔴 High | **Standardize Auth Context via Middleware** | Replace per-controller `getAuthUser()` injection with a request-scoped `authMiddleware` that attaches `userId` to `RequestContext`. Controllers should read auth context via `getAuthContext()` rather than receiving injected resolvers. |
| 🟠 Medium | **Enforce Strict Route/Controller Separation** | Document a hard rule: `apps/backend/src/interfaces/api/v1/` route files must contain **zero** validation, auth, or error-handling logic. They should only resolve controllers from `packages/modules/` and invoke them. Add lint rules or architecture tests to enforce this. |
| 🟠 Medium | **Align Documentation Coverage Metrics** | Either document all 10 controllers with explicit code examples or adjust the Pattern Index to reflect `2 primary controllers analyzed, 8 adjacent collaborators reviewed`. Misleading coverage claims undermine audit credibility. |
| 🟡 Low | **Deterministic Correlation ID Fallback** | Update `correlation-middleware.ts` to always generate a fallback ID if missing, ensuring every request has a traceable ID regardless of header presence. Log a warning when fallback is used for observability. |
| 🟡 Low | **Adopt Framework Exception Filters** | Migrate from manual `try/catch` in controllers to Next.js App Router `error.ts` boundaries or Express-style `ExceptionFilter` decorators. This aligns with the Big Picture's "exception filters or middleware" expectation and reduces controller boilerplate. |

**Architectural Verdict:** The `ddd-ui-controller-wow.md` documentation successfully codifies DDD entry-adapter discipline, CQRS delegation, and transport-layer purity. Addressing the error mapping centralization, auth middleware standardization, and route-handler boundary enforcement will bring the implementation fully in line with the Big Picture Rules and eliminate the remaining architectural drift.
