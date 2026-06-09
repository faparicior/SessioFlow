# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records (ADRs) for SessioFlow. Each ADR documents a significant architectural decision, providing context, alternatives considered, and consequences.

## Quick Reference

| # | Decision | Status | Date |
|---|----------|--------|------|
| [001](001-use-nextjs-as-frontend-framework.md) | Use Next.js as Frontend Framework | Proposed | 2026-06-05 |
| [002](002-use-supabase-for-backend-and-database.md) | Use Supabase for Backend and Database | Proposed | 2026-06-05 |
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

## ADR Categories

### Core Technology Stack
- **001** - Frontend Framework: Next.js
- **002** - Backend/Database: Supabase
- **007** - Validation: Zod
- **010** - Styling: Tailwind CSS
- **013** - Type System: TypeScript Strict Mode

### Infrastructure & Deployment
- **003** - Containerization: Docker Compose
- **012** - CI/CD: GitHub Actions

### Data & Storage
- **005** - File Storage: Supabase Storage

### API Design
- **006** - API Architecture: RESTful Design

### Authentication
- **004** - Auth Method: Magic Links

### Development Practices
- **008** - Testing Strategy: Comprehensive Testing
- **009** - Code Organization: Domain-Driven Design
- **011** - Email Service: Resend
- **014** - UI Components: shadcn-ui

## How to Use This Index

### Finding Decisions by Topic
1. **Technology Choices**: Look for decisions about frameworks, libraries, and tools
2. **Architecture**: Look for decisions about system structure and patterns
3. **Infrastructure**: Look for decisions about deployment, hosting, and DevOps

### Understanding ADR Status
- **Proposed**: Decision is under consideration
- **Accepted**: Decision has been approved and implemented
- **Deprecated**: Decision is no longer valid
- **Superseded**: Decision has been replaced by a newer ADR

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

## Creating New ADRs

1. Follow the workflow in `docs/commands/adr/0-ADR-WORKFLOW.md`
2. Use the template: `cp _templates/TEMPLATE.md docs/adr/XXX-decision-name.md`
3. Fill in the decision details following the template structure
4. Validate using `TEMPLATE-ADR_VALIDATOR.md`
5. Place in this directory with sequential numbering

## ADR Template Structure

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

## Statistics

- **Total ADRs**: 14
- **Date Range**: 2026-06-05 to 2026-06-06
- **Most Active Category**: Core Technology Stack (5 decisions)

---

**Last Updated**: 2026-06-09
**Maintained By**: Technical Team
