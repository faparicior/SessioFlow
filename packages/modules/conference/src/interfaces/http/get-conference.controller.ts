import { NextResponse } from 'next/server';
import type { GetConferenceHandler } from '../../application/queries/get-conference/get-conference.handler.js';
import { mapDomainErrorToResponse } from '@sessioflow/shared-http/error-mapper';
import { DomainError } from '@sessioflow/shared-domain/exceptions';

/**
 * GET /api/v1/conferences/:id
 *
 * Retrieves a conference by ID.
 * Delegates to GetConference CQRS query handler.
 */
export async function getConferenceController(
  request: Request,
  conferenceId: string,
  queryHandler: GetConferenceHandler,
  getAuthUser: () => Promise<{ id: string } | undefined>,
): Promise<Response> {
  try {
    // 1. Authenticate user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // 2. Execute CQRS query
    const conference = await queryHandler.execute({ id: conferenceId });

    // 3. Return response
    return NextResponse.json(
      {
        data: {
          id: conference.id.value,
          name: conference.name.value,
          slug: conference.slug.value,
          status: conference.status,
          cfpStartDate: conference.cfpConfig.startDate.value.toISOString(),
          cfpEndDate: conference.cfpConfig.endDate.value.toISOString(),
          cfpStatus: conference.cfpConfig.status,
          maxSubmissions: conference.cfpConfig.maxSubmissions.value,
          requiresApproval: conference.cfpConfig.requiresApproval.value,
          cfpUrl: `/cfp/${conference.slug.value}`,
          events: [],
          createdAt: conference.createdAt.toISOString(),
          updatedAt: conference.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Translate domain errors to HTTP response
    if (error instanceof DomainError) {
      return mapDomainErrorToResponse(error);
    }
    // Unknown error — rethrow for route safety net
    throw error;
  }
}
