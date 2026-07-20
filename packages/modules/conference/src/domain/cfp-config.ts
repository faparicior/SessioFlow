import { type CfpStartDate } from './value-objects/cfp-start-date';
import { type CfpEndDate } from './value-objects/cfp-end-date';
import { type MaxSubmissions } from './value-objects/max-submissions';
import { type RequiresApproval } from './value-objects/requires-approval';
import { CfpStatus } from './value-objects/cfp-status';
import { CfpDatesInvalidError } from './exceptions/cfp-dates-invalid-error';

/**
 * CfpConfig - Child entity of the Conference aggregate.
 *
 * Configuration settings for a Call for Papers (CfP) submission window.
 * Defines the submission period, rules, and settings for how speakers can submit proposals.
 *
 * DDD Pattern:
 *   - Child Entity (at domain root)
 *   - Managed by Conference aggregate root
 */
export type CfpConfigData = {
  startDate: CfpStartDate;
  endDate: CfpEndDate;
  maxSubmissions: MaxSubmissions;
  requiresApproval: RequiresApproval;
  status: CfpStatus;
};

export class CfpConfig {
  static create(parameters: {
    startDate: CfpStartDate;
    endDate: CfpEndDate;
    maxSubmissions: MaxSubmissions;
    requiresApproval: RequiresApproval;
  }): CfpConfig {
    return new CfpConfig({
      startDate: parameters.startDate,
      endDate: parameters.endDate,
      maxSubmissions: parameters.maxSubmissions,
      requiresApproval: parameters.requiresApproval,
      status: CfpStatus.ACTIVE,
    });
  }

  private constructor(private readonly _params: CfpConfigData) {}

  validateDates(): void {
    if (this.endDate.isBefore(this.startDate.value)) {
      throw new CfpDatesInvalidError('CfP end date must be after start date');
    }
  }

  isActive(): boolean {
    if (this.status !== CfpStatus.ACTIVE) {
      return false;
    }

    const now = new Date();
    return now >= this.startDate.value && now <= this.endDate.value;
  }

  close(): void {
    if (this.status !== CfpStatus.ACTIVE) {
      throw new Error('Cannot close CfP: status is not ACTIVE');
    }

    this._params.status = CfpStatus.CLOSED;
  }

  isWithinWindow(date: Date): boolean {
    return date >= this.startDate.value && date <= this.endDate.value;
  }

  get startDate(): CfpStartDate {
    return this._params.startDate;
  }

  get endDate(): CfpEndDate {
    return this._params.endDate;
  }

  get maxSubmissions(): MaxSubmissions {
    return this._params.maxSubmissions;
  }

  get requiresApproval(): RequiresApproval {
    return this._params.requiresApproval;
  }

  get status(): CfpStatus {
    return this._params.status;
  }
}
