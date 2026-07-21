import {ConferenceId} from '@backend/modules/conference/domain/value-objects/conference-id';
import {type ConferenceRepository} from '@backend/modules/conference/domain/conference-repository';
import {type ConferenceResponseDto} from '../../dto/conference-response.dto';

export type GetConferenceResult = {
  success: boolean;
  data?: ConferenceResponseDto | undefined;
  errors?: Array<{code: string; message: string}>;
};

/**
 * GetConference Handler - Application Layer (CQRS).
 *
 * Responsibilities:
 *   1. Validate conference ID format
 *   2. Retrieve conference from repository by ID
 *   3. Return response DTO (or null if not found)
 *
 * DDD Pattern: Query handler is read-only, no side effects.
 */
export class GetConferenceHandler {
  constructor(public readonly repository: ConferenceRepository) {}

  async execute(conferenceId: string): Promise<GetConferenceResult> {
    try {
      const id = ConferenceId.fromString(conferenceId);
      const conference = await this.repository.findById(id);

      if (!conference) {
        return {
          success: true,
          data: undefined,
        };
      }

      // Return response DTO
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
          events: [],
          createdAt: conference.createdAt.toISOString(),
          updatedAt: conference.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      // Distinguish validation errors from other failures

      if (error instanceof Error && error.message.includes('Invalid ConferenceId')) {
        return {
          success: false,
          errors: [{code: 'INVALID_ID', message: 'Invalid conference ID format'}],
        };
      }

      return {
        success: false,
        errors: [{code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'}],
      };
    }
  }
}
