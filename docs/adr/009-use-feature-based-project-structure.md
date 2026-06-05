# 009-use-feature-based-project-structure

* **Status:** Proposed
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow requires a project structure that supports:

1. **Maintainability**: Code must be easy to navigate for volunteer developers with intermediate skills
2. **Scalability**: Structure must accommodate growth from MVP (4 features) to full product (10+ features)
3. **Collaboration**: Multiple developers must be able to work on different features without conflicts
4. **Onboarding**: New volunteers must understand the codebase quickly (Fernando's Pain 3: "New volunteers has to learn some tools")

The project's AGENTS.md document explicitly defines a "Feature-Based Colocation" structure as the standard. This decision must align with:
- **Simplicity** (ranked #3 in trade-offs): Structure should not add cognitive overhead
- **Usability** (ranked #1): Developer experience should be intuitive
- **MVP Timeline**: Structure should enable rapid development, not hinder it

**Decision Drivers:**
- Must organize code by feature domain rather than file type
- Must support the identified user journeys (Setup, Submission, Selection, Acceptance)
- Must enable clear separation between shared components and feature-specific logic
- Must facilitate testing with clear boundaries between features
- Must scale from MVP to future waves without major refactoring
- Must be intuitive for developers unfamiliar with the codebase

## Considered Options

1. **Feature-Based Colocation (Recommended in AGENTS.md)**
2. **Layered Architecture (Separate controllers, services, views)**
3. **Domain-Driven Design (DDD) Structure**
4. **Simple Flat Structure (All components in one folder)**

## Decision Outcome

**Chosen Option:** "Feature-Based Colocation (as defined in AGENTS.md)"

**Justification:**
Feature-based colocation is the optimal choice because it aligns perfectly with SessioFlow's requirements:

1. **Usability for Developers**: Groups all code related to a feature together, reducing context switching when working on specific user journeys
2. **MVP Alignment**: Directly maps to the identified journeys (auth, cfp, dashboard), enabling clear feature boundaries
3. **Scalability**: New features can be added as new directories without restructuring existing code
4. **Collaboration**: Different developers can work on different features with minimal merge conflicts
5. **Onboarding**: New volunteers can find all code for a feature in one place, addressing Fernando's Pain 3

### Consequences

* **Positive:**
  - Clear ownership: Each feature directory is self-contained with its own components, hooks, and tests
  - Easier refactoring: Changes to one feature rarely affect others
  - Better code discoverability: Developers know where to find feature-specific code
  - Simplified testing: Feature tests are colocated with feature code
  - Supports the 6-week MVP timeline by reducing architectural overhead

* **Negative:**
  - Shared components must be explicitly imported from the `components/` directory
  - May create duplication if features share similar patterns
  - Requires discipline to maintain the structure as the codebase grows
  - Initial setup requires more planning than a flat structure

* **Risks:**
  - "Feature creep" within directories if boundaries are not well-defined
  - Shared utilities may become scattered across features without proper governance
  - May require refactoring if feature boundaries change significantly
  - New developers may initially struggle with where to place new code

### Pros and Cons of the Options

#### Option 1: Feature-Based Colocation (Recommended in AGENTS.md)

* Good, because it groups all code related to a specific feature together (components, hooks, tests, utilities)
* Good, because it maps directly to user journeys and business capabilities
* Good, because it enables independent development of features with minimal conflicts
* Good, because it scales well as the number of features grows
* Good, because it supports the "Simplicity" priority by reducing cognitive load when working on features
* Bad, because shared components must be explicitly imported from a central location
* Bad, because it requires clear definition of feature boundaries to avoid overlap
* Bad, because initial setup requires more planning than simpler structures

#### Option 2: Layered Architecture (Separate controllers, services, views)

* Good, because it enforces separation of concerns by layer
* Good, because it is a well-established pattern with extensive documentation
* Bad, because it requires navigating multiple directories to understand a feature
* Bad, because it creates artificial boundaries that don't match user journeys
* Bad, because it can lead to "anemic" domain models with logic spread across layers
* Bad, because it increases cognitive load for developers working on specific features
* Bad, because it doesn't align with modern React/Next.js development patterns

#### Option 3: Domain-Driven Design (DDD) Structure

* Good, because it provides clear boundaries based on business domains
* Good, because it supports complex business logic and scalability
* Bad, because it adds significant complexity that exceeds MVP needs
* Bad, because it requires deep understanding of DDD patterns
* Bad, because it is over-engineered for a lightweight application
* Bad, because it conflicts with the "Simplicity" and "Usability" priorities
* Bad, because it would extend the 6-week MVP timeline significantly

#### Option 4: Simple Flat Structure (All components in one folder)

* Good, because it is simple to understand and set up initially
* Good, because it requires minimal planning and organization
* Bad, because it becomes unmanageable as the codebase grows
* Bad, because it creates merge conflicts when multiple developers work simultaneously
* Bad, because it doesn't support the feature-based development approach
* Bad, because it makes testing and code organization difficult at scale
* Bad, because it doesn't align with the project's AGENTS.md guidelines

## Project Structure

```
sessioflow/
├── app/                      # Next.js routing only
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
├── components/               # Shared UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── features/                 # Feature-domain code
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── tests/
│   ├── cfp/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── tests/
│   └── dashboard/
│       ├── components/
│       ├── hooks/
│       └── tests/
├── lib/                      # Utilities and infrastructure
│   ├── client.ts
│   └── validations/
├── types/                    # TypeScript interfaces
└── tests/                    # Integration and E2E tests
```

## Links

* [Project Structure Guidelines](../../AGENTS.md#project-structure-feature-based-colocation)
* [User Journey Mapping](../inception/6-user-journey-mapping.md)
* [Feature Brainstorming](../inception/5-brainstorming.md)
