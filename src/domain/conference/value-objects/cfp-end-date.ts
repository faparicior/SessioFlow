export class CfpEndDate {
  static create(date: Date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return {ok: false as const, error: 'Invalid date'};
    }

    return {ok: true as const, value: new CfpEndDate(date)};
  }

  static createAfter(date: Date, startDate: Date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return {ok: false as const, error: 'Invalid date'};
    }

    if (date <= startDate) {
      return {ok: false as const, error: 'End date must be after start date'};
    }

    return {ok: true as const, value: new CfpEndDate(date)};
  }

  getValue(): Date {
    return this.value;
  }

  daysRemaining(): number {
    const now = new Date();
    const diff = this.value.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  equals(other: CfpEndDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  toIsoString(): string {
    return this.value.toISOString();
  }

  private constructor(private readonly value: Date) {}
}
