import {describe, it, expect} from 'vitest';
import {Conference} from '@sessioflow/conference/domain/conference';
import {ConferenceStatus} from '@sessioflow/conference/domain/value-objects/conference-status';
import {CfpStatus} from '@sessioflow/conference/domain/value-objects/cfp-status';
import {ConferenceName} from '@sessioflow/conference/domain/value-objects/conference-name';
import {ConferenceDescription} from '@sessioflow/conference/domain/value-objects/conference-description';
import {OrganizerId} from '@sessioflow/conference/domain/value-objects/organizer-id';
import {CfpStartDate} from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import {CfpEndDate} from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import {MaxSubmissions} from '@sessioflow/conference/domain/value-objects/max-submissions';
import {RequiresApproval} from '@sessioflow/conference/domain/value-objects/requires-approval';
import {StateTransitionError} from '@sessioflow/conference/domain/exceptions/state-transition-error';
import {ConferenceCreatedEvent} from '@sessioflow/conference/domain/events/conference-created';
import {CfpOpenedEvent} from '@sessioflow/conference/domain/events/cfp-opened';
import {futureDate, pastDate} from '../../../__helpers__/date'

describe('Conference', () => {
  const createConference = (overrideParams?: Partial<{
    name: string;
    description: string;
    organizerId: string;
    cfpStartDate: Date;
    cfpEndDate: Date;
  }>) =>
    Conference.create({
      name: ConferenceName.create(overrideParams?.name ?? 'Tech Conference 2026'),
      description: ConferenceDescription.create(overrideParams?.description ?? 'A conference about technology'),
      organizerId: OrganizerId.create(overrideParams?.organizerId ?? 'org-123'),
      cfpStartDate: CfpStartDate.create(overrideParams?.cfpStartDate ?? futureDate(1)),
      cfpEndDate: CfpEndDate.create(overrideParams?.cfpEndDate ?? futureDate(30)),
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(),
    });

  it('create() produces a conference in DRAFT state', () => {
    const conference = createConference();
    expect(conference.status).toBe(ConferenceStatus.DRAFT);
  });

  it('create() rejects a past start date', () => {
    expect(() =>
      createConference({ cfpStartDate: pastDate() })
    ).toThrow('CfpStartDate must be in the future or today');
  });

  it('create() generates a unique ID', () => {
    const conference = createConference();
    expect(conference.id.value).toBeDefined();
    expect(conference.id.value).toMatch(/^[\da-f]{8}-/i);
  });

  it('create() generates a URL-safe slug from name', () => {
    const conference = createConference();
    expect(conference.slug.value).toBe('tech-conference-2026');
  });

  it('create() stores the name', () => {
    const conference = createConference();
    expect(conference.name.value).toBe('Tech Conference 2026');
  });

  it('create() stores the description', () => {
    const conference = createConference();
    expect(conference.description.value).toBe('A conference about technology');
  });

  it('create() stores the organizerId', () => {
    const conference = createConference();
    expect(conference.organizerId.value).toBe('org-123');
  });

  it('create() creates a CfpConfig child in ACTIVE state', () => {
    const conference = createConference();
    expect(conference.cfpConfig.status).toBe(CfpStatus.ACTIVE);
  });

  it('create() sets CfpConfig with correct dates', () => {
    const conference = createConference();
    // Verify dates are in the future (not flaky)
    expect(conference.cfpConfig.startDate.value.getTime()).toBeGreaterThan(Date.now());
    expect(conference.cfpConfig.endDate.value.getTime()).toBeGreaterThan(Date.now());
    expect(conference.cfpConfig.endDate.value.getTime()).toBeGreaterThan(
      conference.cfpConfig.startDate.value.getTime(),
    );
  });

  it('create() defaults requiresApproval to true', () => {
    const conference = createConference();
    expect(conference.cfpConfig.requiresApproval.value).toBe(true);
  });

  it('publishCfp() transitions DRAFT → CFP_OPEN', () => {
    const conference = createConference();
    conference.publishCfp();
    expect(conference.status).toBe(ConferenceStatus.CFP_OPEN);
  });

  it('publishCfp() records ConferenceCreated event and flushes via pullDomainEvents()', () => {
    const conference = createConference();
    conference.publishCfp();
    const events = conference.pullDomainEvents();
    const createdEvent = events.find(e => e instanceof ConferenceCreatedEvent);
    expect(createdEvent).toBeDefined();
    expect((createdEvent as ConferenceCreatedEvent).conferenceId).toBe(conference.id);

    // Verify events are flushed after pulling
    expect(conference.pullDomainEvents()).toHaveLength(0);
  });

  it('publishCfp() records CfpOpened event', () => {
    const conference = createConference();
    conference.publishCfp();
    const events = conference.pullDomainEvents();
    const openedEvent = events.find(e => e instanceof CfpOpenedEvent);
    expect(openedEvent).toBeDefined();
  });

  it('publishCfp() fails if status is not DRAFT', () => {
    const conference = createConference();
    conference.publishCfp(); // DRAFT → CFP_OPEN
    expect(() => conference.publishCfp()).toThrow(StateTransitionError);
  });

  it('cancel() transitions DRAFT → DELETED', () => {
    const conference = createConference();
    conference.cancel();
    expect(conference.status).toBe(ConferenceStatus.DELETED);
  });

  it('cancel() fails if status is CFP_CLOSED', () => {
    const conference = createConference();
    conference.publishCfp(); // DRAFT → CFP_OPEN
    conference.closeCfp(); // CFP_OPEN → CFP_CLOSED
    expect(() => conference.cancel()).toThrow(StateTransitionError);
  });

  it('closeCfp() transitions CFP_OPEN → CFP_CLOSED', () => {
    const conference = createConference();
    conference.publishCfp(); // DRAFT → CFP_OPEN
    conference.closeCfp(); // CFP_OPEN → CFP_CLOSED
    expect(conference.status).toBe(ConferenceStatus.CFP_CLOSED);
  });

  it('isCfpOpen() returns true when status is CFP_OPEN', () => {
    const conference = createConference();
    conference.publishCfp();
    expect(conference.isCfpOpen()).toBe(true);
  });

  it('isCfpOpen() returns false when status is DRAFT', () => {
    const conference = createConference();
    expect(conference.isCfpOpen()).toBe(false);
  });

  it('isDraft() returns true when status is DRAFT', () => {
    const conference = createConference();
    expect(conference.isDraft()).toBe(true);
  });

  it('isDraft() returns false after publishCfp()', () => {
    const conference = createConference();
    conference.publishCfp();
    expect(conference.isDraft()).toBe(false);
  });

  it('isDeleted() returns true after cancel()', () => {
    const conference = createConference();
    conference.cancel();
    expect(conference.isDeleted()).toBe(true);
  });
});
