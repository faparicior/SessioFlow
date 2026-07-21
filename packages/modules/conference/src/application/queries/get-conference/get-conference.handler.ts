import { type ConferenceResponseDto } from '../../dto/conference-response.dto';
import { ConferenceId } from '../../../domain/value-objects/conference-id';
import { type ConferenceRepository } from '../../../domain/conference-repository.interface';

export type GetConferenceResult = {
  success: boolean;
  data?: ConferenceResponseDto;
  errors?: Array<{ code: string; message: string }>;
};

export class GetConferenceHandler {
  constructor(private readonly conferenceRepository: ConferenceRepository) {}

  async execute(params: { id: string }): Promise<GetConferenceResult> {
    const conferenceId = ConferenceId.fromString(params.id);
    const conference = await this.conferenceRepository.findById(conferenceId);

    if (!conference) {
      return {
        success: false,
        errors: [{ code: 'NOT_FOUND', message: 'Conference not found' }],
      };
    }

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
        events: [],
        createdAt: conference.createdAt.toISOString(),
        updatedAt: conference.updatedAt.toISOString(),
      },
    };
  }
}
