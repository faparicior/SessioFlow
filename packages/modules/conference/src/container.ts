import {
  InMemoryCommandBus,
  InMemoryQueryBus,
  LoggingMiddleware,
  Mediator,
} from '@sessioflow/bus';
import {type ConferenceRepository} from './domain/conference-repository.interface.js';
import {CreateConferenceHandler} from './application/commands/create-conference/create-conference.handler.js';
import {CreateConferenceCommand} from './application/commands/create-conference/create-conference.command.js';
import {GetConferenceHandler} from './application/queries/get-conference/get-conference.handler.js';
import {GetConferenceQuery} from './application/queries/get-conference/get-conference.query.js';
import {DrizzleConferenceRepository} from './infrastructure/database/conference.repository.js';
import {createConferenceController as createConferenceHttpController} from './interfaces/http/create-conference.controller.js';
import {getConferenceController as getConferenceHttpController} from './interfaces/http/get-conference.controller.js';

import { DrizzleOutboxRepository, type OutboxRepository } from '@sessioflow/shared-database/outbox-repository';
import { CreateConferenceResponse } from './application/commands/create-conference/create-conference.response.js';
import { GetConferenceResponse } from './application/queries/get-conference/get-conference.response.js';

/**
 * Conference Module Container (Composition Root).
 *
 * Wires Application Use-Cases & HTTP Controllers with default Infrastructure Repositories.
 */
export const conferenceContainer = {
  createConferenceHandler(
    repository: ConferenceRepository = new DrizzleConferenceRepository(),
    outboxRepository: OutboxRepository = new DrizzleOutboxRepository(),
  ): CreateConferenceHandler {
    return new CreateConferenceHandler(repository, outboxRepository);
  },

  getConferenceHandler(
    repository: ConferenceRepository = new DrizzleConferenceRepository(),
  ): GetConferenceHandler {
    return new GetConferenceHandler(repository);
  },

  createMediator(
    repository: ConferenceRepository = new DrizzleConferenceRepository(),
  ): Mediator {
    const commandBus = new InMemoryCommandBus();
    const queryBus = new InMemoryQueryBus();
    const loggingMiddleware = new LoggingMiddleware();

    commandBus.use(loggingMiddleware);
    queryBus.use(loggingMiddleware);

    commandBus.register(CreateConferenceCommand, this.createConferenceHandler(repository));
    queryBus.register(GetConferenceQuery, this.getConferenceHandler(repository));

    return new Mediator(commandBus, queryBus);
  },

  createConferenceController(
    repository?: ConferenceRepository,
    getAuthUser: () => Promise<{id: string} | undefined> = async () => ({id: 'mock-user-id'}),
  ) {
    const mediator = this.createMediator(repository);
    const busHandler = {
      execute: (command: CreateConferenceCommand) =>
        mediator.send<CreateConferenceCommand, CreateConferenceResponse>(command),
    };
    return (request: Request) =>
      createConferenceHttpController(request, busHandler, getAuthUser);
  },

  getConferenceController(
    repository?: ConferenceRepository,
    getAuthUser: () => Promise<{id: string} | undefined> = async () => ({id: 'mock-user-id'}),
  ) {
    const mediator = this.createMediator(repository);
    const busHandler = {
      execute: (query: GetConferenceQuery) =>
        mediator.ask<GetConferenceQuery, GetConferenceResponse>(query),
    };
    return (request: Request, id: string) =>
      getConferenceHttpController(request, id, busHandler, getAuthUser);
  },
};

