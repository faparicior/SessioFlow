import {type NextRequest, NextResponse} from 'next/server';
import {makeGetConferenceHandler} from '@sessioflow/conf-module/container';

/**
 * GET /api/v1/conferences/:id
 *
 * Retrieves a conference by ID.
 */
export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  try {
    const {id} = await params;
    const getConferenceHandler = makeGetConferenceHandler();
    const result = await getConferenceHandler.execute({id});

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: result.errors![0].code,
            message: result.errors![0].message,
          },
        },
        {status: 400},
      );
    }

    if (!result.data) {
      return NextResponse.json(
        {error: {code: 'NOT_FOUND', message: 'Conference not found'}},
        {status: 404},
      );
    }

    return NextResponse.json({data: result.data});
  } catch (error) {
    console.error('Conference retrieval error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      {status: 500},
    );
  }
}
