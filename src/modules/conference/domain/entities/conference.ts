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
    return new Conference(
      data.id,
      data.name,
      data.description,
      data.slug,
      data.status,
      data.organizerId,
      data.cfpConfig,
      data.createdAt,
      data.updatedAt,
    );
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
    return new Conference(
      data.id,
      data.name,
      data.description,
      data.slug,
      data.status,
      data.organizerId,
      data.cfpConfig,
      data.createdAt,
      data.updatedAt,
    );
  }

  private constructor(
    private readonly _id: ConferenceId,
    private readonly _name: ConferenceName,
    private readonly _description: string,
    private readonly _slug: ConferenceSlug,
    private _status: ConferenceStatus,
    private readonly _organizerId: string,
    private readonly _cfpConfig: CfpConfig,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Publish the CfP: transitions from DRAFT to CFP_OPEN.
   *
   * Domain Method: This is a domain method, not a data setter.
   * It validates pre-conditions and publishes domain events.
   */
  publishCfp(): {events: Array<ConferenceCreatedEvent | CfpOpenedEvent>} {
    if (this._status !== ConferenceStatus.DRAFT) {
      throw new StateTransitionError(
        `Cannot publish CfP: conference is in ${this._status} state, must be DRAFT`,
      );
    }

    // Validate CfP dates
    if (this._cfpConfig.endDate.isBefore(this._cfpConfig.startDate)) {
      throw new CfpDatesInvalidError('CfP end date must be after start date');
    }

    // Transition state
    this._status = ConferenceStatus.CFP_OPEN;
    this._updatedAt = new Date();

    // Publish domain events
    const events: Array<ConferenceCreatedEvent | CfpOpenedEvent> = [
      new ConferenceCreatedEvent(
        this._id,
        this._name,
        this._slug,
        this._organizerId,
      ),
      new CfpOpenedEvent(this._id, this._cfpConfig),
    ];

    return {events};
  }

  /**
   * Close the CfP: transitions from CFP_OPEN to CFP_CLOSED.
   */
  closeCfp(): {events: unknown[]} {
    if (this._status !== ConferenceStatus.CFP_OPEN) {
      throw new StateTransitionError(
        `Cannot close CfP: conference is in ${this._status} state, must be CFP_OPEN`,
      );
    }

    this._status = ConferenceStatus.CFP_CLOSED;
    this._cfpConfig.close();
    this._updatedAt = new Date();

    return {events: []};
  }

  /**
   * Cancel the conference: transitions to DELETED state.
   */
  cancel(): {events: unknown[]} {
    if (
      this._status !== ConferenceStatus.DRAFT &&
      this._status !== ConferenceStatus.CFP_OPEN
    ) {
      throw new StateTransitionError(
        `Cannot cancel: conference is in ${this._status} state, must be DRAFT or CFP_OPEN`,
      );
    }

    this._status = ConferenceStatus.DELETED;
    this._updatedAt = new Date();

    return {events: []};
  }

  // Getters
  get id(): ConferenceId {
    return this._id;
  }

  get name(): ConferenceName {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get slug(): ConferenceSlug {
    return this._slug;
  }

  get status(): ConferenceStatus {
    return this._status;
  }

  get organizerId(): string {
    return this._organizerId;
  }

  get cfpConfig(): CfpConfig {
    return this._cfpConfig;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Check if the conference is in CFP_OPEN state.
   */
  isCfpOpen(): boolean {
    return this._status === ConferenceStatus.CFP_OPEN;
  }

  /**
   * Check if the conference is in DRAFT state.
   */
  isDraft(): boolean {
    return this._status === ConferenceStatus.DRAFT;
  }

  /**
   * Check if the conference is in DELETED state.
   */
  isDeleted(): boolean {
    return this._status === ConferenceStatus.DELETED;
  }
}
