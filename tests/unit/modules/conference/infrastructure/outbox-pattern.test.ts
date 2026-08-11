import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Conference } from '@sessioflow/conference/domain/conference';
import { ConferenceName } from '@sessioflow/conference/domain/value-objects/conference-name';
import { ConferenceDescription } from '@sessioflow/conference/domain/value-objects/conference-description';
import { OrganizerId } from '@sessioflow/conference/domain/value-objects/organizer-id';
import { CfpStartDate } from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import { CfpEndDate } from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import { MaxSubmissions } from '@sessioflow/conference/domain/value-objects/max-submissions';
import { RequiresApproval } from '@sessioflow/conference/domain/value-objects/requires-approval';
import { DrizzleConferenceRepository } from '@sessioflow/conference/infrastructure/database/conference.repository';
import { DrizzleOutboxRepository } from '@sessioflow/shared-database/outbox-repository';
import { OutboxProcessor } from '@sessioflow/shared-database/outbox';
import { futureDate } from '../../../__helpers__/date';

// Mock DB client
vi.mock('@sessioflow/shared-database/client', () => {
  const mockRows: any[] = [];
  const mockOutbox: any[] = [];

  return {
    db: {
      insert: (table: any) => ({
        values: (val: any) => {
          const rows = Array.isArray(val) ? val : [val];
          if (rows.length > 0 && ('aggregateType' in rows[0] || 'eventType' in rows[0])) {
            mockOutbox.push(...rows);
          } else {
            mockRows.push(...rows);
          }
          return {
            onConflictDoUpdate: () => Promise.resolve(),
          };
        },
      }),
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve(mockOutbox.filter((m) => m.status === 'PENDING')),
          }),
        }),
      }),
      update: (table: any) => ({
        set: (data: any) => ({
          where: (cond: any) => {
            mockOutbox.forEach((m) => {
              Object.assign(m, data);
            });
            return Promise.resolve();
          },
        }),
      }),
      _mockRows: mockRows,
      _mockOutbox: mockOutbox,
    },
  };
});

describe('Transactional Outbox Pattern', () => {
  it('DrizzleOutboxRepository.saveAll() persists pulled domain events to outbox table', async () => {
    const repository = new DrizzleConferenceRepository();
    const outboxRepository = new DrizzleOutboxRepository();

    const conference = Conference.create({
      name: ConferenceName.create('Outbox Test Conference'),
      description: ConferenceDescription.create(),
      organizerId: OrganizerId.create('org-outbox-1'),
      cfpStartDate: CfpStartDate.create(futureDate(10)),
      cfpEndDate: CfpEndDate.create(futureDate(30)),
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(),
    });

    // Action that generates domain events: ConferenceCreatedEvent & CfpOpenedEvent
    conference.publishCfp();

    await repository.save(conference);

    // Handler explicitly pulls domain events at the latest moment
    const events = conference.pullDomainEvents();
    await outboxRepository.saveAll(events, 'Conference', conference.id.value);

    // Verify DB client mock received outbox rows
    const { db } = await import('@sessioflow/shared-database/client');
    const mockOutbox = (db as any)._mockOutbox;

    expect(mockOutbox.length).toBeGreaterThan(0);
    expect(mockOutbox[0].aggregateType).toBe('Conference');
    expect(mockOutbox[0].status).toBe('PENDING');
  });

  it('OutboxProcessor processes pending outbox messages and marks them PROCESSED', async () => {
    const mockPublisher = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    const result = await OutboxProcessor.processPending(mockPublisher);

    expect(mockPublisher.publish).toHaveBeenCalled();
    expect(result.processed).toBeGreaterThan(0);
    expect(result.failed).toBe(0);
  });
});
