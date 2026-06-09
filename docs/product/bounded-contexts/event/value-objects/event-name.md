# Value Object: EventName

## 📋 Definition
* **Description:** The display name/title of an event. Includes validation for length and content constraints.
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
| `equals(other: EventName)` | Compare two EventName instances for equality |
| `contains(search: string)` | Check if name contains a substring (case-insensitive) |
| `toString()` | Convert to string representation |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [[../entities/event.md]] | Property of Event aggregate |
| [[../../application/use-cases/create-event.ts]] | Input validation for event creation |
| [[../../interfaces/web/create-event-form.tsx]] | Form field validation |

---

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
| **Creation** | `EventName.create('Tech Conference 2026')` validates and creates |
| **Trimming** | `EventName.create('  Summit  ')` automatically trims whitespace |
| **Comparison** | `eventName.equals(otherName)` checks value equality |
| **Search** | `eventName.contains('tech')` performs case-insensitive search |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidEventNameError` | Name is empty, too short (< 3 chars), or too long (> 100 chars) |
