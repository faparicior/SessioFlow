import { NextResponse, type NextRequest } from 'next/server';
import type { GetConferenceHandler } from '@/modules/conference/application/queries/get-conference/get-conference.handler';

/**
 * GET /api/v1/conferences/:id
 *
 * Retrieves a conference by ID.
 * Delegates to GetConference CQRS query handler.
 */
export async function handleGetConference(
  request: NextRequest,
  conferenceId: string,
  getConferenceHandler: GetConferenceHandler,
  getAuthUser: () => Promise<{ id: string } | undefined>,
): Promise<Response> {
  try {
    // 1. Authenticate user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    // 2. Execute CQRS query — handler validates the ID
    const result = await getConferenceHandler.execute(conferenceId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: result.errors![0].code,
            message: result.errors![0].message,
          },
        },
        { status: 400 },
      );
    }

    // 3. Return response
    if (!result.data) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Conference not found' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    console.error('Conference retrieval error:', error);
    return NextResponse.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      },
      { status: 500 },
    );
  }
}
