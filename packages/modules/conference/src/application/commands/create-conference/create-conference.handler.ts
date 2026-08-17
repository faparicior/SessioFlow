import type {OutboxRepository} from '@sessioflow/shared-database/outbox-repository';
import type {Logger} from '@sessioflow/shared-logging/logger';
import {Conference} from '../../../domain/conference.js';
import type {ConferenceRepository} from '../../../domain/conference-repository.interface.js';
import {ConferenceFreeTierLimitError} from '../../../domain/exceptions/conference-free-tier-limit-error.js';
import {SlugExistsError} from '../../../domain/exceptions/slug-exists-error.js';
import {CfpConfig} from '../../../domain/value-objects/cfp-config.js';
import {CfpEndDate} from '../../../domain/value-objects/cfp-end-date.js';
import {CfpStartDate} from '../../../domain/value-objects/cfp-start-date.js';
import {ConferenceDescription} from '../../../domain/value-objects/conference-description.js';
import {ConferenceName} from '../../../domain/value-objects/conference-name.js';
import {ConferenceSlug} from '../../../domain/value-objects/conference-slug.js';
import {MaxSubmissions} from '../../../domain/value-objects/max-submissions.js';
import {OrganizerId} from '../../../domain/value-objects/organizer-id.js';
import {RequiresApproval} from '../../../domain/value-objects/requires-approval.js';
import type {TransactionRunner} from '../../transaction-runner.port.js';
import type {CreateConferenceCommand} from './create-conference.command.js';
import {CreateConferenceResponse} from './create-conference.response.js';

/** BR-004 - Active conferences allowed per organizer (Free Tier, Wave 1 MVP). */
const FREE_TIER_LIMIT = 5;

/**
 * CreateConferenceCommandHandler - Creates a conference and immediately
 * opens its CfP window (Journey 01).
 *
 * Business rules: BR-003 (slug uniqueness → 409) is evaluated before
 * BR-004 (free-tier limit → 403). Persistence is atomic via the
 * Transactional Outbox (ADR-017): aggregate save + outbox events inside one
 * transaction. Domain invariants throw DomainError subclasses, which the
 * HTTP controller translates into responses.
 */
export class CreateConferenceCommandHandler {
  constructor(
    private readonly conferenceRepository: ConferenceRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly transactionRunner: TransactionRunner,
    private readonly logger: Logger,
  ) {}

  public async execute(
    command: CreateConferenceCommand,
  ): Promise<CreateConferenceResponse> {
    const {input} = command;

    const name = ConferenceName.create(input.name);
    const slug = ConferenceSlug.create(name.value);

    // BR-003: slug uniqueness (checked before the free-tier rule).
    const existing = await this.conferenceRepository.findBySlug(slug);
    if (existing) {
      this.logger.error(
        'Conference creation rejected: slug already exists',
        undefined,
        {slug: slug.value, organizerId: input.organizerId},
      );
      throw new SlugExistsError();
    }

    // BR-004: free-tier limit (Wave 1 MVP — all organizers are FREE).
    const organizerId = OrganizerId.create(input.organizerId);
    const activeCount =
      await this.conferenceRepository.countActiveByOrganizerId(organizerId);
    if (activeCount >= FREE_TIER_LIMIT) {
      this.logger.error(
        'Conference creation rejected: free tier limit reached',
        undefined,
        {organizerId: input.organizerId, activeCount},
      );
      throw new ConferenceFreeTierLimitError();
    }

    const description = ConferenceDescription.create(input.description);
    const cfpConfig = CfpConfig.create({
      startDate: CfpStartDate.create(new Date(input.cfpStartDate)),
      endDate: CfpEndDate.create(new Date(input.cfpEndDate)),
      maxSubmissions: MaxSubmissions.create(input.maxSubmissions ?? null),
      requiresApproval: RequiresApproval.create(input.requiresApproval),
    });

    const conference = Conference.create({
      name,
      description,
      slug,
      organizerId,
      cfpConfig,
    });
    conference.publishCfp();
    const events = conference.pullDomainEvents();

    // ADR-017: aggregate + outbox events persist atomically.
    await this.transactionRunner.transaction(async (tx) => {
      await this.conferenceRepository.save(conference, tx);
      await this.outboxRepository.saveAll(
        events,
        'Conference',
        conference.id.value,
        tx,
      );
    });

    this.logger.info('Conference created and CfP opened', {
      conferenceId: conference.id.value,
      slug: slug.value,
      organizerId: input.organizerId,
    });

    return CreateConferenceResponse.from(conference);
  }
}
