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
| [[../entities/cfp-config.md]] | Embedded in Event aggregate |
| [[../entities/event.md]] | Child entity of Event |
| [[../../application/use-cases/submit-proposal.ts]] | Check if submissions allowed |

---

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
| `InvalidCfpConfigError` | General configuration validation failure |
| `InvalidCfpDateError` | Start or end date is invalid |
| `EndDateBeforeStartDateError` | `endDate` is before `startDate` |
| `StartDateInPastError` | `startDate` is in the past |
| `MaxSubmissionsInvalidError` | `maxSubmissions` is not a positive integer |

---

## 🔗 Related Value Objects

| Value Object | Purpose |
|--------------|---------|
| [[cfp-start-date]] | CfP window start date |
| [[cfp-end-date]] | CfP window end date |
| [[max-submissions]] | Maximum submission limit |
| [[cfp-status]] | Active/Inactive status |
