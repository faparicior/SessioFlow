# Value Object: EventId

## 📋 Definition
* **Description:** Unique identifier for an Event aggregate. Ensures type safety and validation at the value object level.
* **Type:** UUIDv4 (string internally, but wrapped in strong type)
* **Immutability:** ✅ Immutable (created once, never changed)
* **Validation:** Format validation on creation

---

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| **Format** | Must be valid UUIDv4 format |
| **Case** | Case-insensitive comparison |
| **Uniqueness** | Must be unique across all Event aggregates |
| **Immutability** | Cannot be modified after creation |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `create(id: string)` | Create from validated string (throws on invalid format) |
| `generate()` | Generate new UUIDv4 identifier |
| `equals(other: EventId)` | Compare two EventId instances for equality |
| `toString()` | Convert to string representation |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [[../entities/event.md]] | Primary key for Event aggregate |
| [[../../application/use-cases/create-event.ts]] | Input parameter for event creation |
| [[../../infrastructure/repositories/event-repository.ts]] | Query parameter for repository methods |

---

## 📚 DDD Principles Applied

1. **Encapsulation**: Private constructor prevents direct instantiation
2. **Validation**: Invalid IDs are rejected at creation time
3. **Type Safety**: Strong typing prevents mixing with other ID types
4. **Behavior**: Includes `equals()` for comparison, not just data access
5. **Immutability**: Once created, the value cannot change

---

## 🔄 Usage Examples

| Scenario | Description |
|----------|-------------|
| **Generation** | `EventId.generate()` creates new UUIDv4 |
| **Creation** | `EventId.create('123e...')` validates and wraps string |
| **Comparison** | `eventId.equals(otherId)` checks value equality |
| **Serialization** | `eventId.toString()` converts to string for storage/transmission |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidEventIdError` | Invalid UUIDv4 format provided |
| `DuplicateEventIdError` | ID already exists in database (repository level) |
