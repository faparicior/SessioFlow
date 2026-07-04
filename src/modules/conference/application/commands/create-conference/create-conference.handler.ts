import {type ConferenceResponseDto} from '../../dto/conference-response.dto';
import {type CreateConferenceCommand, CreateConferenceInput} from './create-conference.command';
import {Conference} from '@/modules/conference/domain/entities/conference';
import {type ConferenceStatus} from '@/modules/conference/domain/value-objects/conference-status';
import {ConferenceCreatedEvent} from '@/modules/conference/domain/events/conference-created';
import {CfpOpenedEvent} from '@/modules/conference/domain/events/cfp-opened';
import {CfpDatesInvalidError} from '@/modules/conference/domain/exceptions/cfp-dates-invalid-error';
import {ConferenceNameTooShortError} from '@/modules/conference/domain/exceptions/conference-name-too-short-error';

/**
 * Email provider interface (best-effort, no side effects in tests).
 */
export type EmailProvider = (data: {to: string; subject: string; body: string}) => Promise<void>;

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
    private readonly repository: {
      findBySlug(slug: {value: string}): Promise<Conference | undefined>;
      save(conference: Conference): Promise<void>;
      findByStatus(status: ConferenceStatus): Promise<Conference[]>;
    },
    private readonly emailProvider: EmailProvider,
  ) {}

  async execute(command: CreateConferenceCommand): Promise<CreateConferenceResult> {
    const {input} = command;

    try {
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

      const existing = await this.repository.findBySlug(slug);
      if (existing) {
        return {
          success: false,
          errors: [{code: 'SLUG_EXISTS', message: 'A conference with this name already exists'}],
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

      const {events} = conference.publishCfp();

      // 3. Save to repository
      await this.repository.save(conference);

      // 4. Send welcome email (best-effort)
      try {
        await this.emailProvider({
          to: 'organizer@example.com',
          subject: `Welcome to SessioFlow - ${conference.name.value} is live!`,
          body: `Your conference ${conference.name.value} is now accepting submissions.`,
        });
      } catch {
        // Best-effort: log but don't fail
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
      if (error instanceof ConferenceNameTooShortError || error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('at least 3 characters')) {
          return {
            success: false,
            errors: [{code: 'NAME_TOO_SHORT', message: errorMessage}],
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
        errors: [{code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'}],
      };
    }
  }
}
