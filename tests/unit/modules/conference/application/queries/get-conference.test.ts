import { beforeEach, describe, it, expect } from 'vitest';
import { Conference } from '@sessioflow/conference/domain/conference';
import { type ConferenceSlug } from '@sessioflow/conference/domain/value-objects/conference-slug';
import { type ConferenceStatus } from '@sessioflow/conference/domain/value-objects/conference-status';
import { type ConferenceId } from '@sessioflow/conference/domain/value-objects/conference-id';
import { GetConferenceHandler } from '@sessioflow/conference/application/queries/get-conference/get-conference.handler';
import { GetConferenceQuery } from '@sessioflow/conference/application/queries/get-conference/get-conference.query';
import { ConferenceNotFoundError } from '@sessioflow/conference/domain/exceptions/conference-not-found-error';
import { futureDate } from '../../../../__helpers__/date'

import { type ConferenceRepository } from '@sessioflow/conference/domain/conference-repository.interface';

// Mock repository
class MockConferenceRepository implements ConferenceRepository {
  private conferences: Conference[] = [];

  async findById(id: ConferenceId | string): Promise<Conference | null> {
    const targetId = typeof id === 'string' ? id : id.value;
    return this.conferences.find((c) => c.id.value === targetId) ?? null;
  }

  async findBySlug(slug: ConferenceSlug | string): Promise<Conference | null> {
    const targetSlug = typeof slug === 'string' ? slug : slug.value;
    return this.conferences.find((c) => c.slug.value === targetSlug) ?? null;
  }

  async findByOrganizerId(organizerId: string): Promise<Conference[]> {
    return this.conferences.filter((c) => c.organizerId.value === organizerId);
  }

  async findByStatus(status: ConferenceStatus): Promise<Conference[]> {
    return this.conferences.filter((c) => c.status === status);
  }

  async save(conference: Conference): Promise<void> {
    const existingIndex = this.conferences.findIndex(
      (c) => c.id.value === conference.id.value
    );
    if (existingIndex === -1) {
      this.conferences.push(conference);
    } else {
      this.conferences[existingIndex] = conference;
    }
  }

  async delete(id: ConferenceId | string): Promise<void> {
    const targetId = typeof id === 'string' ? id : id.value;
    this.conferences = this.conferences.filter((c) => c.id.value !== targetId);
  }

  add(conference: Conference): void {
    this.conferences.push(conference);
  }
}

import { ConferenceName } from '@sessioflow/conference/domain/value-objects/conference-name';
import { ConferenceDescription } from '@sessioflow/conference/domain/value-objects/conference-description';
import { OrganizerId } from '@sessioflow/conference/domain/value-objects/organizer-id';
import { CfpStartDate } from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import { CfpEndDate } from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import { MaxSubmissions } from '@sessioflow/conference/domain/value-objects/max-submissions';
import { RequiresApproval } from '@sessioflow/conference/domain/value-objects/requires-approval';

describe('GetConference Query', () => {
  let handler: GetConferenceHandler;
  let repo: MockConferenceRepository;

  beforeEach(() => {
    repo = new MockConferenceRepository();
    handler = new GetConferenceHandler(repo);
  });

  it('returns conference by ID when it exists', async () => {
    const conference = Conference.create({
      name: ConferenceName.create('Tech Conference 2026'),
      description: ConferenceDescription.create(),
      organizerId: OrganizerId.create('org-123'),
      cfpStartDate: CfpStartDate.create(futureDate(25)),
      cfpEndDate: CfpEndDate.create(futureDate(55)),
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(),
    });
    conference.publishCfp();
    repo.add(conference);

    const result = await handler.execute(
      new GetConferenceQuery({ id: conference.id.toString() })
    );

    expect(result.id).toBe(conference.id.value);
    expect(result.name).toBe('Tech Conference 2026');
    expect(result.status).toBe('CFP_OPEN');
    expect(result.slug).toBe('tech-conference-2026');
  });

  it('throws error when conference not found', async () => {
    await expect(
      handler.execute(new GetConferenceQuery({ id: '12345678-1234-4123-8123-123456789012' }))
    ).rejects.toThrow(ConferenceNotFoundError);
  });

  it('returns conference with CfpConfig details', async () => {
    const conference = Conference.create({
      name: ConferenceName.create('Custom Conference'),
      description: ConferenceDescription.create(),
      organizerId: OrganizerId.create('org-123'),
      cfpStartDate: CfpStartDate.create(futureDate(25)),
      cfpEndDate: CfpEndDate.create(futureDate(55)),
      maxSubmissions: MaxSubmissions.create(100),
      requiresApproval: RequiresApproval.create(false),
    });
    repo.add(conference);

    const result = await handler.execute(
      new GetConferenceQuery({ id: conference.id.toString() })
    );

    expect(result.maxSubmissions).toBe(100);
    expect(result.requiresApproval).toBe(false);
    expect(result.cfpStartDate).toBe(
      conference.cfpConfig.startDate.value.toISOString()
    );
    expect(result.cfpEndDate).toBe(
      conference.cfpConfig.endDate.value.toISOString()
    );
  });

  it('returns conference in DRAFT state', async () => {
    const conference = Conference.create({
      name: ConferenceName.create('Draft Conference'),
      description: ConferenceDescription.create(),
      organizerId: OrganizerId.create('org-123'),
      cfpStartDate: CfpStartDate.create(futureDate(25)),
      cfpEndDate: CfpEndDate.create(futureDate(55)),
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(),
    });
    repo.add(conference);

    const result = await handler.execute(
      new GetConferenceQuery({ id: conference.id.toString() })
    );

    expect(result.status).toBe('DRAFT');
  });

  it('returns conference with correct createdAt and updatedAt', async () => {
    const conference = Conference.create({
      name: ConferenceName.create('Time Test Conference'),
      description: ConferenceDescription.create(),
      organizerId: OrganizerId.create('org-123'),
      cfpStartDate: CfpStartDate.create(futureDate(25)),
      cfpEndDate: CfpEndDate.create(futureDate(55)),
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(),
    });
    repo.add(conference);

    const result = await handler.execute(
      new GetConferenceQuery({ id: conference.id.toString() })
    );

    expect(result.createdAt).toBe(conference.createdAt.toISOString());
    expect(result.updatedAt).toBe(conference.updatedAt.toISOString());
  });
});
