import {describe, it, expect} from 'vitest';
import {Conference} from '@sessioflow/conference/domain/conference';
import {type ConferenceRepository} from '@sessioflow/conference/domain/conference-repository.interface';
import {ConferenceId} from '@sessioflow/conference/domain/value-objects/conference-id';
import {ConferenceSlug} from '@sessioflow/conference/domain/value-objects/conference-slug';
import {ConferenceStatus} from '@sessioflow/conference/domain/value-objects/conference-status';
import {ConferenceName} from '@sessioflow/conference/domain/value-objects/conference-name';
import {ConferenceDescription} from '@sessioflow/conference/domain/value-objects/conference-description';
import {OrganizerId} from '@sessioflow/conference/domain/value-objects/organizer-id';
import {CfpStartDate} from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import {CfpEndDate} from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import {MaxSubmissions} from '@sessioflow/conference/domain/value-objects/max-submissions';
import {RequiresApproval} from '@sessioflow/conference/domain/value-objects/requires-approval';
import {futureDate} from '../../../__helpers__/date';

const createTestConference = (name: string, organizerId: string, startDate = futureDate(15), endDate = futureDate(45)) =>
  Conference.create({
    name: ConferenceName.create(name),
    description: ConferenceDescription.create(),
    organizerId: OrganizerId.create(organizerId),
    cfpStartDate: CfpStartDate.create(startDate),
    cfpEndDate: CfpEndDate.create(endDate),
    maxSubmissions: MaxSubmissions.create(),
    requiresApproval: RequiresApproval.create(),
  });

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
      return this.conferences.filter(c => c.organizerId.value === organizerId);
    }

    async findByStatus(status: ConferenceStatus): Promise<Conference[]> {
      return this.conferences.filter(c => c.status === status);
    }

    async save(conference: Conference): Promise<void> {
      const index = this.conferences.findIndex(c => c.id.value === conference.id.value);
      if (index >= 0) {
        this.conferences[index] = conference;
      } else {
        this.conferences.push(conference);
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

    get count(): number {
      return this.conferences.length;
    }
  }

  let repo: MockConferenceRepository;

  it('findById returns null for non-existent ID', async () => {
    repo = new MockConferenceRepository();
    const result = await repo.findById('non-existent-id');
    expect(result).toBeNull();
  });

  it('findById returns conference for existing ID', async () => {
    repo = new MockConferenceRepository();
    const conference = createTestConference('Test Conference', 'org-1');
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
    const conference = createTestConference('Tech Conference', 'org-1');
    repo.add(conference);

    const result = await repo.findBySlug(conference.slug);
    expect(result).toBe(conference);
  });

  it('findByOrganizerId returns only conferences for that organizer', async () => {
    repo = new MockConferenceRepository();
    const conf1 = createTestConference('Conference 1', 'org-1');
    const conf2 = createTestConference('Conference 2', 'org-1');
    const conf3 = createTestConference('Conference 3', 'org-2');
    repo.add(conf1);
    repo.add(conf2);
    repo.add(conf3);

    const result = await repo.findByOrganizerId('org-1');
    expect(result).toHaveLength(2);
    expect(result.map(c => c.name.value)).toContain('Conference 1');
    expect(result.map(c => c.name.value)).toContain('Conference 2');
  });

  it('findByStatus returns conferences with matching status', async () => {
    repo = new MockConferenceRepository();
    const conf1 = createTestConference('Draft Conference', 'org-1');
    conf1.publishCfp(); // DRAFT → CFP_OPEN

    repo.add(conf1);

    const drafts = await repo.findByStatus(ConferenceStatus.DRAFT);
    expect(drafts).toHaveLength(0);

    const open = await repo.findByStatus(ConferenceStatus.CFP_OPEN);
    expect(open).toHaveLength(1);
  });

  it('save() adds a new conference', async () => {
    repo = new MockConferenceRepository();
    const conference = createTestConference('New Conference', 'org-1');

    await repo.save(conference);
    const result = await repo.findById(conference.id);
    expect(result).toBe(conference);
    expect(result!.name.value).toBe('New Conference');
  });

  it('save() updates an existing conference', async () => {
    repo = new MockConferenceRepository();
    const conference = createTestConference('Original Name', 'org-1');
    repo.add(conference);

    conference.publishCfp();

    await repo.save(conference);
    const result = await repo.findById(conference.id);
    expect(result!.status).toBe('CFP_OPEN');
  });

  it('delete() removes a conference by ID', async () => {
    repo = new MockConferenceRepository();
    const conference = createTestConference('To Delete', 'org-1');
    repo.add(conference);

    await repo.delete(conference.id);
    const result = await repo.findById(conference.id);
    expect(result).toBeNull();
  });
});
