import {ConferenceCreateSchema} from '@sessioflow/api-definitions/zod/conference';
import {DomainError} from '@sessioflow/shared-domain/exceptions';
import {mapDomainErrorToResponse} from '@sessioflow/shared-http/error-mapper';
import {CreateConferenceCommand} from '../../application/commands/create-conference/create-conference.command.js';
import type {CreateConferenceCommandHandler} from '../../application/commands/create-conference/create-conference.handler.js';
import {invalidBodyResponse, jsonResponse, unauthorizedResponse} from './json-response.js';

/** Authenticated principal injected by the composition root (ADR-004-01). */
export type GetAuthUser = () => Promise<{id: string} | undefined>;

/**
 * POST /api/v1/conferences
 *
 * Thin HTTP adapter (ADR-016-01): validates the body with the shared
 * `ConferenceCreateSchema` (ADR-007/020), resolves the organizer from the
 * auth port, wraps the primitives in a `CreateConferenceCommand`, and lets the
 * CQRS handler own every business rule. Domain invariants propagate and are
 * translated with the shared error mapper; unexpected errors are rethrown so
 * the route safety net can log and answer 500.
 */
export async function createConferenceController(
  request: Request,
  handler: CreateConferenceCommandHandler,
  getAuthUser: GetAuthUser,
): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalidBodyResponse('Request body must be valid JSON');
  }

  const parsed = ConferenceCreateSchema.safeParse(payload);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return invalidBodyResponse(issue?.message ?? 'Invalid request body');
  }

  const user = await getAuthUser();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const command = new CreateConferenceCommand({
      ...parsed.data,
      organizerId: user.id,
    });
    const conference = await handler.execute(command);
    return jsonResponse({data: conference}, 201);
  } catch (error) {
    if (error instanceof DomainError) {
      return mapDomainErrorToResponse(error);
    }
    throw error;
  }
}
