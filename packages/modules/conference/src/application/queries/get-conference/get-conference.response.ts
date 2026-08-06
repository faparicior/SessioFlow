import { Conference } from '../../../domain/conference';

export class GetConferenceResponse {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly status: string;
  readonly cfpStartDate: string;
  readonly cfpEndDate: string;
  readonly cfpStatus: string;
  readonly maxSubmissions?: number;
  readonly requiresApproval: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: GetConferenceResponse) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.status = props.status;
    this.cfpStartDate = props.cfpStartDate;
    this.cfpEndDate = props.cfpEndDate;
    this.cfpStatus = props.cfpStatus;
    this.maxSubmissions = props.maxSubmissions;
    this.requiresApproval = props.requiresApproval;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static from(conference: Conference): GetConferenceResponse {
    return new GetConferenceResponse({
      id: conference.id.value,
      name: conference.name.value,
      slug: conference.slug.value,
      status: conference.status,
      cfpStartDate: conference.cfpConfig.startDate.value.toISOString(),
      cfpEndDate: conference.cfpConfig.endDate.value.toISOString(),
      cfpStatus: conference.cfpConfig.status,
      maxSubmissions: conference.cfpConfig.maxSubmissions.value,
      requiresApproval: conference.cfpConfig.requiresApproval.value,
      createdAt: conference.createdAt.toISOString(),
      updatedAt: conference.updatedAt.toISOString(),
    });
  }
}
