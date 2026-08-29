import {describe, it, expect} from 'vitest';
import {
  DomainError,
  DomainInvariantError,
  EntityNotFoundError,
  DomainConflictError,
  DomainForbiddenError,
} from '@sessioflow/shared-domain/exceptions';
import {mapErrorCodeToHttpStatus, mapDomainErrorToResponse} from '@sessioflow/shared-http';

describe('Shared Domain Errors & HTTP Error Mapper', () => {
  it('DomainError hierarchy properly sets code and message', () => {
    class CustomError extends DomainError {
      constructor() {
        super('CUSTOM_CODE', 'Custom message');
      }
    }

    const error = new CustomError();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('CUSTOM_CODE');
    expect(error.message).toBe('Custom message');
  });

  it('Standard domain categories set expected defaults and inherit from DomainError', () => {
    const invariantErr = new DomainInvariantError('INVALID_CFP', 'Invalid CfP');
    const notFoundErr = new EntityNotFoundError('CONF_NOT_FOUND', 'Conference not found');
    const conflictErr = new DomainConflictError('SLUG_TAKEN', 'Slug taken');
    const forbiddenErr = new DomainForbiddenError('TIER_LIMIT', 'Limit reached');

    expect(invariantErr).toBeInstanceOf(DomainError);
    expect(notFoundErr).toBeInstanceOf(DomainError);
    expect(conflictErr).toBeInstanceOf(DomainError);
    expect(forbiddenErr).toBeInstanceOf(DomainError);
  });

  it('mapErrorCodeToHttpStatus resolves status codes based on error instance or code string', () => {
    expect(mapErrorCodeToHttpStatus(new EntityNotFoundError('NOT_FOUND', 'Not found'))).toBe(404);
    expect(mapErrorCodeToHttpStatus(new DomainConflictError('SLUG_EXISTS', 'Slug exists'))).toBe(
      409,
    );
    expect(mapErrorCodeToHttpStatus(new DomainForbiddenError('FREE_TIER_LIMIT', 'Limit'))).toBe(
      403,
    );
    expect(
      mapErrorCodeToHttpStatus(new DomainInvariantError('CFP_DATES_INVALID', 'Invalid dates')),
    ).toBe(400);

    expect(mapErrorCodeToHttpStatus('UNAUTHORIZED')).toBe(401);
    expect(mapErrorCodeToHttpStatus('NOT_FOUND')).toBe(404);
    expect(mapErrorCodeToHttpStatus('SLUG_EXISTS')).toBe(409);
    expect(mapErrorCodeToHttpStatus('FREE_TIER_LIMIT')).toBe(403);
    expect(mapErrorCodeToHttpStatus('CFP_DATES_INVALID')).toBe(400);
    expect(mapErrorCodeToHttpStatus('UNKNOWN_RANDOM_CODE')).toBe(500);
  });

  it('mapDomainErrorToResponse formats standardized HTTP response envelope', async () => {
    const error = new EntityNotFoundError('CONFERENCE_NOT_FOUND', 'Conference missing');
    const response = mapDomainErrorToResponse(error);

    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const json = await response.json();
    expect(json).toEqual({
      error: {
        code: 'CONFERENCE_NOT_FOUND',
        message: 'Conference missing',
      },
    });
  });
});
