import { NextRequest, NextResponse } from 'next/server';
import { ConferenceCreateSchema } from '@/modules/conference/interfaces/api/v1/conferences/conference-create.schema';
import { CreateConferenceCommand } from '@/modules/conference/application/commands/create-conference/create-conference.command';
import { CreateConferenceHandler } from '@/modules/conference/application/commands/create-conference/create-conference.handler';
import { SupabaseConferenceRepository } from '@/modules/conference/infrastructure/database/conference-repository';

/**
 * POST /api/v1/conferences
 *
 * Creates a new conference with CfP configuration.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const parsed = ConferenceCreateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    // 2. Get authenticated user (TODO: Replace with real auth)
    const user = { id: 'mock-user-id' };
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    // 3. Initialize repository and handler
    const repository = new SupabaseConferenceRepository();
    const handler = new CreateConferenceHandler(repository, async () => {});

    // 4. Execute command
    const command = new CreateConferenceCommand({
      ...parsed.data,
      organizerId: user.id,
    });

    const result = await handler.execute(command);

    if (!result.success) {
      const error = result.errors![0];
      let status = 400;

      if (error.code === 'SLUG_EXISTS') {
        status = 409;
      } else if (error.code === 'FREE_TIER_LIMIT') {
        status = 403;
      }

      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status },
      );
    }

    // 5. Return success response
    return NextResponse.json(
      { data: result.data },
      { status: 201 },
    );
  } catch (error) {
    console.error('Conference creation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 },
    );
  }
}