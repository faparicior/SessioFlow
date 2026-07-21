import { type ConferenceRepository } from './domain/conference-repository.interface';
import { CreateConferenceHandler } from './application/commands/create-conference/create-conference.handler';
import { GetConferenceHandler } from './application/queries/get-conference/get-conference.handler';
import { DrizzleConferenceRepository } from './infrastructure/database/conference.repository';

/**
 * Conference Module Container (Composition Root).
 *
 * Wires Application Use-Cases with default Infrastructure Repositories.
 */
export function makeCreateConferenceHandler(
  repository: ConferenceRepository = new DrizzleConferenceRepository()
): CreateConferenceHandler {
  return new CreateConferenceHandler(repository);
}

export function makeGetConferenceHandler(
  repository: ConferenceRepository = new DrizzleConferenceRepository()
): GetConferenceHandler {
  return new GetConferenceHandler(repository);
}
