import {describe, it, expect, vi} from 'vitest';
import {z} from 'zod';
import {createNextRequest} from './fixtures';
import {handleConferenceCreate} from '@backend/modules/conference/interfaces/v1/conferences/create';
import {handleGetConference} from '@backend/modules/conference/interfaces/v1/conferences/get';
import type {ConferenceResponseDto} from '@backend/modules/conference/application/dto/conference-response.dto';
import {CreateConferenceHandler} from '@backend/modules/conference/application/commands/create-conference/create-conference.handler';
import {GetConferenceHandler} from '@backend/modules/conference/application/queries/get-conference/get-conference.handler';

// Zod schemas for testing responses type-safely without type assertions
const successResponseSchema = z.object({
  data: z.object({
    name: z.string(),
    status: z.string(),
  }),
});

const validationErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    details: z.object({
      properties: z.object({
        cfpStartDate: z.object({
          errors: z.array(z.string()),
        }),
      }),
    }),
  }),
});

const mockRepository = {
  findBySlug: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
  findByStatus: vi.fn().mockResolvedValue([]),
  findByOrganizerId: vi.fn().mockResolvedValue([]),
};

const mockCreateConferenceHandler = new CreateConferenceHandler(
  mockRepository,
  vi.fn(),
);

const mockGetConferenceRepository = {
  findById: vi.fn().mockResolvedValue(undefined),
  findBySlug: vi.fn().mockResolvedValue(undefined),
  findByStatus: vi.fn().mockResolvedValue([]),
  findByOrganizerId: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
};

const mockGetConferenceHandler = new GetConferenceHandler(mockGetConferenceRepository);

// Mock auth provider - returns authenticated user by default
const mockGetAuthUser = vi.fn().mockResolvedValue({id: 'test-user-id'});

describe('Conference API - POST /api/v1/conferences', () => {
  it('creates a conference and returns 201', async () => {
    const mockData: ConferenceResponseDto = {
      id: '12345678-1234-4123-8123-123456789012',
      name: 'Tech Conference',
      slug: 'tech-conference',
      status: 'CFP_OPEN',
      cfpStartDate: '2026-08-01T00:00:00.000Z',
      cfpEndDate: '2026-09-30T00:00:00.000Z',
      cfpStatus: 'ACTIVE',
      maxSubmissions: undefined,
      requiresApproval: true,
      cfpUrl: 'https://sessioflow.app/cfp/tech-conference',
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(mockCreateConferenceHandler, 'execute').mockResolvedValue({
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
      mockCreateConferenceHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    const parsed = successResponseSchema.parse(body);
    expect(parsed.data.name).toBe('Tech Conference');
    expect(parsed.data.status).toBe('CFP_OPEN');
  });

  it('returns 400 for validation errors (Zod)', async () => {
    const request = createNextRequest('POST', '/api/v1/conferences', {
      name: 'Tech Conference',
      organizerId: '12345678-1234-4123-8123-123456789012',
      cfpStartDate: 'invalid-date', // Fails Zod validation
      cfpEndDate: '2026-09-30',
    });

    const response = await handleConferenceCreate(
      request,
      mockCreateConferenceHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    const parsed = validationErrorResponseSchema.parse(body);
    expect(parsed.error.code).toBe('VALIDATION_ERROR');
    expect(parsed.error.details.properties.cfpStartDate.errors).toHaveLength(1);
    expect(parsed.error.details.properties.cfpStartDate.errors[0]).toContain('valid date');
  });

  it('returns 400 for validation errors (domain)', async () => {
    vi.spyOn(mockCreateConferenceHandler, 'execute').mockResolvedValue({
      success: false,
      errors: [
        {
          code: 'NAME_TOO_SHORT',
          message: 'ConferenceName must be at least 3 characters',
        },
      ],
    });

    const request = createNextRequest('POST', '/api/v1/conferences', {
      name: 'Ab', // Too short - will fail domain validation
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
    expect(body).toEqual({
      error: {
        code: 'NAME_TOO_SHORT',
        message: expect.stringContaining('at least 3 characters'),
      },
    });
  });

  it('returns 409 for duplicate slug', async () => {
    vi.spyOn(mockCreateConferenceHandler, 'execute').mockResolvedValue({
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
    const mockData: ConferenceResponseDto = {
      id: '12345678-1234-4123-8123-123456789012',
      name: 'Tech Conference',
      slug: 'tech-conference',
      status: 'CFP_OPEN',
      cfpStartDate: '2026-08-01T00:00:00.000Z',
      cfpEndDate: '2026-09-30T00:00:00.000Z',
      cfpStatus: 'ACTIVE',
      maxSubmissions: undefined,
      requiresApproval: true,
      cfpUrl: 'https://sessioflow.app/cfp/tech-conference',
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(mockGetConferenceHandler, 'execute').mockResolvedValue({
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
      mockGetConferenceHandler,
      mockGetAuthUser,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    const parsed = successResponseSchema.parse(body);
    expect(parsed.data.name).toBe('Tech Conference');
  });

  it('returns 404 when conference not found', async () => {
    vi.spyOn(mockGetConferenceHandler, 'execute').mockResolvedValue({
      success: true,
      data: undefined,
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
