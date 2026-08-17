import {MaxSubmissionsInvalidError} from '../exceptions/max-submissions-invalid-error.js';

const MAX_CAP = 10_000;

/**
 * MaxSubmissions - Optional submission cap; `undefined` means unlimited.
 */
export class MaxSubmissions {
  private constructor(private readonly _value: number | undefined) {}

  public static create(value: number | null | undefined): MaxSubmissions {
    if (value === null || value === undefined) {
      return new MaxSubmissions(undefined);
    }
    if (!Number.isInteger(value) || value <= 0 || value > MAX_CAP) {
      throw new MaxSubmissionsInvalidError();
    }
    return new MaxSubmissions(value);
  }

  public static fromData(value: number | null | undefined): MaxSubmissions {
    return MaxSubmissions.create(value);
  }

  public get value(): number | undefined {
    return this._value;
  }

  public isUnlimited(): boolean {
    return this._value === undefined;
  }

  public canAccept(currentCount: number): boolean {
    return this._value === undefined || currentCount < this._value;
  }

  public remaining(currentCount: number): number | null {
    return this._value === undefined ? null : Math.max(0, this._value - currentCount);
  }

  public equals(other: MaxSubmissions): boolean {
    if (!other || !(other instanceof MaxSubmissions)) return false;
    return (this._value ?? null) === (other._value ?? null);
  }
}
