import {ConferenceNotFoundError} from '../../../domain/exceptions/conference-not-found-error.js';
import type {ConferenceRepository} from '../../../domain/conference-repository.interface.js';
import {ConferenceId} from '../../../domain/value-objects/conference-id.js';
import type {GetConferenceQuery} from './get-conference.query.js';
import {GetConferenceResponse} from './get-conference.response.js';

/**
 * GetConferenceQueryHandler - Read-only use case: fetch a conference by id.
 * Throws ConferenceNotFoundError (404) when the aggregate does not exist.
 */
export class GetConferenceQueryHandler {
  constructor(private readonly conferenceRepository: ConferenceRepository) {}

  public async execute(
    query: GetConferenceQuery,
  ): Promise<GetConferenceResponse> {
    const id = ConferenceId.create(query.input.conferenceId);
    const conference = await this.conferenceRepository.findById(id);
    if (!conference) {
      throw new ConferenceNotFoundError(id.value);
    }
    return GetConferenceResponse.from(conference);
  }
}
