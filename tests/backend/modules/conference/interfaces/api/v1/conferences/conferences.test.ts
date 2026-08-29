// @vitest-environment node
import {describe, expect, it, type Mock, vi} from 'vitest';
import {ConferenceCreateSchema} from '@sessioflow/api-definitions/zod/conference';
import type {CreateConferenceCommandHandler} from '@sessioflow/conference/application/commands/create-conference/create-conference.handler';
import {CreateConferenceResponse} from '@sessioflow/conference/application/commands/create-conference/create-conference.response';
import type {GetConferenceQueryHandler} from '@sessioflow/conference/application/queries/get-conference/get-conference.handler';
import {createConferenceController} from '@sessioflow/conference/interfaces/http/create-conference.controller';
import {getConferenceController} from '@sessioflow/conference/interfaces/http/get-conference.controller';
import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';
import {CfpDatesInvalidError} from '@sessioflow/conference/domain/exceptions/cfp-dates-invalid-error';
import {CfpStartDateNotInFutureError} from '@sessioflow/conference/domain/exceptions/cfp-start-date-not-in-future-error';
import {ConferenceFreeTierLimitError} from '@sessioflow/conference/domain/exceptions/conference-free-tier-limit-error';
import {ConferenceNameTooShortError} from '@sessioflow/conference/domain/exceptions/conference-name-too-short-error';
import {ConferenceNotFoundError} from '@sessioflow/conference/domain/exceptions/conference-not-found-error';
import {SlugExistsError} from '@sessioflow/conference/domain/exceptions/slug-exists-error';
import {MaxSubmissionsInvalidError} from '@sessioflow/conference/domain/exceptions/max-submissions-invalid-error';

const AUTH_USER = {id: 'mock-user-id'};
const AUTHENTICATED = async () => AUTH_USER;
const ANONYMOUS = async () => undefined;

const CONFERENCE_ID = '6f1a2c34-5678-4abc-9def-0123456789ab';

/** Valid request body accepted by the shared boundary schema. */
const validBody = {
  name: 'Tech Conference 2026',
  description: 'A conference about technology',
  cfpStartDate: '2026-08-17',
  cfpEndDate: '2026-09-30',
  maxSubmissions: 100,
  requiresApproval: true,
};

/** Builds the Web Standard Request the controllers receive from a route. */
const jsonRequest = (
  body: unknown,
  url = 'http://localhost/api/v1/conferences',
  method = 'POST',
): Request =>
  new Request(url, {
    method,
    headers: {'Content-Type': 'application/json'},
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

/** Minimal handler double satisfying the controller's `import type` contract. */
const mockHandler = (execute: Mock) => ({execute}) as unknown as CreateConferenceCommandHandler;
const mockQueryHandler = (execute: Mock) => ({execute}) as unknown as GetConferenceQueryHandler;

/** Parses a JSON Response body. */
const readBody = async (response: Response): Promise<Record<string, any>> =>
  (await response.json()) as Record<string, any>;

/**
 * Reference response produced by the real response DTO, so the interface
 * tests assert the actual public `ConferenceApiResponse` shape (ADR-020/022).
 */
const responsePayload = () => ({
  id: CONFERENCE_ID,
  name: 'Tech Conference 2026',
  description: 'A conference about technology',
  slug: 'tech-conference-2026',
  status: 'CFP_OPEN',
  organizerId: 'mock-user-id',
  cfp: {
    isOpen: true,
    startDate: '2026-08-17T00:00:00.000Z',
    endDate: '2026-09-30T23:59:59.000Z',
    maxSubmissions: 100,
    requiresApproval: true,
  },
  createdAt: '2026-07-28T00:00:00.000Z',
  updatedAt: '2026-07-28T00:00:00.000Z',
});

const buildResponse = () =>
  ({
    ...responsePayload(),
    toJSON: () => responsePayload(),
  }) as unknown as CreateConferenceResponse;

describe('createConferenceController (POST /api/v1/conferences)', () => {
  it('returns 201 with the { data } conference payload', async () => {
    const execute = vi.fn().mockResolvedValue(buildResponse());

    const response = await createConferenceController(
      jsonRequest(validBody),
      mockHandler(execute),
      AUTHENTICATED,
    );

    expect(response.status).toBe(201);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const body = await readBody(response);
    expect(Object.keys(body)).toEqual(['data']);
    expect(body.data).toMatchObject({
      id: CONFERENCE_ID,
      slug: 'tech-conference-2026',
      status: 'CFP_OPEN',
      cfp: {isOpen: true, maxSubmissions: 100},
    });
  });

  it('dispatches a CreateConferenceCommand with the validated body + authenticated organizer', async () => {
    const execute = vi.fn().mockResolvedValue(buildResponse());

    await createConferenceController(jsonRequest(validBody), mockHandler(execute), AUTHENTICATED);

    expect(execute).toHaveBeenCalledTimes(1);
    const command = execute.mock.calls[0][0];
    expect(command.constructor.name).toBe('CreateConferenceCommand');
    expect(command.input).toEqual({...validBody, organizerId: 'mock-user-id'});
  });

  it('applies shared schema defaults (empty description, approval required)', async () => {
    const execute = vi.fn().mockResolvedValue(buildResponse());
    const body = {
      name: 'Minimal Setup Conf',
      cfpStartDate: '2026-08-17',
      cfpEndDate: '2026-09-30',
    };

    await createConferenceController(jsonRequest(body), mockHandler(execute), AUTHENTICATED);

    expect(execute.mock.calls[0][0].input).toMatchObject({
      description: '',
      requiresApproval: true,
      organizerId: 'mock-user-id',
    });
    // The body is validated with the shared contract before the command.
    expect(ConferenceCreateSchema.parse(body).description).toBe('');
  });

  it('returns 400 VALIDATION_ERROR with the first Zod issue for an invalid body', async () => {
    const execute = vi.fn();

    const response = await createConferenceController(
      jsonRequest({...validBody, name: 'ab'}),
      mockHandler(execute),
      AUTHENTICATED,
    );

    expect(response.status).toBe(400);
    const body = await readBody(response);
    expect(body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Name must be at least 3 characters',
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns 400 when the CfP end date is not after the start date (shared refine)', async () => {
    const execute = vi.fn();

    const response = await createConferenceController(
      jsonRequest({
        ...validBody,
        cfpStartDate: '2026-09-30',
        cfpEndDate: '2026-08-17',
      }),
      mockHandler(execute),
      AUTHENTICATED,
    );

    expect(response.status).toBe(400);
    const body = await readBody(response);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toMatch(/end date must be after start date/i);
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns 400 VALIDATION_ERROR for a malformed JSON body', async () => {
    const execute = vi.fn();

    const response = await createConferenceController(
      jsonRequest('{not json'),
      mockHandler(execute),
      AUTHENTICATED,
    );

    expect(response.status).toBe(400);
    expect((await readBody(response)).error.code).toBe('VALIDATION_ERROR');
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns 401 UNAUTHORIZED when there is no authenticated user', async () => {
    const execute = vi.fn();

    const response = await createConferenceController(
      jsonRequest(validBody),
      mockHandler(execute),
      ANONYMOUS,
    );

    expect(response.status).toBe(401);
    expect(await readBody(response)).toEqual({
      error: {code: 'UNAUTHORIZED', message: 'Authentication required'},
    });
    expect(execute).not.toHaveBeenCalled();
  });

  const cases: Array<{
    name: string;
    error: Error;
    status: number;
    code: string;
    message: string;
  }> = [
    {
      name: 'duplicate slug (BR-003)',
      error: new SlugExistsError(),
      status: 409,
      code: 'SLUG_EXISTS',
      message: 'Conference slug already exists',
    },
    {
      name: 'free tier limit (BR-004)',
      error: new ConferenceFreeTierLimitError(),
      status: 403,
      code: 'FREE_TIER_LIMIT',
      message: 'Free tier limit reached. Please upgrade your plan.',
    },
    {
      name: 'past CfP start date',
      error: new CfpStartDateNotInFutureError(),
      status: 400,
      code: 'CFP_START_DATE_NOT_IN_FUTURE',
      message: 'CfpStartDate must be in the future or today',
    },
    {
      name: 'inverted CfP dates',
      error: new CfpDatesInvalidError(),
      status: 400,
      code: 'CFP_DATES_INVALID',
      message: 'End date must be after start date',
    },
    {
      name: 'name too short',
      error: new ConferenceNameTooShortError(),
      status: 400,
      code: 'NAME_TOO_SHORT',
      message: 'Conference name must be at least 3 characters',
    },
    {
      name: 'invalid max submissions',
      error: new MaxSubmissionsInvalidError(),
      status: 400,
      code: 'MAX_SUBMISSIONS_INVALID',
      message: 'Max submissions must be a positive integer',
    },
  ];

  for (const {name, error, status, code, message} of cases) {
    it(`maps the ${name} domain error to ${status} { error: { code, message } }`, async () => {
      const execute = vi.fn().mockRejectedValue(error);

      const response = await createConferenceController(
        jsonRequest(validBody),
        mockHandler(execute),
        AUTHENTICATED,
      );

      expect(response.status).toBe(status);
      expect(await readBody(response)).toEqual({error: {code, message}});
    });
  }

  it('rethrows unexpected errors for the route safety net', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('database unavailable'));

    await expect(
      createConferenceController(jsonRequest(validBody), mockHandler(execute), AUTHENTICATED),
    ).rejects.toThrow('database unavailable');
  });
});

describe('getConferenceController (GET /api/v1/conferences/{id})', () => {
  // GET requests carry no body (Web Standard restriction).
  const getRequest = (id: string = CONFERENCE_ID): Request =>
    new Request(`http://localhost/api/v1/conferences/${encodeURIComponent(id)}`, {
      method: 'GET',
    });

  it('returns 200 with the { data } conference payload', async () => {
    const execute = vi.fn().mockResolvedValue(buildResponse());

    const response = await getConferenceController(
      getRequest(),
      mockQueryHandler(execute),
      AUTHENTICATED,
      CONFERENCE_ID,
    );

    expect(response.status).toBe(200);
    const body = await readBody(response);
    expect(Object.keys(body)).toEqual(['data']);
    expect(body.data).toMatchObject({
      id: CONFERENCE_ID,
      slug: 'tech-conference-2026',
      cfp: {isOpen: true, startDate: '2026-08-17T00:00:00.000Z'},
    });
  });

  it('dispatches a GetConferenceQuery with the requested id', async () => {
    const execute = vi.fn().mockResolvedValue(buildResponse());

    await getConferenceController(
      getRequest(),
      mockQueryHandler(execute),
      AUTHENTICATED,
      CONFERENCE_ID,
    );

    const query = execute.mock.calls[0][0];
    expect(query.constructor.name).toBe('GetConferenceQuery');
    expect(query.input).toEqual({conferenceId: CONFERENCE_ID});
  });

  it('returns 404 NOT_FOUND when the conference does not exist', async () => {
    const execute = vi.fn().mockRejectedValue(new ConferenceNotFoundError(CONFERENCE_ID));

    const response = await getConferenceController(
      getRequest(),
      mockQueryHandler(execute),
      AUTHENTICATED,
      CONFERENCE_ID,
    );

    expect(response.status).toBe(404);
    expect(await readBody(response)).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: `Conference with ID "${CONFERENCE_ID}" was not found.`,
      },
    });
  });

  it('returns 400 INVALID_CONFERENCE_ID for a malformed id (handled by the query handler)', async () => {
    // The controller cannot touch domain VOs (DDD boundary): format validation
    // lives in the handler, which throws a DomainInvariantError the mapper
    // translates to 400.
    const execute = vi
      .fn()
      .mockRejectedValue(
        new DomainInvariantError(
          'INVALID_CONFERENCE_ID',
          'ConferenceId "nope" must be a valid UUID',
        ),
      );

    const response = await getConferenceController(
      getRequest('nope'),
      mockQueryHandler(execute),
      AUTHENTICATED,
      'nope',
    );

    expect(response.status).toBe(400);
    expect((await readBody(response)).error.code).toBe('INVALID_CONFERENCE_ID');
  });

  it('returns 401 UNAUTHORIZED when there is no authenticated user', async () => {
    const execute = vi.fn();

    const response = await getConferenceController(
      getRequest(),
      mockQueryHandler(execute),
      ANONYMOUS,
      CONFERENCE_ID,
    );

    expect(response.status).toBe(401);
    expect(await readBody(response)).toEqual({
      error: {code: 'UNAUTHORIZED', message: 'Authentication required'},
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it('rethrows unexpected errors for the route safety net', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('connection lost'));

    await expect(
      getConferenceController(
        getRequest(),
        mockQueryHandler(execute),
        AUTHENTICATED,
        CONFERENCE_ID,
      ),
    ).rejects.toThrow('connection lost');
  });
});
