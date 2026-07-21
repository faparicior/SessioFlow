import {z} from 'zod';
import {type NextRequest, NextResponse} from 'next/server';
import {ConferenceCreateSchema} from '@backend/modules/conference/interfaces/api/v1/conferences/conference-create.schema';
import {CreateConferenceCommand} from '@backend/modules/conference/application/commands/create-conference/create-conference.command';
import {CreateConferenceHandler} from '@backend/modules/conference/application/commands/create-conference/create-conference.handler';
import {SupabaseConferenceRepository} from '@backend/modules/conference/infrastructure/database/conference-repository';
import {getLogger} from '@backend/shared/infrastructure/logging';

/**
 * POST /api/v1/conferences
 *
 * Creates a new conference with CfP configuration.
 */
export async function POST(request: NextRequest) {
  const logger = getLogger();
  logger.info('[API] Conference creation request received');

  try {
    // 1. Parse and validate request body
    const body = await request.json();
    logger.debug('[API] Request body', {body});
    const parsed = ConferenceCreateSchema.safeParse(body);

    if (!parsed.success) {
      logger.error(
        '[API] Validation failed:',
        new Error(JSON.stringify(z.treeifyError(parsed.error))),
      );
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

    logger.debug('[API] Validation passed');

    // 2. Get authenticated user (TODO: Replace with real auth)
    const user = {id: 'mock-user-id'};
    if (!user) {
      return NextResponse.json(
        {error: {code: 'UNAUTHORIZED', message: 'Authentication required'}},
        {status: 401},
      );
    }

    // 3. Initialize repository and handler
    const repository = new SupabaseConferenceRepository();
    const handler = new CreateConferenceHandler(repository, async () => undefined);

    // 4. Execute command
    const command = new CreateConferenceCommand({
      ...parsed.data,
      organizerId: user.id,
    });
    logger.debug('[API] Executing create conference command:', {
      name: parsed.data.name,
    });

    const result = await handler.execute(command);
    logger.debug('[API] Command result:', result);

    if (!result.success) {
      logger.error(
        '[API] Conference creation failed:',
        new Error(result.errors?.[0]?.message ?? 'Unknown error'),
      );
      const error = result.errors![0];
      let status = 400;
      let {message} = error;

      switch (error.code) {
        case 'SLUG_EXISTS': {
          status = 409;
          message = 'conference name already taken';

          break;
        }

        case 'FREE_TIER_LIMIT': {
          status = 403;
          message = 'upgrade your plan to create more conferences';

          break;
        }

        case 'CFP_DATES_INVALID': {
          message = 'dates must be in the future';

          break;
        }
        // No default
      }

      return NextResponse.json({error: {code: error.code, message}}, {status});
    }

    logger.info('[API] Conference created successfully');

    // 5. Return success response
    return NextResponse.json({data: result.data}, {status: 201});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[API] Conference creation error', error instanceof Error ? error : new Error(String(error)));
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
