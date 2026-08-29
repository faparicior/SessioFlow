import {
  DomainError,
  EntityNotFoundError,
  DomainConflictError,
  DomainForbiddenError,
  DomainInvariantError,
} from '@sessioflow/shared-domain/exceptions';

/**
 * Maps a domain error code or exception instance to its appropriate HTTP status code.
 */
export function mapErrorCodeToHttpStatus(errorCodeOrError: string | DomainError): number {
  if (typeof errorCodeOrError !== 'string') {
    const error = errorCodeOrError;
    if (error instanceof EntityNotFoundError) return 404;
    if (error instanceof DomainConflictError) return 409;
    if (error instanceof DomainForbiddenError) return 403;
    if (error instanceof DomainInvariantError) return 400;
    return mapErrorCodeToHttpStatus(error.code);
  }

  const code = errorCodeOrError;
  switch (code) {
    case 'UNAUTHORIZED':
    case 'AUTH_REQUIRED':
      return 401;
    case 'FORBIDDEN':
    case 'FREE_TIER_LIMIT':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'SLUG_EXISTS':
    case 'RESOURCE_CONFLICT':
      return 409;
    case 'VALIDATION_ERROR':
    case 'INVALID_INVARIANT':
    case 'CFP_DATES_INVALID':
    case 'NAME_TOO_SHORT':
    case 'NAME_TOO_LONG':
    case 'INVALID_CONFERENCE':
    case 'STATE_TRANSITION_INVALID':
    case 'SUBMISSION_DATE_IN_PAST':
    case 'CFP_START_DATE_NOT_IN_FUTURE':
    case 'INVALID_CONFERENCE_ID':
    case 'EMPTY_SLUG':
    case 'INVALID_CFP_START_DATE':
    case 'INVALID_CFP_END_DATE':
    case 'MAX_SUBMISSIONS_INVALID':
    case 'INVALID_CONFERENCE_STATUS':
      return 400;
    default:
      return 500;
  }
}

/**
 * Utility to format a DomainError into a standardized Web Response (JSON) object.
 */
export function mapDomainErrorToResponse(error: DomainError): Response {
  const status = mapErrorCodeToHttpStatus(error);
  const body = {
    error: {
      code: error.code,
      message: error.message,
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json'},
  });
}
