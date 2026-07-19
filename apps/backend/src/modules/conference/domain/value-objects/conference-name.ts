/**
 * ConferenceName - The title/name of a Conference.
 *
 * Value Object: String with validation
 * Invariants:
 *   - Must be 3-100 characters
 *   - Must not be empty or whitespace-only
 *   - Whitespace is trimmed
 */

export class ConferenceName implements ConferenceName {
  static create(name: string): ConferenceName {
    const trimmed = name.trim();

    if (trimmed.length < 3) {
      throw new Error(
        `ConferenceName must be at least 3 characters, got ${trimmed.length}`,
      );
    }

    if (trimmed.length > 100) {
      throw new Error(
        `ConferenceName must be at most 100 characters, got ${trimmed.length}`,
      );
    }

    return new ConferenceName(trimmed);
  }

  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: ConferenceName): boolean {
    return this._value === other._value;
  }
}
