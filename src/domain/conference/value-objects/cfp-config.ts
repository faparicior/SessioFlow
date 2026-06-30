import {CfpEndDate} from './cfp-end-date.ts';
import {CfpStartDate} from './cfp-start-date.ts';
import {CfpStatus} from './cfp-status.ts';
import {MaxSubmissions} from './max-submissions.ts';

export type CfpConfigData = {
  startDate: Date;
  endDate: Date;
  maxSubmissions?: number | undefined;
  requiresApproval: boolean;
};

export class CfpConfig {
  static create(
    config: CfpConfigData,
    options: {now?: Date; requireFutureStart?: boolean} = {},
  ) {
    const now = options.now ?? new Date();
    const requireFutureStart = options.requireFutureStart ?? true;
    let startDateResult;
    startDateResult = requireFutureStart ? CfpStartDate.create(config.startDate, now) : {ok: true as const, value: CfpStartDate.fromDate(config.startDate)};
    if (!startDateResult.ok) {
      return {ok: false as const, error: startDateResult.error};
    }

    const endResult = CfpEndDate.createAfter(config.endDate, startDateResult.value.getValue());
    if (!endResult.ok) {
      return {ok: false as const, error: endResult.error};
    }

    if (
      config.maxSubmissions !== undefined
      && config.maxSubmissions !== null
      && (!Number.isInteger(config.maxSubmissions) || config.maxSubmissions <= 0)
    ) {
      return {ok: false as const, error: 'maxSubmissions must be a positive integer'};
    }

    const value = new CfpConfig(
      startDateResult.value,
      endResult.value,
      MaxSubmissions.create(config.maxSubmissions ?? undefined),
      config.requiresApproval,
    );
    return {ok: true as const, value};
  }

  isActive(referenceDate?: Date): boolean {
    if (this.status !== CfpStatus.ACTIVE) {
      return false;
    }

    const now = referenceDate ?? new Date();
    const normalized = new Date(now);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized >= this.startDate.getValue() && normalized <= this.endDate.getValue();
  }

  isWithinWindow(date: Date): boolean {
    return date >= this.startDate.getValue() && date <= this.endDate.getValue();
  }

  daysRemaining(): number {
    return this.endDate.daysRemaining();
  }

  equals(other: CfpConfig): boolean {
    return (
      this.startDate.equals(other.startDate)
      && this.endDate.equals(other.endDate)
      && this.maxSubmissions.equals(other.maxSubmissions)
      && this.requiresApproval === other.requiresApproval
      && this.status === other.status
    );
  }

  toJson() {
    return {
      startDate: this.startDate.toIsoString(),
      endDate: this.endDate.toIsoString(),
      maxSubmissions: this.maxSubmissions.toString(),
      requiresApproval: this.requiresApproval,
      status: this.status,
    };
  }

  private constructor(
    public readonly startDate: CfpStartDate,
    public readonly endDate: CfpEndDate,
    public readonly maxSubmissions: MaxSubmissions,
    public readonly requiresApproval: boolean,
    public readonly status: CfpStatus = CfpStatus.ACTIVE,
  ) {}
}
