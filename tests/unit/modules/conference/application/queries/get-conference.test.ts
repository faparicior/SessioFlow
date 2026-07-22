import {beforeEach, describe, it, expect} from 'vitest';
import {Conference} from '@sessioflow/conference/domain/conference';
import {type ConferenceSlug} from '@sessioflow/conference/domain/value-objects/conference-slug';
import {type ConferenceStatus} from '@sessioflow/conference/domain/value-objects/conference-status';
import {type ConferenceId} from '@sessioflow/conference/domain/value-objects/conference-id';
import {GetConferenceHandler} from '@sessioflow/conference/application/queries/get-conference/get-conference.handler';

// Mock repository
class MockConferenceRepository {
  private conferences: Conference[] = [];

  async findById(id: ConferenceId): Promise<Conference | undefined> {
    return this.conferences.find(c => c.id.value === id.value);
  }

  async findBySlug(slug: ConferenceSlug) {
    return this.conferences.find(c => c.slug.value === slug.value);
  }

  async findByOrganizerId(organizerId: string) {
    return this.conferences.filter(c => c.organizerId === organizerId);
  }

  async findByStatus(status: ConferenceStatus) {
    return this.conferences.filter(c => c.status === status);
  }

  async save(conference: Conference) {
    const existingIndex = this.conferences.findIndex(
      c => c.id.value === conference.id.value,
    );
    if (existingIndex === -1) {
      this.conferences.push(conference);
    } else {
      this.conferences[existingIndex] = conference;
    }
  }

  async delete(id: ConferenceId) {
    this.conferences = this.conferences.filter(c => c.id.value !== id.value);
  }

  add(conference: Conference) {
    this.conferences.push(conference);
  }
}

describe('GetConference Query', () => {
  let handler: GetConferenceHandler;
  let repo: MockConferenceRepository;

  beforeEach(() => {
    repo = new MockConferenceRepository();
    handler = new GetConferenceHandler(repo);
  });

  it('returns conference by ID when it exists', async () => {
    const conference = Conference.create({
      name: 'Tech Conference 2026',
      organizerId: 'org-123',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    conference.publishCfp();
    repo.add(conference);

    const result = await handler.execute({id: conference.id.toString()});

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.id).toBe(conference.id.value);
    expect(result.data!.name).toBe('Tech Conference 2026');
    expect(result.data!.status).toBe('CFP_OPEN');
    expect(result.data!.cfpUrl).toBe('/cfp/tech-conference-2026');
  });

  it('returns null when conference not found', async () => {
    const result = await handler.execute({
      id: '12345678-1234-4123-8123-123456789012',
    });

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors![0].code).toBe('NOT_FOUND');
  });

  it('returns conference with CfpConfig details', async () => {
    const conference = Conference.create({
      name: 'Custom Conference',
      organizerId: 'org-123',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
      maxSubmissions: 100,
      requiresApproval: false,
    });
    repo.add(conference);

    const result = await handler.execute({id: conference.id.toString()});

    expect(result.success).toBe(true);
    expect(result.data!.maxSubmissions).toBe(100);
    expect(result.data!.requiresApproval).toBe(false);
    expect(result.data!.cfpStartDate).toBe(
      conference.cfpConfig.startDate.toISOString(),
    );
    expect(result.data!.cfpEndDate).toBe(
      conference.cfpConfig.endDate.toISOString(),
    );
  });

  it('returns conference in DRAFT state', async () => {
    const conference = Conference.create({
      name: 'Draft Conference',
      organizerId: 'org-123',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    repo.add(conference);

    const result = await handler.execute({id: conference.id.toString()});

    expect(result.success).toBe(true);
    expect(result.data!.status).toBe('DRAFT');
  });

  it('returns conference with correct createdAt and updatedAt', async () => {
    const conference = Conference.create({
      name: 'Time Test Conference',
      organizerId: 'org-123',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    repo.add(conference);

    const result = await handler.execute({id: conference.id.toString()});

    expect(result.success).toBe(true);
    expect(result.data!.createdAt).toBe(conference.createdAt.toISOString());
    expect(result.data!.updatedAt).toBe(conference.updatedAt.toISOString());
  });
});
