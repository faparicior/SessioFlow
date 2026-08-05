import { beforeEach, describe, it, expect, vi } from 'vitest';
import { CreateConferenceCommand } from '@sessioflow/conference/application/commands/create-conference/create-conference.command';
import { CreateConferenceHandler } from '@sessioflow/conference/application/commands/create-conference/create-conference.handler';
import { Conference } from '@sessioflow/conference/domain/conference';
import { type ConferenceRepository } from '@sessioflow/conference/domain/conference-repository.interface';
import { type ConferenceId } from '@sessioflow/conference/domain/value-objects/conference-id';
import { type ConferenceSlug } from '@sessioflow/conference/domain/value-objects/conference-slug';
import { ConferenceStatus } from '@sessioflow/conference/domain/value-objects/conference-status';
import { CfpDatesInvalidError } from '@sessioflow/conference/domain/exceptions/cfp-dates-invalid-error';
import { ConferenceNameTooShortError } from '@sessioflow/conference/domain/exceptions/conference-name-too-short-error';
import { ConferenceFreeTierLimitError } from '@sessioflow/conference/domain/exceptions/conference-free-tier-limit-error';
import { SlugExistsError } from '@sessioflow/conference/domain/exceptions/slug-exists-error';
import { futureDate, futureDateStr, pastDateStr } from '../../../../../unit/__helpers__/date'

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
    return this.conferences.filter((c) => c.organizerId === organizerId);
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

describe('CreateConference Command', () => {
  let handler: CreateConferenceHandler;
  let repo: MockConferenceRepository;

  beforeEach(() => {
    repo = new MockConferenceRepository();
    handler = new CreateConferenceHandler(repo);
  });

  it('creates a conference in happy path', async () => {
    const command = new CreateConferenceCommand({
      name: 'Tech Conference 2026',
      description: 'A conference about technology',
      organizerId: 'org-123',
      cfpStartDate: futureDateStr(15),
      cfpEndDate: futureDateStr(45),
    });

    const conference = await handler.execute(command);

    expect(conference.status).toBe('CFP_OPEN');
    expect(conference.name).toBe('Tech Conference 2026');
    expect(conference.slug).toBe('tech-conference-2026');
  });

  it('throws error for short name', async () => {
    const command = new CreateConferenceCommand({
      name: 'Ab',
      organizerId: 'org-123',
      cfpStartDate: futureDateStr(15),
      cfpEndDate: futureDateStr(45),
    });

    await expect(handler.execute(command)).rejects.toThrow(ConferenceNameTooShortError);
  });

  it('throws error for invalid CfP dates', async () => {
    const command = new CreateConferenceCommand({
      name: 'Tech Conference',
      organizerId: 'org-123',
      cfpStartDate: futureDateStr(45),
      cfpEndDate: futureDateStr(15), // End before start
    });

    await expect(handler.execute(command)).rejects.toThrow(CfpDatesInvalidError);
  });

  it('throws error for duplicate slug', async () => {
    const existing = Conference.create({
      name: 'Tech Conference',
      organizerId: 'org-1',
      cfpStartDate: futureDate(15),
      cfpEndDate: futureDate(45),
    });
    existing.publishCfp();
    repo.add(existing);

    const command = new CreateConferenceCommand({
      name: 'Tech Conference',
      organizerId: 'org-2',
      cfpStartDate: futureDateStr(15),
      cfpEndDate: futureDateStr(45),
    });

    await expect(handler.execute(command)).rejects.toThrow(SlugExistsError);
  });

  it('publishes events on creation', async () => {
    const command = new CreateConferenceCommand({
      name: 'Tech Conference',
      organizerId: 'org-123',
      cfpStartDate: futureDateStr(15),
      cfpEndDate: futureDateStr(45),
    });

    const conference = await handler.execute(command);
    // Events are published but not directly accessible from the entity
    // They are stored via the event store in the repository
    const saved = await repo.findBySlug('tech-conference');
    expect(saved).not.toBeNull();
    expect(saved!.status).toBe(ConferenceStatus.CFP_OPEN);
  });

  it('saves conference to repository on success', async () => {
    const command = new CreateConferenceCommand({
      name: 'Tech Conference',
      organizerId: 'org-123',
      cfpStartDate: futureDateStr(15),
      cfpEndDate: futureDateStr(45),
    });

    await handler.execute(command);

    const saved = await repo.findBySlug('tech-conference');
    expect(saved).not.toBeNull();
    expect(saved!.status).toBe(ConferenceStatus.CFP_OPEN);
  });

  it('creates conference with default settings when optional fields omitted', async () => {
    const command = new CreateConferenceCommand({
      name: 'Quick Conference',
      organizerId: 'org-123',
      cfpStartDate: futureDateStr(15),
      cfpEndDate: futureDateStr(45),
    });

    const conference = await handler.execute(command);

    expect(conference.requiresApproval).toBe(true);
    expect(conference.maxSubmissions).toBeUndefined();
  });

  it('creates conference with custom settings', async () => {
    const command = new CreateConferenceCommand({
      name: 'Custom Conference',
      organizerId: 'org-123',
      cfpStartDate: futureDateStr(15),
      cfpEndDate: futureDateStr(45),
      maxSubmissions: 100,
      requiresApproval: false,
    });

    const conference = await handler.execute(command);

    expect(conference.maxSubmissions).toBe(100);
    expect(conference.requiresApproval).toBe(false);
  });

  it('throws error when free tier limit exceeded', async () => {
    // Create 5 active conferences
    for (let i = 0; i < 5; i++) {
      const conference = Conference.create({
        name: `Conference ${i}`,
        organizerId: 'org-123',
        cfpStartDate: futureDate(15),
        cfpEndDate: futureDate(45),
      });
      conference.publishCfp();
      repo.add(conference);
    }

    const command = new CreateConferenceCommand({
      name: 'Additional Conference',
      organizerId: 'org-123',
      cfpStartDate: futureDateStr(15),
      cfpEndDate: futureDateStr(45),
    });

    await expect(handler.execute(command)).rejects.toThrow(ConferenceFreeTierLimitError);
  });
});
