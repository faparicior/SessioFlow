---
name: create-entity-lifecycle
description: >-
  Generate comprehensive entity lifecycle documentation. USE THIS SKILL when user mentions:
  create entity, entity lifecycle, entity documentation, document entity, entity state machine,
  create entity spec, entity definition, domain entity, aggregate lifecycle, or any request to create
  technical documentation for a domain entity including state machine, transitions, and domain behavior.
  This skill creates complete entity specs with state diagrams, transition matrices, domain methods,
  and extracts business rules and invariants.
---

# Create Entity Lifecycle Skill

You are an expert System Architect and Backend Engineer. Your job is to generate the technical details for an "Entity Lifecycle" document based on a domain noun (entity) and its high-level requirements.

Use the exact Markdown layout provided in `templates/entity-lifecycle.md`. Do not add any conversational text before or after the markdown block.

---

## 📋 Input Context

- **Entity Name:** [Domain noun/entity name]
- **Aggregate Role:** [Root Entity or Child Entity]
- **Domain Context:** [Bounded context or domain area]
- **Bounded Context:** [Identify the bounded context for this entity]
- **Related Entities:** [List related entities in the aggregate]
- **Value Objects:** [List value objects used by the entity]
- **State Machine:** [List all possible states]
- **Domain Behavior:** [List core domain methods]

---

## ✅ Required ADR Review After Creation

After generating the entity lifecycle document, review the project's Architecture Decision Records (ADRs) to ensure alignment with established architectural decisions.

### Compliance Checklist

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

---

## 🔄 Mermaid Diagram & State Definition Consistency

The Mermaid state machine diagram and the State Definitions/Transition Matrix MUST be aligned:

1. **State Completeness:** Every state shown in the Mermaid diagram must have a corresponding definition in the State Definitions section
2. **Transition Completeness:** Every transition arrow in the Mermaid diagram must be documented in the State Transition Matrix
3. **State Names:** Use consistent naming (e.g., `DRAFT`, `CFP_OPEN`, not `draft`, `active`)
4. **Trigger Alignment:** The triggering actions/events in the Mermaid diagram must match the "Event / Trigger" column in the State Transition Matrix
5. **Target State Alignment:** The target states in the Mermaid diagram must match the "Target State" column in the State Transition Matrix
6. **Domain Methods:** If domain methods are shown in the Mermaid (e.g., `Event.publishCfp()`), they must be documented in the Domain Behavior section
7. **Terminal States:** All terminal states (states with no outgoing transitions) should be clearly identified in State Definitions

---

## 📁 Output Path

Write the result in:

```
docs/product/bounded-contexts/{bounded-context-name}/entities/{entity-name}.md
```

Where `{bounded-context-name}` is the kebab-case name of the bounded context (e.g., `event`, `submission`, `review`, `scheduling`, or any future context)

---

## 📐 Business Rules & Invariants Extraction

During entity lifecycle creation, you MUST identify all business rules and invariants that govern the entity's state machine, transitions, domain methods, or value objects:

1. Use the templates provided at:
   - `templates/business-rules.md`
   - `templates/invariants.md`
2. Extract each identified business rule to:
   - `docs/product/bounded-contexts/{bounded-context-name}/business-rules/BR-[XXX]-[rule-name].md`
3. Extract each identified invariant to:
   - `docs/product/bounded-contexts/{bounded-context-name}/invariants/INV-[XXX]-[invariant-name].md`
4. Ensure the generated entity lifecycle document links to these extracted files under its **Invariants & Business Rules** section using relative markdown links (e.g., `../business-rules/BR-[XXX]-[rule-name].md`)

---

## 📖 Documentation Structure

The generated entity lifecycle document should include:

1. **Definition & Context** - Entity description, database table, primary key
2. **State Machine Diagram** - Mermaid state diagram showing all states and transitions
3. **State Transition Matrix** - Complete mapping of allowed state changes
4. **State Definitions** - Detailed criteria for each state
5. **Invariants & Business Rules** - Links to extracted BRs and INVs
6. **Linked User Stories & Flows** - References to flows that interact with the entity

---

## 📚 Bundled Resources

### Templates
| Template | Purpose |
|----------|---------|
| `templates/entity-lifecycle.md` | Entity lifecycle document template |
| `templates/business-rules.md` | Business rule documentation template |
| `templates/invariants.md` | Invariant documentation template |

### Guidelines
| Guideline | Purpose |
|-----------|---------|
| `guidelines/flow-documentation-structure.md` | Flow documentation standards (reference) |
| `guidelines/business-rules-vs-invariants.md` | When to use BR vs INV, differences and enforcement |

---

## 🔗 Related Documentation

- [User Journey Mapping](../../../docs/inception/6-user-journey-mapping.md)
- [Flow Documentation](../../../docs/product/flows/README.md)

---

**Last Updated:** 2026-06-25  
**Version:** 1.0