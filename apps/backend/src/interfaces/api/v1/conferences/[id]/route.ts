import {type NextRequest} from 'next/server';
import {getConferenceController} from '@sessioflow/conference/interfaces/http/get-conference.controller';
import {conferenceContainer} from '@sessioflow/conference/container';

/**
 * GET /api/v1/conferences/:id
 *
 * Retrieves a conference by ID.
 * Delegates to getConferenceController in @sessioflow/conference.
 */
export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const {id} = await params;
  const handler = conferenceContainer.getConferenceHandler();
  const getAuthUser = async () => ({id: 'mock-user-id'});

  return getConferenceController(request, id, handler, getAuthUser);
}
