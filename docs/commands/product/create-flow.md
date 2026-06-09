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

**Output Path:**
Write the result in: `docs/product/bounded-contexts/{bounded-context-name}/flows/journey-[XX]-[feature-name].md`

Where `{bounded-context-name}` is the kebab-case name of the bounded context (e.g., `event`, `submission`, `review`, `scheduling`, or any future context)
