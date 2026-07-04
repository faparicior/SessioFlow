import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/shared/infrastructure/database/db-client';
import { ConferenceRepository } from '@/modules/conference/domain/repositories/conference-repository';
import { SupabaseConferenceRepository } from '@/modules/conference/infrastructure/database/conference-repository';
import { Conference } from '@/modules/conference/domain/entities/conference';
import { ConferenceStatus } from '@/modules/conference/domain/value-objects/conference-status';
import { eq } from 'drizzle-orm';
import { conferencesTable } from '@/modules/conference/infrastructure/database/drizzle-schema';

/**
 * GET /api/v1/conferences/:id
 *
 * Retrieves a conference by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const repository = new SupabaseConferenceRepository();
    const conference = await repository.findById({ value: params.id });

    if (!conference) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Conference not found' } },
        { status: 404 },
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
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 },
    );
  }
}