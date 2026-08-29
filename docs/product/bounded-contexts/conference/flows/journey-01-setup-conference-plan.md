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
| D18 | JSONB `maxSubmissions` shape (Phase 3) | Shared `conferencesTable` annotates the JSONB as `maxSubmissions?: number`; domain `CfpConfigData` uses `number \| null` | Repository-local `toCfpConfigJson`/`fromCfpConfigJson` mappers — the shared schema `$type` is left untouched (still additive-safe); an unlimited CfP round-trips as a dropped JSON key | ✅ Applied (Phase 3) |
| D19 | Integration test isolation (Phase 3) | Integration tests share the local PostgreSQL tables with per-test cleanup, but Vitest ran test *files* in parallel → cross-file flakiness | `fileParallelism: false` in root `vitest.config.ts` (only shared-config edit; E2E runs under Playwright, unit tests are DB-free). Full suite stays fast (~28s) | ✅ Applied (Phase 3) |
| D20 | Container controller factories (Phase 3) | Plan lists them under 3.2, but the controllers they delegate to are Phase 4 artifacts | Container ships mediator + handler factories now; `create*Controller` factories stay stubbed and land with the controllers in Phase 4 (ADR-016-01) | ✅ Applied (Phase 3) |
| D21 | Controller transport (Phase 4) | Plan pseudocode is Next-flavoured (`NextResponse`); architecture forbids framework imports in `interfaces/` and `apps/backend` must stay able to reuse controllers | Controllers are framework-agnostic: take a web-standard `Request` and return a plain `Response` (`interfaces/http/json-response.ts` helper). Route handlers stay 5-line delegates; `mapDomainErrorToResponse` remains the single error mapper | ✅ Applied (Phase 4) |
| D22 | Frontend helper imports (Phase 4) | `xo` type-aware rules resolve relative and `@sessioflow/*` imports, but report “type that could not be resolved” (`no-unsafe-call`/`no-unsafe-return`) for `@/*` / `@frontend/*` aliases when the imported symbol is *called* (JSX-only usage is unaffected — the existing pattern in `apps/frontend`) | New callable helpers (`src/lib/api-response.ts`, `src/lib/api-error.ts`) are imported with **relative** paths; alias imports are kept only for shadcn UI components as JSX, matching repo convention. No tsconfig/lint-config change needed | ✅ Applied (Phase 4) |
| D23 | Frontend style constraints (Phase 4) | Frontend lint is `xo` (not `eslint-config-next`) and is stricter than existing code samples: no `null` types, JSX-event handler types, no single-line ternaries (`@stylistic/multiline-ternary` collides with Prettier collapsing), `react/jsx-sort-props` (shorthand first, callbacks last, alphabetical), `react/jsx-no-leaked-render` on plain boolean `&&` | New UI files use `undefined` state, multiline `x !== undefined && (<Alert/>)` guards, `if`-return helpers instead of ternaries, sorted props. Prettier 80-col wrapping applied on top so `xo` and Prettier agree | ✅ Applied (Phase 4) |
| D24 | Route safety net (Phase 4) | Controllers rethrow unexpected errors (AGENTS.md), but the App Router default 500 body is not the platform envelope | Small `src/lib/api-error.ts` helper logs with request context (`{method, path, error}`) and returns `500 INTERNAL_ERROR` `{ error: { code, message } }`. Route-only; no business logic | ✅ Applied (Phase 4) |
| D25 | Architecture rule coverage for `apps/**` | `tests/unit/architecture/ddd-boundaries.test.ts` builds its ts-archunit project from `tests/**` plus forced `packages/modules/*/src/**` sources, and its `apps/frontend` route-import rule is commented out; `scripts/check-architecture.mjs` only enforces `packages/modules/**/domain/**` rules. So **no automated rule inspects the new route handlers or UI files** | Kept as-is (architecture tests are immutable). The module `interfaces/http/**` controllers *are* covered by the ts-archunit function/module rules (naming, DTO instantiation, no domain imports). Route + UI safety rests on the interface contract tests, the E2E suite and review; widening the ts-archunit project scope to `apps/**` is logged as a follow-up, not done here | 📋 Noted (Phase 4) |

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
- [x] Create `@sessioflow/conference` package via `create-module` skill: `packages/modules/conference/{package.json, tsconfig.json, .gitignore, src/container.ts}` (scaffold container, full wiring in Phase 3)
- [x] `npm install` (re-links the `@sessioflow/conference` workspace symlink already referenced by `apps/frontend` and root configs)
- [x] `npm run typecheck` → green (empty module compiles)

#### 1.1 Tests First (Domain)
- [x] Write Value Object unit tests → `tests/unit/modules/conference/domain/value-objects/{conference-id,conference-name,conference-slug,conference-status,conference-description,organizer-id,cfp-start-date,cfp-end-date,cfp-status,max-submissions,requires-approval}.test.ts`
- [x] Write `CfpConfig` composite VO tests → `tests/unit/modules/conference/domain/cfp-config.test.ts`
- [x] Write `Conference` aggregate tests (create → `DRAFT`; `publishCfp()` → `CFP_OPEN`; transition guards; `pullDomainEvents()`; `fromData()` purity) → `tests/unit/modules/conference/domain/conference.test.ts`
- [x] Write exception tests (codes + inheritance) → `tests/unit/modules/conference/domain/exceptions/exceptions.test.ts`
- [x] Verify domain tests **FAIL** initially (run `npx vitest run tests/unit/modules/conference/`) — ✅ 14/14 files failed before implementation

#### 1.2 Implement Code (Domain)
- [x] `src/domain/value-objects/`: `conference-id.ts`, `conference-name.ts`, `conference-slug.ts` (slugify + `toCfpUrl`), `conference-status.ts` (transition matrix), `conference-description.ts`, `organizer-id.ts`, `cfp-start-date.ts`, `cfp-end-date.ts`, `cfp-status.ts`, `max-submissions.ts`, `requires-approval.ts`, `cfp-config.ts` (composite; `create()` enforces INV-002, `fromData()`, `isActive()`, `close()`, `isWithinWindow()`)
- [x] `src/domain/events/`: `domain-event.interface.ts`, `conference-created-event.ts`, `cfp-opened-event.ts` (`type` + `timestamp` + `toJSON()`)
- [x] `src/domain/exceptions/`: `conference-name-too-short-error.ts`, `conference-name-too-long-error.ts`, `empty-slug-error.ts`, `slug-exists-error.ts`, `invalid-cfp-start-date-error.ts`, `cfp-start-date-not-in-future-error.ts`, `invalid-cfp-end-date-error.ts`, `cfp-dates-invalid-error.ts`, `max-submissions-invalid-error.ts`, `conference-free-tier-limit-error.ts`, `invalid-conference-status-error.ts`, `invalid-status-transition-error.ts`, `conference-not-found-error.ts`, `invalid-cfp-status-error.ts`
- [x] `src/domain/conference.ts`: aggregate (`ConferenceData` with VOs only, `create(parameters)` records `ConferenceCreatedEvent`, `publishCfp()`, `fromData()`, `pullDomainEvents()`)
- [x] `src/domain/conference-repository.interface.ts`: `findById`, `findBySlug`, `countActiveByOrganizerId`, `save(conference, tx?)` + `TransactionClient` type (D5)
- [x] Verify domain tests **PASS** — ✅ 97/97 (14 files)

#### 1.3 Architecture & Quality Checks (Domain)
- [x] `npm run check:arch packages/modules/conference` → 0 errors (VO conventions, entity factory conventions, event/exception conventions, domain isolation) — ✅ monorepo-wide check green
- [x] `npm run test:architecture` → 0 errors (61/61)
- [x] `npm run lint:fix && npm run typecheck` → 0 errors (9/9 workspaces lint; 17/17 + root tsc clean)
- 🛑 **Checkpoint 1**: ✅ Phase 1 verified — awaiting user confirmation

---

### Phase 2: Application Layer (Inside-Out) — F1 command + F2 query

#### 2.1 Tests First (Application)
- [x] `tests/unit/modules/conference/application/commands/create-conference.test.ts` (mocked repository/outbox, typed `vi.fn<T>` mocks): happy path (VOs → aggregate → `publishCfp` → transactional save + outbox, events `CONFERENCE_CREATED` + `CFP_OPENED`, tx handle received by both), BR-003 ordering (slug before free-tier) + duplicate slug → `SLUG_EXISTS`, BR-004 → `FREE_TIER_LIMIT`, domain error propagation (past date `CFP_START_DATE_NOT_IN_FUTURE`, name `NAME_TOO_SHORT`, dates order + >180d window `CFP_DATES_INVALID`), slug derivation from name, unlimited maxSubmissions, empty description — 11 tests
- [x] `tests/unit/modules/conference/application/queries/get-conference.test.ts` (mocked repository): found → response mapping (API shape), unlimited variant, missing → `ConferenceNotFoundError` (NOT_FOUND), malformed id → `INVALID_CONFERENCE_ID` (drives the D14 `ConferenceId` → `DomainInvariantError` change)
- [x] Verify application tests **FAIL** initially — ✅ both suites failed (module missing)

#### 2.2 Implement Code (Application)
- [x] `src/application/commands/create-conference/`: `create-conference.command.ts` (`CreateConferenceInput` type + `CreateConferenceCommand` DTO, primitives only — slug is derived by the handler from the name, not an input), `create-conference.handler.ts` (BR-003 check → BR-004 check → `Conference.create()` → `publishCfp()` → `transactionRunner.transaction { save(conference, tx) + outbox.saveAll(events, 'Conference', id, tx) }` (ADR-017 via the `TransactionRunner` port) → `CreateConferenceResponse.from(conference)`; structured `logger.info/error`), `create-conference.response.ts` (private ctor, readonly primitives, static `from`, matches `ConferenceApiResponse`; `GetConferenceResponse` re-exports it — DRY)
- [x] `src/application/queries/get-conference/`: `get-conference.query.ts` (`GetConferenceInput` + DTO), `get-conference.handler.ts` (read-only: `ConferenceId.create` defense-in-depth → `findById` → `ConferenceNotFoundError`), `get-conference.response.ts`
- [x] `src/application/transaction-runner.port.ts` (opaque `TransactionRunner` — drizzle `db.transaction` satisfies it structurally; tests inject a fake)
- [x] Additive contract edit (D10): `packages/api-definitions/src/zod/conference.ts` — `.refine(end > start, {message: 'End date must be after start date'})` (rebuild dist)
- [x] Additive shared edit (D6): `packages/shared/database/src/outbox-repository.ts` — backward-compatible optional `tx?: unknown` on `OutboxRepository.saveAll` + `DrizzleOutboxRepository` (writes inside the provided handle; rebuild dist)
- [x] Domain tweak: `ConferenceId.create` now throws `DomainInvariantError(INVALID_CONFERENCE_ID)` instead of a bare `Error` (D14 defense-in-depth)
- [x] Verify application tests **PASS** — ✅ 15/15

#### 2.3 Architecture & Quality Checks (Application)
- [x] `npm run check:arch` → 0 errors (CQRS naming, self-contained handler folders, DTO purity, handler outbox rule, response DTO conventions) — ✅ monorepo-wide check green (re-verified after moving command/query files into their self-contained subfolders)
- [x] `npm run test:architecture` → 0 errors (61/61)
- [x] `npm run lint:fix && npm run typecheck` → 0 errors (9/9 workspaces; 17/17 + root tsc clean)
- [x] Full unit suite green: 215/215 (no regressions)
- 🛑 **Checkpoint 2**: ✅ Phase 2 verified (CQRS files live in self-contained subfolders `commands/create-conference/`, `queries/get-conference/`) — awaiting user confirmation

---

### Phase 3: Infrastructure & Container Wiring

#### 3.1 Tests First (Infrastructure)
- [x] `tests/integration/modules/conference/conference-repository.integration.test.ts` (real PostgreSQL via docker compose): save + `findBySlug` round-trip, `findById` reconstitution (cfp config JSONB → VOs), `countActiveByOrganizerId` (excludes `DELETED`), transactional save visibility — 11 tests, incl. upsert-safety, `fromData` purity (no events on rehydrate), unlimited CfP, unknown id/slug → `null`, tx commit + rollback
- [x] `tests/integration/modules/conference/outbox-pattern.integration.test.ts`: handler-driven transaction persists aggregate + 2 `outbox_messages` rows atomically (rollback on failure) — 4 tests; asserts `save` and `saveAll` receive the **same** tx handle, `PENDING` status + `aggregate_type/id` + `type`/`timestamp` payload, outbox failure rolls back the aggregate row, full write + read journey via `GetConferenceQueryHandler`, unknown-id → `ConferenceNotFoundError`
- [x] Shared fixture helper `tests/integration/modules/conference/utils/test-db.ts` (loads `.env.local` before the shared client reads `DATABASE_URL`, raw client for fixtures, `cleanTables`, `rowCount`)
- [x] Verify integration tests **FAIL** initially — ✅ both suites failed (`Failed to resolve import .../infrastructure/database/conference.repository`)

#### 3.2 Implement Code (Infrastructure)
- [x] `src/infrastructure/database/conference.repository.ts`: `DrizzleConferenceRepository` (row mapping from `conferencesTable`, reconstitution via `Conference.fromData(...)` with VO `fromData()`s, `tx` delegation, id-keyed upsert, `ne(status,'DELETED')` count, `client` injectable for tests)
- [x] `src/container.ts` (full application wiring): `createMediator(deps?)` (Mediator + `LoggingMiddleware` + registers `CreateConferenceCommand` / `GetConferenceQuery`), handler factories `createCreateConferenceHandler(deps?)` / `createGetConferenceHandler(deps?)` with Drizzle defaults (`DrizzleConferenceRepository`, `DrizzleOutboxRepository`, `db` as `TransactionRunner`, `getLogger()`) and `ConferenceHandlerDependencies` overrides for tests
- [x] Controller factories intentionally deferred to Phase 4 with their controllers (D20) — `createCreateConferenceController` stays a documented stub
- [x] Additive-safe JSONB mapping instead of a shared schema edit (D18)
- [x] Verify integration tests **PASS** — ✅ 15/15 (stable across repeated runs after D19)

#### 3.3 Architecture & Quality Checks (Infrastructure)
- [x] `npm run check:arch` → 0 errors (monorepo-wide and scoped `packages/modules/conference`) — repo in infrastructure, `fromData` reconstitution, container wiring
- [x] Mutation-checked the arch rule (renamed every `.fromData(` in the new repository → suite flagged `DrizzleConferenceRepository`, then restored) so the rule genuinely scans the new file
- [x] `npm run test:architecture` → 0 errors (61/61)
- [x] `npm run lint:fix` → 0 errors (9/9 tasks) and `npm run typecheck` → 0 errors (17/17 tasks + root tsc); new files Prettier-clean
- [x] Chore: rebuilt `@sessioflow/bus` `dist/` after a stale `tsconfig.tsbuildinfo` (gitignored artifact, no source change) masked its declarations and broke `@sessioflow/conference#build`
- [x] No regressions: `npx vitest run` → 230/230 (26 files, 215 unit + 15 integration)
- 🛑 **Checkpoint 3**: ✅ Phase 3 verified — reported to user; D19 (shared Vitest config) flagged for approval

---

### Phase 4: Interface Layer, API Routes & Frontend UI — F1 + F2

#### 4.1 Tests First (Interfaces)
- [x] `tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts` (mocked handlers): POST 201 shape, Zod `400 VALIDATION_ERROR`, missing auth `401`, each DomainError → mapped status/body (400/403/409 per error contract), unexpected error rethrow; GET 200 mapping, 404, 400 malformed id — **20 tests**
- [x] Verify interface tests **FAIL** initially — failed with `Failed to resolve import "@sessioflow/conference/interfaces/http/create-conference.controller"` before the controllers existed

#### 4.2 Implement Code (Interfaces + UI)
- [x] `src/interfaces/http/create-conference.controller.ts`: `createConferenceController(request, handler, getAuthUser)` — `import type` handler, `ConferenceCreateSchema.parse`, auth check, `new CreateConferenceCommand(...)`, `DomainError` → `mapDomainErrorToResponse`, rethrow unexpected (framework-agnostic `Request`/`Response`, D21)
- [x] `src/interfaces/http/get-conference.controller.ts`: `getConferenceController(request, handler, getAuthUser)` — id extraction + `ConferenceId` format check, dispatch, error mapping
- [x] `src/interfaces/http/json-response.ts`: shared `{ data }` / envelope helper used by both controllers (D21)
- [x] Container controller factories wired (closes D20): `conferenceContainer.createCreateConferenceController()` / `createGetConferenceController()` resolve mediator-backed handlers + mock auth (D12)
- [x] Thin route delegates: `apps/frontend/src/app/api/v1/conferences/route.ts` (`POST`), `apps/frontend/src/app/api/v1/conferences/[id]/route.ts` (`GET`) — resolve controllers from `conferenceContainer` (ADR-016-01); `src/lib/api-error.ts` safety net returns the `500 INTERNAL_ERROR` envelope (D24)
- [x] Frontend create UI: `apps/frontend/src/app/conferences/create/page.tsx` (thin) + `apps/frontend/src/modules/conference/conference-form.tsx` (labels `Conference Name`/`Description`/`CfP Start Date`/`CfP End Date`, shared Zod schema, live slug `<code>` preview, inline error display from `error.message`, redirect to `/conferences/{id}`) — style constraints per D22/D23
- [x] Frontend dashboard UI: `apps/frontend/src/app/conferences/[id]/page.tsx` (client fetch, name + status, CfP link in `<code>`, 404 state) + `src/lib/api-response.ts` typed envelope reader
- [x] Workspace wiring (additive): `packages/modules/conference/package.json` (+`@sessioflow/api-definitions`, +`@sessioflow/shared-http`), `tsconfig.json` (+2 project references), `package-lock.json` (workspace links only)
- [x] Verify interface tests **PASS** — 20/20 (35/35 with integration files in the same run)

#### 4.3 Architecture & Quality Checks (Interfaces)
- [x] `npm run check:arch` → 0 errors (monorepo; domain-only rule set — see D25)
- [x] `npm run test:architecture` → 61/61 pass (covers the new `interfaces/http/**` controllers; rules confirmed live via mutation checks)
- [x] `npm run lint` → 10/10 tasks clean (`xo` incl. `apps/frontend`); `npm run typecheck` → 18/18 tasks clean; Prettier check clean on every new file (D23)
- [x] Bonus: `npx vitest run` → **250/250** (27 files) and the full E2E suite already green (**5/5**, 13.1s) ahead of Phase 5
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
8. **Deploy-safe**: `git diff` against `main` shows only additive files + the logged additive edits (D6, D10, D19 `vitest.config.ts`, D21 workspace deps/references in `packages/modules/conference/{package.json,tsconfig.json}` + `package-lock.json` workspace links); existing behavior unchanged. Drive-by Prettier reflows observed in 6 pre-existing files were reverted to keep the diff surgical

---

## 📎 Affected Files Manifest

| Phase | Files | Type |
|-------|-------|------|
| 1.0 | `packages/modules/conference/{package.json,tsconfig.json,.gitignore,src/container.ts}` | New (scaffold) |
| 1.2 | `packages/modules/conference/src/domain/**` (1 entity + interface, 12 VOs, 3 events, 13 exceptions) | New |
| 1.1 | `tests/unit/modules/conference/domain/**` (14 test files) | New |
| 2.2 | `packages/modules/conference/src/application/**` (7 files: `transaction-runner.port.ts` + self-contained `commands/create-conference/` and `queries/get-conference/` folders), `packages/api-definitions/src/zod/conference.ts`, `packages/shared/database/src/outbox-repository.ts`, `packages/modules/conference/src/domain/value-objects/conference-id.ts` | New + 2 additive edits + 1 domain tweak (D14) |
| 2.1 | `tests/unit/modules/conference/application/**` (2 test files) | New |
| 3.2 | `packages/modules/conference/src/infrastructure/database/conference.repository.ts`, `src/container.ts` (mediator + handler wiring) | New + update |
| 3.1 | `tests/integration/modules/conference/**` (2 test files + `utils/test-db.ts` fixture helper) | New |
| 3.1 | `vitest.config.ts` — `fileParallelism: false` for DB-shared integration tests (D19) | Additive config edit |
| 4.2 | `packages/modules/conference/src/interfaces/http/**` (2 controllers + `json-response.ts`), `packages/modules/conference/{package.json,tsconfig.json}` (+2 workspace deps / references), `apps/frontend/src/app/api/v1/conferences/{route,[id]/route}.ts`, `apps/frontend/src/app/conferences/{create/page,[id]/page}.tsx`, `apps/frontend/src/modules/conference/conference-form.tsx`, `apps/frontend/src/lib/{api-response,api-error}.ts` | New + additive wiring |
| 4.1 | `tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts` | New |
| 0 / 5 | `tests/e2e/conference-setup.spec.ts` (existing), `journey-01-setup-conference-plan.md` status | Existing / update |
