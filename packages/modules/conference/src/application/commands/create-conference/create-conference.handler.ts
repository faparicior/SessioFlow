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

import { type ConferenceRepository } from '../../../domain/conference-repository.interface';

export type CreateConferenceResult = {
  success: boolean;
  data?: ConferenceResponseDto;
  errors?: Array<{ code: string; message: string }>;
};

export class CreateConferenceHandler {
  constructor(private readonly repository: ConferenceRepository) {}

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
      // 1. Check free tier limit (max 5 active/draft conferences per organizer)
      const organizerConferences = await this.repository.findByOrganizerId(
        command.input.organizerId
      );
      const activeCount = organizerConferences.filter(
        (c) => c.status === 'CFP_OPEN' || c.status === 'DRAFT'
      ).length;

      if (activeCount >= 5) {
        return {
          success: false,
          errors: [
            {
              code: 'FREE_TIER_LIMIT',
              message: 'upgrade your plan to create more conferences',
            },
          ],
        };
      }

      // 2. Create conference aggregate
      const conference = Conference.create({
        name: command.input.name,
        description: command.input.description,
        organizerId: command.input.organizerId,
        cfpStartDate: new Date(command.input.cfpStartDate),
        cfpEndDate: new Date(command.input.cfpEndDate),
        maxSubmissions: command.input.maxSubmissions,
        requiresApproval: command.input.requiresApproval,
      });

      // 3. Check slug uniqueness
      const existing = await this.repository.findBySlug(conference.slug);
      if (existing) {
        return {
          success: false,
          errors: [
            {
              code: 'SLUG_EXISTS',
              message: 'conference name already taken',
            },
          ],
        };
      }

      const { events } = conference.publishCfp();

      await this.repository.save(conference);

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
      if (error instanceof CfpDatesInvalidError) {
        return {
          success: false,
          errors: [{ code: 'CFP_DATES_INVALID', message: 'dates must be in the future' }],
        };
      }

      if (error instanceof ConferenceNameTooShortError) {
        return {
          success: false,
          errors: [{ code: 'NAME_TOO_SHORT', message: error.message }],
        };
      }

      if (error instanceof ConferenceFreeTierLimitError) {
        return {
          success: false,
          errors: [
            {
              code: 'FREE_TIER_LIMIT',
              message: 'upgrade your plan to create more conferences',
            },
          ],
        };
      }

      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('future')) {
        return {
          success: false,
          errors: [{ code: 'CFP_DATES_INVALID', message: 'dates must be in the future' }],
        };
      }

      logger.error('Unexpected error creating conference', error as Error, {
        correlationId,
      });

      return {
        success: false,
        errors: [{ code: 'INTERNAL_ERROR', message }],
      };
    }
  }
}
