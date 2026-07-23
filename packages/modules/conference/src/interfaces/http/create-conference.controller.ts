import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateConferenceCommand } from '../../application/commands/create-conference/create-conference.command.js';
import { type CreateConferenceHandler } from '../../application/commands/create-conference/create-conference.handler.js';
import { ConferenceCreateSchema, ConferenceResponseSchema } from './conference-create.schema.js';
import { mapDomainErrorToResponse } from '@sessioflow/shared-http/error-mapper';
import { DomainError } from '@sessioflow/shared-domain/exceptions';

/**
 * POST /api/v1/conferences
 *
 * Creates a new conference with CfP configuration.
 * Delegates to CreateConference CQRS command handler.
 */
export async function createConferenceController(
  request: Request,
  commandHandler: CreateConferenceHandler,
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

    // 2. Parse and validate request body contract
    const body = (await request.json()) as unknown;
    const parsed = ConferenceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: z.treeifyError(parsed.error),
          },
        },
        { status: 400 }
      );
    }

    // 3. Execute CQRS command
    const command = new CreateConferenceCommand({
      ...parsed.data,
      organizerId: user.id,
    });
    const conference = await commandHandler.execute(command);

    // 4. Return success response
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
          events: (conference as any).events?.map((e: any) => ({ type: e.type })) || [],
          createdAt: conference.createdAt.toISOString(),
          updatedAt: conference.updatedAt.toISOString(),
        },
      },
      { status: 201 }
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
