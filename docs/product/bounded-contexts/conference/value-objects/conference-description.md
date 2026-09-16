# Value Object: ConferenceDescription

## 📋 Definition

* **Description:** Optional free-text description of a conference, displayed on the creation form and dashboard.

* **Implementation:** `packages/modules/conference/src/domain/value-objects/conference-description.ts`

* **Type:** String (length-bounded)

* **Immutability:** ✅ Immutable

* **Validation:** Max length only; empty string allowed (it is the field default)

---

## ✅ Validation Rules

| Rule | Description |
| --- | --- |
| **Optional** | Empty string `''` is valid — the shared Zod schema defaults the field to `''` |
| **Maximum Length** | At most 1000 characters (`MAX_DESCRIPTION_LENGTH`), enforced in `create()` |
| **No trim** | Unlike `ConferenceName`, the value is stored exactly as given |
| **Reconstitution** | `fromData()` bypasses the length check (rows are trusted once persisted) |

> The 1000-char bound is duplicated in the shared contract
> (`ConferenceCreateSchema.description.max(1000)`, `packages/api-definitions/src/zod/conference.ts`)
> and in `create()` — defense in depth, edit both together. There is **no dedicated BR doc** for
> this policy yet; if it ever grows organizer-facing wording, it should be promoted to a `BR-XXX`.

---

## 🎯 Behavior

| Method | Purpose |
| --- | --- |
| `create(value: string)` | Create from string; throws `DomainInvariantError('INVALID_INVARIANT', 'Description cannot exceed 1000 characters')` when over the cap |
| `fromData(value: string)` | Reconstitute a persisted description (no validation) |
| `get value(): string` | Plain-string projection |
| `equals(other: ConferenceDescription)` | Structural equality |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
| --- | --- |
| [conference.md](../entities/conference.md) | Property of the Conference aggregate (`ConferenceData.description`) |
| [create-conference.handler.ts](../../../../../packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts) | `ConferenceDescription.create(input.description)` during creation |
| [conference.repository.ts](../../../../../packages/modules/conference/src/infrastructure/database/conference.repository.ts) | `fromData(row.description ?? '')` on reconstitution |

---

## 🔒 Invariants & Business Rules

*The `Enforces` edge — every rule below must list this value object back in its `Enforced by` table.
Convention: [Traceability](../../../guidelines/traceability.md).*

*none yet* — no `BR-*`/`INV-*` doc currently claims this VO as an enforcement site. The length
policy lives in the Zod contract and this `create()` only.

### Verified by

* `tests/unit/modules/conference/domain/value-objects/conference-description.test.ts` —
  "allows an empty description (optional field)", "accepts the 1000-character boundary",
  "rejects descriptions over 1000 characters"

---

## 📚 DDD Principles Applied

1. **Encapsulation**: private constructor prevents invalid direct instantiation
2. **Type Safety**: aggregate data never holds a raw description string
3. **Immutability**: once created, the value cannot change
