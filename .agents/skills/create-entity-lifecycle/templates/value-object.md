# Value Object: [VoName]

## 📋 Definition
* **Description:** [Brief summary of what this value object represents in the domain]
* **Type:** [Simple Value Object | Composite Value Object]
* **Immutability:** ✅ Immutable
* **Validation:** [Summary of validation constraints]

---

## 🎯 Composition

| Property | Type | Description |
|----------|------|-------------|
| `[field]` | `[Type]` | [Description] |

---

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| **[Rule Name]** | [What is validated and why] |

---

## 🎯 Behavior & Methods

| Method | Purpose |
|--------|---------|
| `static create(rawValue)` | Static factory method creating validated instance (enforces invariants) |
| `static fromData(rawValue)` | Static factory method reconstituting from database (bypasses time-relative validation) |
| `get value` | Encapsulated getter for underlying primitive |
| `equals(other)` | Structural equality comparison |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `[ExceptionClass]` | [When it is thrown] |

---

## 🔒 Invariants

* [INV-[XXX]](../invariants/INV-[XXX]-[invariant-name].md): [Short invariant title]

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [EntityName](../entities/EntityName.md) | [How this VO is used] |

---

## 🔗 Related Value Objects

| Value Object | Purpose |
|--------------|---------|
| [VoName](VoName.md) | [Relationship] |
