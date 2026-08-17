# Feature 01: Conference Creation with CfP Configuration - Feature Specification

* **Feature ID:** `F1`
* **Specification File:** `docs/product/bounded-contexts/conference/flows/features/feature-01-conference-creation-with-cfp.md`
* **Parent Flow:** [journey-01-setup-conference.md](../journey-01-setup-conference.md)
* **Bounded Context:** `conference`
* **Status:** 📋 Planned
* **Priority:** High

> **Architecture Reference**: See `AGENTS.md` and `docs/ARCHITECTURE.md` for project folder layout, layer conventions, and verification commands.

---

## 🎯 Overview

**Feature Description:** An authenticated organizer fills a creation form (name, description, CfP start/end dates, optional `maxSubmissions`/`requiresApproval`). The system validates input at the UI, API, and domain layers, enforces business rules (BR-001..BR-004), creates the `Conference` aggregate in `DRAFT`, transitions it to `CFP_OPEN` via `publishCfp()`, and persists the aggregate plus its domain events (`ConferenceCreated`, `CfpOpened`) in a single database transaction through the Transactional Outbox. Success returns `201 Created`; the UI redirects to the conference dashboard (Feature F2).

**User Value:** The organizer can go from zero to a live, shareable CfP submission window in one step — the foundational MVP capability of SessioFlow.

**Flow Step:** Journey 01 steps 1–16 (form fill → client validation → `POST /api/v1/conferences` → server validation → BR checks → aggregate creation → `publishCfp()` → transactional persistence → `201`).

**Executable Contract:** `tests/e2e/conference-setup.spec.ts` (already in the repository — it is the North Star; this feature must make all its creation scenarios pass).

---

## 📋 Requirements

### Functional Requirements
- [ ] **F1-R1** `POST /api/v1/conferences` accepts the `ConferenceCreateSchema` payload (`@sessioflow/api-definitions/zod/conference`) and returns `201` with the created conference data on success.
- [ ] **F1-R2** Name validation (BR-002): 3–100 characters after trim; invalid names rejected with `400` + specific message.
- [ ] **F1-R3** CfP date validation (BR-001, INV-002): start date must be today or future; end date must be after start date; violations rejected with `400` + specific messages.
- [ ] **F1-R4** Slug generation & uniqueness (BR-003, INV-003): slug derived from the name (lowercase, hyphenated, ≤ 100 chars); if the slug already exists, reject with `409 Conflict` + "Conference slug already exists".
- [ ] **F1-R5** Free tier limit (BR-004): organizers default to FREE tier; if they already have ≥ 5 active conferences (`status != 'DELETED'`), reject with `403` + upgrade prompt message.
- [ ] **F1-R6** Aggregate lifecycle: `Conference.create()` → `DRAFT`, then `Conference.publishCfp()` → `CFP_OPEN` (INV-001 state machine); `CfpConfig` created with `ACTIVE` status.
- [ ] **F1-R7** Domain events `ConferenceCreated` and `CfpOpened` are recorded on the aggregate and persisted to `outbox_messages` (status `PENDING`) atomically with the aggregate (single DB transaction, ADR-017).
- [ ] **F1-R8** UI: `/conferences/create` form with labels `Conference Name`, `Description`, `CfP Start Date`, `CfP End Date`, live slug preview, client-side Zod validation, inline server error display, and redirect to `/conferences/{id}` on success.
- [ ] **F1-R9** Error contract: all domain failures return the standard `{ "error": { code, message } }` shape with the HTTP status from `@sessioflow/shared-http/error-mapper` (see table below).

### Non-Functional Requirements
- [ ] **Security:** organizer identity resolved via `getAuthUser()` (mocked `mock-user-id` for Wave 1 — no auth-strategy change).
- [ ] **Architecture:** strict DDD layer boundaries per `docs/ARCHITECTURE-RULES.md` (domain purity, CQRS co-located folders, controller factory DI per ADR-016-01, transaction in application layer per ADR-017).
- [ ] **Architecture Tests:** `npm run check:arch` and `tests/unit/architecture/*` pass with 0 violations (VO conventions, entity factory conventions, CQRS naming, response DTO purity, container/Mediator rules).
- [ ] **Deploy-Safety (additive only):** no new npm runtime dependencies; no DB schema/migration changes (tables `conferences` + `outbox_messages` already migrated); no modifications to existing routes/pages (`/`, `/dashboard`, `auth/me`); shared-package edits limited to backward-compatible optional parameters.
- [ ] **Performance:** single write path (1 insert + outbox insert) in one transaction; no N+1 queries.

### HTTP Error Contract (E2E-visible messages)

| Condition | Domain Exception | Error Code | HTTP | User-visible message |
|-----------|------------------|------------|------|----------------------|
| CfP end date ≤ start date | `CfpDatesInvalidError` | `CFP_DATES_INVALID` | 400 | `End date must be after start date` |
| CfP start date before today | `CfpStartDateNotInFutureError` | `CFP_START_DATE_NOT_IN_FUTURE` | 400 | `CfpStartDate must be in the future or today` |
| Unparseable start date | `InvalidCfpStartDateError` | `INVALID_CFP_START_DATE` | 400 | `CfpStartDate is not a valid date` |
| Unparseable end date | `InvalidCfpEndDateError` | `INVALID_CFP_END_DATE` | 400 | `CfpEndDate is not a valid date` |
| Name < 3 chars (trimmed) | `ConferenceNameTooShortError` | `NAME_TOO_SHORT` | 400 | `Conference name must be at least 3 characters` |
| Name > 100 chars (trimmed) | `ConferenceNameTooLongError` | `NAME_TOO_LONG` | 400 | `Conference name cannot exceed 100 characters` |
| Name not slug-able | `EmptySlugError` | `EMPTY_SLUG` | 400 | `Conference name must contain at least one letter or number` |
| Duplicate slug | `SlugExistsError` (extends `DomainConflictError`) | `SLUG_EXISTS` | 409 | `Conference slug already exists` |
| Free tier limit reached | `ConferenceFreeTierLimitError` (extends `DomainForbiddenError`) | `FREE_TIER_LIMIT` | 403 | `Free tier limit reached. Please upgrade your plan.` |
| Invalid `maxSubmissions` | `MaxSubmissionsInvalidError` | `MAX_SUBMISSIONS_INVALID` | 400 | `Max submissions must be a positive integer` |
| Invalid status transition | `InvalidStatusTransitionError` | `STATE_TRANSITION_INVALID` | 400 | `Invalid status transition from {from} to {to}` |
| Malformed request body (Zod) | — (controller-level `ZodError`) | `VALIDATION_ERROR` | 400 | first Zod issue message |
| Unauthenticated | — (controller-level) | `UNAUTHORIZED` | 401 | `Authentication required` |

All codes above already exist in the `@sessioflow/shared-http/error-mapper` switch — **no shared-http changes required**.

---

## 🧠 Agent Design Decisions & Assumptions (Lack of Information Log)

| # | Topic / Area | Documentation State / Gap | Decision / Judgment Made | Status |
|---|--------------|---------------------------|--------------------------|--------|
| D1 | Slug collision policy | Conflict: BR-003 doc says "append numeric suffix, retry up to 3"; the flow doc error path and the executable E2E contract expect a `409` + "Conference slug already exists" | Hard-fail with `SlugExistsError` (409), **no auto-suffixing** — the E2E contract (executable acceptance criteria) wins | 📋 Proposed |
| D2 | Error transport (`Result` vs exceptions) | `ARCHITECTURE-RULES.md` templates reference a `Result` type from `@sessioflow/shared-domain`, but that package only exports exceptions | Domain VOs/entities **throw** `DomainError` subclasses; handlers are pure (no try/catch) and return response DTOs; controllers translate via `mapDomainErrorToResponse` (per AGENTS.md Error Handling section) | 📋 Proposed |
| D3 | CfP start date boundary | VO doc says "must be in the future"; flow doc says `>= today`; E2E message says "in the future **or today**" | Start date may be **today** (`startDate >= today`), matching flow doc + E2E message | 📋 Proposed |
| D4 | Max duration caps | VO docs list caps (start ≤ +365d; end ≤ start+180d) as hard rules; flow doc treats the 180-day window as a soft warning | Enforce **both caps as hard domain validation** (400) — MVP simplification; E2E windows are ≤ 60 days so no contract impact | 📋 Proposed |
| D5 | Transaction boundary | ADR-017 mandates the transaction at the application layer, but domain repository interfaces cannot reference Drizzle types | `ConferenceRepository.save(conference, tx?)` and shared `OutboxRepository.saveAll(events, type, id, tx?)` accept an opaque `TransactionClient` (type = `unknown`) defined in the domain interface; the handler wraps both calls in `db.transaction` | 📋 Proposed |
| D6 | Shared package edit | Shared `DrizzleOutboxRepository.saveAll` has no transaction parameter | Add a **backward-compatible optional `tx?: unknown`** parameter (existing callers unaffected) — the only shared-package change in this flow | 📋 Proposed |
| D7 | Welcome email / Outbox worker | Flow doc shows an async Resend welcome email; ADR-011-01 makes email optional | **Out of scope:** persist outbox events with `PENDING` status; no worker/email in this flow (deploy-safe, zero new infrastructure) | 📋 Proposed |
| D8 | `logoUrl` field | Flow doc request body includes optional `logoUrl`; current `ConferenceCreateSchema` and `conferences` table have no logo field | **Excluded** — follow the existing api-definitions contract and DB schema (no schema change → deploy-safe) | 📋 Proposed |
| D9 | `cfpUrl` in API response | Flow doc 201 body includes `cfpUrl`; current `ConferenceApiResponse` type has no `cfpUrl` field | Server returns `ConferenceApiResponse` as-is; the **frontend derives** the CfP link as `/cfp/{slug}` (E2E only asserts the slug appears in a `<code>` element) | 📋 Proposed |
| D10 | Client/server validation split | Flow doc shows client + server Zod | Client and server **share** `ConferenceCreateSchema` (single source, ADR-020); a date-order refinement (`End date must be after start date`) is added to the shared schema (additive); domain VOs re-validate as the final authority (defense in depth, BR-001/BR-002) | 📋 Proposed |
| D11 | Free tier definition | BR-004: no billing module in Wave 1 | All organizers default to `FREE`; "active" = `status != 'DELETED'`; limit constant `FREE_TIER_LIMIT = 5`; check runs **before** aggregate creation via `countActiveByOrganizerId` | 📋 Proposed |
| D12 | Mocked auth | Flow doc assumes real auth; repo currently mocks auth everywhere (`auth/me` returns `mock-user-id`) | `getAuthUser()` factory defaults to `async () => ({ id: 'mock-user-id' })` (matches E2E setup/cleanup); no auth strategy change | 📋 Proposed |
| D13 | Module `DomainEvent` type | `ARCHITECTURE-RULES.md` imports `DomainEvent` from `@sessioflow/shared-domain`, which doesn't export it | Define `DomainEvent` interface locally at `domain/events/domain-event.interface.ts` (module-local, per the template's alternative import path) | 📋 Proposed |

---

## 🏗️ Domain Model

### Entities Affected
| Entity | Role | Changes |
|--------|------|---------|
| `Conference` | Aggregate Root | **Create** — new aggregate with `create()`, `publishCfp()`, `fromData()`, `pullDomainEvents()` |

### Value Objects (all new, in `domain/value-objects/`)
| Value Object | Validation rules |
|--------------|------------------|
| `ConferenceId` | UUIDv4 format; `create()` validates, `fromData()` reconstitutes |
| `ConferenceName` | Trimmed; 3–100 chars; `contains()` helper |
| `ConferenceSlug` | Lowercase alphanumerics + hyphens only; ≤ 100 chars; generated from name (slugify: lowercase → spaces/specials → hyphens → collapse → trim edges); `toCfpUrl(basePath)` |
| `ConferenceStatus` | Enum `DRAFT / CFP_OPEN / CFP_CLOSED / REVIEWING / SCHEDULED / PUBLISHED / COMPLETED / DELETED`; `canTransitionTo()` per the entity state machine |
| `CfpStartDate` | Valid `Date`; `create()`: `>= today` and `<= today + 365d`; `fromData()` bypasses time-relative checks |
| `CfpEndDate` | Valid `Date`; `create()`: `<= start + 180d` (order with start enforced by `CfpConfig`); `fromData()` bypasses time-relative checks |
| `CfpStatus` | Enum `ACTIVE / CLOSED / ARCHIVED`; `canTransitionTo()` |
| `MaxSubmissions` | Optional; positive integer ≤ 10,000; `null` = unlimited; `canAccept(count)`, `remaining(count)` |
| `RequiresApproval` | Boolean wrapper |
| `OrganizerId` | Non-empty string (auth user id) |
| `ConferenceDescription` | ≤ 1,000 chars; empty string allowed (default) |
| `CfpConfig` (composite VO) | `startDate`, `endDate`, `maxSubmissions?`, `requiresApproval`, `status`; `create()` enforces `endDate > startDate` (throws `CfpDatesInvalidError`) and initializes `status = ACTIVE`; `fromData()` reconstitutes; `isActive()`, `close()`, `isWithinWindow(date)` |

### Domain Events (in `domain/events/`)
| Event | Triggered by | Payload (via `toJSON()`) |
|-------|--------------|--------------------------|
| `ConferenceCreatedEvent` | `Conference.create()` | `{ type: 'CONFERENCE_CREATED', aggregateId, name, slug, organizerId, timestamp }` |
| `CfpOpenedEvent` | `Conference.publishCfp()` | `{ type: 'CFP_OPENED', aggregateId, startDate, endDate, timestamp }` |

### Domain Exceptions (in `domain/exceptions/`)
`ConferenceNameTooShortError`, `ConferenceNameTooLongError`, `EmptySlugError`, `SlugExistsError` (conflict), `InvalidCfpStartDateError`, `CfpStartDateNotInFutureError`, `InvalidCfpEndDateError`, `CfpDatesInvalidError`, `MaxSubmissionsInvalidError`, `ConferenceFreeTierLimitError` (forbidden), `InvalidConferenceStatusError`, `InvalidStatusTransitionError`, `ConferenceNotFoundError` (F2, 404).

---

## 📦 Implementation Scope by Layer

- **Module scaffold (new package `@sessioflow/conference`)**: `packages/modules/conference/{package.json, tsconfig.json, .gitignore}` via the `create-module` skill (root `tsconfig.json` and `vitest.config.ts` already alias `@sessioflow/conference`).
- **Contracts / Schemas (`packages/api-definitions`)**: additive edit to `src/zod/conference.ts` — add `.refine(end > start, { message: 'End date must be after start date' })` to `ConferenceCreateSchema`. Existing `ConferenceCreateInput` type reused unchanged.
- **Domain Layer (`packages/modules/conference/src/domain/`)**: `conference.ts` (aggregate), `conference-repository.interface.ts` (+ `TransactionClient` type), 12 value objects, `events/` (interface + 2 events), 13 exceptions.
- **Application Layer (`src/application/commands/create-conference/`)**: co-located `create-conference.command.ts` (DTO + `CreateConferenceInput` type), `create-conference.handler.ts` (BR-003/004 checks → domain creation → `publishCfp()` → transactional save + outbox), `create-conference.response.ts` (`CreateConferenceResponse.from(entity)`, primitives only, matches `ConferenceApiResponse`).
- **Infrastructure Layer (`src/infrastructure/database/`)**: `DrizzleConferenceRepository` — `findBySlug`, `countActiveByOrganizerId`, `save` (insert row built from entity getters; reconstitution via `Conference.fromData`), using the existing `conferencesTable` from `@sessioflow/shared-database/schema`.
- **Shared (additive)**: `packages/shared/database/src/outbox-repository.ts` — optional `tx?: unknown` parameter on `saveAll` (D5/D6).
- **Container (`src/container.ts`)**: `conferenceContainer` with `createMediator()` (Mediator + LoggingMiddleware + command/query registration, ADR-016-01), handler factories, and `createCreateConferenceController(getAuthUser?)` controller factory.
- **Interface Layer (`src/interfaces/http/`)**: `createConferenceController(request, handler, getAuthUser)` — Zod parse (api-definitions), auth check, `new CreateConferenceCommand(...)`, `handler.execute(...)`, `DomainError` → `mapDomainErrorToResponse`, unexpected errors rethrown.
- **API Route (`apps/frontend/src/app/api/v1/conferences/route.ts`)**: thin 2-line `POST` delegate resolving the controller from `conferenceContainer` (ADR-016-01).
- **Frontend UI (`apps/frontend/src/`)**: `app/conferences/create/page.tsx` (thin) + `modules/conference/conference-form.tsx` (client component: labels per E2E, shared Zod schema, live slug preview `<code>`, inline error banner, success redirect).
- **Database**: **none** — migrations `0000`/`0001` already define `conferences` + `outbox_messages`.

### Test Scope
| Type | Location | Scope |
|------|----------|-------|
| Unit (domain) | `tests/unit/modules/conference/domain/...` | Per-VO tests, `CfpConfig` composite, `Conference` aggregate (state machine, events), exceptions |
| Unit (application) | `tests/unit/modules/conference/application/commands/create-conference.test.ts` | Handler with mocked repository/outbox: happy path, BR-003/004, domain error propagation, transaction invocation |
| Interface | `tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts` | Controller with mocked handler: 201 shape, Zod 400, 401, each DomainError mapping |
| Integration | `tests/integration/modules/conference/...` | `DrizzleConferenceRepository` against real PostgreSQL (docker compose); outbox persistence inside transaction |
| E2E | `tests/e2e/conference-setup.spec.ts` | **Existing** — creation scenarios (happy path, invalid dates, duplicate slug, free tier, past date) |

---

## 🧪 TDD Execution Checklist

Follow the 4-step cycle: **1. First Test → 2. After Code → 3. After Architecture Tests → 4. Linter & Types**

- [ ] **0. Scaffold**: create `@sessioflow/conference` package (create-module skill), `npm install`, typecheck green
- [ ] **1. Test First (Domain)**: write VO / aggregate / event / exception unit tests (Expect FAIL)
- [ ] **2. Implement Code (Domain)**: implement VOs, `Conference`, events, exceptions, repository interface (Expect PASS)
- [ ] **3. Architecture Check**: `npm run check:arch packages/modules/conference` + `npm run test:architecture` (0 errors)
- [ ] **4. Test First (Application)**: write `CreateConferenceHandler` tests with mocks (Expect FAIL)
- [ ] **5. Implement Code (Application)**: command DTO, handler, response DTO + shared outbox `tx` parameter (Expect PASS)
- [ ] **6. Architecture Check**: `npm run check:arch` (0 errors)
- [ ] **7. Infrastructure & Container**: repository implementation + integration tests (real DB); container wiring
- [ ] **8. Interface Tests + Code**: controller tests (mocked handler), controller + route handler
- [ ] **9. Frontend UI**: create page + form (driven by the E2E contract)
- [ ] **10. Linter & Types**: `npm run lint:fix` + `npm run typecheck` (0 errors)

---

## ✅ Acceptance Criteria

**Scenario 1: Happy Path (E2E test 1)**
- **Given** the organizer is on `/conferences/create` with a clean database
- **When** they enter name `Tech Conference {ts}`, a description, start = +1d, end = +30d and submit
- **Then** the live slug preview shows `tech-conference-{ts}` in a `<code>` element
- **And** `POST /api/v1/conferences` returns `201` with `status: 'CFP_OPEN'` and `cfp: { isOpen: true }`
- **And** a `conferences` row exists with slug `tech-conference-{ts}` and cfp config JSONB
- **And** two `outbox_messages` rows exist (`CONFERENCE_CREATED`, `CFP_OPENED`, status `PENDING`)
- **And** the browser is redirected to `/conferences/{uuid}`

**Scenario 2: Minimal Setup (flow doc Scenario 2)**
- **Given** only name + dates are provided
- **When** submitted
- **Then** description defaults to `''`, `requiresApproval` defaults to `true`, `maxSubmissions` is `undefined` (unlimited)

**Scenario 3: Invalid CfP dates (E2E test 2)**
- **Given** end date is before start date
- **When** submitted
- **Then** inline error `End date must be after start date` is shown; nothing is persisted

**Scenario 4: Duplicate slug (E2E test 3)**
- **Given** a conference with slug `duplicate-slug-test-conference` exists
- **When** a second conference with the same name is created
- **Then** `409` + `Conference slug already exists`; no new row

**Scenario 5: Free tier limit (E2E test 4)**
- **Given** the organizer has 5 active conferences
- **When** they create a 6th
- **Then** `403` + message containing `upgrade your plan`; no new row

**Scenario 6: Past start date (E2E test 5)**
- **Given** `cfpStartDate` = `2020-01-01`
- **When** submitted
- **Then** `400` + `CfpStartDate must be in the future or today`; no new row

---

## 📊 Progress Tracking

| Layer | Status | Notes |
|-------|--------|-------|
| Module scaffold | 📋 | Package created, typecheck green |
| Domain Models & Tests | 📋 | VO/entity invariants enforced; arch rules pass |
| Application Handlers | 📋 | CQRS command + BR-003/004 + transactional outbox |
| Infrastructure & Wiring | 📋 | Drizzle repository + container (Mediator) |
| Interface & Routes | 📋 | Controller + thin route delegate |
| Frontend UI | 📋 | Create form per E2E contract |
| Lint & Typecheck | 📋 | 0 errors |
