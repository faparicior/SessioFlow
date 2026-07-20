import { type ConferenceId } from '../../../domain/value-objects/conference-id';

/**
 * GetConference Query - CQRS Read Operation.
 */
export class GetConferenceQuery {
  constructor(readonly conferenceId: ConferenceId) {}
}
