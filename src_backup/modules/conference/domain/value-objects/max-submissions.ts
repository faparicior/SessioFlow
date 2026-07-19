/**
 * MaxSubmissions - Maximum number of submissions allowed for a conference.
 *
 * Value Object: Integer (optional)
 * Invariants:
 *   - Must be a positive integer if provided
 *   - Can be undefined (unlimited)
 */

export class MaxSubmissions implements MaxSubmissions {
  static create(max?: number): MaxSubmissions {
    if (max !== undefined && (!Number.isInteger(max) || max <= 0)) {
      throw new Error('MaxSubmissions must be a positive integer');
    }

    return new MaxSubmissions(max);
  }

  private constructor(private readonly _value?: number) {}

  get value(): number | undefined {
    return this._value;
  }

  isUnlimited(): boolean {
    return this._value === undefined;
  }

  isExceeded(currentCount: number): boolean {
    if (this._value === undefined) {
      return false;
    }

    return currentCount >= this._value;
  }
}
