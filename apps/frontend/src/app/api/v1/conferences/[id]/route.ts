import {conferenceContainer} from '@sessioflow/conference/container';
import {internalErrorResponse} from '../../../../../lib/api-error';

/**
 * GET /api/v1/conferences/{id}
 *
 * Thin delegate: the controller is resolved from the module composition root
 * (ADR-016-01); the App Router owns URL parsing and hands the raw `id` over.
 */
const getConference = conferenceContainer.createGetConferenceController();

export async function GET(
  request: Request,
  context: {params: Promise<{id: string}>},
): Promise<Response> {
  const {id} = await context.params;

  try {
    return await getConference(request, id);
  } catch (error) {
    return internalErrorResponse('GET /api/v1/conferences/{id}', error);
  }
}
