import {type ConferenceResponseDto} from '../../dto/conference-response.dto';
import {
  type CreateConferenceCommand,
  CreateConferenceInput,
} from './create-conference.command';
import {Conference} from '@backend/modules/conference/domain/entities/conference';
import {ConferenceStatus} from '@backend/modules/conference/domain/value-objects/conference-status';
import {ConferenceCreatedEvent} from '@backend/modules/conference/domain/events/conference-created';
import {CfpOpenedEvent} from '@backend/modules/conference/domain/events/cfp-opened';
import {CfpDatesInvalidError} from '@backend/modules/conference/domain/exceptions/cfp-dates-invalid-error';
import {ConferenceNameTooShortError} from '@backend/modules/conference/domain/exceptions/conference-name-too-short-error';
import {ConferenceFreeTierLimitError} from '@backend/modules/conference/domain/exceptions/conference-free-tier-limit-error';
import {getLogger, getCorrelationId} from '@backend/shared/infrastructure/logging';

/**
 * Email provider interface (best-effort, no side effects in tests).
 */
export type EmailProvider = (data: {
  to: string;
  subject: string;
  body: string;
}) => Promise<void>;

export type CreateConferenceResult = {
  success: boolean;
  data?: ConferenceResponseDto;
  errors?: Array<{code: string; message: string}>;
};

/**
 * CreateConference Handler - Application Layer (CQRS).
 *
 * Responsibilities:
 *   1. Validate input
 *   2. Check slug uniqueness
 *   3. Create Conference aggregate
 *   4. Publish CfP
 *   5. Save to repository
 *   6. Send welcome email (best-effort)
 *   7. Return response DTO
 */
export class CreateConferenceHandler {
  constructor(
    public readonly repository: {
      findBySlug(slug: {value: string}): Promise<Conference | undefined>;
      save(conference: Conference): Promise<void>;
      findByStatus(status: ConferenceStatus): Promise<Conference[]>;
      findByOrganizerId(organizerId: string): Promise<Conference[]>;
    },
    public readonly emailProvider: EmailProvider,
  ) {}

  async execute(
    command: CreateConferenceCommand,
  ): Promise<CreateConferenceResult> {
    const logger = getLogger();
    const {input} = command;
    const correlationId = getCorrelationId() ?? 'unknown';

    const context = {
      correlationId,
      conferenceName: input.name,
      organizerId: input.organizerId,
    };

    logger.info('Starting conference creation', context);

    try {
      // 0. Check free tier limit (max 5 active conferences for free users)
      const organizerConferences = await this.repository.findByOrganizerId(
        input.organizerId,
      );
      const activeCount = organizerConferences.filter(
        c => c.status === ConferenceStatus.CFP_OPEN || c.status === ConferenceStatus.DRAFT,
      ).length;

      if (activeCount >= 5) {
        logger.warn('Free tier limit exceeded', {
          ...context,
          activeCount,
        });
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

      // 1. Check slug uniqueness by creating a temporary conference
      const temporaryConference = Conference.create({
        name: input.name,
        organizerId: 'placeholder',
        cfpStartDate: new Date(input.cfpStartDate),
        cfpEndDate: new Date(input.cfpEndDate),
        maxSubmissions: input.maxSubmissions,
        requiresApproval: input.requiresApproval,
      });
      const {slug} = temporaryConference;

      logger.debug('Generated slug', {
        ...context,
        slug: slug.value,
      });

      const existing = await this.repository.findBySlug(slug);
      if (existing) {
        logger.warn('Slug already exists', {
          ...context,
          slug: slug.value,
        });
        return {
          success: false,
          errors: [
            {
              code: 'SLUG_EXISTS',
              message: 'A conference with this name already exists',
            },
          ],
        };
      }

      // 2. Create conference and publish CfP
      const conference = Conference.create({
        name: input.name,
        description: input.description,
        organizerId: input.organizerId,
        cfpStartDate: new Date(input.cfpStartDate),
        cfpEndDate: new Date(input.cfpEndDate),
        maxSubmissions: input.maxSubmissions,
        requiresApproval: input.requiresApproval,
      });

      logger.debug('Conference entity created', {
        ...context,
        conferenceId: conference.id.value,
      });

      const {events} = conference.publishCfp();

      // 3. Save to repository
      logger.debug('Saving conference to repository', {
        conferenceId: conference.id.value,
      });
      await this.repository.save(conference);

      logger.info('Conference saved successfully', {
        ...context,
        conferenceId: conference.id.value,
        slug: conference.slug.value,
      });

      // 4. Send welcome email (best-effort)
      try {
        await this.emailProvider({
          to: 'organizer@example.com',
          subject: `Welcome to SessioFlow - ${conference.name.value} is live!`,
          body: `Your conference ${conference.name.value} is now accepting submissions.`,
        });

        logger.info('Welcome email sent', {
          ...context,
          conferenceId: conference.id.value,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(
          'Failed to send welcome email (best-effort)',
          {
            ...context,
            conferenceId: conference.id.value,
            error: errorMessage,
          },
        );
      }

      // 5. Return response
      return {
        success: true,
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
          events: events.map(e => ({type: e.type, ...e.toJSON()})),
          createdAt: conference.createdAt.toISOString(),
          updatedAt: conference.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorName = error instanceof Error ? error.name : 'Error';
      const errorContext = {
        ...context,
        errorType: errorName,
        errorMessage,
      };

      logger.error('Conference creation failed', error instanceof Error ? error : new Error(String(error)), errorContext);

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

      if (
        error instanceof ConferenceNameTooShortError ||
        error instanceof Error
      ) {
        const errorMessage = error.message;
        if (errorMessage.includes('at least 3 characters')) {
          return {
            success: false,
            errors: [{code: 'NAME_TOO_SHORT', message: errorMessage}],
          };
        }

        if (errorMessage.includes('future')) {
          return {
            success: false,
            errors: [
              {
                code: 'CFP_DATES_INVALID',
                message: 'dates must be in the future',
              },
            ],
          };
        }
      }

      if (error instanceof CfpDatesInvalidError) {
        return {
          success: false,
          errors: [{code: 'CFP_DATES_INVALID', message: error.message}],
        };
      }

      return {
        success: false,
        errors: [
          {code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'},
        ],
      };
    }
  }
}
