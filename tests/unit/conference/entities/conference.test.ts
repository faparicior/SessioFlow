import {describe, it, expect} from 'vitest';
import {Conference} from '@/modules/conference/domain/entities/conference';
import {ConferenceStatus} from '@/modules/conference/domain/value-objects/conference-status';
import {CfpStatus} from '@/modules/conference/domain/value-objects/cfp-status';
import {StateTransitionError} from '@/modules/conference/domain/exceptions/state-transition-error';
import {ConferenceCreatedEvent} from '@/modules/conference/domain/events/conference-created';
import {CfpOpenedEvent} from '@/modules/conference/domain/events/cfp-opened';

describe('Conference', () => {
  const createConference = () =>
    Conference.create({
      name: 'Tech Conference 2026',
      description: 'A conference about technology',
      organizerId: 'org-123',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });

  it('create() produces a conference in DRAFT state', () => {
    const conference = createConference();
    expect(conference.status).toBe(ConferenceStatus.DRAFT);
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
    expect(conference.description).toBe('A conference about technology');
  });

  it('create() stores the organizerId', () => {
    const conference = createConference();
    expect(conference.organizerId).toBe('org-123');
  });

  it('create() creates a CfpConfig child in ACTIVE state', () => {
    const conference = createConference();
    expect(conference.cfpConfig.status).toBe(CfpStatus.ACTIVE);
  });

  it('create() sets CfpConfig with correct dates', () => {
    const conference = createConference();
    expect(conference.cfpConfig.startDate.value).toEqual(
      new Date('2026-08-01'),
    );
    expect(conference.cfpConfig.endDate.value).toEqual(new Date('2026-09-30'));
  });

  it('create() defaults requiresApproval to true', () => {
    const conference = createConference();
    expect(conference.cfpConfig.requiresApproval.value).toBe(true);
  });

  it('publishCfp() transitions DRAFT → CFP_OPEN', () => {
    const conference = createConference();
    const {events} = conference.publishCfp();
    expect(conference.status).toBe(ConferenceStatus.CFP_OPEN);
  });

  it('publishCfp() publishes ConferenceCreated event', () => {
    const conference = createConference();
    const {events} = conference.publishCfp();
    const createdEvent = events.find(e => e instanceof ConferenceCreatedEvent);
    expect(createdEvent).toBeDefined();
    expect(createdEvent!.conferenceId).toBe(conference.id);
  });

  it('publishCfp() publishes CfpOpened event', () => {
    const conference = createConference();
    const {events} = conference.publishCfp();
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
