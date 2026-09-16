# Value Object: OrganizerId

## 📋 Definition

* **Description:** Identity of the authenticated user who owns a conference — the tenant key every
  ownership-scoped query (BR-004 free-tier count) is filtered by.

* **Implementation:** `packages/modules/conference/src/domain/value-objects/organizer-id.ts`

* **Type:** String (wraps the auth-provider user id; mocked `mock-user-id` in Wave 1 — F1-D12)

* **Immutability:** ✅ Immutable

* **Validation:** none shipped — see ⚠️ below

---

## ✅ Validation Rules

| Rule | Description |
| --- | --- |
| **⚠️ No validation in code** | `create()` and `fromData()` wrap *any* string, including `''`. Feature 01's VO table specifies "Non-empty string (auth user id)" but the check was never implemented — a known gap, not shipped behaviour |
| **Trust boundary** | Safety comes from *where the value comes from*, not from the VO: `organizerId` is injected by the controller from the `getAuthUser()` auth port, never from the request body (`create-conference.controller.ts`) |
| **Reconstitution** | `fromData()` is identical to `create()` — neither validates |

> If an `OrganizerId.create()` non-empty guard is ever added, it must reject `''` and whitespace —
> then the ⚠️ row above flips to a real rule and Feature 01's spec becomes true.

---

## 🎯 Behavior

| Method | Purpose |
| --- | --- |
| `create(value: string)` | Wrap the authenticated user id (no validation today) |
| `fromData(value: string)` | Reconstitute a persisted organizer id |
| `get value(): string` | Plain-string projection |
| `equals(other: OrganizerId)` | Structural equality |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
| --- | --- |
| [conference.md](../entities/conference.md) | `ConferenceData.organizerId` — "tenant key for BR-004" |
| [create-conference.handler.ts](../../../../../packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts) | `OrganizerId.create(input.organizerId)` feeding the BR-004 count |
| [conference-repository.interface.ts](../../../../../packages/modules/conference/src/domain/conference-repository.interface.ts) | Parameter of `countActiveByOrganizerId()` |

---

## 🔒 Invariants & Business Rules

*The `Enforces` edge — every rule below must list this value object back in its `Enforced by` table.
Convention: [Traceability](../../../guidelines/traceability.md).*

*none* — `OrganizerId` is the **subject** of [BR-004](../business-rules/BR-004-free-tier-conference-limit.md)
(it is the key the quota is counted per), but it enforces nothing itself: `create()` has no guard.
BR-004's enforcement sites are the handler, repository port and infrastructure — see its
`Enforced by` table; this VO is intentionally **not** a row there.

### Verified by

* `tests/unit/modules/conference/domain/value-objects/organizer-id.test.ts` —
  "wraps an organizer identifier", "reconstitutes historical identifiers via fromData",
  "implements structural equality"

---

## 📚 DDD Principles Applied

1. **Encapsulation**: private constructor; aggregate data never holds a raw organizer string
2. **Explicit identity**: distinguishes organizer ids from other string identifiers at compile time
3. **Immutability**: once created, the value cannot change
