import {conferenceContainer} from '@sessioflow/conference/container';
import {internalErrorResponse} from '../../../../lib/api-error';

/**
 * POST /api/v1/conferences
 *
 * Thin delegate: the controller is resolved from the module composition root
 * (ADR-016-01), so this file never touches Zod, domain or infrastructure.
 */
const createConference = conferenceContainer.createCreateConferenceController();

export async function POST(request: Request): Promise<Response> {
  try {
    return await createConference(request);
  } catch (error) {
    return internalErrorResponse('POST /api/v1/conferences', error);
  }
}
