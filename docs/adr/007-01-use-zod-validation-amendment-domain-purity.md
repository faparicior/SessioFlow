# 007-01-Use Zod Validation Amendment: Domain Purity and Decoupled Layers

* **Status:** ✅ **APPROVED**
* **Date:** 2026-07-18
* **Decision Makers:** Technical Lead, Fernando
* **Amends:** [ADR-007 (Use Zod for Validation)](file:///home/fernando/src/sessioflow/docs/adr/007-use-zod-for-validation.md)
* **Related:** [ADR-009 (Adopt Domain-Driven Design Structure)](file:///home/fernando/src/sessioflow/docs/adr/009-adopt-domain-driven-design-structure.md)

---

## Purpose of This Amendment

This document amends **ADR-007** to define the exact validation boundaries between the **Domain**, **API**, and **Frontend** layers. It clarifies how we enforce invariants and validation schemas while strictly preserving **Domain Purity** (keeping the core domain agnostic of external validation libraries like Zod).

---

## Context and Problem Statement

ADR-007 approved Zod as the primary technology for schema validation, highlighting its type inference and runtime safety. However, inside a Domain-Driven Design (DDD) layout:
1. **Domain Purity**: Value Objects and Entities must express business invariants cleanly. Directly importing Zod or embedding Zod schemas in Value Objects binds the domain layer to a specific external framework, violating the DDD boundary principle.
2. **Layer Separation**: The frontend UI and backend API require structural parsing, whereas the domain requires invariant enforcement.
3. **Future Portability**: If the backend is rewritten in a different technology (e.g., Kotlin), the domain rules must not be coupled to Node-specific libraries.

---

## Decision Outcome

To satisfy both domain purity and robust input validation, we adopt the **Decoupled Boundary Validation** pattern:

1. **Pure Domain Enforcers (Value Objects)**:
   * Value Objects validate their invariants natively using standard language features (e.g., throwing custom typed exceptions like `ConferenceNameTooShortError`).
   * No `zod` imports are allowed within the `domain/` directory.

2. **Zod Validation & Sanitization at API Boundaries**:
   * Next.js API routes use standalone Zod schemas (e.g., `ConferenceCreateSchema`) to validate request structure and types (syntactic contract validation).
   * API routes use corresponding response schemas (e.g., `ConferenceResponseSchema`) to parse and sanitize outgoing DTOs, ensuring internal properties are stripped and matching the documented contract.
   * If input parsing fails, the API route returns a structured `400 Bad Request` with Zod validation details (`z.treeifyError(err)`).

3. **Frontend Independent Validation**:
   * The frontend form components execute client-side validation for instant UX feedback.
   * If a validation failure occurs during API submission (either Zod structural failures or Domain exception codes), the form component dynamically maps the server-side errors directly back to the respective input fields inline.

---

## Consequences

* **Positive:**
  * **Domain Purity**: Bypasses any temptation to couple domain rules with API schemas in Next.js.
  * **Clean API Contracts**: Zod schemas serve as clear entry and exit gatekeepers for the API.
  * **Payload Sanitization**: Response schemas automatically filter out internal database metadata or auditing fields before sending responses.
  * **Minimal Duplication**: API schema only validates formats/types, while business validation resides entirely in the domain.
  * **Dynamic UI Mapping**: Errors from both layers (structural and business rules) are mapped inline, preserving a high-quality user experience.

* **Negative/Risks:**
  * Small type alignment overhead: Field types are declared in both the TS command definitions and the API's Zod schema.

