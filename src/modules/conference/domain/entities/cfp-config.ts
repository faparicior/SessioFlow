import {type CfpStartDate} from '../value-objects/cfp-start-date';
import {type CfpEndDate} from '../value-objects/cfp-end-date';
import {type MaxSubmissions} from '../value-objects/max-submissions';
import {type RequiresApproval} from '../value-objects/requires-approval';
import {CfpStatus} from '../value-objects/cfp-status';
import {CfpDatesInvalidError} from '../exceptions/cfp-dates-invalid-error';

/**
 * CfpConfig - Child entity of the Conference aggregate.
 *
 * Configuration settings for a Call for Papers (CfP) submission window.
 * Defines the submission period, rules, and settings for how speakers can submit proposals.
 *
 * DDD Pattern:
 *   - Child Entity (Embedded)
 *   - No separate identity (uses parent Conference.id)
 *   - Managed by Conference aggregate root
 *
 * State Machine:
 *   ACTIVE → CLOSED → ARCHIVED
 */
export type CfpConfigData = {
  startDate: CfpStartDate;
  endDate: CfpEndDate;
  maxSubmissions: MaxSubmissions;
  requiresApproval: RequiresApproval;
  status: CfpStatus;
};

export class CfpConfig {
  /**
   * Factory method to create a new CfpConfig in ACTIVE state.
   */
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

  /**
   * Validate CfP dates: end date must be after start date.
   */
  validateDates(): void {
    if (this.endDate.isBefore(this.startDate)) {
      throw new CfpDatesInvalidError('CfP end date must be after start date');
    }
  }

  /**
   * Check if CfP is currently active (accepting submissions).
   */
  isActive(): boolean {
    if (this.status !== CfpStatus.ACTIVE) {
      return false;
    }

    const now = new Date();
    return now >= this.startDate.value && now <= this.endDate.value;
  }

  /**
   * Close the CfP submission window.
   */
  close(): void {
    if (this.status !== CfpStatus.ACTIVE) {
      throw new Error('Cannot close CfP: status is not ACTIVE');
    }

    this._params.status = CfpStatus.CLOSED;
  }

  /**
   * Check if a date falls within the CfP window.
   */
  isWithinWindow(date: Date): boolean {
    return date >= this.startDate.value && date <= this.endDate.value;
  }

  // Getters
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
