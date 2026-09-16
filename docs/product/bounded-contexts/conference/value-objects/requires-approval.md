# Value Object: RequiresApproval

## 📋 Definition

* **Description:** Whether accepted submissions need manual organizer approval before being
  scheduled. Part of the embedded `CfpConfig` configuration.

* **Implementation:** `packages/modules/conference/src/domain/value-objects/requires-approval.ts`

* **Type:** Boolean

* **Immutability:** ✅ Immutable

* **Validation:** none — a typed wrapper only; the field default (`true`) is applied by the shared
  Zod schema (`ConferenceCreateSchema.requiresApproval.optional().default(true)`)

---

## ✅ Validation Rules

| Rule | Description |
| --- | --- |
| **No invalid state** | Any boolean is meaningful; there is nothing to reject |
| **Default** | `true` when the client omits the field — the default lives in the contract layer, not the VO |
| **Persistence** | Stored inside the `conferences.cfp_config` JSONB (`requiresApproval` key) |

> Consumers of this flag (the submission-review workflow: auto-accept vs manual approve) are
> **Wave 2+** — nothing in Wave 1 branches on it beyond storing and echoing it back in
> `CreateConferenceResponse.cfp.requiresApproval`.

---

## 🎯 Behavior

| Method | Purpose |
| --- | --- |
| `create(value: boolean)` | Wrap the flag |
| `fromData(value: boolean)` | Reconstitute a persisted flag |
| `get value(): boolean` | Plain-boolean projection |
| `isApprovalRequired()` | Domain-phrased read of the flag |
| `equals(other: RequiresApproval)` | Structural equality |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
| --- | --- |
| [conference.md](../entities/conference.md) | Via the embedded `CfpConfig` |
| [cfp-config.md (entity)](../entities/cfp-config.md) | `CfpConfig.requiresApproval` member |
| [create-conference.handler.ts](../../../../../packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts) | `RequiresApproval.create(input.requiresApproval)` during CfP configuration build |

---

## 🔒 Invariants & Business Rules

*The `Enforces` edge — every rule below must list this value object back in its `Enforced by` table.
Convention: [Traceability](../../../guidelines/traceability.md).*

*none yet* — no `BR-*`/`INV-*` claims this VO as an enforcement site. The approval workflow the
flag configures is specified behavior (Wave 2+); when a submission-review flow ships, its rule doc
should list this VO if the flag gates it.

### Verified by

* `tests/unit/modules/conference/domain/value-objects/requires-approval.test.ts` —
  "wraps a boolean flag", "reports the approval requirement", "implements structural equality"

---

## 📚 DDD Principles Applied

1. **Encapsulation**: private constructor; no raw boolean floats through aggregate data
2. **Explicit intent**: `isApprovalRequired()` reads as domain language at call sites
3. **Immutability**: once created, the value cannot change
