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
* **External JSON Parsing:** When parsing JSON from external APIs (e.g., `fetch().json()` returns `any`), use a type assertion function with `asserts` keyword instead of `as` casts or eslint suppressions.
  ```typescript
  function assumeType<T>(value: unknown): asserts value is T {
    if (value === undefined) {
      throw new TypeError('Value is undefined');
    }
  }

  async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
    const json: unknown = await response.json();
    assumeType<ApiResponse<T>>(json);
    return json;
  }
  ```
* **Request Body Parsing:** When parsing request bodies (e.g., `request.json()` returns `any`), cast to `unknown` first, then validate with Zod or use `assumeType`.
  ```typescript
  // Option 1: Cast to unknown, then validate with Zod
  const body = (await request.json()) as unknown;
  const parsed = schema.safeParse(body);

  // Option 2: Use assumeType for direct narrowing
  const body = await request.json();
  assumeType<RequestSchema>(body);
  ```
* **Enum Validation from External Data:** When mapping external data (e.g., database rows) to enum types, use a type predicate for validation.
  ```typescript
  export const StatusValues = [Status.A, Status.B, Status.C] as const;

  export function isStatus(value: unknown): value is Status {
    return typeof value === 'string' && StatusValues.includes(value as Status);
  }

  export function StatusFromString(value: unknown): Status {
    if (!isStatus(value)) {
      throw new Error(`Invalid status: ${String(value)}`);
    }
    return value;
  }
  ```

## 🔀 Coalescing Operators
* **Prefer Nullish Coalescing (`??`):** Use `??` instead of logical OR (`||`) when assigning fallback values. `||` incorrectly coerces falsy values (like `0` or empty strings `""`).
  * *Bad:* `const name = input.name || 'Anonymous';`
  * *Good:* `const name = input.name ?? 'Anonymous';`
* **Boolean Conditions:** When using `||` in boolean conditions (e.g., `if` statements), use explicit null checks to avoid lint false positives.
  * *Bad:* `if (error || !conference)` — linter flags `||` as potential fallback
  * *Good:* `if (error !== null || !conference)` — explicit intent, no lint warning
  * *Why:* The `prefer-nullish-coalescing` rule can't distinguish between fallback `||` and boolean `||` in conditions. Use explicit checks for clarity.

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

## 📝 Schema Validation (Zod v4)
* **UUID Validation:**
  * `z.uuid()` validates strictly per RFC 9562 (variant bits must be `10`). Returns a **branded UUID type**, not plain `string`.
  * `z.guid()` is permissive (UUID-like) and returns a plain `string`. Use this when you need string compatibility.
  * `z.string().uuid()` and `z.string().guid()` are **deprecated**. Use `z.uuid()` or `z.guid()` directly.
  * When a branded UUID type isn't compatible with expected `string`, add `.transform(v => v ?? '')`.
  * *Good:* `z.guid().optional().transform(v => v ?? '')`
  * *Good:* `z.uuid()` (when branded type is acceptable)
* **Date/Time Validation:**
  * `z.iso.date()` instead of `z.string().date()`
  * `z.iso.datetime()` instead of `z.string().datetime()`
  * `z.url()` instead of `z.string().url()`
* **Error Handling:**
  * `z.treeifyError(err)` instead of `err.flatten()` or `err.format()`
  * `z.treeifyError()` returns an object (not `Error`), so pass `JSON.stringify()` to loggers expecting `Error` type.
  * *Good:* `logger.error('msg', JSON.stringify(z.treeifyError(err)))`
  * *Good:* `return NextResponse.json({ details: z.treeifyError(err) })`
* **Avoid Deprecated Patterns:**
  * `z.string().email()` → `z.email()`
  * `z.string().ipv4()` / `z.string().ipv6()` → `z.ipv4()` / `z.ipv6()`
  * `z.string().cidr()` → `z.cidrv4()` / `z.cidrv6()` (use union for both)
  * `z.string().base64url()` → `z.base64url()`
  * `z.ostring()`, `z.onumber()` etc. → removed, use `.optional()` instead
  * `z.strict()` / `z.passthrough()` → use `z.strictObject()` / `z.looseObject()`
