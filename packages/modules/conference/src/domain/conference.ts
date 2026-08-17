import {CfpOpenedEvent} from './events/cfp-opened-event.js';
import {ConferenceCreatedEvent} from './events/conference-created-event.js';
import {DomainEvent} from './events/domain-event.interface.js';
import {InvalidStatusTransitionError} from './exceptions/invalid-status-transition-error.js';
import {CfpConfig} from './value-objects/cfp-config.js';
import {ConferenceDescription} from './value-objects/conference-description.js';
import {ConferenceId} from './value-objects/conference-id.js';
import {ConferenceName} from './value-objects/conference-name.js';
import {ConferenceSlug} from './value-objects/conference-slug.js';
import {ConferenceStatus} from './value-objects/conference-status.js';
import {OrganizerId} from './value-objects/organizer-id.js';

/**
 * Persisted/reconstituted shape of the Conference aggregate (all VOs, no primitives).
 */
export type ConferenceData = {
  id: ConferenceId;
  name: ConferenceName;
  description: ConferenceDescription;
  slug: ConferenceSlug;
  status: ConferenceStatus;
  organizerId: OrganizerId;
  cfpConfig: CfpConfig;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Parameters for creating a NEW conference (all Value Objects per DDD convention).
 */
export type CreateConferenceParameters = {
  name: ConferenceName;
  description: ConferenceDescription;
  slug: ConferenceSlug;
  organizerId: OrganizerId;
  cfpConfig: CfpConfig;
};

/**
 * Conference - Aggregate Root of the Conference bounded context.
 *
 * Owns the CfP configuration and the lifecycle state machine (INV-001).
 * Records domain events internally; consumers flush them via
 * pullDomainEvents() for Transactional Outbox persistence (ADR-017).
 */
export class Conference {
  private constructor(
    private readonly _data: ConferenceData,
    private _domainEvents: DomainEvent[],
  ) {}

  /**
   * Named constructor for NEW conferences: generates an id, initializes
   * DRAFT state and records ConferenceCreatedEvent.
   */
  public static create(parameters: CreateConferenceParameters): Conference {
    const id = ConferenceId.generate();
    const now = new Date();
    const conference = new Conference(
      {
        id,
        name: parameters.name,
        description: parameters.description,
        slug: parameters.slug,
        status: ConferenceStatus.create('DRAFT'),
        organizerId: parameters.organizerId,
        cfpConfig: parameters.cfpConfig,
        createdAt: now,
        updatedAt: now,
      },
      [],
    );
    conference.recordEvent(
      new ConferenceCreatedEvent(
        id.value,
        parameters.name.value,
        parameters.slug.value,
        parameters.organizerId.value,
      ),
    );
    return conference;
  }

  /**
   * Reconstitution factory used ONLY by repository implementations.
   * Does not record domain events or run creation-time validations.
   */
  public static fromData(data: ConferenceData): Conference {
    return new Conference(data, []);
  }

  public get id(): ConferenceId {
    return this._data.id;
  }

  public get name(): ConferenceName {
    return this._data.name;
  }

  public get description(): ConferenceDescription {
    return this._data.description;
  }

  public get slug(): ConferenceSlug {
    return this._data.slug;
  }

  public get status(): ConferenceStatus {
    return this._data.status;
  }

  public get organizerId(): OrganizerId {
    return this._data.organizerId;
  }

  public get cfpConfig(): CfpConfig {
    return this._data.cfpConfig;
  }

  public get createdAt(): Date {
    return this._data.createdAt;
  }

  public get updatedAt(): Date {
    return this._data.updatedAt;
  }

  /**
   * DRAFT -> CFP_OPEN: opens the CfP and records CfpOpenedEvent.
   * Throws InvalidStatusTransitionError for any other current state.
   */
  public publishCfp(): void {
    const target = ConferenceStatus.create('CFP_OPEN');
    if (!ConferenceStatus.canTransitionTo(this._data.status, target)) {
      throw new InvalidStatusTransitionError(this._data.status.value, target.value);
    }
    this._data.status = target;
    this._data.updatedAt = new Date();
    this.recordEvent(
      new CfpOpenedEvent(
        this._data.id.value,
        this._data.cfpConfig.startDate.value,
        this._data.cfpConfig.endDate.value,
      ),
    );
  }

  /**
   * Flushes and returns recorded domain events (Outbox persistence).
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  /**
   * Data view for persistence mapping (repository layer).
   */
  public toData(): ConferenceData {
    return {...this._data};
  }

  protected recordEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}
