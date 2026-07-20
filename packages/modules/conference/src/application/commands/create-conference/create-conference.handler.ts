import { type ConferenceResponseDto } from '../../dto/conference-response.dto';
import {
  type CreateConferenceCommand,
  CreateConferenceInput,
} from './create-conference.command';
import { Conference } from '../../../domain/conference';
import { ConferenceCreatedEvent } from '../../../domain/events/conference-created';
import { CfpOpenedEvent } from '../../../domain/events/cfp-opened';
import { CfpDatesInvalidError } from '../../../domain/exceptions/cfp-dates-invalid-error';
import { ConferenceNameTooShortError } from '../../../domain/exceptions/conference-name-too-short-error';
import { ConferenceFreeTierLimitError } from '../../../domain/exceptions/conference-free-tier-limit-error';
import { getLogger } from '@sessioflow/shared-logging/logger';
import { getCorrelationId } from '@sessioflow/shared-logging/context';

export type CreateConferenceResult = {
  success: boolean;
  data?: ConferenceResponseDto;
  errors?: Array<{ code: string; message: string }>;
};

export class CreateConferenceHandler {
  async execute(
    command: CreateConferenceCommand
  ): Promise<CreateConferenceResult> {
    const logger = getLogger();
    const correlationId = getCorrelationId() ?? 'unknown';

    logger.info('Starting conference creation', {
      correlationId,
      conferenceName: command.input.name,
      organizerId: command.input.organizerId,
    });

    try {
      const conference = Conference.create({
        name: command.input.name,
        description: command.input.description,
        organizerId: command.input.organizerId,
        cfpStartDate: new Date(command.input.cfpStartDate),
        cfpEndDate: new Date(command.input.cfpEndDate),
        maxSubmissions: command.input.maxSubmissions,
        requiresApproval: command.input.requiresApproval,
      });

      const { events } = conference.publishCfp();

      logger.info('Conference saved successfully', {
        correlationId,
        conferenceId: conference.id.value,
        conferenceName: conference.name.value,
        slug: conference.slug.value,
        organizerId: conference.organizerId,
      });

      return {
        success: true,
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
          events: events.map((e) => ({ type: e.type })),
          createdAt: conference.createdAt.toISOString(),
          updatedAt: conference.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      if (
        error instanceof CfpDatesInvalidError ||
        error instanceof ConferenceNameTooShortError ||
        error instanceof ConferenceFreeTierLimitError
      ) {
        return {
          success: false,
          errors: [{ code: 'VALIDATION_ERROR', message: error.message }],
        };
      }

      logger.error('Unexpected error creating conference', error as Error, {
        correlationId,
      });

      return {
        success: false,
        errors: [{ code: 'INTERNAL_ERROR', message: (error as Error).message }],
      };
    }
  }
}
