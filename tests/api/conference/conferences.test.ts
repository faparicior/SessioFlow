import {describe, it, expect, vi} from 'vitest';
import {createNextRequest} from './fixtures';
import {handleConferenceCreate} from '@/modules/conference/interfaces/api/v1/conferences/create';
import {handleGetConference} from '@/modules/conference/interfaces/api/v1/conferences/get';
import type {ConferenceResponseDto} from '@/modules/conference/application/dto/conference-response.dto';
import type {CreateConferenceCommand} from '@/modules/conference/application/commands/create-conference/create-conference.command';
import type {CreateConferenceResult, CreateConferenceHandler} from '@/modules/conference/application/commands/create-conference/create-conference.handler';
import type {Conference} from '@/modules/conference/domain/entities/conference';
import type {EmailProvider} from '@/modules/conference/application/commands/create-conference/create-conference.handler';
import type {GetConferenceHandler} from '@/modules/conference/application/queries/get-conference/get-conference.handler';

// Mock CQRS handlers
type MockCreateConferenceHandler = {
  repository: {
    findBySlug(slug: {value: string}): Promise<Conference | undefined>;
    save(conference: Conference): Promise<void>;
    findByStatus(status: any): Promise<Conference[]>;
    findByOrganizerId(organizerId: string): Promise<Conference[]>;
  };
  emailProvider: EmailProvider;
  execute(command: CreateConferenceCommand): Promise<CreateConferenceResult>;
};

const mockCreateConferenceHandler: MockCreateConferenceHandler = {
  repository: {
    findBySlug: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    findByStatus: vi.fn().mockResolvedValue([]),
    findByOrganizerId: vi.fn().mockResolvedValue([]),
  },
  emailProvider: vi.fn(),
  execute: vi.fn(),
};

type MockGetConferenceHandler = {
  repository: {
    findById(id: {value: string}): Promise<Conference | undefined>;
    findBySlug(slug: {value: string}): Promise<Conference | undefined>;
    findByStatus(status: any): Promise<Conference[]>;
    findByOrganizerId(organizerId: string): Promise<Conference[]>;
    save(conference: Conference): Promise<void>;
    delete(id: {value: string}): Promise<void>;
  };
  execute(id: string): Promise<any>;
};

const mockGetConferenceHandler: MockGetConferenceHandler = {
  repository: {
    findById: vi.fn().mockResolvedValue(undefined),
    findBySlug: vi.fn().mockResolvedValue(undefined),
    findByStatus: vi.fn().mockResolvedValue([]),
    findByOrganizerId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  execute: vi.fn(),
};

// Mock auth provider - returns authenticated user by default
const mockGetAuthUser = vi.fn().mockResolvedValue({id: 'test-user-id'});

describe('Conference API - POST /api/v1/conferences', () => {
  it('creates a conference and returns 201', async () => {
    const mockData: ConferenceResponseDto = {
      id: 'test-id',
      name: 'Tech Conference',
      slug: 'tech-conference',
      status: 'CFP_OPEN',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
      cfpStatus: 'ACTIVE',
      maxSubmissions: null,
      requiresApproval: true,
      cfpUrl: 'https://sessioflow.app/cfp/tech-conference',
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCreateConferenceHandler.execute.mockResolvedValue({
      success: true,
      data: mockData,
    });

    const request = createNextRequest('POST', '/api/v1/conferences', {
      name: 'Tech Conference',
      organizerId: '12345678-1234-4123-8123-123456789012',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const response = await handleConferenceCreate(
      request,
      mockCreateConferenceHandler as unknown as CreateConferenceHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.name).toBe('Tech Conference');
    expect(body.data.status).toBe('CFP_OPEN');
  });

  it('returns 400 for validation errors (Zod)', async () => {
    const request = createNextRequest('POST', '/api/v1/conferences', {
      name: 'Ab', // Too short - will fail Zod validation
      organizerId: '12345678-1234-4123-8123-123456789012',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const response = await handleConferenceCreate(
      request,
      mockCreateConferenceHandler as unknown as CreateConferenceHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details.properties.name.errors).toHaveLength(1);
    expect(body.error.details.properties.name.errors[0]).toContain('at least 3 characters');
  });

  it('returns 409 for duplicate slug', async () => {
    mockCreateConferenceHandler.execute.mockResolvedValue({
      success: false,
      errors: [
        {
          code: 'SLUG_EXISTS',
          message: 'A conference with this name already exists',
        },
      ],
    });

    const request = createNextRequest('POST', '/api/v1/conferences', {
      name: 'Existing Conference',
      organizerId: '12345678-1234-4123-8123-123456789012',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const response = await handleConferenceCreate(
      request,
      mockCreateConferenceHandler as unknown as CreateConferenceHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(409);
  });

  it('returns 401 when not authenticated', async () => {
    const unauthenticatedGetAuthUser = vi.fn().mockResolvedValue(null);

    const request = createNextRequest('POST', '/api/v1/conferences', {
      name: 'Test Conference',
      organizerId: '12345678-1234-4123-8123-123456789012',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const response = await handleConferenceCreate(
      request,
      mockCreateConferenceHandler as unknown as CreateConferenceHandler,
      unauthenticatedGetAuthUser,
    );

    expect(response.status).toBe(401);
  });
});

describe('Conference API - GET /api/v1/conferences/:id', () => {
  it('returns conference data', async () => {
    const mockData: ConferenceResponseDto = {
      id: 'test-id',
      name: 'Tech Conference',
      slug: 'tech-conference',
      status: 'CFP_OPEN',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
      cfpStatus: 'ACTIVE',
      maxSubmissions: null,
      requiresApproval: true,
      cfpUrl: 'https://sessioflow.app/cfp/tech-conference',
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockGetConferenceHandler.execute.mockResolvedValue({
      success: true,
      data: mockData,
    });

    const validUuid = '12345678-1234-4123-8123-123456789012';
    const request = createNextRequest(
      'GET',
      `/api/v1/conferences/${validUuid}`,
    );

    const response = await handleGetConference(
      request,
      validUuid,
      mockGetConferenceHandler as unknown as GetConferenceHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe('Tech Conference');
  });

  it('returns 404 when conference not found', async () => {
    mockGetConferenceHandler.execute.mockResolvedValue({
      success: true,
      data: null,
    });

    const request = createNextRequest(
      'GET',
      '/api/v1/conferences/12345678-1234-4123-8123-123456789012',
    );

    const response = await handleGetConference(
      request,
      '12345678-1234-4123-8123-123456789012',
      mockGetConferenceHandler as unknown as GetConferenceHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(404);
  });
});
