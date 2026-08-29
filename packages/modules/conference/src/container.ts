import {InMemoryCommandBus, InMemoryQueryBus, LoggingMiddleware, Mediator} from '@sessioflow/bus';
import type {OutboxRepository} from '@sessioflow/shared-database/outbox-repository';
import {DrizzleOutboxRepository} from '@sessioflow/shared-database/outbox-repository';
import type {Logger} from '@sessioflow/shared-logging/logger';
import {getLogger} from '@sessioflow/shared-logging/logger';
import {CreateConferenceCommand} from './application/commands/create-conference/create-conference.command.js';
import {CreateConferenceCommandHandler} from './application/commands/create-conference/create-conference.handler.js';
import {GetConferenceQuery} from './application/queries/get-conference/get-conference.query.js';
import {GetConferenceQueryHandler} from './application/queries/get-conference/get-conference.handler.js';
import type {TransactionRunner} from './application/transaction-runner.port.js';
import type {ConferenceRepository} from './domain/conference-repository.interface.js';
import {db} from '@sessioflow/shared-database/client';
import {DrizzleConferenceRepository} from './infrastructure/database/conference.repository.js';
import {createConferenceController} from './interfaces/http/create-conference.controller.js';
import type {GetAuthUser} from './interfaces/http/create-conference.controller.js';
import {getConferenceController} from './interfaces/http/get-conference.controller.js';

/**
 * Wave 1 auth port default (ADR-004-01 / decision D12): the repository mocks
 * authentication everywhere, so controllers resolve `mock-user-id` unless a
 * real strategy is injected.
 */
const defaultGetAuthUser: GetAuthUser = async () => ({id: 'mock-user-id'});

/**
 * Optional dependency overrides for handler factories. Unit/interface tests
 * inject fakes here; production wiring falls back to Drizzle defaults.
 */
export interface ConferenceHandlerDependencies {
  conferenceRepository?: ConferenceRepository;
  outboxRepository?: OutboxRepository;
  transactionRunner?: TransactionRunner;
  logger?: Logger;
}

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
  createMediator(dependencies: ConferenceHandlerDependencies = {}): Mediator {
    const commandBus = new InMemoryCommandBus();
    const queryBus = new InMemoryQueryBus();
    const loggingMiddleware = new LoggingMiddleware();

    commandBus.use(loggingMiddleware);
    queryBus.use(loggingMiddleware);

    commandBus.register(CreateConferenceCommand, this.createCreateConferenceHandler(dependencies));
    queryBus.register(GetConferenceQuery, this.createGetConferenceHandler(dependencies));

    return new Mediator(commandBus, queryBus);
  },

  /**
   * Build the CreateConference use case with Drizzle defaults
   * (repository, outbox and db-transaction runner), overridable in tests.
   */
  createCreateConferenceHandler(
    dependencies: ConferenceHandlerDependencies = {},
  ): CreateConferenceCommandHandler {
    return new CreateConferenceCommandHandler(
      dependencies.conferenceRepository ?? new DrizzleConferenceRepository(),
      dependencies.outboxRepository ?? new DrizzleOutboxRepository(),
      // The Drizzle client satisfies the opaque TransactionRunner port (D5).
      dependencies.transactionRunner ?? (db as unknown as TransactionRunner),
      dependencies.logger ?? getLogger(),
    );
  },

  /**
   * Build the GetConference query handler with the Drizzle default repository.
   */
  createGetConferenceHandler(
    dependencies: ConferenceHandlerDependencies = {},
  ): GetConferenceQueryHandler {
    return new GetConferenceQueryHandler(
      dependencies.conferenceRepository ?? new DrizzleConferenceRepository(),
    );
  },

  /**
   * HTTP POST /api/v1/conferences controller (ADR-016-01): route delegates
   * resolve it here so only the composition root touches infrastructure.
   */
  createCreateConferenceController(getAuthUser: GetAuthUser = defaultGetAuthUser) {
    const handler = this.createCreateConferenceHandler();
    return (request: Request) => createConferenceController(request, handler, getAuthUser);
  },

  /**
   * HTTP GET /api/v1/conferences/{id} controller (ADR-016-01).
   */
  createGetConferenceController(getAuthUser: GetAuthUser = defaultGetAuthUser) {
    const handler = this.createGetConferenceHandler();
    return (request: Request, conferenceId: string) =>
      getConferenceController(request, handler, getAuthUser, conferenceId);
  },
};
