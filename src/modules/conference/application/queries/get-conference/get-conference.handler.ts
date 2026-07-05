import {type ConferenceResponseDto} from '../../dto/conference-response.dto';
import {type GetConferenceQuery} from './get-conference.query';
import {Conference} from '@/modules/conference/domain/entities/conference';
import {type ConferenceRepository} from '@/modules/conference/domain/repositories/conference-repository';

export type GetConferenceResult = {
  success: boolean;
  data?: ConferenceResponseDto | undefined;
  errors?: Array<{code: string; message: string}>;
};

/**
 * GetConference Handler - Application Layer (CQRS).
 *
 * Responsibilities:
 *   1. Retrieve conference from repository by ID
 *   2. Return response DTO (or null if not found)
 *
 * DDD Pattern: Query handler is read-only, no side effects.
 */
export class GetConferenceHandler {
  constructor(private readonly repository: ConferenceRepository) {}

  async execute(query: GetConferenceQuery): Promise<GetConferenceResult> {
    try {
      const conference = await this.repository.findById(query.conferenceId);

      if (!conference) {
        return {
          success: true,
          data: null,
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
    } catch {
      return {
        success: false,
        errors: [
          {code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'},
        ],
      };
    }
  }
}
