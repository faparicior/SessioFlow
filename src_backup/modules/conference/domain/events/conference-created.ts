import {type ConferenceId} from '../value-objects/conference-id';
import {type ConferenceName} from '../value-objects/conference-name';
import {type ConferenceSlug} from '../value-objects/conference-slug';

/**
 * ConferenceCreatedEvent - Published when a new Conference is created.
 *
 * Domain Event:
 *   - Triggered by: Conference.create()
 *   - Side Effects: Log conference creation, initialize analytics
 */
export type ConferenceCreatedEventData = {
  conferenceId: ConferenceId;
  conferenceName: ConferenceName;
  conferenceSlug: ConferenceSlug;
  organizerId: string;
  timestamp?: Date;
};

export class ConferenceCreatedEvent {
  readonly type = 'ConferenceCreated';

  constructor(
    private readonly _params: {
      conferenceId: ConferenceId;
      conferenceName: ConferenceName;
      conferenceSlug: ConferenceSlug;
      organizerId: string;
      timestamp?: Date;
    },
  ) {
    this._params.timestamp ??= new Date();
  }

  get conferenceId() {
    return this._params.conferenceId;
  }

  get conferenceName() {
    return this._params.conferenceName;
  }

  get conferenceSlug() {
    return this._params.conferenceSlug;
  }

  get organizerId() {
    return this._params.organizerId;
  }

  get timestamp() {
    return this._params.timestamp;
  }

  toJSON(): ConferenceCreatedEventData {
    return {
      conferenceId: this.conferenceId,
      conferenceName: this.conferenceName,
      conferenceSlug: this.conferenceSlug,
      organizerId: this.organizerId,
      timestamp: this.timestamp,
    };
  }
}
