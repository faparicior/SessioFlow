import type {Conference} from '../../../domain/conference.js';

/**
 * CreateConferenceResponse - Application response DTO.
 * Structurally equivalent to the public `ConferenceApiResponse` contract
 * (@sessioflow/api-definitions), decoupled from the domain aggregate.
 */
export class CreateConferenceResponse {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly slug: string,
    readonly status: string,
    readonly organizerId: string,
    readonly cfp: {
      isOpen: boolean;
      startDate: string;
      endDate: string;
      maxSubmissions?: number;
      requiresApproval: boolean;
    },
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  public static from(conference: Conference): CreateConferenceResponse {
    const cfp = conference.cfpConfig;
    return new CreateConferenceResponse(
      conference.id.value,
      conference.name.value,
      conference.description.value,
      conference.slug.value,
      conference.status.value,
      conference.organizerId.value,
      {
        isOpen: cfp.isActive(),
        startDate: cfp.startDate.value.toISOString(),
        endDate: cfp.endDate.value.toISOString(),
        maxSubmissions: cfp.maxSubmissions.value,
        requiresApproval: cfp.requiresApproval.value,
      },
      conference.createdAt.toISOString(),
      conference.updatedAt.toISOString(),
    );
  }
}
