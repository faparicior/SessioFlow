# 🏛️ Level 2 DDD Architecture Review Guide & Reusable Prompt

This guide provides a standardized checklist, reusable AI prompt, and audit protocol for evaluating software elements across all bounded contexts in **SessioFlow** against Level 2 Domain-Driven Design (DDD) rules and automated `ts-archunit` tests.

---

## 📋 Reusable Review Prompt (For PR Reviews & AI Agents)

Copy and paste the following prompt when reviewing new PRs, feature implementations, or refactoring existing modules:

```markdown
### Task: Perform a Level 2 Architecture Review

Please review the target DDD element/use case: `<TARGET_FILE_OR_FEATURE>` against SessioFlow's architectural contracts documented in `AGENTS.md` and `docs/adr/019-use-ts-archunit-for-architecture-testing.md`.

#### 🎯 Level 2 DDD Invariant Checklist

1. **Domain Layer (`packages/modules/*/src/domain/`)**
   - [ ] Zero external dependencies (imports strictly restricted to `domain/`, `shared/`, or `node_modules/`).
   - [ ] Value Objects are immutable, self-validating, and throw `DomainError` on invalid invariants.
   - [ ] Domain Entities are exported and contain zero HTTP or database ORM references.

2. **Application Layer (`packages/modules/*/src/application/`)**
   - [ ] Strict CQRS separation (Commands mutate state; Queries are strictly read-only with zero `.save()` or `.delete()` calls).
   - [ ] Commands/Queries end with `Command`/`Query` and carry **primitives only** (zero domain VO imports).
   - [ ] Primitive `Input` type alias exported (e.g. `CreateConferenceInput`).
   - [ ] Handlers end with `Handler`, implement `execute()`, and receive the co-located DTO class in `execute()`.
   - [ ] Command Handlers invoke structured logger (`logger.info` / `logger.error`) in `execute()`, using zero direct `console.log` statements.
   - [ ] CQRS Responses have a `private constructor`, a static `from(entity)` factory method, and `readonly` primitive fields only.

3. **Interfaces / Controller Layer (`packages/modules/*/src/interfaces/http/`)**
   - [ ] Controller functions end with `Controller` and return `Promise<Response>`.
   - [ ] Zero direct domain imports (`ConferenceId`, etc.) and zero repository imports.
   - [ ] Contract payload validation uses Zod schemas (`safeParse`), returning `400 Bad Request` with `z.treeifyError`.
   - [ ] Instantiates primitive-only CQRS command/query DTO (`new Command(...)`).
   - [ ] Translates `DomainError` exceptions to semantic HTTP responses via `mapDomainErrorToResponse`.
   - [ ] Zero direct infrastructure or database imports.

4. **API Route Wrappers (`apps/backend/src/interfaces/api/v1/`)**
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
# Architecture tests (40+ rules)
npx vitest run tests/unit/architecture/

# Unit & Controller tests
npx vitest run tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts

# TypeScript strict type check
npm run typecheck
```

### 2. File Organization Reference
| Layer | Location Pattern | Main Responsibilities |
| :--- | :--- | :--- |
| **Domain** | `packages/modules/[module]/src/domain/` | Entities, Value Objects, Domain Events, Repository Interfaces. |
| **Application** | `packages/modules/[module]/src/application/` | CQRS Commands, Queries, Handlers, Response DTOs. |
| **Interfaces** | `packages/modules/[module]/src/interfaces/http/` | HTTP Controllers, Zod Schemas, Response contracts. |
| **Infrastructure** | `packages/modules/[module]/src/infrastructure/` | Drizzle ORM Repositories, Database Schemas, External API Clients. |
| **API Routes** | `apps/backend/src/interfaces/api/v1/` | Thin Next.js App Router handlers delegating to controllers via `container.ts`. |
