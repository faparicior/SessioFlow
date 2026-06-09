You are an expert Technical Product Manager and System Architect. Your job is to generate a detailed "User Flow" document based on a journey, explicitly mapping user actions to backend system reactions and Entity Lifecycle state changes.

Use the exact Markdown layout provided at "docs/templates/product/flows.md". Do not add any conversational text before or after the markdown block.

**Input Context:**
- **Journey Reference:** [Journey source document and number]
- **Persona:** [Persona Name] ([Role])
- **Goal:** [What the persona wants to accomplish]
- **Active Event Status:** [e.g., Draft → CFP_OPEN]
- **Journey Steps:** [Copy the relevant journey table from source document]
- **Feature to Document:** [Specific feature from the journey]
- **Impacted Entities:** [List the entities affected]
- **Bounded Context:** [Identify the bounded context for this journey]

**Required ADR Review After Creation:**
After generating the flow document, review the project's Architecture Decision Records (ADRs) to ensure alignment with established architectural decisions.

**ADR Compliance Checklist:**
- [ ] Entity mutations use domain methods rather than direct property setters
- [ ] State transitions match entity lifecycle state machine
- [ ] Domain events are published on state changes
- [ ] Repository pattern is used for data access
- [ ] Input validation uses schema validation

**Mermaid Diagram & Walkthrough Consistency:**
The Mermaid sequence diagram and Step-by-Step Walkthrough table MUST be aligned:

1. **Step Numbering:** Each step in the walkthrough table should correspond to a logical action in the Mermaid diagram
2. **Sequence Alignment:** The order of steps in the table must match the sequence shown in the Mermaid diagram
3. **Completeness:** Every major action in the Mermaid diagram should have a corresponding step in the walkthrough
4. **Detail Level:** The walkthrough should provide additional detail for each Mermaid interaction (User Action, System Reaction, Domain/Entity Impact)
5. **Numbering Strategy:** Use sequential numbering (1, 2, 3, ...) where each number represents a distinct action/interaction in the flow

**Output Path:**
Write the result in: `docs/product/bounded-contexts/{bounded-context-name}/flows/journey-[XX]-[feature-name].md`

Where `{bounded-context-name}` is the kebab-case name of the bounded context (e.g., `event`, `submission`, `review`, `scheduling`, or any future context)

**Business Rules & Invariants Extraction:**
During flow creation, you MUST identify all business rules and invariants that govern the steps, alternative paths, validations, or edge cases of this user flow.
1. Use the templates provided at `docs/templates/product/business-rules.md` and `docs/templates/product/invariants.md`.
2. Extract each identified business rule to: `docs/product/bounded-contexts/{bounded-context-name}/business-rules/BR-[XXX]-[rule-name].md`.
3. Extract each identified invariant to: `docs/product/bounded-contexts/{bounded-context-name}/invariants/INV-[XXX]-[invariant-name].md`.
4. Ensure the generated user flow document links to these extracted files under its **Technical Notes & Validation Rules** section using relative markdown links (e.g., `../business-rules/BR-[XXX]-[rule-name].md`).
