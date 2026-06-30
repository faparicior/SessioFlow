import type {NextRequest, NextResponse} from 'next/server';
import {ConferenceSlug} from '@/domain/conference/value-objects/conference-slug.ts';
import {ConferenceSlugConflictError} from '@/domain/conference/domain-errors.ts';
import {CreateConference} from '@/application/conference/use-cases/create-conference.ts';
import {SupabaseConferenceRepository} from '@/infrastructure/database/conference-repository.ts';

function getRepository() {
  return new SupabaseConferenceRepository();
}

export async function postConference(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const organizerId = request.headers.get('x-organizer-id');
    if (!organizerId) {
      return NextResponse.json(
        {error: 'Unauthorized: organizer ID required'},
        {status: 401},
      );
    }

    const createConference = new CreateConference(getRepository());
    const result = await createConference.execute({...body, organizerId});

    if (result.isFailure) {
      let status = 400;
      if (result.error?.includes('already taken') ?? false) {
        status = 409;
      }

      return NextResponse.json({error: result.error}, {status});
    }

    const conference = result.value;
    return NextResponse.json(
      {
        id: conference.id.getValue(),
        name: conference.name.getValue(),
        slug: conference.slug.getValue(),
        status: conference.status,
        description: conference.description,
        logoUrl: conference.logoUrl,
        cfpUrl: conference.cfpUrl,
        cfpConfig: conference.cfpConfig?.toJson(),
        createdAt: conference.createdAt.toISOString(),
      },
      {status: 201},
    );
  } catch {
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
