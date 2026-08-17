import {
  InMemoryCommandBus,
  InMemoryQueryBus,
  LoggingMiddleware,
  Mediator,
} from '@sessioflow/bus';

// ──────────────────────────────────────────────────────────────
// TODO (Phase 3): Import domain types, handlers, repositories,
// and HTTP controllers.
//
// Example:
//   import type { ConferenceRepository } from './domain/conference-repository.interface.js';
//   import { CreateConferenceHandler } from './application/commands/create-conference/create-conference.handler.js';
//   import { createConferenceController } from './interfaces/http/create-conference.controller.js';
// ──────────────────────────────────────────────────────────────

/**
 * Conference Module Container (Composition Root).
 *
 * Wires Application Use-Cases & HTTP Controllers with
 * default Infrastructure Repositories (ADR-016-01).
 */
export const conferenceContainer = {
  /**
   * Create the CQRS mediator with command & query buses.
   */
  createMediator(): Mediator {
    const commandBus = new InMemoryCommandBus();
    const queryBus = new InMemoryQueryBus();
    const loggingMiddleware = new LoggingMiddleware();

    commandBus.use(loggingMiddleware);
    queryBus.use(loggingMiddleware);

    // TODO (Phase 2/3): Register commands and queries.
    // Example:
    //   commandBus.register(CreateConferenceCommand, this.createCreateConferenceHandler());
    //   queryBus.register(GetConferenceQuery, this.createGetConferenceHandler());

    return new Mediator(commandBus, queryBus);
  },

  /**
   * Create the HTTP POST controller for conference creation.
   */
  createCreateConferenceController(
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    getAuthUser: () => Promise<{ id: string } | undefined> = async () => ({
      id: 'mock-user-id',
    }),
  ) {
    // TODO (Phase 3): Wire mediator + handler + auth to controller.
    // Example:
    //   const handler = this.createCreateConferenceHandler();
    //   return (request: Request) =>
    //     createConferenceController(request, handler, getAuthUser);

    void getAuthUser;
    throw new Error('Not implemented — wire in the handler step (Phase 3)');
  },
};
