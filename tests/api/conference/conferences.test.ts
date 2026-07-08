import {describe, it, expect, vi} from 'vitest';
import {createNextRequest} from './fixtures';
import {handleConferenceCreate} from '@/modules/conference/interfaces/api/v1/conferences/create';
import {handleGetConference} from '@/modules/conference/interfaces/api/v1/conferences/get';
import {ConferenceResponseDto} from '@/modules/conference/application/dto/conference-response.dto';

// Mock CQRS handlers
const mockCreateConferenceHandler = {
  repository: {
    findBySlug: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    findByStatus: vi.fn().mockResolvedValue([]),
    findByOrganizerId: vi.fn().mockResolvedValue([]),
  },
  emailProvider: vi.fn(),
  execute: vi.fn(),
};
const mockGetConferenceHandler = {
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
    mockCreateConferenceHandler.execute.mockResolvedValue({
      success: true,
      data: {
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
      },
    });

    const request = createNextRequest('POST', '/api/v1/conferences', {
      name: 'Tech Conference',
      organizerId: '12345678-1234-4123-8123-123456789012',
      cfpStartDate: '2026-08-01',
      cfpEndDate: '2026-09-30',
    });

    const response = await handleConferenceCreate(
      request,
      mockCreateConferenceHandler,
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
      mockCreateConferenceHandler,
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
      mockCreateConferenceHandler,
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
      mockCreateConferenceHandler,
      unauthenticatedGetAuthUser,
    );

    expect(response.status).toBe(401);
  });
});

describe('Conference API - GET /api/v1/conferences/:id', () => {
  it('returns conference data', async () => {
    mockGetConferenceHandler.execute.mockResolvedValue({
      success: true,
      data: {
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
      },
    });

    const validUuid = '12345678-1234-4123-8123-123456789012';
    const request = createNextRequest(
      'GET',
      `/api/v1/conferences/${validUuid}`,
    );

    const response = await handleGetConference(
      request,
      validUuid,
      mockGetConferenceHandler,
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
      mockGetConferenceHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(404);
  });
});
