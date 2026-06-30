export class MaxSubmissions {
  static readonly maxAllowed = 10_000;

  static create(value: number | undefined): MaxSubmissions {
    if (value === undefined) {
      return new MaxSubmissions(null);
    }

    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('MaxSubmissions must be a positive integer');
    }

    if (value > MaxSubmissions.maxAllowed) {
      throw new Error(`MaxSubmissions cannot exceed ${MaxSubmissions.maxAllowed}`);
    }

    return new MaxSubmissions(value);
  }

  isUnlimited(): boolean {
    return this.value === null;
  }

  canAccept(currentCount: number): boolean {
    if (this.isUnlimited()) {
      return true;
    }

    return currentCount < this.value;
  }

  remaining(currentCount: number): number {
    if (this.isUnlimited()) {
      return Infinity;
    }

    return Math.max(0, this.value - currentCount);
  }

  equals(other: MaxSubmissions): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.isUnlimited() ? 'unlimited' : String(this.value);
  }

  private constructor(private readonly value: number | undefined) {}
}
