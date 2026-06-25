# 006-use-restful-api-design

* **Status:** ✅ **APPROVED**
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow requires an API design approach that serves:

1. **Internal Frontend**: Next.js application needs to interact with backend services
2. **Public API**: Feature requirement to "Expose Public API for integration" (Brainstorming, Differentiating Features)
3. **Future Mobile Apps**: Potential for mobile applications to consume the same API

The Brainstorming phase identified "Expose Public API" as a Should-have feature with the description: "Provide read-only API endpoints for the schedule and speaker details." This enables advanced organizers to build custom websites or mobile apps.

The architecture must balance:
- **Simplicity** (ranked #3): API should be straightforward to implement and maintain
- **Usability** (ranked #1): API should be easy for third-party developers to consume
- **MVP Timeline**: 6-week development schedule limits API complexity

**Decision Drivers:**
- Must support Next.js API Routes for internal backend needs
- Must provide public read-only endpoints for schedule and speaker data
- Must be intuitive for third-party developers (external API consumers)
- Must align with Next.js framework capabilities and conventions
- Must support versioning for future API evolution
- Must be documented for public consumption

## Considered Options

1. **RESTful API (HTTP verbs, resource-based URLs)**
2. **GraphQL (Single endpoint, query-based)**
3. **RPC-style (Action-based endpoints)**
4. **tRPC (Type-safe RPC for TypeScript)**

## Decision Outcome

**Chosen Option:** "RESTful API (HTTP verbs, resource-based URLs)"

**Justification:**
RESTful API design is the optimal choice because it best satisfies the MVP constraints and future requirements:

1. **Simplicity**: REST follows well-established conventions that are easy to understand and implement, supporting the #3 ranked Simplicity priority
2. **Public API Requirements**: REST is the industry standard for public APIs, making it intuitive for third-party developers to consume
3. **Next.js Integration**: Next.js API Routes are designed for RESTful patterns, requiring minimal boilerplate
4. **MVP Timeline**: REST is straightforward to implement within the 6-week schedule, unlike GraphQL which requires schema design and resolvers
5. **Caching**: REST's use of standard HTTP methods enables easy caching of public endpoints (schedule, speaker listings)
6. **Documentation**: REST APIs are easily documented with OpenAPI/Swagger, supporting the public API feature requirement

### Consequences

* **Positive:**
  - REST is universally understood by developers, reducing onboarding time for external API consumers
  - HTTP caching (ETag, Cache-Control) improves performance for read-heavy public endpoints
  - Simple to test with browser and standard HTTP clients
  - Next.js API Routes map naturally to REST resource patterns
  - Easy to version (e.g., `/api/v1/sessions`) for future evolution

* **Negative:**
  - Over-fetching: Clients may receive more data than needed for specific views
  - Under-fetching: May require multiple requests to fetch related resources (e.g., session + speaker details)
  - Less flexible than GraphQL for complex data requirements
  - Requires careful design to maintain consistent resource naming conventions

* **Risks:**
  - REST endpoint proliferation as features grow (may become harder to maintain)
  - Versioning strategy must be planned from the start to avoid breaking changes
  - Real-time features (if added later) require WebSocket or Server-Sent Events alongside REST
  - May require additional endpoints for complex business operations (e.g., bulk updates)

### Pros and Cons of the Options

#### Option 1: RESTful API (HTTP verbs, resource-based URLs)

* Good, because it follows industry standards that are universally understood by developers
* Good, because it leverages HTTP features (caching, status codes, content negotiation) natively
* Good, because Next.js API Routes are designed for REST patterns, minimizing boilerplate
* Good, because it enables simple API documentation with OpenAPI/Swagger
* Good, because it supports the "Expose Public API" feature requirement effectively
* Bad, because it can lead to over-fetching or under-fetching data in complex scenarios
* Bad, because it may require multiple round-trips for related data (N+1 problem)
* Bad, because endpoint design can become inconsistent without strict guidelines

#### Option 2: GraphQL (Single endpoint, query-based)

* Good, because it allows clients to request exactly the data they need, preventing over-fetching
* Good, because it enables fetching related resources in a single request
* Good, because it provides strong type safety and auto-generated documentation
* Bad, because it adds significant complexity to the MVP timeline (schema design, resolvers)
* Bad, because it requires more infrastructure (GraphQL server, schema validation)
* Bad, because caching is more complex compared to REST's HTTP caching
* Bad, because it may be overkill for MVP's simple data requirements

#### Option 3: RPC-style (Action-based endpoints)

* Good, because it maps directly to business operations (e.g., `/api/submitProposal`)
* Good, because it is simple to implement and understand for specific use cases
* Bad, because it lacks standardization, making it harder for external developers to learn
* Bad, because it doesn't leverage HTTP semantics (verbs, status codes) effectively
* Bad, because it becomes harder to maintain as the number of actions grows
* Bad, because it doesn't align well with the "Public API" requirement for third-party consumption

#### Option 4: tRPC (Type-safe RPC for TypeScript)

* Good, because it provides end-to-end type safety between backend and frontend
* Good, because it reduces boilerplate and improves developer experience for internal APIs
* Bad, because it requires both client and server to use TypeScript (limits public API consumers)
* Bad, because it is less known outside the TypeScript community, reducing external API usability
* Bad, because it creates dependency on specific framework and ecosystem
* Bad, because it doesn't work well for public API scenarios where clients may use different languages

## API Structure

The RESTful API will follow these conventions:

```
/api/v1/
  /events           - GET (list), POST (create)
  /events/:id       - GET (read), PATCH (update), DELETE
  /events/:id/proposals     - GET (list proposals for event)
  /proposals/:id    - GET, PATCH
  /speakers/:id     - GET
  /schedule         - GET (public schedule)
```

## Authentication for API

- Internal API routes: Supabase JWT token validation
- Public API endpoints: API key authentication (future implementation)
- Rate limiting: Applied to all public endpoints

## Links

* [Next.js API Routes Documentation](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
* [REST API Best Practices](https://restfulapi.net/)
* [Feature: Expose Public API](../inception/5-brainstorming.md#differentiating-features)
* [MVP Canvas - Public API Requirement](../inception/8-mvp-canvas-definition.md#2-mvp-scope---wave-1-features)
