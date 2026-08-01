# Executive Summary & Core Responsibilities

The Application Use Case layer (`app-use-case`) serves as the orchestration bridge between the presentation/presentation-adjacent layer (Controllers, APIs, CLI, Events) and the Domain layer. In this architecture, it is strictly governed by **CQRS (Command Query Responsibility Segregation)** and acts as the single entry point for all business workflows.

## Core Responsibilities
- **Orchestration:** Coordinate domain entities, domain services, and repository ports to fulfill a single business intent.
- **Input Validation:** Validate request shapes, types, and constraints *before* domain interaction.
- **Context Injection:** Resolve security, tenant, correlation, and audit context from infrastructure adapters.
- **Transaction Management:** Explicitly open, commit, or rollback database sessions per use case execution.
- **Result Translation:** Map domain outcomes or entity projections into stable Application Transfer Objects (DTOs).

## Key Principles & Anti-Patterns
- 🚫 **No Business Rules:** The application layer never implements domain invariants or core business logic. It only validates structural/formatting constraints and delegates to domain aggregates/services.
- 🔒 **Statelessness:** Handlers are instantiated per request and must hold no mutable state across calls.
- 📐 **Strict CQRS:** Commands mutate state; Queries read state. They are never mixed in the same handler or method.
- 🧱 **Repository Isolation:** Direct database access or SQL/ORM queries inside handlers are strictly prohibited; handlers interact with repository interfaces.
- 🛡️ **Explicit Error Handling:** Prefer returning explicit Result types (or structured exceptions) over swallowing errors or throwing untyped generic JS Errors.
