# SessioFlow Development Rules & Linting Guidelines

This reference document outlines key linting conventions and guidelines enforced by the project linter (**XO** / ESLint). Adhering to these rules will prevent CI pipeline failures and ensure consistent code quality.

---

## 🛡️ Type Safety & `any` Prevention
* **Avoid `any` Assignments:** Never assign `any` to typed variables. Always define explicit interfaces or use type guards/assertions when dealing with external API responses or JSON parsing.
* **Property Access:** Do not read properties directly from `any` objects. Cast to a known interface or use `unknown` with a type predicate.
  * *Bad:* `const name = (response as any).name;`
  * *Good:* 
    ```typescript
    interface UserResponse { name: string; }
    const name = (response as UserResponse).name;
    ```

## 🔀 Coalescing Operators
* **Prefer Nullish Coalescing (`??`):** Use `??` instead of logical OR (`||`) when assigning fallback values. `||` incorrectly coerces falsy values (like `0` or empty strings `""`).
  * *Bad:* `const name = input.name || 'Anonymous';`
  * *Good:* `const name = input.name ?? 'Anonymous';`

## 🧱 DDD Entity & Value Object Design
* **Member Ordering:** Factory methods, static creators (e.g., `create()`, `fromISOString()`, `fromString()`), and static properties must be declared **before** private constructors in domain classes.
* **Constructor Parameters (`max-params`):** Constructors must have **at most 4 parameters**. If an Entity or Value Object requires more parameters, group them into a single option object/interface.
  * *Bad:*
    ```typescript
    constructor(id: string, name: string, date: Date, status: string, max: number) {}
    ```
  * *Good:*
    ```typescript
    interface ConferenceProps {
      id: string;
      name: string;
      date: Date;
      status: string;
      max: number;
    }
    constructor(props: ConferenceProps) {}
    ```

## 📝 Schema Validation (Zod)
* **Use Modern/Non-deprecated Zod Methods:** Avoid deprecated method chains. Use recommended alternatives such as:
  * `z.uuid()` instead of the legacy deprecated `uuid()` configurations.
  * Modern date validation helpers instead of legacy `date()` or `datetime()` configurations.
