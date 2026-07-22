import {type NextRequest} from 'next/server';
import {createConferenceController} from '@sessioflow/conference/interfaces/http/create-conference.controller';
import {conferenceContainer} from '@sessioflow/conference/container';
import {getLogger} from '@sessioflow/shared-logging/logger';
import {withApiCorrelation} from '@sessioflow/shared-logging/middleware';

/**
 * POST /api/v1/conferences
 *
 * Creates a new conference with CfP configuration.
 * Delegates to createConferenceController in @sessioflow/conference.
 */
export const POST = withApiCorrelation(async (request: NextRequest) => {
  const logger = getLogger();
  logger.info('[API] Conference creation request received');

  const handler = conferenceContainer.createConferenceHandler();
  const getAuthUser = async () => ({id: 'mock-user-id'});

  return createConferenceController(request, handler, getAuthUser);
});
