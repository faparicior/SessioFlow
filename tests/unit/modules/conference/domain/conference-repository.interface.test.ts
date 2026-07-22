import {describe, it, expect} from 'vitest';
import {Conference} from '@sessioflow/conference/domain/conference';
import {type ConferenceRepository} from '@sessioflow/conference/domain/conference-repository.interface';
import {ConferenceId} from '@sessioflow/conference/domain/value-objects/conference-id';
import {ConferenceSlug} from '@sessioflow/conference/domain/value-objects/conference-slug';
import {ConferenceStatus} from '@sessioflow/conference/domain/value-objects/conference-status';

/**
 * ConferenceRepository Interface - Tests using a mock implementation.
 *
 * This test validates the repository contract without depending on
 * any specific database implementation. The mock simulates in-memory storage.
 */
describe('ConferenceRepository', () => {
  // In-memory mock implementation
  class MockConferenceRepository implements ConferenceRepository {
    private conferences: Conference[] = [];

    async findById(id: ConferenceId | string): Promise<Conference | null> {
      const targetId = typeof id === 'string' ? id : id.value;
      return this.conferences.find(c => c.id.value === targetId) ?? null;
    }

    async findBySlug(slug: ConferenceSlug | string): Promise<Conference | null> {
      const targetSlug = typeof slug === 'string' ? slug : slug.value;
      return this.conferences.find(c => c.slug.value === targetSlug) ?? null;
    }

    async findByOrganizerId(organizerId: string): Promise<Conference[]> {
      return this.conferences.filter(c => c.organizerId === organizerId);
    }

    async findByStatus(status: ConferenceStatus): Promise<Conference[]> {
      return this.conferences.filter(c => c.status === status);
    }

    async save(conference: Conference): Promise<void> {
      const existingIndex = this.conferences.findIndex(
        c => c.id.value === conference.id.value,
      );
      if (existingIndex === -1) {
        this.conferences.push(conference);
      } else {
        this.conferences[existingIndex] = conference;
      }
    }

    async delete(id: ConferenceId | string): Promise<void> {
      const targetId = typeof id === 'string' ? id : id.value;
      this.conferences = this.conferences.filter(c => c.id.value !== targetId);
    }

    // Helper for tests
    add(conference: Conference): void {
      this.conferences.push(conference);
    }
  }

  let repo: MockConferenceRepository;

  it('findById returns null for non-existent ID', async () => {
    repo = new MockConferenceRepository();
    const result = await repo.findById(ConferenceId.fromString('12345678-1234-4123-8123-123456789012'));
    expect(result).toBeNull();
  });

  it('findById returns conference for existing ID', async () => {
    repo = new MockConferenceRepository();
    const conference = Conference.create({
      name: 'Test Conference',
      organizerId: 'org-1',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    repo.add(conference);

    const result = await repo.findById(conference.id);
    expect(result).toBe(conference);
    expect(result!.name.value).toBe('Test Conference');
  });

  it('findBySlug returns null for non-existent slug', async () => {
    repo = new MockConferenceRepository();
    const result = await repo.findBySlug(ConferenceSlug.create('non-existent'));
    expect(result).toBeNull();
  });

  it('findBySlug returns conference for existing slug', async () => {
    repo = new MockConferenceRepository();
    const conference = Conference.create({
      name: 'Tech Conference',
      organizerId: 'org-1',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    repo.add(conference);

    const result = await repo.findBySlug(conference.slug);
    expect(result).toBe(conference);
  });

  it('findByOrganizerId returns only conferences for that organizer', async () => {
    repo = new MockConferenceRepository();
    const conf1 = Conference.create({
      name: 'Conference 1',
      organizerId: 'org-1',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    const conf2 = Conference.create({
      name: 'Conference 2',
      organizerId: 'org-2',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    repo.add(conf1);
    repo.add(conf2);

    const result = await repo.findByOrganizerId('org-1');
    expect(result).toHaveLength(1);
    expect(result[0].name.value).toBe('Conference 1');
  });

  it('findByStatus returns conferences with matching status', async () => {
    repo = new MockConferenceRepository();
    const conf1 = Conference.create({
      name: 'Draft Conference',
      organizerId: 'org-1',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    conf1.publishCfp(); // DRAFT → CFP_OPEN

    repo.add(conf1);

    const drafts = await repo.findByStatus(ConferenceStatus.DRAFT);
    expect(drafts).toHaveLength(0);

    const open = await repo.findByStatus(ConferenceStatus.CFP_OPEN);
    expect(open).toHaveLength(1);
  });

  it('save() adds a new conference', async () => {
    repo = new MockConferenceRepository();
    const conference = Conference.create({
      name: 'New Conference',
      organizerId: 'org-1',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });

    await repo.save(conference);
    const result = await repo.findById(conference.id);
    expect(result).toBe(conference);
    expect(result!.name.value).toBe('New Conference');
  });

  it('save() updates an existing conference', async () => {
    repo = new MockConferenceRepository();
    const conference = Conference.create({
      name: 'Original Name',
      organizerId: 'org-1',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    repo.add(conference);

    conference.publishCfp();

    await repo.save(conference);
    const result = await repo.findById(conference.id);
    expect(result!.status).toBe('CFP_OPEN');
  });

  it('delete() removes a conference by ID', async () => {
    repo = new MockConferenceRepository();
    const conference = Conference.create({
      name: 'To Delete',
      organizerId: 'org-1',
      cfpStartDate: new Date('2026-08-01'),
      cfpEndDate: new Date('2026-09-30'),
    });
    repo.add(conference);

    await repo.delete(conference.id);
    const result = await repo.findById(conference.id);
    expect(result).toBeNull();
  });
});
