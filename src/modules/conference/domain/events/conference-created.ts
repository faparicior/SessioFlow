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
  timestamp: Date;
};

export class ConferenceCreatedEvent {
  readonly type = 'ConferenceCreated';

  constructor(
    readonly conferenceId: ConferenceId,
    readonly conferenceName: ConferenceName,
    readonly conferenceSlug: ConferenceSlug,
    readonly organizerId: string,
    readonly timestamp: Date = new Date(),
  ) {}

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
