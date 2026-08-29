import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import type {ConferenceRepository} from '@sessioflow/conference/domain/conference-repository.interface';
import type {OutboxRepository} from '@sessioflow/shared-database/outbox-repository';
import type {Logger} from '@sessioflow/shared-logging/logger';
import {CreateConferenceCommand} from '@sessioflow/conference/application/commands/create-conference/create-conference.command';
import {CreateConferenceCommandHandler} from '@sessioflow/conference/application/commands/create-conference/create-conference.handler';
import type {TransactionRunner} from '@sessioflow/conference/application/transaction-runner.port';
import {ConferenceFreeTierLimitError} from '@sessioflow/conference/domain/exceptions/conference-free-tier-limit-error';
import {ConferenceNameTooShortError} from '@sessioflow/conference/domain/exceptions/conference-name-too-short-error';
import {CfpDatesInvalidError} from '@sessioflow/conference/domain/exceptions/cfp-dates-invalid-error';
import {CfpStartDateNotInFutureError} from '@sessioflow/conference/domain/exceptions/cfp-start-date-not-in-future-error';
import {SlugExistsError} from '@sessioflow/conference/domain/exceptions/slug-exists-error';

const MOCK_TX = {marker: 'db-transaction'};

interface CommandMocks {
  findById: Mock;
  findBySlug: Mock;
  countActiveByOrganizerId: Mock;
  save: Mock;
  outboxSaveAll: Mock;
  transaction: Mock;
  logger: Logger;
  handler: CreateConferenceCommandHandler;
}

function makeMocks(): CommandMocks {
  const findById = vi.fn<ConferenceRepository['findById']>();
  const findBySlug = vi.fn<ConferenceRepository['findBySlug']>();
  const countActiveByOrganizerId = vi.fn<ConferenceRepository['countActiveByOrganizerId']>();
  const save = vi.fn<ConferenceRepository['save']>();
  const outboxSaveAll = vi.fn<OutboxRepository['saveAll']>();
  const transaction = vi.fn<TransactionRunner['transaction']>(async work => work(MOCK_TX));
  const logger: Logger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    child: vi.fn(),
    bind: vi.fn(),
  };
  const handler = new CreateConferenceCommandHandler(
    {
      findById,
      findBySlug,
      countActiveByOrganizerId,
      save,
    },
    {saveAll: outboxSaveAll},
    {transaction},
    logger,
  );
  return {
    findById,
    findBySlug,
    countActiveByOrganizerId,
    save,
    outboxSaveAll,
    transaction,
    logger,
    handler,
  };
}

function makeInput(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Tech Summit 2026',
    description: 'A conference about technology',
    cfpStartDate: '2026-08-01',
    cfpEndDate: '2026-10-01',
    maxSubmissions: 50,
    requiresApproval: true,
    organizerId: 'org-1',
    ...overrides,
  };
}

describe('CreateConferenceCommandHandler', () => {
  let mocks: CommandMocks;

  beforeEach(() => {
    mocks = makeMocks();
  });

  it('creates a conference, opens its CfP, and persists aggregate + outbox atomically', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(0);

    const response = await mocks.handler.execute(new CreateConferenceCommand(makeInput()));

    // Response shape (ConferenceApiResponse contract)
    expect(response.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(response.name).toBe('Tech Summit 2026');
    expect(response.description).toBe('A conference about technology');
    expect(response.slug).toBe('tech-summit-2026');
    expect(response.status).toBe('CFP_OPEN');
    expect(response.organizerId).toBe('org-1');
    expect(response.cfp).toMatchObject({
      isOpen: true,
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-10-01T00:00:00.000Z',
      maxSubmissions: 50,
      requiresApproval: true,
    });
    expect(typeof response.createdAt).toBe('string');
    expect(typeof response.updatedAt).toBe('string');

    // Atomic persistence: both save + outbox receive the transaction handle
    const saveCall = mocks.save.mock.calls[0];
    expect(saveCall).toHaveLength(2);
    expect(saveCall[1]).toBe(MOCK_TX);
    const savedConference = saveCall[0];
    expect(savedConference.status.value).toBe('CFP_OPEN');

    const outboxCall = mocks.outboxSaveAll.mock.calls[0];
    expect(outboxCall[1]).toBe('Conference');
    expect(outboxCall[2]).toBe(response.id);
    expect(outboxCall[3]).toBe(MOCK_TX);
    const events = outboxCall[0];
    expect(events).toHaveLength(2);
    expect(events.map((e: {type: string}) => e.type)).toEqual(['CONFERENCE_CREATED', 'CFP_OPENED']);

    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.logger.info).toHaveBeenCalled();
  });

  it('runs the BR-003 slug check before the BR-004 free-tier check', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(0);

    await mocks.handler.execute(new CreateConferenceCommand(makeInput()));

    expect(mocks.findBySlug.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.countActiveByOrganizerId.mock.invocationCallOrder[0],
    );
  });

  it('derives the slug from the conference name (slug is not an input)', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(0);

    await mocks.handler.execute(
      new CreateConferenceCommand(makeInput({name: 'Startup! Summit 2026'})),
    );

    expect(mocks.findBySlug.mock.calls[0][0].value).toBe('startup-summit-2026');
  });

  it('maps an omitted maxSubmissions to unlimited (undefined)', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(0);

    const response = await mocks.handler.execute(
      new CreateConferenceCommand(makeInput({maxSubmissions: undefined, requiresApproval: false})),
    );

    expect(response.cfp.maxSubmissions).toBeUndefined();
    expect(response.cfp.requiresApproval).toBe(false);
  });

  it('rejects a duplicate slug with SLUG_EXISTS (409) and persists nothing', async () => {
    mocks.findBySlug.mockResolvedValue({id: 'existing'});

    await expect(mocks.handler.execute(new CreateConferenceCommand(makeInput()))).rejects.toThrow(
      SlugExistsError,
    );
    await expect(
      mocks.handler.execute(new CreateConferenceCommand(makeInput())),
    ).rejects.toMatchObject({code: 'SLUG_EXISTS'});
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.outboxSaveAll).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('rejects when the organizer reached the free-tier limit with FREE_TIER_LIMIT (403)', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(5);

    await expect(mocks.handler.execute(new CreateConferenceCommand(makeInput()))).rejects.toThrow(
      ConferenceFreeTierLimitError,
    );
    await expect(
      mocks.handler.execute(new CreateConferenceCommand(makeInput())),
    ).rejects.toMatchObject({code: 'FREE_TIER_LIMIT'});
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('rejects a past CfP start date with CFP_START_DATE_NOT_IN_FUTURE', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(0);

    await expect(
      mocks.handler.execute(new CreateConferenceCommand(makeInput({cfpStartDate: '2020-01-01'}))),
    ).rejects.toThrow(CfpStartDateNotInFutureError);
    await expect(
      mocks.handler.execute(new CreateConferenceCommand(makeInput({cfpStartDate: '2020-01-01'}))),
    ).rejects.toMatchObject({code: 'CFP_START_DATE_NOT_IN_FUTURE'});
  });

  it('rejects an end date before the start date with CFP_DATES_INVALID', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(0);

    await expect(
      mocks.handler.execute(
        new CreateConferenceCommand(
          makeInput({cfpStartDate: '2026-10-01', cfpEndDate: '2026-08-01'}),
        ),
      ),
    ).rejects.toThrow(CfpDatesInvalidError);
    await expect(
      mocks.handler.execute(
        new CreateConferenceCommand(
          makeInput({cfpStartDate: '2026-10-01', cfpEndDate: '2026-08-01'}),
        ),
      ),
    ).rejects.toMatchObject({code: 'CFP_DATES_INVALID'});
  });

  it('rejects a CfP window longer than 180 days', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(0);

    await expect(
      mocks.handler.execute(
        new CreateConferenceCommand(
          makeInput({cfpStartDate: '2026-08-01', cfpEndDate: '2027-02-01'}),
        ),
      ),
    ).rejects.toMatchObject({code: 'CFP_DATES_INVALID'});
  });

  it('rejects an over-short name with NAME_TOO_SHORT', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(0);

    await expect(
      mocks.handler.execute(new CreateConferenceCommand(makeInput({name: 'Ab'}))),
    ).rejects.toThrow(ConferenceNameTooShortError);
    await expect(
      mocks.handler.execute(new CreateConferenceCommand(makeInput({name: 'Ab'}))),
    ).rejects.toMatchObject({code: 'NAME_TOO_SHORT'});
  });

  it('accepts an empty description (optional field)', async () => {
    mocks.findBySlug.mockResolvedValue(null);
    mocks.countActiveByOrganizerId.mockResolvedValue(0);

    const response = await mocks.handler.execute(
      new CreateConferenceCommand(makeInput({description: ''})),
    );

    expect(response.description).toBe('');
  });
});
