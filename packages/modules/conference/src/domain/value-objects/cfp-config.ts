import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';
import {CfpDatesInvalidError} from '../exceptions/cfp-dates-invalid-error.js';
import {CfpEndDate} from './cfp-end-date.js';
import {CfpStartDate} from './cfp-start-date.js';
import {CfpStatus} from './cfp-status.js';
import {MaxSubmissions} from './max-submissions.js';
import {RequiresApproval} from './requires-approval.js';

const MS_PER_DAY = 86_400_000;
const MAX_WINDOW_DAYS = 180;

/**
 * Calendar-day anchor in UTC (DST-proof day arithmetic).
 */
function startOfUtcDayMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Persisted shape of the embedded CfP configuration (JSONB `cfp_config`).
 */
export type CfpConfigData = {
  startDate: string;
  endDate: string;
  maxSubmissions: number | null;
  requiresApproval: boolean;
  status: string;
};

/**
 * CfpConfig - Composite value object embedded in the Conference aggregate.
 * Enforces INV-002 (end after start) and the 180-day window at creation.
 */
export class CfpConfig {
  private constructor(
    private readonly _startDate: CfpStartDate,
    private readonly _endDate: CfpEndDate,
    private readonly _maxSubmissions: MaxSubmissions,
    private readonly _requiresApproval: RequiresApproval,
    private _status: CfpStatus,
  ) {}

  public static create(parameters: {
    startDate: CfpStartDate;
    endDate: CfpEndDate;
    maxSubmissions?: MaxSubmissions;
    requiresApproval: RequiresApproval;
  }): CfpConfig {
    const {startDate, endDate} = parameters;
    if (endDate.value.getTime() <= startDate.value.getTime()) {
      throw new CfpDatesInvalidError();
    }
    const windowDays = Math.round(
      (startOfUtcDayMs(endDate.value) - startOfUtcDayMs(startDate.value)) / MS_PER_DAY,
    );
    if (windowDays > MAX_WINDOW_DAYS) {
      throw new CfpDatesInvalidError('Cfp window cannot be more than 180 days');
    }
    return new CfpConfig(
      startDate,
      endDate,
      parameters.maxSubmissions ?? MaxSubmissions.create(null),
      parameters.requiresApproval,
      CfpStatus.create('ACTIVE'),
    );
  }

  /** Reconstitutes a persisted configuration (past dates allowed). */
  public static fromData(data: CfpConfigData): CfpConfig {
    return new CfpConfig(
      CfpStartDate.fromData(new Date(data.startDate)),
      CfpEndDate.fromData(new Date(data.endDate)),
      MaxSubmissions.fromData(data.maxSubmissions),
      RequiresApproval.fromData(data.requiresApproval),
      CfpStatus.fromData(data.status),
    );
  }

  public get startDate(): CfpStartDate {
    return this._startDate;
  }

  public get endDate(): CfpEndDate {
    return this._endDate;
  }

  public get maxSubmissions(): MaxSubmissions {
    return this._maxSubmissions;
  }

  public get requiresApproval(): RequiresApproval {
    return this._requiresApproval;
  }

  public get status(): CfpStatus {
    return this._status;
  }

  /** Plain data view (matches the JSONB persistence shape). */
  public get value(): CfpConfigData {
    return {
      startDate: this._startDate.value.toISOString(),
      endDate: this._endDate.value.toISOString(),
      maxSubmissions: this._maxSubmissions.value ?? null,
      requiresApproval: this._requiresApproval.value,
      status: this._status.value,
    };
  }

  /** Status-based "open" flag (window semantics live in isWithinWindow). */
  public isActive(): boolean {
    return this._status.equals(CfpStatus.create('ACTIVE'));
  }

  /** Closes the submission window (ACTIVE -> CLOSED only). */
  public close(): void {
    const closed = CfpStatus.create('CLOSED');
    if (!CfpStatus.canTransitionTo(this._status, closed)) {
      throw new DomainInvariantError(
        'INVALID_INVARIANT',
        `Invalid CfP status transition from ${this._status.value} to CLOSED`,
      );
    }
    this._status = closed;
  }

  public isWithinWindow(date: Date): boolean {
    return (
      date.getTime() >= this._startDate.value.getTime() &&
      date.getTime() <= this._endDate.value.getTime()
    );
  }

  public equals(other: CfpConfig): boolean {
    if (!other || !(other instanceof CfpConfig)) return false;
    return (
      this._startDate.equals(other._startDate) &&
      this._endDate.equals(other._endDate) &&
      this._maxSubmissions.equals(other._maxSubmissions) &&
      this._requiresApproval.equals(other._requiresApproval) &&
      this._status.equals(other._status)
    );
  }
}
