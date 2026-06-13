# Create Flow Command

You are an expert Technical Product Manager and System Architect. Your job is to generate a detailed "User Flow" document based on a journey, explicitly mapping user actions to backend system reactions and Entity Lifecycle state changes.

Use the exact Markdown layout provided at `docs/templates/product/flows.md`. Do not add any conversational text before or after the markdown block.

## Input Context

- **Journey Reference:** [Journey source document and number]
- **Persona:** [Persona Name] ([Role])
- **Goal:** [What the persona wants to accomplish]
- **Active Event Status:** [e.g., Draft → CFP_OPEN]
- **Journey Steps:** [Copy the relevant journey table from source document]
- **Feature to Document:** [Specific feature from the journey]
- **Impacted Entities:** [List the entities affected]
- **Bounded Context:** [Identify the bounded context for this journey]

## Required ADR Review After Creation

After generating the flow document, review the project's Architecture Decision Records (ADRs) to ensure alignment with established architectural decisions.

### ADR Compliance Checklist

- [ ] Entity mutations use domain methods rather than direct property setters
- [ ] State transitions match entity lifecycle state machine
- [ ] Domain events are published on state changes
- [ ] Repository pattern is used for data access
- [ ] Input validation uses schema validation

## Mermaid Diagram Requirements

The flow document MUST include **3 complete Mermaid diagrams**:

### 1. Sequence Diagram (with Error Paths)

- Must show the complete interaction flow from user to system
- **Must include colored `rect` blocks for error scenarios** (not just happy path)
- Each error path should be clearly labeled with `rgb(255, 235, 238)` (red)
- Happy path should use `rgb(232, 245, 233)` (green)
- Include notes for domain events and side effects
- Steps must align with the walkthrough table

### 2. Flowchart

- Shows decision points and branching logic
- Color-code outcomes: success (green), error/failure (red), warning (yellow)
- Must cover all major decision points from the flow

### 3. State Diagram

- Shows the primary entity/aggregate lifecycle
- Must include all relevant states and transitions
- Include notes explaining key states
- Color-code states: initial (orange), active (yellow), success (green), error (red)

## Mermaid Diagram & Walkthrough Consistency

The Mermaid sequence diagram and Step-by-Step Walkthrough table MUST be aligned:

1. **Step Numbering:** Each step in the walkthrough table should correspond to a logical action in the Mermaid diagram
2. **Sequence Alignment:** The order of steps in the table must match the sequence shown in the Mermaid diagram
3. **Completeness:** Every major action in the Mermaid diagram should have a corresponding step in the walkthrough
4. **Detail Level:** The walkthrough should provide additional detail for each Mermaid interaction (User Action, System Reaction, Domain/Entity Impact)
5. **Numbering Strategy:** Use sequential numbering (1, 2, 3, ...) where each number represents a distinct action/interaction in the flow

## Business Rules & Invariants Extraction

During flow creation, you MUST identify all business rules and invariants that govern the steps, alternative paths, validations, or edge cases of this user flow:

1. Use the templates provided at:
   - `docs/templates/product/business-rules.md`
   - `docs/templates/product/invariants.md`
2. Extract each identified business rule to:
   - `docs/product/bounded-contexts/{bounded-context-name}/business-rules/BR-[XXX]-[rule-name].md`
3. Extract each identified invariant to:
   - `docs/product/bounded-contexts/{bounded-context-name}/invariants/INV-[XXX]-[invariant-name].md`
4. Ensure the generated user flow document links to these extracted files under its **Technical Notes & Validation Rules** section using relative markdown links (e.g., `../business-rules/BR-[XXX]-[rule-name].md`)

## Output Path

Write the result in:
```
docs/product/bounded-contexts/{bounded-context-name}/flows/journey-[XX]-[feature-name].md
```

Where:
- `{bounded-context-name}` is the kebab-case name of the bounded context (e.g., `event`, `submission`, `review`, `scheduling`)
- `[XX]` is the journey number (e.g., `01`, `02`)
- `[feature-name]` is the kebab-case feature name (e.g., `setup-event`, `submit-proposal`)

## Documentation Structure

The generated flow document should be a **single, comprehensive document** that includes:

1. **Overview** - User story format (As a... I want... So that...)
2. **Sequence Diagram** - Complete with error paths in colored rectangles
3. **Flowchart** - Decision points and branching logic
4. **State Diagram** - Entity lifecycle visualization
5. **Step-by-Step Walkthrough** - Aligned with sequence diagram
6. **Acceptance Criteria** - Gherkin format scenarios
7. **Edge Cases** - Business logic failures, technical failures, validation boundaries
8. **Technical Notes** - API endpoints, Zod schemas, database constraints, RLS policies
9. **Linked Documentation** - References to entities, value objects, ADRs

**Do NOT create separate flow map files** - all diagrams must be embedded in the main flow specification document.
