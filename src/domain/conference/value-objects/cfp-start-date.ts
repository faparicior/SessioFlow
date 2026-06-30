export class CfpStartDate {
  static create(date: Date, referenceDate?: Date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return {ok: false as const, error: 'Invalid date'};
    }

    const now = referenceDate ?? new Date();
    if (date <= now) {
      return {ok: false as const, error: 'Start date must be in the future'};
    }

    const oneYearFromNow = new Date(now);
    oneYearFromNow.setUTCFullYear(oneYearFromNow.getUTCFullYear() + 1);
    if (date > oneYearFromNow) {
      return {ok: false as const, error: 'Start date cannot be more than 1 year in the future'};
    }

    return {ok: true as const, value: new CfpStartDate(date)};
  }

  static fromDate(date: Date): CfpStartDate {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new TypeError('Invalid date');
    }

    return new CfpStartDate(date);
  }

  getValue(): Date {
    return this.value;
  }

  isInFuture(): boolean {
    return this.value > new Date();
  }

  daysUntil(): number {
    const now = new Date();
    const diff = this.value.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  equals(other: CfpStartDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  toIsoString(): string {
    return this.value.toISOString();
  }

  private constructor(private readonly value: Date) {}
}
