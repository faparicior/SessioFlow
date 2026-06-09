# Value Object: CfpEndDate

## 📋 Definition
* **Description:** The date and time when the Call for Papers closes for submissions.
* **Type:** DateTime (UTC)
* **Immutability:** ✅ Immutable
* **Validation:** Must be after start date, valid date format

---

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| **After Start** | Must be after `CfpStartDate` |
| **Valid Format** | Must be parseable ISO 8601 datetime |
| **Reasonable Duration** | Cannot be more than 180 days after start (configurable) |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `create(date: Date)` | Create from validated Date object |
| `isAfter(other: Date)` | Check if date is after another date |
| `daysRemaining()` | Calculate days until end date |
| `equals(other: CfpEndDate)` | Compare for equality |
| `toString()` | Convert to ISO 8601 string |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [[cfp-config.md]] | Part of CfpConfig composite |
| [[../entities/event.md]] | Used in Event's CfpConfig |

---

## 📚 DDD Principles Applied

1. **Encapsulation**: Private constructor prevents invalid dates
2. **Validation**: Must be after start date, enforced at creation
3. **Behavior**: Includes `isAfter()`, `daysRemaining()` for domain logic
4. **Immutability**: Once created, the value cannot change

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidCfpEndDateError` | Invalid date format |
| `EndDateBeforeStartDateError` | Date is before start date |
| `EndDateTooFarFutureError` | Date is more than 180 days after start |
