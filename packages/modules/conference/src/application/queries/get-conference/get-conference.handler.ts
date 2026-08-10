import { ConferenceNotFoundError } from '../../../domain/exceptions/conference-not-found-error';
import { ConferenceId } from '../../../domain/value-objects/conference-id';
import { GetConferenceQuery } from './get-conference.query';
import { GetConferenceResponse } from './get-conference.response';

import { type ConferenceRepository } from '../../../domain/conference-repository.interface';

export interface GetConferenceQueryHandler {
  execute(query: GetConferenceQuery): Promise<GetConferenceResponse>;
}

export class GetConferenceHandler implements GetConferenceQueryHandler {
  constructor(private readonly conferenceRepository: ConferenceRepository) { }

  async execute(query: GetConferenceQuery): Promise<GetConferenceResponse> {
    const conferenceId = ConferenceId.fromString(query.input.id);
    const conference = await this.conferenceRepository.findById(conferenceId);

    if (!conference) {
      throw new ConferenceNotFoundError();
    }

    return GetConferenceResponse.from(conference);
  }
}
