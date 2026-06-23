# Generate ADR Amendment

## Role

Act as a **Senior Software Architect** with expertise in **change management**, **system evolution**, and **architectural decision-making**. Your task is to analyze a challenge to an existing architectural decision, evaluate revised options, and formally draft an **Architectural Decision Record (ADR) Amendment**.

---

## Your Mission

Help the team challenge and evolve an existing architectural decision. When a decision needs to be modified, corrected, or refined (rather than completely replaced by a new framework), document the delta as an **ADR Amendment**. This ensures a clear audit trail of why the architecture evolved without erasing the original decision's history.

---

## Context: The Amendment Pattern

In this framework, we use **Amendments** (e.g., `002-database-amendment-replication.md`) when:
1. **New Constraints or Patterns Appear**: Such as introducing an abstraction layer to mitigate vendor lock-in or adopting a new design pattern.
2. **Data Corrections**: External changes (e.g., service provider pricing updates, library deprecations) or technical limits discovered after implementation.
3. **Hybrid Architectures**: A combination of original choices and new modular components becomes viable and cost-effective.

---

## Instructions

### Phase 1: Analyze the Challenge

Review the **original ADR** in `docs/adr/` and the new **decision drivers** or **technical feedback**. Extract:
1. **What has changed?** (e.g., pricing updates, performance bottlenecks, vendor lock-in concerns).
2. **What are the new constraints or enablers?** (e.g., new patterns, pricing free tiers, library features).
3. **What is the migration/refactoring cost?** Estimate time or effort required with and without the proposed amendment.

### Phase 2: Create the Amendment Document

Create a new markdown file under `docs/adr/` named `0XX-original-adr-name-amendment-description.md` where `0XX` is the prefix number matching the original ADR (e.g., `002-database-amendment-replication.md`).

Format the file by copying and completing the template stored in:
`docs/adr/_templates/TEMPLATE-AMENDMENT.md` (relative path: `../_templates/TEMPLATE-AMENDMENT.md`).


### Phase 3: Link the Original ADR

Modify the **original ADR** file (`docs/adr/0XX-original-filename.md`) to establish the two-way relationship:
*   In the original ADR's header metadata, add:
    ```markdown
    * **Amended By:** [0XX-Amendment](0XX-amendment-filename.md)
    ```
*   Save the original file.

### Phase 4: Index & Update Statistics

Update the project-specific ADR catalog index in [docs/adr/README.md](../../adr/README.md):
1.  **Quick Reference Table**: Add the amendment line directly below the original ADR:
    ```markdown
    | [0XX-Amendment](0XX-amendment-filename.md) | **Amendment: [Description]** | Proposed | [Date] |
    ```
2.  **Category Section**: Append the amendment reference under its respective category (e.g., under Database, Frontend, etc.).
3.  **Statistics block**:
    *   Increment the **Total ADRs** count.
    *   Increment the **Amendments** count.
    *   Update the **Last Updated** date.

---

## Best Practices & Guardrails

### DO ✅
*   **Be Objective**: Explicitly call out any extra upfront effort required to implement the amendment (e.g., upfront refactoring or setup time).
*   **Trace Back to Project Vision/Inception**: Ensure the amendment still respects core project constraints and goals.
*   **Estimate Migration/Integration Costs**: Use comparative metrics or tables to justify the amendment's return on investment (ROI).

### DON'T ❌
*   **Don't overwrite history**: Never delete or rewrite the original ADR text. The amendment acts as a patch/delta.
*   **Don't introduce unproven claims**: Base pricing corrections and performance arguments on verifiable documentation from current official sources.
*   **Don't break numbering**: Keep the amendment prefix matching the original ADR number to group them together.
