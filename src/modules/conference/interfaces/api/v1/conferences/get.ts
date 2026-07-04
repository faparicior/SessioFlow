import {type NextRequest, NextResponse} from 'next/server';
import {GetConferenceQuery} from '@/modules/conference/application/queries/get-conference/get-conference.query';
import {type GetConferenceHandler} from '@/modules/conference/application/queries/get-conference/get-conference.handler';
import {ConferenceId} from '@/modules/conference/domain/value-objects/conference-id';
import {getSupabaseClient} from '@/shared/infrastructure/database/db-client';

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
  getAuthUser: () => Promise<{id: string} | undefined>,
): Promise<Response> {
  try {
    // 1. Authenticate user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        {error: {code: 'UNAUTHORIZED', message: 'Authentication required'}},
        {status: 401},
      );
    }

    // 2. Validate conference ID format
    try {
      ConferenceId.fromString(conferenceId);
    } catch {
      return NextResponse.json(
        {error: {code: 'INVALID_ID', message: 'Invalid conference ID format'}},
        {status: 400},
      );
    }

    // 3. Execute CQRS query
    const query = new GetConferenceQuery(ConferenceId.fromString(conferenceId));
    const result = await getConferenceHandler.execute(query);

    if (!result.success) {
      return NextResponse.json(
        {error: {code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'}},
        {status: 500},
      );
    }

    // 4. Return response
    if (!result.data) {
      return NextResponse.json(
        {error: {code: 'NOT_FOUND', message: 'Conference not found'}},
        {status: 404},
      );
    }

    return NextResponse.json(
      {data: result.data},
      {status: 200},
    );
  } catch (error) {
    console.error('Conference retrieval error:', error);
    return NextResponse.json(
      {error: {code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'}},
      {status: 500},
    );
  }
}
