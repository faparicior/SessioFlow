import {DomainError} from '@sessioflow/shared-domain/exceptions';
import {mapDomainErrorToResponse} from '@sessioflow/shared-http/error-mapper';
import {GetConferenceQuery} from '../../application/queries/get-conference/get-conference.query.js';
import type {GetConferenceQueryHandler} from '../../application/queries/get-conference/get-conference.handler.js';
import {jsonResponse, unauthorizedResponse} from './json-response.js';
import type {GetAuthUser} from './create-conference.controller.js';

/**
 * GET /api/v1/conferences/{id}
 *
 * Read-side HTTP adapter (CQRS query path). The `conferenceId` arrives as a
 * route parameter (the framework layer owns URL parsing); id format is
 * validated by the query handler, which throws `DomainInvariantError`
 * (`400 INVALID_CONFERENCE_ID`), while an unknown id throws
 * `ConferenceNotFoundError` (`404 NOT_FOUND`) — both mapped by the shared
 * error mapper. Controllers never import domain value objects (DDD boundary).
 */
export async function getConferenceController(
  request: Request,
  handler: GetConferenceQueryHandler,
  getAuthUser: GetAuthUser,
  conferenceId: string,
): Promise<Response> {
  const user = await getAuthUser();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const query = new GetConferenceQuery({conferenceId});
    const conference = await handler.execute(query);
    return jsonResponse({data: conference}, 200);
  } catch (error) {
    if (error instanceof DomainError) {
      return mapDomainErrorToResponse(error);
    }
    throw error;
  }
}
