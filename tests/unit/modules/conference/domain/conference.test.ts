import {describe, expect, it} from 'vitest';
import {Conference} from '@sessioflow/conference/domain/conference';
import {ConferenceDescription} from '@sessioflow/conference/domain/value-objects/conference-description';
import {ConferenceName} from '@sessioflow/conference/domain/value-objects/conference-name';
import {ConferenceSlug} from '@sessioflow/conference/domain/value-objects/conference-slug';
import {ConferenceStatus} from '@sessioflow/conference/domain/value-objects/conference-status';
import {OrganizerId} from '@sessioflow/conference/domain/value-objects/organizer-id';
import {CfpConfig} from '@sessioflow/conference/domain/value-objects/cfp-config';
import {CfpEndDate} from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import {CfpStartDate} from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import {RequiresApproval} from '@sessioflow/conference/domain/value-objects/requires-approval';
import {ConferenceCreatedEvent} from '@sessioflow/conference/domain/events/conference-created-event';
import {CfpOpenedEvent} from '@sessioflow/conference/domain/events/cfp-opened-event';
import {InvalidStatusTransitionError} from '@sessioflow/conference/domain/exceptions/invalid-status-transition-error';
import {futureDate} from '../../../__helpers__/date';

function makeConference(overrides: Partial<Parameters<typeof Conference.create>[0]> = {}) {
  return Conference.create({
    name: ConferenceName.create('Tech Conference 2026'),
    description: ConferenceDescription.create('A tech conference'),
    slug: ConferenceSlug.create('Tech Conference 2026'),
    organizerId: OrganizerId.create('mock-user-id'),
    cfpConfig: CfpConfig.create({
      startDate: CfpStartDate.create(futureDate(1)),
      endDate: CfpEndDate.create(futureDate(30)),
      requiresApproval: RequiresApproval.create(true),
    }),
    ...overrides,
  });
}

describe('Conference aggregate', () => {
  describe('create()', () => {
    it('creates a conference in DRAFT state', () => {
      const conference = makeConference();
      expect(conference.status.equals(ConferenceStatus.create('DRAFT'))).toBe(true);
    });

    it('generates a UUIDv4 id', () => {
      const conference = makeConference();
      expect(conference.id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it('keeps the provided VOs', () => {
      const conference = makeConference();
      expect(conference.name.value).toBe('Tech Conference 2026');
      expect(conference.slug.value).toBe('tech-conference-2026');
      expect(conference.organizerId.value).toBe('mock-user-id');
      expect(conference.description.value).toBe('A tech conference');
      expect(conference.cfpConfig.isActive()).toBe(true);
    });

    it('sets createdAt/updatedAt and records ConferenceCreatedEvent', () => {
      const conference = makeConference();
      expect(conference.createdAt.getTime()).toBe(conference.updatedAt.getTime());
      const events = conference.pullDomainEvents();
      expect(events).toHaveLength(1);
      const created = events[0] as ConferenceCreatedEvent;
      expect(created).toBeInstanceOf(ConferenceCreatedEvent);
      expect(created.type).toBe('CONFERENCE_CREATED');
      expect(created.aggregateId).toBe(conference.id.value);
    });

    it('produces unique ids per conference', () => {
      expect(makeConference().id.value).not.toBe(makeConference().id.value);
    });
  });

  describe('publishCfp()', () => {
    it('transitions DRAFT -> CFP_OPEN (INV-001) and records CfpOpenedEvent', () => {
      const conference = makeConference();
      conference.publishCfp();
      expect(conference.status.equals(ConferenceStatus.create('CFP_OPEN'))).toBe(true);
      const events = conference.pullDomainEvents();
      expect(events.map(event => event.type)).toEqual(['CONFERENCE_CREATED', 'CFP_OPENED']);
      const opened = events[1] as CfpOpenedEvent;
      expect(opened).toBeInstanceOf(CfpOpenedEvent);
      expect(opened.aggregateId).toBe(conference.id.value);
    });

    it('updates updatedAt on transition', () => {
      const conference = makeConference();
      const created = conference.updatedAt.getTime();
      conference.publishCfp();
      expect(conference.updatedAt.getTime()).toBeGreaterThanOrEqual(created);
    });

    it('rejects publishCfp() from non-DRAFT states', () => {
      const conference = makeConference();
      conference.publishCfp();
      expect(() => conference.publishCfp()).toThrow(InvalidStatusTransitionError);
    });

    it('rejects publishCfp() from a reconstituted CFP_CLOSED conference', () => {
      const conference = makeConference();
      conference.publishCfp();
      const reconstituted = Conference.fromData({
        id: conference.id,
        name: conference.name,
        description: conference.description,
        slug: conference.slug,
        status: ConferenceStatus.create('CFP_CLOSED'),
        organizerId: conference.organizerId,
        cfpConfig: conference.cfpConfig,
        createdAt: conference.createdAt,
        updatedAt: conference.updatedAt,
      });
      expect(() => reconstituted.publishCfp()).toThrow(InvalidStatusTransitionError);
    });
  });

  describe('pullDomainEvents()', () => {
    it('returns events exactly once (flush semantics)', () => {
      const conference = makeConference();
      const first = conference.pullDomainEvents();
      expect(first).toHaveLength(1);
      expect(conference.pullDomainEvents()).toHaveLength(0);
    });

    it('reconstituted aggregates carry no pending events', () => {
      const conference = makeConference();
      conference.pullDomainEvents();
      const reconstituted = Conference.fromData({
        id: conference.id,
        name: conference.name,
        description: conference.description,
        slug: conference.slug,
        status: conference.status,
        organizerId: conference.organizerId,
        cfpConfig: conference.cfpConfig,
        createdAt: conference.createdAt,
        updatedAt: conference.updatedAt,
      });
      expect(reconstituted.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('fromData()', () => {
    it('reconstitutes without recording domain events', () => {
      const conference = makeConference();
      const reconstituted = Conference.fromData({
        id: conference.id,
        name: conference.name,
        description: conference.description,
        slug: conference.slug,
        status: conference.status,
        organizerId: conference.organizerId,
        cfpConfig: conference.cfpConfig,
        createdAt: conference.createdAt,
        updatedAt: conference.updatedAt,
      });
      expect(reconstituted.id.equals(conference.id)).toBe(true);
      expect(reconstituted.name.equals(conference.name)).toBe(true);
      expect(reconstituted.status.equals(conference.status)).toBe(true);
    });
  });
});
