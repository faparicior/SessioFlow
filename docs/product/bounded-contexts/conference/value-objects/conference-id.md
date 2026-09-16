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
| **Format** | Must be a valid UUIDv4 (version/variant bits checked, case-insensitive input, stored lowercase) |
| **Case** | Normalized to lowercase on creation → case-insensitive comparison |
| **Uniqueness** | Minted by `generate()` (`crypto.randomUUID()`); the DB primary key is the final guard — no duplicate-specific domain exception exists |
| **Immutability** | Cannot be modified after creation |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `create(id: string)` | Create from validated string (trim + lowercase; throws on invalid format) |
| `generate()` | Generate new UUIDv4 identifier (`crypto.randomUUID()`) |
| `fromData(id: string)` | Reconstitute a persisted id (same format validation as `create()`) |
| `get value(): string` | Plain-string projection (there is no `toString()`) |
| `equals(other: ConferenceId)` | Compare two ConferenceId instances for equality |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [conference.md](../entities/conference.md) | Primary key for Conference aggregate |
| [create-conference.handler.ts](../../../../../packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts) | Input parameter for conference creation |
| [conference.repository.ts](../../../../../packages/modules/conference/src/infrastructure/database/conference.repository.ts) | Query parameter for repository methods |

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
| **Generation** | `ConferenceId.generate()` creates new UUIDv4 (called inside `Conference.create()`) |
| **Creation** | `ConferenceId.create('123e...')` validates and wraps string |
| **Comparison** | `conferenceId.equals(otherId)` checks value equality |
| **Serialization** | `conferenceId.value` is used for storage/transmission |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `DomainInvariantError('INVALID_CONFERENCE_ID')` | Invalid UUID format provided to `create()`/`fromData()` (→ `400 INVALID_CONFERENCE_ID` on the GET-by-id controller) |

> There is no `InvalidConferenceIdError` or `DuplicateConferenceIdError` class in
> `domain/exceptions/` — rejections use the shared `DomainInvariantError` with the code above.
> Duplicate ids cannot reach the DB anyway: `Conference.create()` mints the id and `save()`
> upserts by primary key.
