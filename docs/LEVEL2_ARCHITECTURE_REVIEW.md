# 🏛️ Level 2 DDD Architecture Review Guide & Reusable Prompt

This guide provides a standardized checklist, reusable AI prompt, and audit protocol for evaluating software elements across all bounded contexts in **SessioFlow** against Level 2 Domain-Driven Design (DDD) rules, CQRS Bus middleware conventions, and automated `ts-archunit` tests.

---

## 📋 Reusable Review Prompt (For PR Reviews & AI Agents)

Copy and paste the following prompt when reviewing new PRs, feature implementations, or refactoring existing modules:

```markdown
### Task: Perform a Level 2 Architecture Review

Please review the target DDD element/use case: `<TARGET_FILE_OR_FEATURE>` against SessioFlow's architectural contracts documented in `AGENTS.md`, `docs/adr/015-adopt-cqrs-pattern.md`, `docs/adr/019-use-ts-archunit-for-architecture-testing.md`, and `@sessioflow/bus`.

#### 🎯 Level 2 DDD Invariant Checklist

1. **Domain Layer (`packages/modules/*/src/domain/`)**
   - [ ] Zero external dependencies (imports strictly restricted to `domain/`, `shared/`, or `node_modules/`).
   - [ ] Value Objects are immutable, self-validating, and throw `DomainError` on invalid invariants.
   - [ ] Domain Entities are exported and contain zero HTTP or database ORM references.
   - [ ] Domain Entities & Child Entities enforce `private constructor` with named static factory methods (`create(...)` for domain creation rules vs `fromData(...)` / `fromRaw(...)` for persistence reconstitution).

2. **Application Layer (`packages/modules/*/src/application/`)**
   - [ ] Strict CQRS separation (Commands mutate state; Queries are strictly read-only with zero `.save()` or `.delete()` calls).
   - [ ] Commands/Queries end with `Command`/`Query` and carry **primitives only** (zero domain VO imports).
   - [ ] Primitive `Input` type alias exported (e.g. `CreateConferenceInput`).
   - [ ] Handlers end with `Handler`, implement `execute()`, and receive the co-located DTO class in `execute()`.
   - [ ] Command Handlers invoke structured logger (`logger.info` / `logger.error`) in `execute()`, using zero direct `console.log` statements.
   - [ ] Command Handlers accept and use `OutboxRepository` to persist domain events at the latest moment using the Transactional Outbox pattern.
   - [ ] CQRS Responses have a `private constructor`, a static `from(entity)` factory method, and `readonly` primitive fields only.

3. **Interfaces / Controller Layer (`packages/modules/*/src/interfaces/http/`)**
   - [ ] Controller functions end with `Controller` and return `Promise<Response>`.
   - [ ] Explicitly imports co-located Handler interface via `import type { [UseCase]CommandHandler }` for 100% LLM/IDE traceability and zero runtime coupling.
   - [ ] Zero direct domain imports (`ConferenceId`, etc.) and zero repository imports.
   - [ ] Contract payload validation uses Zod schemas (`safeParse`) from `@sessioflow/api-definitions`, returning `400 Bad Request` with `z.treeifyError`.
   - [ ] Instantiates primitive-only CQRS command/query DTO (`new Command(...)`).
   - [ ] Translates `DomainError` exceptions to semantic HTTP responses via `mapDomainErrorToResponse`.
   - [ ] Zero direct infrastructure or database imports.

4. **Composition Root & CQRS Bus (`packages/modules/*/container.ts` & `@sessioflow/bus`)**
   - [ ] Container instantiates `createMediator(deps)` with `InMemoryCommandBus`, `InMemoryQueryBus`, and `LoggingMiddleware`.
   - [ ] Controllers wrap execution through `mediator.send(command)` and `mediator.ask(query)` so all HTTP calls execute through the Bus middleware pipeline.
   - [ ] Container uses a `Dependencies` object (e.g. `ConferenceDependencies`) for clean named overrides in tests.

5. **API Route Wrappers (`apps/backend/src/interfaces/api/v1/`)**
   - [ ] Thin delegation wrapper only — zero Zod schema imports (`notImportFrom('zod')`).
   - [ ] Zero domain or repository imports.
   - [ ] Resolves controllers via `container.ts` composition root.
   - [ ] Exported functions are standard uppercase HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
   - [ ] Route-level `try/catch` safety net catches unhandled errors as HTTP `500`.

#### 🧪 Automated Architecture Verification
Run the architecture test suite:
```bash
npx vitest run tests/unit/architecture/
```
```

---

## 🔍 Audit Protocol for All Repository Objects

When conducting a comprehensive audit across all bounded contexts:

### 1. Verification Commands
```bash
# Architecture tests (47+ ts-archunit rules)
npx vitest run tests/unit/architecture/

# Shared Bus package tests
npx vitest run tests/unit/shared/bus.test.ts

# Controller & Interface tests
npx vitest run tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts

# TypeScript strict type check across monorepo (17 workspace targets)
npm run typecheck
```

### 2. File Organization Reference
| Layer | Location Pattern | Main Responsibilities |
| :--- | :--- | :--- |
| **Domain** | `packages/modules/[module]/src/domain/` | Entities, Value Objects, Domain Events, Repository Interfaces. |
| **Application** | `packages/modules/[module]/src/application/` | CQRS Commands, Queries, Handlers, Response DTOs. |
| **Interfaces** | `packages/modules/[module]/src/interfaces/http/` | HTTP Controllers, Zod Schemas, Response contracts. |
| **Shared Bus** | `packages/shared/bus/` | `@sessioflow/bus`: InMemoryCommandBus, InMemoryQueryBus, Mediator, LoggingMiddleware. |
| **Infrastructure** | `packages/modules/[module]/src/infrastructure/` | Drizzle ORM Repositories, Database Schemas, External API Clients. |
| **API Routes** | `apps/backend/src/interfaces/api/v1/` | Thin Next.js App Router handlers delegating to controllers via `container.ts`. |
