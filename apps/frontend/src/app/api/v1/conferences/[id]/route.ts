import {type NextRequest} from 'next/server';
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
  const controller = conferenceContainer.getConferenceController();
  return controller(request, id);
}

