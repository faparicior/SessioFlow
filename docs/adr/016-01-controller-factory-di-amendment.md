# Controller Factory DI Amendment for Next.js

* **Status:** Approved
* **Date:** 2026-07-22
* **Decision Makers:** Technical Team
* **Amends:** [ADR-016](016-dependency-injection-strategy-for-nextjs.md)
* **Amended By:** N/A

## Context and Problem Statement

ADR-016 established "Factory Functions with Explicit Injection" as the Dependency Injection strategy for SessioFlow. Under that strategy, module composition roots (`container.ts`) exposed factory functions for Application Handlers (e.g., `createConferenceHandler`).

However, this required Next.js route handlers (`route.ts`) to:
1. Manually resolve the Application Handler from `container.ts`
2. Instantiate/invoke the HTTP Controller passing the Application Handler as an explicit argument

This created a **leaky abstraction**: framework route entrypoints (`route.ts`) were aware of Application Use Case Handlers when they should only be concerned with HTTP Controllers.

## Decision Outcome

**Chosen Refinement:** Extend module containers (`container.ts`) to expose **HTTP Controller factories** alongside Application Handler factories.

In this architecture:
- `container.ts` acts as the single Composition Root that encapsulates resolving Application Handlers and injecting them into HTTP Controllers.
- `route.ts` becomes a thin, single-responsibility delegate that resolves and invokes the HTTP Controller.

### Implementation Example

**Module Container (`packages/modules/conference/src/container.ts`):**

```typescript
export const conferenceContainer = {
  // Use Case Handler factories (useful for CLI, background jobs, unit testing)
  createConferenceHandler(
    repository: ConferenceRepository = new DrizzleConferenceRepository(),
  ): CreateConferenceHandler {
    return new CreateConferenceHandler(repository);
  },

  // Controller factories (resolves handler internally for HTTP routes)
  createConferenceController(
    repository?: ConferenceRepository,
    getAuthUser: () => Promise<{id: string} | undefined> = async () => ({id: 'mock-user-id'}),
  ) {
    const handler = this.createConferenceHandler(repository);
    return (request: Request) => createConferenceController(request, handler, getAuthUser);
  },
};
```

**Next.js Route Entrypoint (`apps/backend/src/interfaces/api/v1/conferences/route.ts`):**

```typescript
export async function POST(request: NextRequest) {
  const controller = conferenceContainer.createConferenceController();
  return controller(request);
}
```

## Consequences

### Positive
- **Clean Boundaries:** Route entrypoints (`route.ts`) do not import or depend on Application Handlers.
- **Reduced Boilerplate:** Route handlers are simplified to 2-line delegates.
- **Encapsulated Wiring:** Composition roots control full dependency trees from Repositories → Application Handlers → HTTP Controllers.
- **Preserved Testability:** Individual HTTP controller functions remain pure, explicitly injected functions for isolated unit testing.

### Negative
- `container.ts` has additional helper factory methods for controllers.
