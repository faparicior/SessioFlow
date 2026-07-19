import {ConferenceId} from '../value-objects/conference-id';
import {ConferenceName} from '../value-objects/conference-name';
import {ConferenceSlug} from '../value-objects/conference-slug';
import {ConferenceStatus} from '../value-objects/conference-status';
import {CfpStartDate} from '../value-objects/cfp-start-date';
import {CfpEndDate} from '../value-objects/cfp-end-date';
import {MaxSubmissions} from '../value-objects/max-submissions';
import {RequiresApproval} from '../value-objects/requires-approval';
import {CfpStatus} from '../value-objects/cfp-status';
import {ConferenceCreatedEvent} from '../events/conference-created';
import {CfpOpenedEvent} from '../events/cfp-opened';
import {CfpDatesInvalidError} from '../exceptions/cfp-dates-invalid-error';
import {StateTransitionError} from '../exceptions/state-transition-error';
import {CfpConfig} from './cfp-config';

/**
 * Conference - Aggregate Root for the Conference bounded context.
 *
 * Represents a Call for Papers (CfP) conference organized by a user.
 * Manages the consistency boundary for CfP configuration, sessions, and schedules.
 *
 * DDD Pattern:
 *   - Aggregate Root: Conference
 *   - Child Entity: CfpConfig
 *   - Value Objects: ConferenceId, ConferenceName, ConferenceSlug, ConferenceStatus, etc.
 *   - Domain Events: ConferenceCreated, CfpOpened
 *
 * State Machine:
 *   DRAFT → CFP_OPEN → CFP_CLOSED → REVIEWING → SCHEDULED → PUBLISHED → COMPLETED
 */
export type ConferenceData = {
  id: ConferenceId;
  name: ConferenceName;
  description: string;
  slug: ConferenceSlug;
  status: ConferenceStatus;
  organizerId: string;
  cfpConfig: CfpConfig;
  createdAt: Date;
  updatedAt: Date;
};

export class Conference {
  /**
   * Factory method to load a Conference from stored data (e.g., database row).
   */
  static fromData(data: ConferenceData): Conference {
    return this.createFromData(data);
  }

  /**
   * Factory method to create a new Conference in DRAFT state.
   */
  static create(parameters: {
    name: string;
    description?: string;
    organizerId: string;
    cfpStartDate: Date;
    cfpEndDate: Date;
    maxSubmissions?: number;
    requiresApproval?: boolean;
  }): Conference {
    // Temporal business rule checked at the creation boundary of the entity:
    const now = new Date().setHours(0, 0, 0, 0);
    if (parameters.cfpStartDate.getTime() < now) {
      throw new Error('CfpStartDate must be in the future or today');
    }

    return this.createFromData({
      id: ConferenceId.create(),
      name: ConferenceName.create(parameters.name),
      description: parameters.description ?? '',
      slug: ConferenceSlug.create(parameters.name),
      status: ConferenceStatus.DRAFT,
      organizerId: parameters.organizerId,
      cfpConfig: CfpConfig.create({
        startDate: CfpStartDate.create(parameters.cfpStartDate),
        endDate: CfpEndDate.create(parameters.cfpEndDate),
        maxSubmissions: MaxSubmissions.create(parameters.maxSubmissions),
        requiresApproval: RequiresApproval.create(parameters.requiresApproval),
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Private factory method shared by create() and fromData().
   */
  private static createFromData(data: ConferenceData): Conference {
    return new Conference(data);
  }

  private constructor(
    private readonly _data: ConferenceData,
  ) {}

  /**
   * Publish the CfP: transitions from DRAFT to CFP_OPEN.
   *
   * Domain Method: This is a domain method, not a data setter.
   * It validates pre-conditions and publishes domain events.
   */
  publishCfp(): {events: Array<ConferenceCreatedEvent | CfpOpenedEvent>} {
    if (this._data.status !== ConferenceStatus.DRAFT) {
      throw new StateTransitionError(
        `Cannot publish CfP: conference is in ${this._data.status} state, must be DRAFT`,
      );
    }

    // Validate CfP dates
    if (this.cfpConfig.endDate.isBefore(this.cfpConfig.startDate.value)) {
      throw new CfpDatesInvalidError('CfP end date must be after start date');
    }

    // Transition state
    this._data.status = ConferenceStatus.CFP_OPEN;
    this._data.updatedAt = new Date();

    // Publish domain events
    const events: Array<ConferenceCreatedEvent | CfpOpenedEvent> = [
      new ConferenceCreatedEvent({
        conferenceId: this.id,
        conferenceName: this.name,
        conferenceSlug: this.slug,
        organizerId: this.organizerId,
      }),
      new CfpOpenedEvent(this.id, this.cfpConfig),
    ];

    return {events};
  }

  /**
   * Close the CfP: transitions from CFP_OPEN to CFP_CLOSED.
   */
  closeCfp(): {events: unknown[]} {
    if (this._data.status !== ConferenceStatus.CFP_OPEN) {
      throw new StateTransitionError(
        `Cannot close CfP: conference is in ${this._data.status} state, must be CFP_OPEN`,
      );
    }

    this._data.status = ConferenceStatus.CFP_CLOSED;
    this.cfpConfig.close();
    this._data.updatedAt = new Date();

    return {events: []};
  }

  /**
   * Cancel the conference: transitions to DELETED state.
   */
  cancel(): {events: unknown[]} {
    if (
      this._data.status !== ConferenceStatus.DRAFT &&
      this._data.status !== ConferenceStatus.CFP_OPEN
    ) {
      throw new StateTransitionError(
        `Cannot cancel: conference is in ${this._data.status} state, must be DRAFT or CFP_OPEN`,
      );
    }

    this._data.status = ConferenceStatus.DELETED;
    this._data.updatedAt = new Date();

    return {events: []};
  }

  // Getters
  get id(): ConferenceId {
    return this._data.id;
  }

  get name(): ConferenceName {
    return this._data.name;
  }

  get description(): string {
    return this._data.description;
  }

  get slug(): ConferenceSlug {
    return this._data.slug;
  }

  get status(): ConferenceStatus {
    return this._data.status;
  }

  get organizerId(): string {
    return this._data.organizerId;
  }

  get cfpConfig(): CfpConfig {
    return this._data.cfpConfig;
  }

  get createdAt(): Date {
    return this._data.createdAt;
  }

  get updatedAt(): Date {
    return this._data.updatedAt;
  }

  /**
   * Check if the conference is in CFP_OPEN state.
   */
  isCfpOpen(): boolean {
    return this._data.status === ConferenceStatus.CFP_OPEN;
  }

  /**
   * Check if the conference is in DRAFT state.
   */
  isDraft(): boolean {
    return this._data.status === ConferenceStatus.DRAFT;
  }

  /**
   * Check if the conference is in DELETED state.
   */
  isDeleted(): boolean {
    return this._data.status === ConferenceStatus.DELETED;
  }
}
