import {type NextRequest, NextResponse} from 'next/server';
import {conferenceContainer} from '@sessioflow/conference/container';

/**
 * GET /api/v1/conferences/:id
 *
 * Retrieves a conference by ID.
 * Delegates to getConferenceController in @sessioflow/conference.
 * Route safety net for truly unexpected errors only.
 */
export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const {id} = await params;
  const controller = conferenceContainer.getConferenceController();

  try {
    return await controller(request, id);
  } catch (error) {
    console.error('Route-level unhandled error:', error);
    return NextResponse.json(
      {error: {code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'}},
      {status: 500},
    );
  }
}
