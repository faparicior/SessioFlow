# Executive Summary & Core Responsibilities

The User Interface Controller layer (`ui-controller`) handles HTTP/REST endpoints, routing, request deserialization, and presentation formatting. It acts as an entry adapter in Hexagonal Architecture, delegating all business workflow execution directly to the Application Layer (Use Cases / Handlers).

## Core Responsibilities
- **Request Routing & Parsing:** Map HTTP methods, paths, headers, and query parameters to application commands or queries.
- **Transport Validation:** Validate HTTP request payloads (headers, body structure, query parameters) before command construction.
- **Use Case Dispatch:** Instantiate and execute application commands/queries via Command Bus or Use Case handlers.
- **HTTP Response Mapping:** Map application results or DTOs into standard HTTP responses, status codes (200, 201, 204, 400, 404, 500), and headers.

## Key Principles & Anti-Patterns
- 🚫 **No Domain or Business Rules:** Controllers must never contain business logic, domain entity instantiation, or ORM/database queries.
- 🔒 **Stateless & Transport-Focused:** Controllers should remain thin transport adapters without holding request-scoped mutable state.
- 📐 **DTO Translation:** Convert raw HTTP bodies to application commands/DTOs, and application output DTOs back to HTTP response models. Never leak domain entities to the client.
- 🛡️ **Centralized Error Mapping:** Exception filters or middleware should translate application/domain exceptions into standardized HTTP error responses.
