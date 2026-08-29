import {eq} from 'drizzle-orm';
import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {db} from '@sessioflow/shared-database/client';
import {conferencesTable} from '@sessioflow/shared-database/schema';
import {DrizzleConferenceRepository} from '@sessioflow/conference/infrastructure/database/conference.repository';
import {Conference} from '@sessioflow/conference/domain/conference';
import {CfpConfig} from '@sessioflow/conference/domain/value-objects/cfp-config';
import {CfpEndDate} from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import {CfpStartDate} from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import {ConferenceDescription} from '@sessioflow/conference/domain/value-objects/conference-description';
import {ConferenceName} from '@sessioflow/conference/domain/value-objects/conference-name';
import {ConferenceSlug} from '@sessioflow/conference/domain/value-objects/conference-slug';
import {MaxSubmissions} from '@sessioflow/conference/domain/value-objects/max-submissions';
import {OrganizerId} from '@sessioflow/conference/domain/value-objects/organizer-id';
import {RequiresApproval} from '@sessioflow/conference/domain/value-objects/requires-approval';
import {cleanTables, rowCount, testSql} from './utils/test-db';

/**
 * Builds a fresh (unsaved) Conference aggregate via the domain API.
 * Dates are fixed ISO instants; the mocked test clock is 2026-07-28.
 */
function buildConference(name = 'Tech Conference 2026'): Conference {
  return Conference.create({
    name: ConferenceName.create(name),
    description: ConferenceDescription.create('The best tech event of the year'),
    slug: ConferenceSlug.create(name),
    organizerId: OrganizerId.create('mock-user-id'),
    cfpConfig: CfpConfig.create({
      startDate: CfpStartDate.create(new Date('2026-08-17T00:00:00.000Z')),
      endDate: CfpEndDate.create(new Date('2026-09-30T23:59:59.000Z')),
      maxSubmissions: MaxSubmissions.create(50),
      requiresApproval: RequiresApproval.create(true),
    }),
  });
}

/** Forces a persisted row into another status, bypassing the aggregate
 * (exercises the DELETED exclusion of the BR-004 count). */
async function forceStatus(conferenceId: string, status: string): Promise<void> {
  await db.update(conferencesTable).set({status}).where(eq(conferencesTable.id, conferenceId));
}

describe('DrizzleConferenceRepository (integration)', () => {
  let repository: DrizzleConferenceRepository;

  beforeAll(() => {
    repository = new DrizzleConferenceRepository();
  });

  beforeEach(async () => {
    await cleanTables();
  });

  afterAll(async () => {
    await cleanTables();
  });

  describe('save + findBySlug round-trip', () => {
    it('persists the aggregate and reads it back by slug', async () => {
      const conference = buildConference();
      await repository.save(conference);

      expect(await rowCount('conferences')).toBe(1);

      const found = await repository.findBySlug(conference.slug);
      expect(found).not.toBeNull();
      expect(found!.id.value).toBe(conference.id.value);
      expect(found!.slug.value).toBe('tech-conference-2026');
    });

    it('is upsert-safe: saving the same aggregate twice keeps a single row', async () => {
      const conference = buildConference();
      await repository.save(conference);

      conference.publishCfp();
      await repository.save(conference);

      expect(await rowCount('conferences')).toBe(1);
      const found = await repository.findById(conference.id);
      expect(found!.status.value).toBe('CFP_OPEN');
    });
  });

  describe('findById reconstitution', () => {
    it('rebuilds the aggregate with Value Objects from the row + cfp_config JSONB', async () => {
      const conference = buildConference();
      await repository.save(conference);

      const found = await repository.findById(conference.id);
      expect(found).not.toBeNull();

      expect(found!.name.value).toBe('Tech Conference 2026');
      expect(found!.description.value).toBe('The best tech event of the year');
      expect(found!.slug.value).toBe('tech-conference-2026');
      expect(found!.status.value).toBe('DRAFT');
      expect(found!.organizerId.value).toBe('mock-user-id');

      const cfp = found!.cfpConfig;
      expect(cfp.startDate.value.toISOString()).toBe('2026-08-17T00:00:00.000Z');
      expect(cfp.endDate.value.toISOString()).toBe('2026-09-30T23:59:59.000Z');
      expect(cfp.maxSubmissions.value).toBe(50);
      expect(cfp.requiresApproval.value).toBe(true);
      expect(cfp.status.value).toBe('ACTIVE');
      expect(cfp.equals(conference.cfpConfig)).toBe(true);

      expect(found!.createdAt.getTime()).toBe(conference.createdAt.getTime());
      expect(found!.updatedAt.getTime()).toBe(conference.updatedAt.getTime());
    });

    it('reconstitutes without pending domain events (fromData purity)', async () => {
      const conference = buildConference();
      await repository.save(conference);

      const found = await repository.findById(conference.id);
      expect(found!.pullDomainEvents()).toEqual([]);
    });

    it('treats a missing maxSubmissions as unlimited after reconstitution', async () => {
      const conference = Conference.create({
        name: ConferenceName.create('Unlimited Conf'),
        description: ConferenceDescription.create(''),
        slug: ConferenceSlug.create('Unlimited Conf'),
        organizerId: OrganizerId.create('mock-user-id'),
        cfpConfig: CfpConfig.create({
          startDate: CfpStartDate.create(new Date('2026-08-17T00:00:00.000Z')),
          endDate: CfpEndDate.create(new Date('2026-09-30T00:00:00.000Z')),
          maxSubmissions: MaxSubmissions.create(null),
          requiresApproval: RequiresApproval.create(false),
        }),
      });
      await repository.save(conference);

      const found = await repository.findBySlug(conference.slug);
      expect(found!.cfpConfig.maxSubmissions.isUnlimited()).toBe(true);
      expect(found!.description.value).toBe('');
      expect(found!.cfpConfig.requiresApproval.value).toBe(false);
    });

    it('returns null for an unknown id or slug', async () => {
      const known = buildConference();
      expect(await repository.findById(known.id)).toBeNull();
      expect(await repository.findBySlug(ConferenceSlug.fromData('nope-2026'))).toBeNull();
    });
  });

  describe('countActiveByOrganizerId (BR-004)', () => {
    it('counts conferences across non-DELETED statuses', async () => {
      const a = buildConference('Alpha One');
      const b = buildConference('Beta Two');
      await repository.save(a);
      await repository.save(b);
      await forceStatus(b.id.value, 'CFP_OPEN');

      expect(await repository.countActiveByOrganizerId(a.organizerId)).toBe(2);
    });

    it('excludes DELETED conferences from the count', async () => {
      const a = buildConference('Alpha One');
      const b = buildConference('Beta Two');
      await repository.save(a);
      await repository.save(b);
      await forceStatus(b.id.value, 'DELETED');

      expect(await repository.countActiveByOrganizerId(a.organizerId)).toBe(1);
    });

    it('is scoped per organizer', async () => {
      await repository.save(buildConference('Alpha One'));

      expect(await repository.countActiveByOrganizerId(OrganizerId.create('other-user'))).toBe(0);
    });
  });

  describe('transactional save (ADR-017)', () => {
    it('writes inside a provided tx handle and commits atomically', async () => {
      const conference = buildConference();
      await db.transaction(async tx => {
        await repository.save(conference, tx);
        const [row] = await tx
          .select({id: conferencesTable.id})
          .from(conferencesTable)
          .where(eq(conferencesTable.slug, conference.slug.value));
        expect(row).toBeDefined();
      });

      expect(await rowCount('conferences')).toBe(1);
    });

    it('rolls back the aggregate write when the transaction fails', async () => {
      const conference = buildConference();
      await expect(
        db.transaction(async tx => {
          await repository.save(conference, tx);
          throw new Error('simulated failure after aggregate save');
        }),
      ).rejects.toThrow('simulated failure after aggregate save');

      expect(await rowCount('conferences')).toBe(0);
    });
  });
});
