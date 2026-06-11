# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records (ADRs) for SessioFlow. Each ADR documents a significant architectural decision, providing context, alternatives considered, and consequences.

---

## Quick Reference

| # | Decision | Status | Date |
|---|----------|--------|------|
| [001](001-use-nextjs-as-frontend-framework.md) | Use Next.js as Frontend Framework | Proposed | 2026-06-05 |
| [002](002-use-supabase-for-backend-and-database.md) | Use Supabase for Backend and Database | Proposed | 2026-06-05 |
| [002-Amendment](002-supabase-backend-amendment-ddd-abstraction.md) | **Amendment: DDD Abstraction Layer** | Proposed | 2026-06-11 |
| [002a](_to-discuss/002a-supabase-vendor-lock-in-alternatives.md) | Supabase Vendor Lock-in Alternatives | Under Discussion | 2026-06-09 |
| [002b](_to-discuss/002b-supabase-auth-strategy-ddd-abstraction.md) | **Authentication Strategy with DDD** | Under Discussion | 2026-06-11 |
| [003](003-use-docker-compose-for-deployment.md) | Use Docker Compose for Deployment | Proposed | 2026-06-05 |
| [004](004-implement-magic-link-authentication.md) | Implement Magic Link Authentication | Proposed | 2026-06-05 |
| [005](005-use-supabase-storage-for-files.md) | Use Supabase Storage for Files | Proposed | 2026-06-05 |
| [006](006-use-restful-api-design.md) | Use RESTful API Design | Proposed | 2026-06-05 |
| [007](007-use-zod-for-validation.md) | Use Zod for Validation | Proposed | 2026-06-05 |
| [008](008-implement-comprehensive-testing-strategy.md) | Implement Comprehensive Testing Strategy | Proposed | 2026-06-05 |
| [009](009-adopt-domain-driven-design-structure.md) | Adopt Domain-Driven Design Structure | Proposed | 2026-06-06 |
| [010](010-use-tailwind-css-for-styling.md) | Use Tailwind CSS for Styling | Proposed | 2026-06-05 |
| [011](011-use-resend-for-email-communications.md) | Use Resend for Email Communications | Proposed | 2026-06-05 |
| [012](012-implement-ci-cd-with-github-actions.md) | Implement CI/CD with GitHub Actions | Proposed | 2026-06-05 |
| [013](013-adopt-typescript-with-strict-mode.md) | Adopt TypeScript with Strict Mode | Proposed | 2026-06-05 |
| [014](014-use-shadcn-ui-for-components.md) | Use shadcn-ui for Components | Proposed | 2026-06-05 |

---

## ADR Categories

### 🔑 Core Technology Stack
- **001** - Frontend Framework: Next.js
- **002** - Backend/Database: Supabase
- **002-Amendment** - **Supabase with DDD Abstraction (Updated)**
- **007** - Validation: Zod
- **009** - **Architecture: Domain-Driven Design**
- **010** - Styling: Tailwind CSS
- **013** - Type System: TypeScript Strict Mode

### 🔐 Authentication & Security
- **002a** - **Supabase Vendor Lock-in Analysis**
- **002b** - **Authentication Strategy with DDD Abstraction**
- **004** - Auth Method: Magic Links

### 🏗️ Infrastructure & Deployment
- **003** - Containerization: Docker Compose
- **012** - CI/CD: GitHub Actions

### 💾 Data & Storage
- **005** - File Storage: Supabase Storage
- **002a** - Database Alternatives Analysis

### 🔌 API Design
- **006** - API Architecture: RESTful Design

### 🧪 Development Practices
- **008** - Testing Strategy: Comprehensive Testing
- **009** - Code Organization: Domain-Driven Design
- **011** - Email Service: Resend
- **014** - UI Components: shadcn-ui

---

## Key Architectural Decisions

### 🔥 Authentication Strategy (Latest: ADR-002b)

**Decision:** Implement DDD ports & adapters pattern for vendor-agnostic authentication

**Options:**
1. **Auth0** (Recommended for MVP)
   - ✅ 30-minute setup
   - ✅ 25,000 MAU free tier
   - ✅ Enterprise-grade security
   - ❌ Vendor lock-in (mitigated by DDD abstraction)

2. **NextAuth.js**
   - ✅ Standard PostgreSQL
   - ✅ Full control
   - ❌ 2-4 weeks development

3. **Supabase Auth**
   - ✅ Integrated with Supabase
   - ❌ Tightly coupled to Supabase ecosystem

**Migration Cost:**
- With DDD abstraction: **8-14 hours**
- Without DDD: **52-112 hours**

**Recommendation:** Use Auth0 with DDD abstraction for MVP, migrate to self-hosted if needed (1-2 days effort)

---

### 🗄️ Database & Backend (ADR-002 + Amendment)

**Decision:** Supabase PostgreSQL with DDD abstraction layer

**Updated Rationale:**
- ✅ Supabase provides PostgreSQL with RLS for GDPR compliance
- ✅ DDD abstraction reduces migration cost by 85%
- ✅ Can swap to any PostgreSQL provider (Neon, PlanetScale, AWS RDS)
- ✅ Hybrid approach viable: Supabase DB + Auth0 + Cloudflare R2

**Cost:** $0/month (Supabase free tier: 500MB DB, 1GB storage, 50K users)

---

### 🏛️ Architecture Pattern (ADR-009)

**Decision:** Domain-Driven Design (DDD) Structure

**Benefits:**
- ✅ Clear domain model with entities, value objects, aggregates
- ✅ Separation of concerns (Domain, Application, Infrastructure, Interfaces)
- ✅ Swappable infrastructure via repository pattern
- ✅ Scales well for complex domain features (scheduling, reviews)
- ✅ AI-friendly (well-documented patterns)

**Project Structure:**
```
src/
├── domains/              # Business logic (vendor-agnostic)
├── application/          # Use cases
├── infrastructure/       # External service implementations
└── interfaces/          # UI and API entry points
```

---

## How to Use This Index

### Finding Decisions by Topic

**Technology Choices:**
- Look for ADRs in **Core Technology Stack** category
- Examples: Next.js, TypeScript, Tailwind CSS, Zod

**Architecture:**
- Look for ADRs in **DDD Structure** and **API Design**
- Examples: Domain-Driven Design, RESTful API

**Infrastructure:**
- Look for ADRs in **Infrastructure & Deployment**
- Examples: Docker Compose, GitHub Actions

**Authentication:**
- Look for ADRs in **Authentication & Security**
- Examples: Auth0, NextAuth, Supabase Auth, DDD Abstraction

### Understanding ADR Status

| Status | Meaning |
|--------|---------|
| **Proposed** | Decision is under consideration |
| **Accepted** | Decision has been approved and implemented |
| **Under Discussion** | Decision is being actively debated |
| **Deprecated** | Decision is no longer valid |
| **Superseded** | Decision has been replaced by a newer ADR |

---

## Related Documentation

### Command Documents
- [Generate ADRs from Inception](../commands/adr/1-generate-adrs-from-inception.md)
- [Validate ADR Quality](../commands/adr/2-ADR-validator.md)
- [Generate ADR Summary](../commands/adr/3-generate-adr-summary.md)
- [Generate Traceability Matrix](../commands/adr/4-generate-traceability-matrix.md)
- [Analyze ADR Alternatives](../commands/adr/5-analyze-adr-alternatives.md)

### Supporting Documents
- [ADR Structure Guide](STRUCTURE.md)
- [Template Directory](_templates/README.md)
- [Analysis Reports](_reports/README.md)

---

## Creating New ADRs

1. Follow the workflow in `docs/commands/adr/0-ADR-WORKFLOW.md`
2. Use the template: `cp _templates/TEMPLATE.md docs/adr/XXX-decision-name.md`
3. Fill in the decision details following the template structure
4. Validate using `TEMPLATE-ADR_VALIDATOR.md`
5. Place in this directory with sequential numbering

### ADR Template Structure

Each ADR follows this structure:
- **Title** - Short, imperative statement
- **Status** - Current state of the decision
- **Date** - When the decision was made
- **Decision Makers** - Who made the decision
- **Context** - Problem statement and constraints
- **Options** - Alternatives considered
- **Decision** - Chosen option and justification
- **Consequences** - Positive and negative outcomes
- **Links** - Related documentation

---

## Statistics

| Metric | Count |
|--------|-------|
| **Total ADRs** | 17 (including amendments and discussions) |
| **Proposed** | 14 |
| **Under Discussion** | 2 |
| **Amendments** | 1 |
| **Date Range** | 2026-06-05 to 2026-06-11 |
| **Most Active Category** | Core Technology Stack (6 decisions) |

---

## Key Decisions Summary

### For New Developers

**Start Here:**
1. **ADR-009**: Understand the DDD architecture
2. **ADR-002 + Amendment**: Learn about database and vendor abstraction
3. **ADR-002b**: Understand authentication strategy

**Quick Facts:**
- Frontend: Next.js with TypeScript
- Backend: Supabase PostgreSQL (or swappable alternative)
- Auth: Auth0 with DDD abstraction (swappable to NextAuth)
- Architecture: Domain-Driven Design
- Testing: Vitest + Playwright

### For Technical Decision Makers

**Critical Decisions:**
- **ADR-002b**: Authentication strategy with DDD abstraction (85% migration cost reduction)
- **ADR-002 Amendment**: Updated Supabase decision with DDD mitigation
- **ADR-009**: DDD architecture for long-term maintainability

**Trade-offs Considered:**
- Speed vs. Flexibility (Auth0 vs. Self-hosted)
- Vendor Lock-in vs. Development Time (Supabase vs. Hybrid)
- Complexity vs. Maintainability (DDD vs. Simpler patterns)

---

**Last Updated**: 2026-06-11
**Maintained By**: Technical Team
