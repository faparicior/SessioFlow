import {type NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/shared/infrastructure/database/db-client';
import {SupabaseConferenceRepository} from '@/modules/conference/infrastructure/database/conference-repository';

/**
 * GET /api/v1/conferences/:id
 *
 * Retrieves a conference by ID.
 */
export async function GET(
  request: NextRequest,
  {params}: {params: {id: string}},
) {
  try {
    const {id} = await params;
    const repository = new SupabaseConferenceRepository();
    const conference = await repository.findById({value: id});

    if (!conference) {
      return NextResponse.json(
        {error: {code: 'NOT_FOUND', message: 'Conference not found'}},
        {status: 404},
      );
    }

    return NextResponse.json({
      data: {
        id: conference.id.value,
        name: conference.name.value,
        slug: conference.slug.value,
        status: conference.status,
        cfpStartDate: conference.cfpConfig.startDate.toISOString(),
        cfpEndDate: conference.cfpConfig.endDate.toISOString(),
        cfpStatus: conference.cfpConfig.status,
        maxSubmissions: conference.cfpConfig.maxSubmissions.value,
        requiresApproval: conference.cfpConfig.requiresApproval.value,
        cfpUrl: `https://sessioflow.app/cfp/${conference.slug.value}`,
        events: [],
        createdAt: conference.createdAt.toISOString(),
        updatedAt: conference.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Conference retrieval error:', error);
    return NextResponse.json(
      {error: {code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'}},
      {status: 500},
    );
  }
}
