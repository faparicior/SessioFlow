import {InvalidConferenceStatusError} from '../exceptions/invalid-conference-status-error.js';

export type ConferenceStatusValue =
  | 'DRAFT'
  | 'CFP_OPEN'
  | 'CFP_CLOSED'
  | 'REVIEWING'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'COMPLETED'
  | 'DELETED';

/** Allowed transitions per the Conference state machine (INV-001). */
const TRANSITIONS: Record<ConferenceStatusValue, readonly ConferenceStatusValue[]> = {
  DRAFT: ['CFP_OPEN', 'DELETED'],
  CFP_OPEN: ['CFP_CLOSED', 'DELETED'],
  CFP_CLOSED: ['REVIEWING'],
  REVIEWING: ['SCHEDULED'],
  SCHEDULED: ['PUBLISHED'],
  PUBLISHED: ['COMPLETED'],
  COMPLETED: [],
  DELETED: [],
};

/**
 * ConferenceStatus - Lifecycle state of a Conference (INV-001).
 */
export class ConferenceStatus {
  private constructor(private readonly _value: ConferenceStatusValue) {}

  public static create(value: string): ConferenceStatus {
    if (!ConferenceStatus.isValidStatus(value)) {
      throw new InvalidConferenceStatusError(value);
    }
    return new ConferenceStatus(value as ConferenceStatusValue);
  }

  public static fromData(value: string): ConferenceStatus {
    return ConferenceStatus.create(value);
  }

  public static isValidStatus(value: string): boolean {
    return value in TRANSITIONS;
  }

  /** Validates a state transition against the state machine. */
  public static canTransitionTo(
    current: ConferenceStatus,
    target: ConferenceStatus,
  ): boolean {
    return TRANSITIONS[current.value].includes(target.value);
  }

  public get value(): ConferenceStatusValue {
    return this._value;
  }

  public equals(other: ConferenceStatus): boolean {
    if (!other || !(other instanceof ConferenceStatus)) return false;
    return this._value === other._value;
  }
}
