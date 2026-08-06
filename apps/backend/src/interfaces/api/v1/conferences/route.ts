import {type NextRequest, NextResponse} from 'next/server';
import {conferenceContainer} from '@sessioflow/conference/container';
import {getLogger} from '@sessioflow/shared-logging/logger';

/**
 * POST /api/v1/conferences
 *
 * Creates a new conference with CfP configuration.
 * Delegates to createConferenceController in @sessioflow/conference.
 * Route safety net for truly unexpected errors only.
 */
export async function POST(request: NextRequest) {
  const logger = getLogger();
  logger.info('[API] Conference creation request received');

  const controller = conferenceContainer.createConferenceController();

  try {
    return await controller(request);
  } catch (error) {
    console.error('Route-level unhandled error:', error);
    return NextResponse.json(
      {error: {code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'}},
      {status: 500},
    );
  }
}
