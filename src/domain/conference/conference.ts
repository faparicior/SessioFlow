import {CfpConfig} from './value-objects/cfp-config.ts';
import {ConferenceId} from './value-objects/conference-id.ts';
import {ConferenceName} from './value-objects/conference-name.ts';
import {ConferenceSlug} from './value-objects/conference-slug.ts';
import {ConferenceStatus} from './value-objects/conference-status.ts';
import {Result} from '@/domain/shared/result.ts';

export type ConferenceData = {
  id: ConferenceId;
  name: ConferenceName;
  slug: ConferenceSlug;
  status: ConferenceStatus;
  description?: string;
  logoUrl?: string;
  cfpConfig?: CfpConfig;
  createdAt?: Date;
  organizerId: string;
};

export class Conference {
  readonly id: ConferenceId;
  readonly name: ConferenceName;
  readonly slug: ConferenceSlug;
  status: ConferenceStatus;
  readonly description?: string;
  readonly logoUrl?: string;
  cfpConfig?: CfpConfig;
  readonly createdAt: Date;
  readonly organizerId: string;

  static create(data: {
    name: string;
    description?: string;
    logoUrl?: string;
    cfpStartDate: Date;
    cfpEndDate: Date;
    maxSubmissions?: number;
    requiresApproval?: boolean;
    organizerId: string;
    id?: ConferenceId;
    now?: Date;
  }) {
    const nameResult = ConferenceName.create(data.name);
    if (nameResult.isFailure) {
      return Result.fail(nameResult.error);
    }

    const slug = ConferenceSlug.generate(data.name);
    const id = data.id ?? ConferenceId.generate();

    const cfpConfigResult = CfpConfig.create(
      {
        startDate: data.cfpStartDate,
        endDate: data.cfpEndDate,
        maxSubmissions: data.maxSubmissions ?? null,
        requiresApproval: data.requiresApproval ?? true,
      },
      {now: data.now},
    );
    if (!cfpConfigResult.ok) {
      return Result.fail(cfpConfigResult.error);
    }

    const conference = new Conference({
      id,
      name: nameResult.value,
      slug,
      status: ConferenceStatus.DRAFT,
      description: data.description,
      logoUrl: data.logoUrl,
      cfpConfig: cfpConfigResult.value,
      createdAt: data.now ?? new Date(),
      organizerId: data.organizerId,
    });
    return Result.ok(conference);
  }

  publishCfp() {
    if (this.status !== ConferenceStatus.DRAFT) {
      return Result.fail(`Cannot publish CfP: Conference is in ${this.status} state, not DRAFT`);
    }

    if (!this.cfpConfig) {
      return Result.fail('Conference must have a CfpConfig to publish CfP');
    }

    this.status = ConferenceStatus.CFP_OPEN;
    return Result.ok(this);
  }

  closeCfp() {
    if (this.status !== ConferenceStatus.CFP_OPEN) {
      return Result.fail(`Cannot close CfP: Conference is in ${this.status} state, not CFP_OPEN`);
    }

    this.status = ConferenceStatus.CFP_CLOSED;
    return Result.ok(this);
  }

  cancel() {
    if (
      this.status !== ConferenceStatus.DRAFT
      && this.status !== ConferenceStatus.CFP_OPEN
    ) {
      return Result.fail(`Cannot cancel: Conference is in ${this.status} state`);
    }

    this.status = ConferenceStatus.DELETED;
    return Result.ok(this);
  }

  get cfpUrl() {
    return `https://sessioflow.app/cfp/${this.slug.getValue()}`;
  }

  toJson() {
    return {
      id: this.id.getValue(),
      name: this.name.getValue(),
      slug: this.slug.getValue(),
      status: this.status,
      description: this.description,
      logoUrl: this.logoUrl,
      cfpConfig: this.cfpConfig?.toJson(),
      cfpUrl: this.cfpUrl,
      createdAt: this.createdAt.toISOString(),
      organizerId: this.organizerId,
    };
  }

  private constructor(data: ConferenceData) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.status = data.status;
    this.description = data.description;
    this.logoUrl = data.logoUrl;
    this.cfpConfig = data.cfpConfig;
    this.createdAt = data.createdAt ?? new Date();
    this.organizerId = data.organizerId;
  }
}
