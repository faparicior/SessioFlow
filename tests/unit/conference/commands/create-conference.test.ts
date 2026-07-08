import {beforeEach, describe, it, expect, vi} from 'vitest';
import {CreateConferenceCommand} from '@/modules/conference/application/commands/create-conference/create-conference.command';
import {CreateConferenceHandler} from '@/modules/conference/application/commands/create-conference/create-conference.handler';
import {Conference} from '@/modules/conference/domain/entities/conference';
import {ConferenceStatus} from '@/modules/conference/domain/value-objects/conference-status';

// Mock repository
class MockConferenceRepository {
  private conferences: Conference[] = [];

  async findById(id: any) {
    return this.conferences.find(c => c.id.value === id.value);
  }

  async findBySlug(slug: any) {
    return this.conferences.find(c => c.slug.value === slug.value);
  }

  async findByOrganizerId(organizerId: string) {
    return this.conferences.filter(c => c.organizerId === organizerId);
  }

  async findByStatus(status: any) {
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

  async delete(id: any) {
    this.conferences = this.conferences.filter(c => c.id.value !== id.value);
  }

  add(conference: Conference) {
    this.conferences.push(conference);
  }
}

describe('CreateConference Command', () => {
  let handler: CreateConferenceHandler;
  let repo: MockConferenceRepository;

  beforeEach(() => {
    repo = new MockConferenceRepository();
    handler = new CreateConferenceHandler(repo, async () => void 0);
  });

  it('creates a conference in happy path', async () => {
    const command = new CreateConferenceCommand({
      name: 'Tech Conference 2026',
      description: 'A conference about technology',
      organizerId: 'org-123',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.status).toBe('CFP_OPEN');
    expect(result.data!.name).toBe('Tech Conference 2026');
    expect(result.data!.cfpUrl).toBe(
      'https://sessioflow.app/cfp/tech-conference-2026',
    );
  });

  it('returns validation error for short name', async () => {
    const command = new CreateConferenceCommand({
      name: 'Ab',
      organizerId: 'org-123',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const result = await handler.execute(command);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors![0].message).toContain('at least 3 characters');
  });

  it('returns validation error for invalid CfP dates', async () => {
    const command = new CreateConferenceCommand({
      name: 'Tech Conference',
      organizerId: 'org-123',
      cfpStartDate: '2026-09-30',
      cfpEndDate: '2026-08-01', // End before start
    });

    const result = await handler.execute(command);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors![0].message).toContain('after start date');
  });

  it('returns conflict error for duplicate slug', async () => {
    // Create an existing conference
    const existing = Conference.create({
      name: 'Tech Conference',
      organizerId: 'org-1',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    existing.publishCfp();
    repo.add(existing);

    const command = new CreateConferenceCommand({
      name: 'Tech Conference',
      organizerId: 'org-2',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const result = await handler.execute(command);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors![0].message).toContain('already exists');
  });

  it('includes events in response', async () => {
    const command = new CreateConferenceCommand({
      name: 'Tech Conference',
      organizerId: 'org-123',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.data!.events).toHaveLength(2);
    expect(result.data!.events[0].type).toBe('ConferenceCreated');
    expect(result.data!.events[1].type).toBe('CfpOpened');
  });

  it('saves conference to repository on success', async () => {
    const command = new CreateConferenceCommand({
      name: 'Tech Conference',
      organizerId: 'org-123',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    await handler.execute(command);

    const saved = await repo.findBySlug({value: 'tech-conference'});
    expect(saved).not.toBeUndefined();
    expect(saved!.status).toBe(ConferenceStatus.CFP_OPEN);
  });

  it('creates conference with default settings when optional fields omitted', async () => {
    const command = new CreateConferenceCommand({
      name: 'Quick Conference',
      organizerId: 'org-123',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.data!.requiresApproval).toBe(true);
    expect(result.data!.maxSubmissions).toBeUndefined();
  });

  it('creates conference with custom settings', async () => {
    const command = new CreateConferenceCommand({
      name: 'Custom Conference',
      organizerId: 'org-123',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
      maxSubmissions: 100,
      requiresApproval: false,
    });

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.data!.maxSubmissions).toBe(100);
    expect(result.data!.requiresApproval).toBe(false);
  });
});
