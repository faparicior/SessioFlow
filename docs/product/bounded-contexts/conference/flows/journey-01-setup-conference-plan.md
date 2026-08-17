# Journey 01: Setup Conference - Development Plan

* **Date:** 2026-08-17
* **Status:** 📋 Planning
* **Flow File:** `docs/product/bounded-contexts/conference/flows/journey-01-setup-conference.md`
* **Bounded Context:** `conference`

> **Architecture & Commands Reference**: Consult **`AGENTS.md`** and **`docs/ARCHITECTURE.md`** for exact folder paths, naming rules, test runner commands, and Definition of Done.

---

## 🎯 Overview

**Flow Description:** The conference organizer creates a new conference, configures its Call for Papers (CfP) window (dates, optional submission limit/approval), and the system validates (UI + API + domain), enforces BR-001..BR-004, creates the `Conference` aggregate (`DRAFT` → `CFP_OPEN`), and persists it atomically with its domain events via the Transactional Outbox. The organizer is redirected to their conference dashboard with a shareable CfP link.

**Current State (search-first, 2026-08-17):**
- ✅ **Exists:** `@sessioflow/shared-{database,domain,http,logging,bus}` (Drizzle client + `conferences`/`outbox_messages` schema, base `DomainError`s, `mapDomainErrorToResponse` with all needed error codes, CQRS buses, Pino logger), `@sessioflow/api-definitions` (`ConferenceCreateSchema` + `ConferenceApiResponse`), DB migrations `0000`/`0001`, architecture checker (`scripts/check-architecture.mjs` + `tests/unit/architecture/`), E2E infra (`tests/e2e/setup.ts`, `cleanup.ts`, `teardown.ts`), **E2E North Star test `tests/e2e/conference-setup.spec.ts`**, frontend UI kit (button/card/input/label/alert/textarea), `/dashboard` page, root `tsconfig`/`vitest` aliases for `@sessioflow/conference`.
- ❌ **Missing (built by this plan):** `packages/modules/conference/**` (entire DDD module), frontend `/conferences/*` pages + `/api/v1/conferences*` routes, conference unit/integration/interface tests, two additive shared/contract edits (api-definitions Zod refine; shared outbox `tx` param).
- 🚀 **Deploy-safety constraint:** purely additive — no new npm dependencies, no DB schema/migration changes, no edits to existing routes/pages (`/`, `/dashboard`, `auth/me`), mocked auth untouched.

### Associated Features (Sequentially Ordered)
| # | Feature | Specification File | Status |
|---|---------|---------------------|--------|
| F1 | Conference Creation with CfP Configuration | [`features/feature-01-conference-creation-with-cfp.md`](./features/feature-01-conference-creation-with-cfp.md) | 📋 Planned |
| F2 | Conference Dashboard with CfP Link | [`features/feature-02-conference-dashboard-cfp-link.md`](./features/feature-02-conference-dashboard-cfp-link.md) | 📋 Planned |

---

## 📋 Relevant ADRs
*Referenced from `docs/adr/README.md`:*
- `ADR-001`: Next.js Frontend — UI lives in `apps/frontend` (App Router, Tailwind, shadcn primitives).
- `ADR-002-01`: Supabase with DDD Abstraction — PostgreSQL accessed only through repository interfaces; Drizzle schema shared via `@sessioflow/shared-database`.
- `ADR-004-01`: Auth with DDD Abstraction — `getAuthUser()` injection point; Wave 1 uses the existing mock (`mock-user-id`), no strategy change.
- `ADR-006`: RESTful API Design — `POST /api/v1/conferences`, `GET /api/v1/conferences/{id}`.
- `ADR-007` + `ADR-007-01`: Zod at boundaries, domain validates natively — shared `ConferenceCreateSchema` used by client + controller; domain VOs are the final authority.
- `ADR-009`: DDD Structure — `domain → application → infrastructure → interfaces` with `container.ts` composition root.
- `ADR-011-01`: Optional Email Abstraction — welcome email worker is **out of scope** (outbox rows persist as `PENDING`).
- `ADR-015`: CQRS — co-located `*.command.ts` / `*.query.ts` / `*.handler.ts` / `*.response.ts` folders; handlers return DTOs; command handlers take `OutboxRepository`.
- `ADR-016-01`: Controller Factory DI — `conferenceContainer.create*Controller(getAuthUser?)`; `route.ts` is a 2-line delegate.
- `ADR-017`: Drizzle with DDD Transactions — aggregate save + outbox `saveAll` wrapped in `db.transaction` **at the application layer** (opaque `tx` parameter).
- `ADR-019`: ts-archunit — `npm run check:arch` (fast) + `npm run test:architecture` (full suite) must pass after every phase.
- `ADR-020`: API Schema Package — data-only contracts in `@sessioflow/api-definitions`; no domain leakage.
- `ADR-021`: Domain Module Structure — entities/interfaces at `domain/` root; `value-objects/`, `exceptions/`, `events/` grouped subfolders.
- `ADR-022`: Frontend-Backend Type Decoupling — frontend consumes `ConferenceApiResponse` data shapes only.
- `ADR-023`: Monorepo Structure — module as `packages/modules/conference` workspace package.

---

## 🧠 Agent Design Decisions & Assumptions (Lack of Information Log)
*Consolidated from both feature specs; each decision is audit-flagged there as well.*

| # | Topic / Area | Documentation State / Gap | Decision / Judgment Made | Status |
|---|--------------|---------------------------|--------------------------|--------|
| D1 | Slug collision policy (F1) | BR-003 says "auto-suffix + retry"; flow doc error path + E2E expect `409` | Hard-fail `SlugExistsError` → `409 SLUG_EXISTS` "Conference slug already exists"; no auto-suffix (E2E contract wins) | 📋 Proposed |
| D2 | Error transport (F1) | `Result` type referenced in templates but absent from `@sessioflow/shared-domain` | Domain throws `DomainError` subclasses; pure handlers return DTOs; controllers map via `mapDomainErrorToResponse` (per AGENTS.md) | 📋 Proposed |
| D3 | CfP start boundary (F1) | VO doc "future"; flow doc `>= today`; E2E "future or today" | Start date may be today (`>= today`) | 📋 Proposed |
| D4 | Duration caps (F1) | VO docs: hard caps; flow doc: 180d = soft warning | Hard domain validation: start ≤ +365d, end ≤ start+180d → `400` | 📋 Proposed |
| D5 | Transaction typing (F1) | Domain interfaces cannot import Drizzle types | Opaque `TransactionClient` (`unknown`) in domain interface; handler drives `db.transaction` | 📋 Proposed |
| D6 | Shared outbox edit (F1) | `saveAll` has no `tx` parameter | Add backward-compatible optional `tx?: unknown` to `DrizzleOutboxRepository.saveAll` — only shared-package change | 📋 Proposed |
| D7 | Email worker (F1) | Flow shows async Resend worker; ADR-011-01 optional | Out of scope — outbox events persisted `PENDING`, no worker (deploy-safe) | 📋 Proposed |
| D8 | `logoUrl` (F1) | In flow doc request body, absent from schema + DB | Excluded — no schema change (deploy-safe) | 📋 Proposed |
| D9 | `cfpUrl` field (F1) | Flow doc 201 body has `cfpUrl`; `ConferenceApiResponse` doesn't | Server returns `ConferenceApiResponse` unchanged; frontend derives `/cfp/{slug}` | 📋 Proposed |
| D10 | Validation split (F1) | — | Additive `.refine(end > start)` to shared `ConferenceCreateSchema`; client + controller use it; domain VOs re-validate | 📋 Proposed |
| D11 | Free tier (F1) | No billing module in Wave 1 | All organizers `FREE`; active = `status != 'DELETED'`; limit 5; checked pre-creation via `countActiveByOrganizerId` | 📋 Proposed |
| D12 | Auth (F1) | Repo mocks auth everywhere | `getAuthUser()` defaults to `mock-user-id` (matches E2E setup/cleanup) | 📋 Proposed |
| D13 | `DomainEvent` interface (F1) | Not exported by `@sessioflow/shared-domain` | Module-local `domain/events/domain-event.interface.ts` | 📋 Proposed |
| D14 | Conference id validation (F2) | Layer not specified | Controller: `ConferenceId.create()` → `400 INVALID_CONFERENCE_ID` for malformed; handler: `null` from repo → `404 NOT_FOUND` | 📋 Proposed |
| D15 | Dashboard fetching (F2) | RSC vs client unspecified | Client component fetches `/api/v1/conferences/{id}` (single-server E2E architecture) | 📋 Proposed |
| D16 | CfP link base URL (F2) | No base-URL env exists | Relative `/cfp/{slug}` rendered in `<code>` (E2E asserts slug text only) | 📋 Proposed |
| D17 | Dashboard scope (F2) | Flow requires CfP link only | Minimal page: name + status + CfP link; no sessions/submissions UI | 📋 Proposed |

---

## 📦 Phased Execution Plan

> **Disciplined TDD Micro-Cycle for every phase:**
> 1. **First: Write Test** (Must fail initially)
> 2. **After: Implement Code** (Make test pass)
> 3. **After: Architecture Tests** (`npm run check:arch` + `npm run test:architecture`)
> 4. **After: Linter & Typecheck** (`npm run lint:fix` + `npm run typecheck`)
> 5. **🛑 User Checkpoint**: report verification results; confirm before next phase

**Per-phase verification commands** (from `AGENTS.md`):
- Architecture: `npm run check:arch` (fast, < 2s) and `npm run test:architecture`
- Unit: `npx vitest run tests/unit/modules/conference/`
- Integration: `npx vitest run tests/integration/modules/conference/` (requires `docker compose -f apps/backend/docker-compose.yml up -d`)
- Interface: `npx vitest run tests/backend/modules/conference/`
- Quality: `npm run lint:fix && npm run typecheck`
- E2E: `npm run test:e2e`

---

### Phase 0: Define E2E Contract (Outside-In)
- [x] **0.1 Write E2E Journey Test**: `tests/e2e/conference-setup.spec.ts` already exists in the current repository (5 scenarios: happy path, invalid dates, duplicate slug, free tier limit, past date) — kept as-is; it is the North Star contract
- [ ] **0.2 Run E2E (Must Fail)**: `npm run test:e2e` → all scenarios fail (no `/conferences/*` routes, no module) — confirm and record failures
- 🛑 **Checkpoint 0**: report failing E2E baseline to user

---

### Phase 1: Domain Core (Inside-Out) — F1

#### 1.0 Module Scaffold (prerequisite)
- [ ] Create `@sessioflow/conference` package via `create-module` skill: `packages/modules/conference/{package.json, tsconfig.json, .gitignore, src/container.ts}` (scaffold container, full wiring in Phase 3)
- [ ] `npm install` (re-links the `@sessioflow/conference` workspace symlink already referenced by `apps/frontend` and root configs)
- [ ] `npm run typecheck` → green (empty module compiles)

#### 1.1 Tests First (Domain)
- [ ] Write Value Object unit tests → `tests/unit/modules/conference/domain/value-objects/{conference-id,conference-name,conference-slug,conference-status,conference-description,organizer-id,cfp-start-date,cfp-end-date,cfp-status,max-submissions,requires-approval}.test.ts`
- [ ] Write `CfpConfig` composite VO tests → `tests/unit/modules/conference/domain/cfp-config.test.ts`
- [ ] Write `Conference` aggregate tests (create → `DRAFT`; `publishCfp()` → `CFP_OPEN`; transition guards; `pullDomainEvents()`; `fromData()` purity) → `tests/unit/modules/conference/domain/conference.test.ts`
- [ ] Write exception tests (codes + inheritance) → `tests/unit/modules/conference/domain/exceptions/exceptions.test.ts`
- [ ] Verify domain tests **FAIL** initially (run `npx vitest run tests/unit/modules/conference/`)

#### 1.2 Implement Code (Domain)
- [ ] `src/domain/value-objects/`: `conference-id.ts`, `conference-name.ts`, `conference-slug.ts` (slugify + `toCfpUrl`), `conference-status.ts` (transition matrix), `conference-description.ts`, `organizer-id.ts`, `cfp-start-date.ts`, `cfp-end-date.ts`, `cfp-status.ts`, `max-submissions.ts`, `requires-approval.ts`, `cfp-config.ts` (composite; `create()` enforces INV-002, `fromData()`, `isActive()`, `close()`, `isWithinWindow()`)
- [ ] `src/domain/events/`: `domain-event.interface.ts`, `conference-created-event.ts`, `cfp-opened-event.ts` (`type` + `timestamp` + `toJSON()`)
- [ ] `src/domain/exceptions/`: `conference-name-too-short-error.ts`, `conference-name-too-long-error.ts`, `empty-slug-error.ts`, `slug-exists-error.ts`, `invalid-cfp-start-date-error.ts`, `cfp-start-date-not-in-future-error.ts`, `invalid-cfp-end-date-error.ts`, `cfp-dates-invalid-error.ts`, `max-submissions-invalid-error.ts`, `conference-free-tier-limit-error.ts`, `invalid-conference-status-error.ts`, `invalid-status-transition-error.ts`, `conference-not-found-error.ts`
- [ ] `src/domain/conference.ts`: aggregate (`ConferenceData` with VOs only, `create(parameters)` records `ConferenceCreatedEvent`, `publishCfp()`, `fromData()`, `pullDomainEvents()`)
- [ ] `src/domain/conference-repository.interface.ts`: `findById`, `findBySlug`, `countActiveByOrganizerId`, `save(conference, tx?)` + `TransactionClient` type (D5)
- [ ] Verify domain tests **PASS**

#### 1.3 Architecture & Quality Checks (Domain)
- [ ] `npm run check:arch packages/modules/conference` → 0 errors (VO conventions, entity factory conventions, event/exception conventions, domain isolation)
- [ ] `npm run test:architecture` → 0 errors
- [ ] `npm run lint:fix && npm run typecheck` → 0 errors
- 🛑 **Checkpoint 1**: report phase verification; confirm before Phase 2

---

### Phase 2: Application Layer (Inside-Out) — F1 command + F2 query

#### 2.1 Tests First (Application)
- [ ] `tests/unit/modules/conference/application/commands/create-conference.test.ts` (mocked repository/outbox): happy path (VOs → aggregate → `publishCfp` → transactional save + outbox), BR-003 duplicate slug → 409 error, BR-004 free tier → 403 error, domain error propagation (past date, name, dates order), transaction receives both save + outbox calls
- [ ] `tests/unit/modules/conference/application/queries/get-conference.test.ts` (mocked repository): found → response mapping, missing → `ConferenceNotFoundError`, malformed id → `InvalidConferenceId`-style rejection
- [ ] Verify application tests **FAIL** initially

#### 2.2 Implement Code (Application)
- [ ] `src/application/commands/create-conference/`: `create-conference.command.ts` (`CreateConferenceInput` type + `CreateConferenceCommand` DTO, primitives only), `create-conference.handler.ts` (BR-003 check → BR-004 check → `Conference.create()` → `publishCfp()` → `db.transaction { save + outbox.saveAll(events, 'Conference', id, tx) }` → `CreateConferenceResponse.from(conference)`), `create-conference.response.ts` (private ctor, readonly primitives, static `from`, matches `ConferenceApiResponse`)
- [ ] `src/application/queries/get-conference/`: `get-conference.query.ts`, `get-conference.handler.ts` (read-only), `get-conference.response.ts`
- [ ] Additive contract edit (D10): `packages/api-definitions/src/zod/conference.ts` — `.refine(end > start, {message: 'End date must be after start date'})`
- [ ] Additive shared edit (D6): `packages/shared/database/src/outbox-repository.ts` — optional `tx?: unknown` on `saveAll`
- [ ] Verify application tests **PASS**

#### 2.3 Architecture & Quality Checks (Application)
- [ ] `npm run check:arch` → 0 errors (CQRS naming, co-located folders, DTO purity, handler outbox rule, response DTO conventions)
- [ ] `npm run test:architecture` → 0 errors
- [ ] `npm run lint:fix && npm run typecheck` → 0 errors
- 🛑 **Checkpoint 2**: report phase verification; confirm before Phase 3

---

### Phase 3: Infrastructure & Container Wiring

#### 3.1 Tests First (Infrastructure)
- [ ] `tests/integration/modules/conference/conference-repository.integration.test.ts` (real PostgreSQL via docker compose): save + `findBySlug` round-trip, `findById` reconstitution (cfp config JSONB → VOs), `countActiveByOrganizerId` (excludes `DELETED`), transactional save visibility
- [ ] `tests/integration/modules/conference/outbox-pattern.integration.test.ts`: handler-driven transaction persists aggregate + 2 `outbox_messages` rows atomically (rollback on failure)
- [ ] Verify integration tests **FAIL** initially

#### 3.2 Implement Code (Infrastructure)
- [ ] `src/infrastructure/database/conference.repository.ts`: `DrizzleConferenceRepository` (row mapping from `conferencesTable`, reconstitution via `Conference.fromData(...)` with VO `fromData()`s, `tx` delegation)
- [ ] `src/container.ts` (full wiring): `createMediator()` (Mediator + `LoggingMiddleware` + register `CreateConferenceCommand` / `GetConferenceQuery`), handler factories (default `DrizzleConferenceRepository` + `DrizzleOutboxRepository` + `getLogger()`, injectable for tests), controller factories `createCreateConferenceController(getAuthUser?)` / `createGetConferenceController(getAuthUser?)`
- [ ] Verify integration tests **PASS**

#### 3.3 Architecture & Quality Checks (Infrastructure)
- [ ] `npm run check:arch` → 0 errors (repo in infrastructure, `fromData` reconstitution, container imports Mediator from `@sessioflow/bus`)
- [ ] `npm run test:architecture` → 0 errors
- [ ] `npm run lint:fix && npm run typecheck` → 0 errors
- 🛑 **Checkpoint 3**: report phase verification; confirm before Phase 4

---

### Phase 4: Interface Layer, API Routes & Frontend UI — F1 + F2

#### 4.1 Tests First (Interfaces)
- [ ] `tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts` (mocked handlers): POST 201 shape, Zod `400 VALIDATION_ERROR`, missing auth `401`, each DomainError → mapped status/body (400/403/409 per error contract), unexpected error rethrow; GET 200 mapping, 404, 400 malformed id
- [ ] Verify interface tests **FAIL** initially

#### 4.2 Implement Code (Interfaces + UI)
- [ ] `src/interfaces/http/create-conference.controller.ts`: `createConferenceController(request, handler, getAuthUser)` — `import type` handler, `ConferenceCreateSchema.parse`, auth check, `new CreateConferenceCommand(...)`, `DomainError` → `mapDomainErrorToResponse`, rethrow unexpected
- [ ] `src/interfaces/http/get-conference.controller.ts`: `getConferenceController(request, handler, getAuthUser)` — id extraction + `ConferenceId` format check, dispatch, error mapping
- [ ] Thin route delegates: `apps/frontend/src/app/api/v1/conferences/route.ts` (`POST`), `apps/frontend/src/app/api/v1/conferences/[id]/route.ts` (`GET`) — resolve controllers from `conferenceContainer` (ADR-016-01)
- [ ] Frontend create UI: `apps/frontend/src/app/conferences/create/page.tsx` (thin) + `apps/frontend/src/modules/conference/conference-form.tsx` (labels `Conference Name`/`Description`/`CfP Start Date`/`CfP End Date`, shared Zod schema, live slug `<code>` preview, inline error display from `error.message`, redirect to `/conferences/{id}`)
- [ ] Frontend dashboard UI: `apps/frontend/src/app/conferences/[id]/page.tsx` (client fetch, name + status, CfP link in `<code>`, 404 state)
- [ ] Verify interface tests **PASS**

#### 4.3 Architecture & Quality Checks (Interfaces)
- [ ] `npm run check:arch` → 0 errors (controller naming, `import type` handler, DTO instantiation, routes have no Zod/domain/infrastructure imports)
- [ ] `npm run test:architecture` → 0 errors
- [ ] `npm run lint:fix && npm run typecheck` → 0 errors
- 🛑 **Checkpoint 4**: report phase verification; confirm before Phase 5

---

### Phase 5: E2E Validation & Definition of Done

- [ ] **5.1 Execute E2E Suite**: `npm run test:e2e` — **ALL 5 scenarios MUST PASS** (happy path + redirect, invalid dates, duplicate slug, free tier limit, past date)
- [ ] **5.2 Fast Architecture Verification**: `npm run check:arch` → 0 errors
- [ ] **5.3 Architecture Test Suite**: `npm run test:architecture` → 0 errors
- [ ] **5.4 Unit & Integration Test Suites**: `npx vitest run` (full suite) → 0 errors; coverage ≥ 80% for new code
- [ ] **5.5 TypeScript Typecheck**: `npm run typecheck` → 0 errors
- [ ] **5.6 Linting & Formatting**: `npm run lint` → 0 errors
- [ ] **5.7 Mark Plan Complete**: update this plan's status to `✅ Complete`, flip feature spec statuses to `✅ Complete`, commit with conventional commit format
- 🛑 **Final Gate**: present full verification results; user approval closes the flow

---

## ✅ Definition of Done (per `AGENTS.md`)

1. `npm run check:arch` exits 0
2. `npx vitest run` exits 0
3. `npm run test:e2e` exits 0
4. `npm run lint` exits 0
5. `npm run typecheck` exits 0
6. Code coverage ≥ 80% for new code
7. Changes committed with conventional commit format
8. **Deploy-safe**: `git diff` against `main` shows only additive files + the 2 logged additive edits (D6, D10); existing behavior unchanged

---

## 📎 Affected Files Manifest

| Phase | Files | Type |
|-------|-------|------|
| 1.0 | `packages/modules/conference/{package.json,tsconfig.json,.gitignore,src/container.ts}` | New (scaffold) |
| 1.2 | `packages/modules/conference/src/domain/**` (1 entity + interface, 12 VOs, 3 events, 13 exceptions) | New |
| 1.1 | `tests/unit/modules/conference/domain/**` (15 test files) | New |
| 2.2 | `packages/modules/conference/src/application/**` (6 files), `packages/api-definitions/src/zod/conference.ts`, `packages/shared/database/src/outbox-repository.ts` | New + 2 additive edits |
| 2.1 | `tests/unit/modules/conference/application/**` (2 test files) | New |
| 3.2 | `packages/modules/conference/src/infrastructure/database/conference.repository.ts`, `src/container.ts` (wiring) | New + update |
| 3.1 | `tests/integration/modules/conference/**` (2 test files) | New |
| 4.2 | `packages/modules/conference/src/interfaces/http/**` (2 controllers), `apps/frontend/src/app/api/v1/conferences/{route,[id]/route}.ts`, `apps/frontend/src/app/conferences/{create/page,[id]/page}.tsx`, `apps/frontend/src/modules/conference/conference-form.tsx` | New |
| 4.1 | `tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts` | New |
| 0 / 5 | `tests/e2e/conference-setup.spec.ts` (existing), `journey-01-setup-conference-plan.md` status | Existing / update |
