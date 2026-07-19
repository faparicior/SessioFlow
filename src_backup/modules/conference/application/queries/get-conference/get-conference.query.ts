import {type ConferenceId} from '@/modules/conference/domain/value-objects/conference-id';

/**
 * GetConference Query - CQRS Read Operation.
 *
 * Query: Retrieves a conference by its unique ID.
 * Side Effects: None (read-only).
 *
 * DDD Pattern: Query lives in application layer.
 */
export class GetConferenceQuery {
  constructor(readonly conferenceId: ConferenceId) {}
}
