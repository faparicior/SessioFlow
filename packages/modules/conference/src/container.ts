import {type ConferenceRepository} from './domain/conference-repository.interface.js';
import {CreateConferenceHandler} from './application/commands/create-conference/create-conference.handler.js';
import {GetConferenceHandler} from './application/queries/get-conference/get-conference.handler.js';
import {DrizzleConferenceRepository} from './infrastructure/database/conference.repository.js';

/**
 * Conference Module Container (Composition Root).
 *
 * Wires Application Use-Cases with default Infrastructure Repositories.
 */
export const conferenceContainer = {
  createConferenceHandler(
    repository: ConferenceRepository = new DrizzleConferenceRepository(),
  ): CreateConferenceHandler {
    return new CreateConferenceHandler(repository);
  },

  getConferenceHandler(
    repository: ConferenceRepository = new DrizzleConferenceRepository(),
  ): GetConferenceHandler {
    return new GetConferenceHandler(repository);
  },
};
