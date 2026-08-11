import { Conference } from '../../../domain/conference';
import { CfpDatesInvalidError } from '../../../domain/exceptions/cfp-dates-invalid-error';
import { ConferenceNameTooShortError } from '../../../domain/exceptions/conference-name-too-short-error';
import { ConferenceFreeTierLimitError } from '../../../domain/exceptions/conference-free-tier-limit-error';
import { SlugExistsError } from '../../../domain/exceptions/slug-exists-error';
import { getLogger } from '@sessioflow/shared-logging/logger';
import { getCorrelationId } from '@sessioflow/shared-logging/context';
import { CreateConferenceResponse } from './create-conference.response';

import { type ConferenceRepository } from '../../../domain/conference-repository.interface';
import { type OutboxRepository } from '@sessioflow/shared-database/outbox-repository';
import { OutboxProcessor, type EventPublisher } from '@sessioflow/shared-database/outbox';
import { type CreateConferenceCommand } from './create-conference.command';

export interface CreateConferenceCommandHandler {
  execute(command: CreateConferenceCommand): Promise<CreateConferenceResponse>;
}

export class CreateConferenceHandler implements CreateConferenceCommandHandler {
  constructor(
    private readonly repository: ConferenceRepository,
    private readonly outboxRepository?: OutboxRepository,
    private readonly eventPublisher?: EventPublisher
  ) {}

  async execute(command: CreateConferenceCommand): Promise<CreateConferenceResponse> {
    const logger = getLogger();
    const correlationId = getCorrelationId() ?? 'unknown';

    logger.info('Starting conference creation', {
      correlationId,
      conferenceName: command.input.name,
      organizerId: command.input.organizerId,
    });

    // 1. Check free tier limit
    const organizerConferences = await this.repository.findByOrganizerId(
      command.input.organizerId
    );
    const activeCount = organizerConferences.filter(
      (c) => c.status === 'CFP_OPEN' || c.status === 'DRAFT'
    ).length;

    if (activeCount >= 5) {
      throw new ConferenceFreeTierLimitError();
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
      throw new SlugExistsError();
    }

    conference.publishCfp();
    await this.repository.save(conference);

    // 4. Explicitly pull pending events at the latest moment and persist to outbox
    if (this.outboxRepository) {
      const events = conference.pullDomainEvents();
      await this.outboxRepository.saveAll(events, 'Conference', conference.id.value);

      // Immediate non-blocking post-commit outbox trigger
      if (events.length > 0 && this.eventPublisher) {
        setImmediate(() => {
          OutboxProcessor.processPending(this.eventPublisher!).catch((err) => {
            logger.error('Immediate outbox processing failed', err);
          });
        });
      }
    }

    logger.info('Conference saved successfully', {
      correlationId,
      conferenceId: conference.id.value,
      conferenceName: conference.name.value,
      slug: conference.slug.value,
      organizerId: conference.organizerId,
    });

    return CreateConferenceResponse.from(conference);
  }
}


