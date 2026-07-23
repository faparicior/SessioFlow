import {describe, it, expect} from 'vitest';
import {createConferenceController} from '@sessioflow/conference/interfaces/http/create-conference.controller';
import {CreateConferenceHandler} from '@sessioflow/conference/application/commands/create-conference/create-conference.handler';
import {Conference} from '@sessioflow/conference/domain/conference';
import {type ConferenceRepository} from '@sessioflow/conference/domain/conference-repository.interface';
import {ConferenceId} from '@sessioflow/conference/domain/value-objects/conference-id';
import {ConferenceSlug} from '@sessioflow/conference/domain/value-objects/conference-slug';
import {ConferenceStatus} from '@sessioflow/conference/domain/value-objects/conference-status';
import {createNextRequest} from '../../../backend/modules/conference/interfaces/api/v1/conferences/fixtures.js';

class InMemoryConferenceRepository implements ConferenceRepository {
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
}

describe('Create Conference Integration (Controller + Command Handler)', () => {
  it('connects HTTP controller to real command handler and validates response DTO schema', async () => {
    const repo = new InMemoryConferenceRepository();
    const commandHandler = new CreateConferenceHandler(repo);
    const mockGetAuthUser = async () => ({id: '12345678-1234-4123-8123-123456789012'});

    const request = createNextRequest('POST', '/api/v1/conferences', {
      name: 'Tech Conference 2026',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const response = await createConferenceController(
      request,
      commandHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(201);
    const body = await response.json();

    expect(body.data).toBeDefined();
    expect(body.data.name).toBe('Tech Conference 2026');
    expect(body.data.slug).toBe('tech-conference-2026');
    expect(body.data.cfpUrl).toBe('/cfp/tech-conference-2026');
    expect(body.data.status).toBe('CFP_OPEN');

    // Verify entity was actually persisted to repository
    const saved = await repo.findBySlug('tech-conference-2026');
    expect(saved).not.toBeNull();
    expect(saved!.name.value).toBe('Tech Conference 2026');
  });
});
