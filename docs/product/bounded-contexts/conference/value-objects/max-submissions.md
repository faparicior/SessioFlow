# Value Object: MaxSubmissions

## 📋 Definition
* **Description:** Optional limit on the maximum number of submissions allowed for an event.
* **Type:** Integer (positive, optional)
* **Immutability:** ✅ Immutable
* **Validation:** Must be positive integer if provided

---

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| **Positive** | Must be greater than 0 |
| **Integer** | Must be a whole number (no decimals) |
| **Reasonable Limit** | Maximum 10,000 (configurable) |
| **Optional** | Can be null/undefined for unlimited submissions |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `create(value: number)` | Create from validated integer |
| `isUnlimited()` | Check if this represents unlimited submissions |
| `canAccept(currentCount: number)` | Check if more submissions are allowed |
| `remaining(currentCount: number)` | Calculate remaining submission slots |
| `equals(other: MaxSubmissions)` | Compare for equality |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [[cfp-config.md]] | Part of CfpConfig composite |
| [[../entities/conference.md]] | Used in Conference's CfpConfig |
| [[../../application/use-cases/submit-proposal.ts]] | Validate submission limits |

---

## 📚 DDD Principles Applied

1. **Encapsulation**: Private constructor prevents invalid values
2. **Validation**: Positive integer constraint enforced at creation
3. **Behavior**: Includes `canAccept()`, `remaining()` for domain logic
4. **Optional**: Supports null/undefined for unlimited case
5. **Immutability**: Once created, the value cannot change

---

## 🔄 Usage Examples

| Scenario | Description |
|----------|-------------|
| **Unlimited** | `MaxSubmissions.create(null)` or `undefined` |
| **Limited** | `MaxSubmissions.create(100)` allows 100 submissions |
| **Check Capacity** | `maxSubmissions.canAccept(50)` returns true if 50 < limit |
| **Remaining Slots** | `maxSubmissions.remaining(50)` returns 50 if limit is 100 |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidMaxSubmissionsError` | Value is not a positive integer |
| `MaxSubmissionsTooHighError` | Value exceeds maximum allowed (10,000) |
| `MaxSubmissionsZeroError` | Value is 0 or negative |
