# Feature 02: Conference Dashboard with CfP Link - Feature Specification

* **Feature ID:** `F2`
* **Specification File:** `docs/product/bounded-contexts/conference/flows/features/feature-02-conference-dashboard-cfp-link.md`
* **Parent Flow:** [journey-01-setup-conference.md](../journey-01-setup-conference.md)
* **Bounded Context:** `conference`
* **Status:** 📋 Planned
* **Priority:** High
* **Depends On:** [Feature F1](./feature-01-conference-creation-with-cfp.md) (conference must exist in `CFP_OPEN` state)

> **Architecture Reference**: See `AGENTS.md` and `docs/ARCHITECTURE.md` for project folder layout, layer conventions, and verification commands.

---

## 🎯 Overview

**Feature Description:** After creation, the organizer lands on their conference dashboard (`/conferences/{id}`). The page loads the conference via `GET /api/v1/conferences/{id}` (CQRS query path) and displays the conference details — name, status, and a **shareable CfP link** (`/cfp/{slug}`) rendered in a `<code>` element. This is the redirect target of Feature F1 and the end state of Journey 01 (steps 16–17).

**User Value:** The organizer immediately sees proof the setup succeeded and gets the exact link to share with potential speakers.

**Flow Step:** Journey 01 steps 16–17 (`201` → redirect → dashboard with pre-populated CfP link).

**Executable Contract:** `tests/e2e/conference-setup.spec.ts` — happy-path assertions after submission: URL matches `/conferences/{uuid}` and a `<code>` element containing the slug is visible.

---

## 📋 Requirements

### Functional Requirements
- [ ] **F2-R1** `GET /api/v1/conferences/{id}` returns `200` with the conference data (`ConferenceApiResponse` shape: `id`, `name`, `description`, `slug`, `status`, `organizerId`, `cfp: { isOpen, startDate, endDate, maxSubmissions?, requiresApproval }`, `createdAt`, `updatedAt`) wrapped in `{ "data": ... }`.
- [ ] **F2-R2** Unknown or malformed conference id → `404` `NOT_FOUND` (`ConferenceNotFoundError`, extends `EntityNotFoundError`); malformed UUID → `400` `INVALID_CONFERENCE_ID`.
- [ ] **F2-R3** Query path is read-only CQRS: `GetConferenceQuery` DTO + `GetConferenceHandler` (no `save`/`delete` calls) + `GetConferenceResponse` (private constructor, readonly primitives, single static `from(entity)`).
- [ ] **F2-R4** UI: `/conferences/{id}` page fetches the conference client-side, shows name + status, and renders the CfP link containing the slug inside a `<code>` element (e.g. `https://<base>/cfp/{slug}` or `/cfp/{slug}`).
- [ ] **F2-R5** Error contract: `404` for missing conference; `400` for malformed id — both using the standard `{ "error": { code, message } }` shape via `mapDomainErrorToResponse`.

### Non-Functional Requirements
- [ ] **Architecture:** layer boundaries per `docs/ARCHITECTURE-RULES.md`; `npm run check:arch` + architecture test suite pass with 0 violations.
- [ ] **Deploy-Safety (additive only):** no new routes in `apps/backend`; no DB changes; no new npm dependencies; no edits to existing pages; the dashboard page is a new route that 404s cleanly if the id doesn't exist (no impact on `/` or `/dashboard`).
- [ ] **Performance:** single indexed lookup (`conferences.pkey`); no joins.

---

## 🧠 Agent Design Decisions & Assumptions (Lack of Information Log)

| # | Topic / Area | Documentation State / Gap | Decision / Judgment Made | Status |
|---|--------------|---------------------------|--------------------------|--------|
| D1 | Id validation layering | Docs don't specify where UUID format is validated | Controller validates format with `ConferenceId.create()` **before** dispatch (`400 INVALID_CONFERENCE_ID`); handler re-validates defensively; repository `findById` returns `null` for unknown ids → `ConferenceNotFoundError` (`404`) | 📋 Proposed |
| D2 | Dashboard data fetching strategy | Docs don't specify RSC vs client fetching; E2E architecture serves everything through one Next.js dev server | Dashboard page is a **client component** fetching `/api/v1/conferences/{id}` in the browser (simplest under the single-server E2E architecture; no server-side data-access wiring) | 📋 Proposed |
| D3 | CfP link base URL | Flow doc shows `https://sessioflow.app/cfp/{slug}`; no base-URL env exists in the repo yet | Frontend renders a **relative** link `/cfp/{slug}` (E2E asserts only that the slug text appears in a `<code>` element); full absolute URL can be introduced later via an env var without API changes (see F1 decision D9) | 📋 Proposed |
| D4 | Scope of dashboard content | Flow doc only requires the CfP link at this stage | Minimal dashboard: name, status badge, CfP link. No sessions/submissions UI (out of flow scope) | 📋 Proposed |

---

## 🏗️ Domain Model

### Entities Affected
| Entity | Role | Changes |
|--------|------|---------|
| `Conference` | Aggregate Root | **Read** — reconstituted via `Conference.fromData()` in the repository (created in F1) |

### Value Objects
- Reuses all F1 value objects; adds no new ones.
- `ConferenceNotFoundError` (F1 exception file set) is exercised here.

### Domain Events
- None published (read-only path).

---

## 📦 Implementation Scope by Layer

- **Application Layer (`src/application/queries/get-conference/`)**: co-located `get-conference.query.ts` (`GetConferenceInput` type + `GetConferenceQuery`), `get-conference.handler.ts` (`GetConferenceHandler.execute(query)` — `findById` → throw `ConferenceNotFoundError` → map response), `get-conference.response.ts` (`GetConferenceResponse.from(entity)`).
- **Infrastructure Layer**: `DrizzleConferenceRepository.findById` (F1 file — completes the repository interface).
- **Container**: register `GetConferenceQuery` on the query bus; `createGetConferenceController(getAuthUser?)` factory.
- **Interface Layer (`src/interfaces/http/`)**: `getConferenceController(request, handler, getAuthUser)` — parse id param, `ConferenceId` format check, dispatch, error mapping.
- **API Route (`apps/frontend/src/app/api/v1/conferences/[id]/route.ts`)**: thin 2-line `GET` delegate via `conferenceContainer`.
- **Frontend UI (`apps/frontend/src/app/conferences/[id]/page.tsx`)**: client component — load state, 404 state, success state with name/status/CfP link (`<code>`).
- **Database**: none (existing `conferences` table, primary-key lookup).

### Test Scope
| Type | Location | Scope |
|------|----------|-------|
| Unit (application) | `tests/unit/modules/conference/application/queries/get-conference.test.ts` | Handler: 200 mapping, 404 on missing, response shape |
| Interface | `tests/backend/modules/conference/interfaces/api/v1/conferences/conferences.test.ts` (extended) | Controller: 200, 404, 400 malformed id |
| Integration | `tests/integration/modules/conference/conference-repository.integration.test.ts` (extended) | `findById` reconstitution round-trip vs real PostgreSQL |
| E2E | `tests/e2e/conference-setup.spec.ts` | **Existing** — redirect + slug-in-`<code>` assertions (happy path) |

---

## 🧪 TDD Execution Checklist

Follow the 4-step cycle: **1. First Test → 2. After Code → 3. After Architecture Tests → 4. Linter & Types**

- [ ] **1. Test First (Application)**: `GetConferenceHandler` unit tests with mocked repository (Expect FAIL)
- [ ] **2. Implement Code (Application)**: query DTO, handler, response DTO (Expect PASS)
- [ ] **3. Architecture Check**: `npm run check:arch packages/modules/conference` (0 errors)
- [ ] **4. Integration**: `findById` round-trip test against real DB (Expect FAIL → implement → PASS)
- [ ] **5. Test First (Interface)**: controller tests for 200/404/400 (Expect FAIL)
- [ ] **6. Implement Code (Interface)**: `getConferenceController` + route delegate + container query wiring (Expect PASS)
- [ ] **7. Architecture Check**: `npm run check:arch` (0 errors)
- [ ] **8. Frontend UI**: `/conferences/[id]` dashboard page
- [ ] **9. Linter & Types**: `npm run lint:fix` + `npm run typecheck` (0 errors)

---

## ✅ Acceptance Criteria

**Scenario 1: Dashboard after creation (E2E happy path)**
- **Given** a conference `tech-conference-{ts}` was just created (F1)
- **When** the browser is redirected to `/conferences/{uuid}`
- **Then** the page shows the conference name and `CFP_OPEN` status
- **And** a `<code>` element containing `tech-conference-{ts}` (the CfP link) is visible

**Scenario 2: Existing conference by id**
- **Given** a conference with id `{uuid}` exists
- **When** `GET /api/v1/conferences/{uuid}`
- **Then** `200` with `{ "data": { id, name, slug, status: 'CFP_OPEN', cfp: { isOpen: true, ... }, ... } }`

**Scenario 3: Missing conference**
- **Given** no conference with the given id
- **When** `GET /api/v1/conferences/{uuid}`
- **Then** `404` + `{ error: { code: 'NOT_FOUND', message: ... } }`

**Scenario 4: Malformed id**
- **Given** a non-UUID path parameter (e.g. `abc123`)
- **When** `GET /api/v1/conferences/abc123`
- **Then** `400` + `INVALID_CONFERENCE_ID`

---

## 📊 Progress Tracking

| Layer | Status | Notes |
|-------|--------|-------|
| Application Query | 📋 | Read-only CQRS handler + response |
| Integration (repo `findById`) | 📋 | Reconstitution round-trip vs real DB |
| Interface & Route | 📋 | Controller + thin GET delegate |
| Frontend Dashboard | 📋 | CfP link per E2E contract |
| Lint & Typecheck | 📋 | 0 errors |
