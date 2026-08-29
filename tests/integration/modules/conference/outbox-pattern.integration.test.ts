import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {db} from '@sessioflow/shared-database/client';
import {DrizzleOutboxRepository} from '@sessioflow/shared-database/outbox-repository';
import {getLogger, type Logger} from '@sessioflow/shared-logging/logger';
import {CreateConferenceCommand} from '@sessioflow/conference/application/commands/create-conference/create-conference.command';
import {CreateConferenceCommandHandler} from '@sessioflow/conference/application/commands/create-conference/create-conference.handler';
import {GetConferenceQuery} from '@sessioflow/conference/application/queries/get-conference/get-conference.query';
import {GetConferenceQueryHandler} from '@sessioflow/conference/application/queries/get-conference/get-conference.handler';
import type {TransactionRunner} from '@sessioflow/conference/application/transaction-runner.port';
import type {ConferenceRepository} from '@sessioflow/conference/domain/conference-repository.interface';
import {ConferenceNotFoundError} from '@sessioflow/conference/domain/exceptions/conference-not-found-error';
import {DrizzleConferenceRepository} from '@sessioflow/conference/infrastructure/database/conference.repository';
import {cleanTables, testSql} from './utils/test-db';

/** Silent logger so integration output stays readable. */
const silentLogger: Logger = getLogger({level: 'silent'});

function buildCommand(overrides: Record<string, unknown> = {}) {
  return new CreateConferenceCommand({
    name: 'Outbox Pattern Conf',
    description: 'Conference used to exercise the transactional outbox',
    cfpStartDate: '2026-08-17',
    cfpEndDate: '2026-09-30',
    maxSubmissions: 42,
    requiresApproval: false,
    organizerId: 'mock-user-id',
    ...overrides,
  });
}

describe('Transactional Outbox via CreateConferenceCommandHandler (integration)', () => {
  let conferenceRepository: DrizzleConferenceRepository;
  let outboxRepository: DrizzleOutboxRepository;
  let handler: CreateConferenceCommandHandler;

  beforeAll(() => {
    conferenceRepository = new DrizzleConferenceRepository();
    outboxRepository = new DrizzleOutboxRepository();
    // The Drizzle db client satisfies the opaque TransactionRunner port
    // structurally (ADR-017 / D5).
    handler = new CreateConferenceCommandHandler(
      conferenceRepository,
      outboxRepository,
      db as unknown as TransactionRunner,
      silentLogger,
    );
  });

  beforeEach(async () => {
    await cleanTables();
  });

  afterAll(async () => {
    await cleanTables();
  });

  it('persists aggregate + events atomically on ONE shared tx handle', async () => {
    const saveHandles: unknown[] = [];
    const outboxHandles: unknown[] = [];
    const instrumentedRepository: ConferenceRepository = {
      findById: id => conferenceRepository.findById(id),
      findBySlug: slug => conferenceRepository.findBySlug(slug),
      countActiveByOrganizerId: organizerId =>
        conferenceRepository.countActiveByOrganizerId(organizerId),
      save: async (conference, tx) => {
        saveHandles.push(tx);
        await conferenceRepository.save(conference, tx);
      },
    };
    const instrumentedOutbox = {
      saveAll: async (
        events: unknown[],
        aggregateType: string,
        aggregateId: string,
        tx?: unknown,
      ) => {
        outboxHandles.push(tx);
        await outboxRepository.saveAll(events, aggregateType, aggregateId, tx);
      },
    };
    const instrumentedHandler = new CreateConferenceCommandHandler(
      instrumentedRepository,
      instrumentedOutbox,
      db as unknown as TransactionRunner,
      silentLogger,
    );

    const response = await instrumentedHandler.execute(buildCommand());
    expect(response.id).toBeDefined();

    // ADR-017: both writes ran inside ONE shared transaction handle.
    expect(saveHandles).toHaveLength(1);
    expect(outboxHandles).toHaveLength(1);
    expect(saveHandles[0]).toBe(outboxHandles[0]);
    expect(saveHandles[0]).toBeDefined();

    const conferenceRows = await testSql`
      SELECT slug, status FROM conferences WHERE id = ${response.id}
    `;
    expect(conferenceRows).toHaveLength(1);
    expect(conferenceRows[0].slug).toBe('outbox-pattern-conf');
    expect(conferenceRows[0].status).toBe('CFP_OPEN');

    const events = await testSql`
      SELECT aggregate_type, aggregate_id, event_type, status, payload
      FROM outbox_messages ORDER BY event_type
    `;
    expect(events).toHaveLength(2);
    expect(events.map(event => event.event_type)).toEqual(['CFP_OPENED', 'CONFERENCE_CREATED']);
    for (const event of events) {
      expect(event.aggregate_type).toBe('Conference');
      expect(event.aggregate_id).toBe(response.id);
      expect(event.status).toBe('PENDING');
      expect(event.payload.type).toBe(event.event_type);
      expect(typeof event.payload.timestamp).toBe('string');
    }
  });

  it('rolls back the aggregate row when the outbox write fails', async () => {
    const failingOutbox = {
      saveAll: async () => {
        throw new Error('simulated outbox failure');
      },
    };
    const failingHandler = new CreateConferenceCommandHandler(
      conferenceRepository,
      failingOutbox,
      db as unknown as TransactionRunner,
      silentLogger,
    );

    await expect(failingHandler.execute(buildCommand())).rejects.toThrow(
      'simulated outbox failure',
    );

    const [conferenceCount] = await testSql`SELECT COUNT(*)::int AS count FROM conferences`;
    const [outboxCount] = await testSql`SELECT COUNT(*)::int AS count FROM outbox_messages`;
    expect(conferenceCount.count).toBe(0);
    expect(outboxCount.count).toBe(0);
  });

  it('supports the full write + read journey through the real repositories', async () => {
    const created = await handler.execute(buildCommand({name: 'Journey Read Conf'}));

    const getHandler = new GetConferenceQueryHandler(conferenceRepository);
    const found = await getHandler.execute(new GetConferenceQuery({conferenceId: created.id}));

    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Journey Read Conf');
    expect(found.slug).toBe('journey-read-conf');
    expect(found.status).toBe('CFP_OPEN');
    expect(found.cfp.isOpen).toBe(true);
    expect(found.cfp.maxSubmissions).toBe(42);
  });

  it('throws ConferenceNotFoundError for a valid but unknown id', async () => {
    const getHandler = new GetConferenceQueryHandler(conferenceRepository);
    await expect(
      getHandler.execute(new GetConferenceQuery({conferenceId: crypto.randomUUID()})),
    ).rejects.toThrow(ConferenceNotFoundError);
  });
});
