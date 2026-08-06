# Value Object: ConferenceId

## 📋 Definition
* **Description:** Unique identifier for a Conference aggregate. Ensures type safety and validation at the value object level.
* **Type:** UUIDv4 (string internally, but wrapped in strong type)
* **Immutability:** ✅ Immutable (created once, never changed)
* **Validation:** Format validation on creation

---

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| **Format** | Must be valid UUIDv4 format |
| **Case** | Case-insensitive comparison |
| **Uniqueness** | Must be unique across all Conference aggregates |
| **Immutability** | Cannot be modified after creation |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `create(id: string)` | Create from validated string (throws on invalid format) |
| `generate()` | Generate new UUIDv4 identifier |
| `equals(other: ConferenceId)` | Compare two ConferenceId instances for equality |
| `toString()` | Convert to string representation |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [conference.md](../entities/conference.md) | Primary key for Conference aggregate |
| [create-conference.ts](../../../../../src/application/conference/use-cases/create-conference.ts) | Input parameter for conference creation |
| [conference-repository.ts](../../../../../src/infrastructure/database/conference-repository.ts) | Query parameter for repository methods |

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
| **Generation** | `ConferenceId.generate()` creates new UUIDv4 |
| **Creation** | `ConferenceId.create('123e...')` validates and wraps string |
| **Comparison** | `conferenceId.equals(otherId)` checks value equality |
| **Serialization** | `conferenceId.toString()` converts to string for storage/transmission |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidConferenceIdError` | Invalid UUIDv4 format provided |
| `DuplicateConferenceIdError` | ID already exists in database (repository level) |
