# Value Object: CfpStartDate

## 📋 Definition
* **Description:** The date and time when the Call for Papers opens for submissions.
* **Type:** DateTime (UTC)
* **Immutability:** ✅ Immutable
* **Validation:** Must be in the future, valid date format

---

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| **Future Date** | Must be after current time at creation |
| **Valid Format** | Must be parseable ISO 8601 datetime |
| **Not Too Far** | Cannot be more than 365 days in the future (configurable) |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `create(date: Date)` | Create from validated Date object |
| `isInFuture()` | Check if date is in the future |
| `daysUntil()` | Calculate days until start date |
| `equals(other: CfpStartDate)` | Compare for equality |
| `toString()` | Convert to ISO 8601 string |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [cfp-config.md](cfp-config.md) | Part of CfpConfig composite |
| [conference.md](../entities/conference.md) | Used in Conference's CfpConfig |

---

## 📚 DDD Principles Applied

1. **Encapsulation**: Private constructor prevents invalid dates
2. **Validation**: Future date constraint enforced at creation
3. **Behavior**: Includes `isInFuture()`, `daysUntil()` for domain logic
4. **Immutability**: Once created, the value cannot change

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidCfpStartDateError` | Invalid date format |
| `StartDateInPastError` | Date is in the past |
| `StartDateTooFarFutureError` | Date is more than 365 days ahead |
