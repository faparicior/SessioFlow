# Value Object: ConferenceSlug

## 📋 Definition
* **Description:** URL-safe identifier generated from conference name. Used for public CfP links and conference URLs.
* **Type:** String (slugified from conference name)
* **Immutability:** ✅ Immutable
* **Validation:** Format, uniqueness, length constraints

---

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| **Format** | Lowercase alphanumeric with hyphens only |
| **No Special Characters** | Converted from original name (e.g., "Tech Conference 2026" → "tech-conference-2026") |
| **Unique** | Must be unique across all conferences (enforced at repository level) |
| **Length** | Maximum 100 characters after slugification |
| **Non-empty** | Cannot be empty or only hyphens |

---

## 🎯 Behavior

| Method | Purpose |
|--------|---------|
| `create(name: string)` | Generate slug from conference name (throws on invalid input) |
| `equals(other: ConferenceSlug)` | Compare two ConferenceSlug instances for equality |
| `toString()` | Convert to string representation |
| `toCfpUrl(basePath: string)` | Generate full CfP URL (e.g., `{basePath}/cfp/{slug}`) |

---

## 🔗 Referenced By

| Entity / Use Case | Usage |
|-------------------|-------|
| [conference.md](../entities/conference.md) | Property of Conference aggregate |
| [create-conference.ts](../../../../../src/application/conference/use-cases/create-conference.ts) | Auto-generated from conference name |
| [cfp-page.tsx](../../../../../src/interfaces/web/cfp-page.tsx) | Used in public CfP route |

---

## 📚 DDD Principles Applied

1. **Encapsulation**: Private constructor prevents invalid slugs
2. **Validation**: Format and uniqueness enforced at creation time
3. **Behavior**: Includes `toCfpUrl()` for domain-relevant operations
4. **Derivation**: Generated from ConferenceName, not user input
5. **Immutability**: Once created, the value cannot change

---

## 🔄 Usage Examples

| Scenario | Description |
|----------|-------------|
| **Generation** | `ConferenceSlug.create('Tech Conference 2026')` → "tech-conference-2026" |
| **Comparison** | `conferenceSlug.equals(otherSlug)` checks value equality |
| **URL Generation** | `conferenceSlug.toCfpUrl('https://sessioflow.app')` → "https://sessioflow.app/cfp/tech-conference-2026" |

---

## ⚠️ Error Conditions

| Error | Trigger |
|-------|---------|
| `InvalidConferenceSlugError` | Name cannot be converted to valid slug (empty, only special chars) |
| `SlugTooLongError` | Slug exceeds 100 characters after conversion |
| `SlugAlreadyTakenError` | Slug already exists in database (repository level) |

---

## 🔄 Slug Generation Rules

| Original Character | Slug Replacement |
|--------------------|------------------|
| Uppercase letters | Lowercase |
| Spaces | Hyphens (-) |
| Special characters | Removed |
| Multiple consecutive hyphens | Single hyphen |
| Leading/trailing hyphens | Removed |

**Examples:**
| Input | Output |
|-------|--------|
| "Tech Conference 2026" | "tech-conference-2026" |
| "Startup! Summit" | "startup-summit" |
| "  Dev  Meetup  " | "dev-meetup" |
| "AI/ML Workshop" | "ai-ml-workshop" |
