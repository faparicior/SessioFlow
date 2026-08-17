import {describe, expect, it, vi} from 'vitest';
import {GetConferenceQuery} from '@sessioflow/conference/application/queries/get-conference/get-conference.query';
import {GetConferenceQueryHandler} from '@sessioflow/conference/application/queries/get-conference/get-conference.handler';
import {Conference} from '@sessioflow/conference/domain/conference';
import type {ConferenceRepository} from '@sessioflow/conference/domain/conference-repository.interface';
import {ConferenceNotFoundError} from '@sessioflow/conference/domain/exceptions/conference-not-found-error';
import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';
import {CfpConfig} from '@sessioflow/conference/domain/value-objects/cfp-config';
import {CfpEndDate} from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import {CfpStartDate} from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import {ConferenceDescription} from '@sessioflow/conference/domain/value-objects/conference-description';
import {ConferenceId} from '@sessioflow/conference/domain/value-objects/conference-id';
import {ConferenceName} from '@sessioflow/conference/domain/value-objects/conference-name';
import {ConferenceSlug} from '@sessioflow/conference/domain/value-objects/conference-slug';
import {MaxSubmissions} from '@sessioflow/conference/domain/value-objects/max-submissions';
import {OrganizerId} from '@sessioflow/conference/domain/value-objects/organizer-id';
import {RequiresApproval} from '@sessioflow/conference/domain/value-objects/requires-approval';

function makeRepositoryMock(
  findById: ReturnType<typeof vi.fn<ConferenceRepository['findById']>>,
): ConferenceRepository {
  return {
    findById,
    findBySlug: vi.fn(),
    countActiveByOrganizerId: vi.fn(),
    save: vi.fn(),
  };
}

function makeConference(): Conference {
  const conference = Conference.create({
    name: ConferenceName.create('Tech Summit 2026'),
    description: ConferenceDescription.create('A conference about technology'),
    slug: ConferenceSlug.create('tech-summit-2026'),
    organizerId: OrganizerId.create('org-1'),
    cfpConfig: CfpConfig.create({
      startDate: CfpStartDate.fromData(new Date('2026-08-01T00:00:00.000Z')),
      endDate: CfpEndDate.fromData(new Date('2026-10-01T00:00:00.000Z')),
      maxSubmissions: MaxSubmissions.create(50),
      requiresApproval: RequiresApproval.create(true),
    }),
  });
  conference.publishCfp();
  return conference;
}

describe('GetConferenceQueryHandler', () => {
  it('returns the conference data for a valid id', async () => {
    const conference = makeConference();
    const findById = vi
      .fn<ConferenceRepository['findById']>()
      .mockResolvedValue(conference);
    const handler = new GetConferenceQueryHandler(makeRepositoryMock(findById));

    const response = await handler.execute(
      new GetConferenceQuery({conferenceId: conference.id.value}),
    );

    expect(response.id).toBe(conference.id.value);
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
  });

  it('returns undefined maxSubmissions for unlimited conferences', async () => {
    const conference = Conference.create({
      name: ConferenceName.create('Open Summit'),
      description: ConferenceDescription.create(''),
      slug: ConferenceSlug.create('open-summit'),
      organizerId: OrganizerId.create('org-1'),
      cfpConfig: CfpConfig.create({
        startDate: CfpStartDate.fromData(new Date('2026-08-01T00:00:00.000Z')),
        endDate: CfpEndDate.fromData(new Date('2026-09-01T00:00:00.000Z')),
        maxSubmissions: MaxSubmissions.create(null),
        requiresApproval: RequiresApproval.create(false),
      }),
    });
    const findById = vi
      .fn<ConferenceRepository['findById']>()
      .mockResolvedValue(conference);
    const handler = new GetConferenceQueryHandler(makeRepositoryMock(findById));

    const response = await handler.execute(
      new GetConferenceQuery({conferenceId: conference.id.value}),
    );

    expect(response.cfp.maxSubmissions).toBeUndefined();
  });

  it('throws ConferenceNotFoundError (NOT_FOUND / 404) when the id does not exist', async () => {
    const missingId = ConferenceId.generate().value;
    const findById = vi
      .fn<ConferenceRepository['findById']>()
      .mockResolvedValue(null);
    const handler = new GetConferenceQueryHandler(makeRepositoryMock(findById));

    await expect(
      handler.execute(new GetConferenceQuery({conferenceId: missingId})),
    ).rejects.toThrow(ConferenceNotFoundError);
    await expect(
      handler.execute(new GetConferenceQuery({conferenceId: missingId})),
    ).rejects.toMatchObject({code: 'NOT_FOUND'});
    expect(findById).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed ids with a domain error (INVALID_CONFERENCE_ID / 400)', async () => {
    const findById = vi.fn<ConferenceRepository['findById']>();
    const handler = new GetConferenceQueryHandler(makeRepositoryMock(findById));

    await expect(
      handler.execute(new GetConferenceQuery({conferenceId: 'not-a-uuid'})),
    ).rejects.toThrow(DomainInvariantError);
    await expect(
      handler.execute(new GetConferenceQuery({conferenceId: 'not-a-uuid'})),
    ).rejects.toMatchObject({code: 'INVALID_CONFERENCE_ID'});
    expect(findById).not.toHaveBeenCalled();
  });
});
