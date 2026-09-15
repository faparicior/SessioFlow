# Value Object: CfpConfig

## 📋 Definition
* **Description:** Configuration for the Call for Papers submission window. Contains dates and settings that control proposal submission behavior.
* **Type:** Composite Value Object (contains multiple date/value objects)
* **Immutability:** ✅ Immutable
* **Validation:** Date constraints, logical consistency

---

## 🎯 Composition

| Property | Type | Description |
|----------|------|-------------|
| `startDate` | `CfpStartDate` | When CfP opens for submissions |
| `endDate` | `CfpEndDate` | When CfP closes for submissions |
| `maxSubmissions` | `MaxSubmissions` (optional) | Maximum number of submissions allowed |
| `requiresApproval` | `RequiresApproval` | Whether submissions need organizer approval |

---

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| **Date Order** | `endDate` must be after `startDate` |
| **Future Start** | `startDate` must be in the future at creation |
| **Max Submissions** | If set, must be a positive integer |
| **Timezone** | All dates stored in UTC for consistency |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `create(startDate, endDate, options)` | Create validated CfpConfig (throws on invalid dates) |
| `isActive()` | Check if current time is within submission window |
| `isWithinWindow(date: Date)` | Check if a date falls within the CfP window |
| `daysRemaining()` | Calculate days until CfP closes (if active) |
| `validateDates()` | Validate date constraints (throws on violation) |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [cfp-config.md](../entities/cfp-config.md) | Embedded in Conference aggregate |
| [conference.md](../entities/conference.md) | Child entity of Conference |
| `submit-proposal.ts` (planned) | Check if submissions allowed |

---

## 🔒 Invariants & Business Rules

*The `Enforces` edge — every rule below must list this value object back in its `Enforced by` table.
Convention: [Traceability](../../../guidelines/traceability.md).*

| Rule | Enforced by | Test |
| ---- | ----------- | ---- |
| [BR-001](../business-rules/BR-001-cfp-dates-validation.md) | `CfpConfig.create()` — window + order checks | `tests/unit/modules/conference/domain/cfp-config.test.ts` |
| [BR-005](../business-rules/BR-005-cfp-submission-when-active.md) | `CfpConfig.isActive()` / `.isWithinWindow(date)` — submission use case ⏳ Planned | `tests/unit/modules/conference/domain/cfp-config.test.ts` |
| [INV-002](../invariants/INV-002-cfp-date-order.md) | `CfpConfig.create()` → `CfpDatesInvalidError`; `fromData()` exempts reconstitution | `tests/unit/modules/conference/domain/cfp-config.test.ts` |

## 📚 DDD Principles Applied

1. **Encapsulation**: Private constructor prevents invalid configurations
2. **Validation**: All constraints enforced at creation time
3. **Behavior**: Includes `isActive()`, `isWithinWindow()` for domain logic
4. **Composite Value Object**: Combines multiple related value objects
5. **Immutability**: Once created, the configuration cannot change

---

## 🔄 Usage Examples

| Scenario | Description |
|----------|-------------|
| **Creation** | `CfpConfig.create(start, end)` validates and creates configuration |
| **Active Check** | `cfpConfig.isActive()` returns true if within submission window |
| **Date Check** | `cfpConfig.isWithinWindow(someDate)` validates date falls in window |
| **Days Remaining** | `cfpConfig.daysRemaining()` calculates time until close |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `CfpDatesInvalidError` | `endDate` not after `startDate`, or the window exceeds 180 days ([INV-002](../invariants/INV-002-cfp-date-order.md)) |
| `InvalidCfpStartDateError` | `startDate` malformed or in the past (creation path) |
| `InvalidCfpEndDateError` | `endDate` malformed |
| `InvalidCfpStatusError` | `close()` called from a status that is not `ACTIVE` |
| `MaxSubmissionsInvalidError` | `maxSubmissions` is not a positive integer |

---

## 🔗 Related Value Objects

| Value Object | Purpose |
|--------------|---------|
| [cfp-start-date.md](cfp-start-date.md) | CfP window start date |
| [cfp-end-date.md](cfp-end-date.md) | CfP window end date |
| [max-submissions.md](max-submissions.md) | Maximum submission limit |
| [cfp-status.md](cfp-status.md) | Active/Inactive status |
