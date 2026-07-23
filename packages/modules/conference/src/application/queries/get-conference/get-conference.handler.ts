import { ConferenceId } from '../../../domain/value-objects/conference-id';
import { ConferenceNotFoundError } from '../../../domain/exceptions/conference-not-found-error';

import { type ConferenceRepository } from '../../../domain/conference-repository.interface';

export class GetConferenceHandler {
  constructor(private readonly conferenceRepository: ConferenceRepository) {}

  async execute(params: { id: string }): Promise<import('../../../domain/conference').Conference> {
    const conferenceId = ConferenceId.fromString(params.id);
    const conference = await this.conferenceRepository.findById(conferenceId);

    if (!conference) {
      throw new ConferenceNotFoundError();
    }

    return conference;
  }
}
