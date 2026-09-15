# Value Object: ConferenceName

## 📋 Definition
* **Description:** The display name/title of a conference. Includes validation for length and content constraints.
* **Type:** String (validated and normalized)
* **Immutability:** ✅ Immutable
* **Validation:** Length, non-empty, character restrictions

---

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| **Non-empty** | Cannot be null, undefined, or whitespace-only |
| **Minimum Length** | At least 3 characters |
| **Maximum Length** | Maximum 100 characters |
| **Trimmed** | Leading/trailing whitespace is removed |
| **No Special Characters** | Alphanumeric, spaces, and basic punctuation only |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `create(name: string)` | Create from validated string (throws on invalid input) |
| `equals(other: ConferenceName)` | Compare two ConferenceName instances for equality |
| `contains(search: string)` | Check if name contains a substring (case-insensitive) |
| `toString()` | Convert to string representation |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [conference.md](../entities/conference.md) | Property of Conference aggregate |
| [create-conference.handler.ts](../../../../../packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts) | Input validation for conference creation |
| `create-conference-form.tsx` (planned) | Form field validation |

---

## 🔒 Invariants & Business Rules

*The `Enforces` edge — every rule below must list this value object back in its `Enforced by` table.
Convention: [Traceability](../../../guidelines/traceability.md).*

| Rule | Enforced by | Test |
| ---- | ----------- | ---- |
| [BR-002](../business-rules/BR-002-conference-name-validation.md) | `ConferenceName.create()` — trims, then `ConferenceNameTooShortError` / `ConferenceNameTooLongError` (no sanitizing, no truncation) | `tests/unit/modules/conference/domain/value-objects/conference-name.test.ts` |

## 📚 DDD Principles Applied

1. **Encapsulation**: Private constructor prevents invalid states
2. **Validation**: All constraints enforced at creation time
3. **Behavior**: Includes `contains()` for domain-relevant operations
4. **Normalization**: Automatically trims whitespace
5. **Immutability**: Once created, the value cannot change

---

## 🔄 Usage Examples

| Scenario | Description |
|----------|-------------|
| **Creation** | `ConferenceName.create('Tech Conference 2026')` validates and creates |
| **Trimming** | `ConferenceName.create('  Summit  ')` automatically trims whitespace |
| **Comparison** | `eventName.equals(otherName)` checks value equality |
| **Search** | `eventName.contains('tech')` performs case-insensitive search |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidConferenceNameError` | Name is empty, too short (< 3 chars), or too long (> 100 chars) |
