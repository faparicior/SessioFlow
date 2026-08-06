# 009-01-Accept-Monorepo-With-Backend-Frontend-Separation-For-Stack-Independence

* **Status:** ❌ **Superseded by [ADR-023](023-comprehensive-monorepo-structure-update.md)**
* **Date:** 2026-06-25
* **Decision Makers:** Technical Lead, Product Team
* **Superseded By:** [ADR-023](023-comprehensive-monorepo-structure-update.md)
* **Supersedes:** None
* **Amends:** ADR-009 (Domain-Driven Design Structure)
* **Related:** ADR-002-01 (Supabase DDD Abstraction), ADR-001 (Next.js Frontend), ADR-015 (CQRS Pattern)

## Context and Problem Statement

SessioFlow currently uses a single `src/` directory where all layers (Domain, Application, Infrastructure, Interface) are colocated with modules. While this works for a unified Next.js stack, the **product vision considers the possibility of moving the backend to a different stack** (Go, Kotlin, Python) in the future without rewriting the frontend.

**Current Structure:**
```
src/
├── modules/
│   ├── conference/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   │       ├── api/      (API routes)
│   │       └── web/      (Next.js components)
│   └── ...
```

**Problem:**
1. Frontend (`interfaces/web/`) is tangled with backend modules
2. Changing backend stack requires moving frontend code too
3. CI/CD cannot deploy frontend and backend independently
4. Violates the principle of **explicit boundaries** for truly independent deployables

**Decision Drivers:**
- Must support **Swappable Backend Stack** (Go/Kotlin/Node) without touching frontend
- Must maintain **DDD purity** (Domain/API contracts only in backend)
- Must enable **independent deployment** of frontend and backend
- Must minimize **migration cost** if stack change occurs
- Must not contradict **ADR-009** DDD principles

## Considered Options

1. **Monorepo with `apps/frontend/` and `apps/backend/` (Recommended)**
2. **Single `src/` with backend tags**
3. **Completely separate repos**
4. **Keep current structure, accept coupling**

## Decision Outcome

**Chosen Option:** "Monorepo with `apps/frontend/` and `apps/backend/`"

**Rationale:**
This structure maintains all DDD benefits while enabling true stack independence.

### Project Structure

```
sessioflow/
├── apps/
│   ├── backend/                  # Backend service (Node → swappable to Go/Kotlin)
│   │   ├── package.json
│   │   └── src/
│   │       ├── main.ts           # Entry point
│   │       └── modules/
│   │           ├── conference/
│   │           │   ├── domain/           ✅ Business logic (unchanged)
│   │           │   ├── application/      ✅ Service layer (unchanged)
│   │           │   ├── infrastructure/   ✅ DB adapters (Swappable)
│   │           │   └── interfaces/
│   │           │       └── api/          🌐 API CONTRACTS (Backend-specific)
│   │           │           └── v1/
│   │           │               ├── get.ts        (Next.js API route handler)
│   │           │               └── create.ts     (Next.js API route handler)
│   │           └── submission/   (other domains)
│   │
│   └── frontend/                 # Next.js frontend (React)
│       ├── package.json
│       └── src/
│           ├── app/                (Next.js pages, client components)
│           ├── components/        (Shared UI)
│           ├── hooks/             (Frontend hooks)
│           └── types/             (Frontend-specific types)
│           └── modules/
│               └── conference/
│                   └── interfaces/
│                       └── web/    ✅ React components only
│                           └── ConferenceForm.tsx
│
└── packages/                     # Shared utilities (NOT API contracts)
    └── utils/                    (String, Date, Validation helpers)
```

### Key Separation Points

| Component | Location | Backend Stack Independence |
|-----------|----------|---------------------------|
| **Domain** | `apps/backend/src/modules/<context>/domain/` | ✅ Backend-only (immutable core) |
| **Application** | `apps/backend/src/modules/<context>/application/` | ✅ Backend-only |
| **Infrastructure** | `apps/backend/src/modules/<context>/infrastructure/` | ✅ Backend-only (swappable) |
| **API Contracts** | `apps/backend/src/modules/<context>/interfaces/api/` | 🔄 Backend-specific (cannot be changed without API versioning) |
| **Frontend UI** | `apps/frontend/src/modules/<context>/interfaces/web/` | ✅ Frontend-only |

### What Changes When Backend Stack Changes

**Initial State (Node Backend):**
```
GET /api/v1/conferences/:id
├── Next.js API route → handleGetConference() 
└── handleGetConference() → GetConferenceHandler()
    └── GetConferenceHandler() → Repository (Node implementation)
```

**After Switch to Go Backend:**
```
GET /api/v1/conferences/:id
├── Go HTTP handler → QueryHandler()
└── QueryHandler() → Repository (Go implementation)
```

**Frontend (Unchanged):**
```typescript
// apps/frontend/src/...
const response = await fetch('/api/v1/conferences/:id');
const data = await response.json();
```

**Result:** Frontend works **without any code changes** because it only consumes the API contract.

## Advertising ADR-009 (DOMAIN STRUCTURE)

This amendment updates ADR-009 to clarify that:

1. **Domain, Application, Infrastructure layers are backend-only**
2. **Interfaces layer is split**:
   - `interfaces/api/` → Backend only (contains API handlers and schemas)
   - `interfaces/web/` → Frontend only (contains React components)
3. **Module organization**: Each Bounded Context (e.g., `conference/`) contains all 4 layers for **cohesion**, but these modules live in the **backend app** only.

### Corrected DDD Structure for Stack Independence

```
apps/backend/src/modules/
├── conference/           ← Bounded Context
│   ├── domain/           ← Business logic (ConfEntity, ConfName VO, etc.)
│   ├── application/      ← Use cases (CreateConferenceCommand, GetConferenceHandler)
│   ├── infrastructure/   ← DB adapters (ConfRepoPostgreSQL, ConfRepoOracle)
│   └── interfaces/       ← Transport layer
│       └── api/          ← API handlers (Next.js routes → Go handlers)
│
└── submission/           ← Another Bounded Context
    ├── domain/
    ├── application/
    └── forms/
```

## Consequences

### Positive

* ✅ **True stack independence**: Backend can be replaced (Node → Go/Kotlin) with 8-14 hours of work (per ADR-002-01)
* ✅ **Independent deployment**: Frontend and backend have separate CI/CD pipelines
* ✅ **Clear ownership**: Frontend team never touches backend code, vice versa
* ✅ **Better tooling**: Each app has its own `package.json` (or `go.mod`) for dependency management
* ✅ **Maintains DDD purity**: Domain logic remains isolated from transport layer
* ✅ **No breaking changes to existing patterns**: DDD boundaries preserved, just reorganized

### Negative

* 🔧 **Initial migration effort**: Move `interfaces/web/` to frontend, `interfaces/api/` stay in backend (~8-12 hours)
* 📦 **More workspaces**: CI/CD must handle multiple apps
* 📝 **Import paths change**: All imports must be updated (absolute imports adapt to new root)

### Risks

* ⚠️ **Import misconfigurations**: Frontend accidentally importing from backend (prevent with lint rules)
* ⚠️ **API contract drift**: Backend changes API without versioning (mitigate with versioned routes)
* ⚠️ **Duplicate utilities**: If not in `packages/utils/`, frontend and backend may duplicate code

## Implementation Plan

### Phase 1: Setup (Day 1)

```bash
mkdir -p apps/backend/src/modules
mkdir -p apps/frontend/src

# Create package.json for each
cd apps/backend && npm init -y
cd ../frontend && npm init -y
```

### Phase 2: Move Code (Day 1-2)

```bash
# Backend: All modules stay but path changes
rsync -av src/modules/conference/ apps/backend/src/modules/conference/

# Frontend: Move interfaces/web and components
rsync -av src/modules/conference/interfaces/web/ apps/frontend/src/modules/conference/interfaces/web/
rsync -av src/components/ src/app/ src/types/ apps/frontend/src/
```

### Phase 3: Update Imports (Day 2)

```typescript
// Before
import { Conference } from '@/modules/conference/domain/entities/conference';
import { ConferenceForm } from '@/modules/conference/interfaces/web/components/conference-form';

// After (Backend)
import { Conference } from '@backend/modules/conference/domain/entities/conference';
import { PredicateHandler } from '@backend/modules/conference/application/commands/create-conference/create-conference.handler';

// After (Frontend)
'use client';
import { ConferenceForm } from '@/modules/conference/interfaces/web/components/conference-form';
```

### Phase 4: Verify (Day 3)

```bash
# Frontend runs standalone
cd apps/frontend && npm run dev

# Backend runs standalone
cd apps/backend && npm run start

# Frontend calls backend via /api/...
curl http://localhost:3000/api/v1/conferences
```

## Migration Cost (With This Structure)

| Scenario | Without `apps/` Structure | With `apps/` Structure |
|----------|---------------------------|------------------------|
| Backend Node → Go | Touch all `src/` folders, including frontend | Move `apps/backend/`, keep `apps/frontend/` untouched |
| Frontend React → Vue | Touch all `src/` folders, especially `interfaces/web/` | Move `apps/frontend/`, keep `apps/backend/` untouched |
| **Full Stack Swap** | 156-336 hours (ADR-002-01) | 24-42 hours (8-14 hours per layer) |

## Links

* [ADR-009: Domain-Driven Design Structure](./009-adopt-domain-driven-design-structure.md)
* [ADR-002-01: Supabase DDD Abstraction](./002-01-use-supabase-amendment-ddd-abstraction.md)
* [ADR-001: Next.js Frontend](./001-use-nextjs-as-frontend-framework.md)
* [ADR-015: CQRS Pattern](./015-adopt-cqrs-pattern.md)

---

**Status:** ✅ **PROPOSED** (Approve to enable stack independence)

**Decision:** Adopt monorepo with `apps/backend/` and `apps/frontend/` separation to enable true backend stack independence while maintaining DDD purity.

**Implementation Date:** Immediately upon approval
**Owner:** Technical Lead
