import {type NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {CreateConferenceCommand} from '@backend/modules/conference/application/commands/create-conference/create-conference.command';
import {type CreateConferenceHandler} from '@backend/modules/conference/application/commands/create-conference/create-conference.handler';
import {ConferenceCreateSchema, ConferenceResponseSchema} from './conference-create.schema';

/**
 * POST /api/v1/conferences
 *
 * Creates a new conference with CfP configuration.
 * Delegates to CreateConference CQRS command handler.
 */
export async function handleConferenceCreate(
  request: NextRequest,
  createConferenceHandler: CreateConferenceHandler,
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

    // 2. Parse and validate request body contract
    const body = (await request.json());
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
        {status: 400},
      );
    }

    // 3. Execute CQRS command
    const command = new CreateConferenceCommand({
      ...parsed.data,
      organizerId: user.id,
    });

    const result = await createConferenceHandler.execute(command);

    if (!result.success) {
      // Map error codes to HTTP status codes
      const error = result.errors![0];
      let status = 400;

      if (error.code === 'SLUG_EXISTS') {
        status = 409;
      } else if (error.code === 'FREE_TIER_LIMIT') {
        status = 403;
      }

      return NextResponse.json(
        {error: {code: error.code, message: error.message}},
        {status},
      );
    }

    // 4. Return success response sanitized by the response schema
    const responseDto = ConferenceResponseSchema.parse(result.data);
    return NextResponse.json({data: responseDto}, {status: 201});
  } catch (error) {
    console.error('Conference creation error:', error);
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

