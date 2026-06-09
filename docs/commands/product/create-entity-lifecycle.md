You are an expert System Architect and Backend Engineer. Your job is to generate the technical details for an "Entity Lifecycle" document based on a domain noun (entity) and its high-level requirements.

Use the exact Markdown layout provided at "docs/templates/product/entity-lifecycle.md". Do not add any conversational text before or after the markdown block.

**Input Context:**
- **Entity Name:** [Domain noun/entity name]
- **Aggregate Role:** [Root Entity or Child Entity]
- **Domain Context:** [Bounded context or domain area]
- **Bounded Context:** [Identify the bounded context for this entity]
- **Related Entities:** [List related entities in the aggregate]
- **Value Objects:** [List value objects used by this entity]
- **State Machine:** [List all possible states]
- **Domain Behavior:** [List core domain methods]

**Required ADR Review After Creation:**
After generating the entity lifecycle document, review the project's Architecture Decision Records (ADRs) to ensure alignment with established architectural decisions.

**Compliance Checklist:**
- [ ] Entity is properly designated as Aggregate Root or Child Entity
- [ ] Value Objects encapsulate validation and business rules
- [ ] Domain behavior is exposed through methods (not data setters)
- [ ] State transitions are explicit and validated
- [ ] Domain events are published on state changes
- [ ] Repository interfaces are defined for data access
- [ ] Entity invariants are documented and enforced
- [ ] Entity links to relevant User Flows / Journeys
- [ ] Domain events are documented with triggers and side effects
- [ ] State definitions are clear and unambiguous
- [ ] Validation rules are comprehensive

**Mermaid Diagram & State Definition Consistency:**
The Mermaid state machine diagram and the State Definitions/Transition Matrix MUST be aligned:

1. **State Completeness:** Every state shown in the Mermaid diagram must have a corresponding definition in the State Definitions section
2. **Transition Completeness:** Every transition arrow in the Mermaid diagram must be documented in the State Transition Matrix
3. **State Names:** Use consistent naming (e.g., `DRAFT`, `CFP_OPEN`, not `draft`, `active`)
4. **Trigger Alignment:** The triggering actions/events in the Mermaid diagram must match the "Event / Trigger" column in the State Transition Matrix
5. **Target State Alignment:** The target states in the Mermaid diagram must match the "Target State" column in the State Transition Matrix
6. **Domain Methods:** If domain methods are shown in the Mermaid (e.g., `Event.publishCfp()`), they must be documented in the Domain Behavior section
7. **Terminal States:** All terminal states (states with no outgoing transitions) should be clearly identified in State Definitions

**Output Path:**
Write the result in: `docs/product/bounded-contexts/{bounded-context-name}/entities/{entity-name}.md`

Where `{bounded-context-name}` is the kebab-case name of the bounded context (e.g., `event`, `submission`, `review`, `scheduling`, or any future context)
