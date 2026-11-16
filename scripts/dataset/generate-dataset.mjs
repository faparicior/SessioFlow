/**
 * SessioFlow Unsloth Dataset Generator & Architecture Oracle Validator (v3)
 *
 * Generates ~430+ varied, oracle-verified `train.jsonl` samples and ~30+ held-out
 * `eval.jsonl` samples in OpenAI/Unsloth `messages` format for QLoRA fine-tuning.
 *
 * v3 coverage across 22 train domains + 3 held-out eval domains + real `conference` files:
 * - Folder scaffolding & file placement Q&A
 * - String, UUIDv4, Numeric, State-Machine, and Composite DateRange Value Objects
 * - Aggregate Roots (`create`, `fromData`, `pullDomainEvents`)
 * - Domain Events (`implements DomainEvent`, `toJSON`) & `DomainInvariantError`
 * - CQRS Commands, CommandHandlers (`TransactionRunner` + `OutboxRepository`), and `Response.from()`
 * - CQRS Queries, QueryHandlers, Drizzle Repositories (`fromData`), and `container.ts` (`Mediator`)
 * - HTTP Controllers (Zod + `GetAuthUser` + `DomainError`) & Next.js App Router `route.ts` delegates
 * - Vitest domain unit tests & React/`xo` frontend conventions
 * - 5 distinct Negative -> Positive architecture/lint violation-fix pairs
 *
 * Usage:
 *   node scripts/dataset/generate-dataset.mjs
 *   node scripts/dataset/generate-dataset.mjs --verify
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join, relative} from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'scripts/dataset/out');
const VERIFY = process.argv.includes('--verify');

const MINIMAL_SYSTEM_PROMPT =
  'You are a TypeScript/DDD coding assistant for the SessioFlow monorepo.';

const DETAILED_SYSTEM_PROMPT = [
  'You are a senior TypeScript/DDD engineer working in the SessioFlow monorepo.',
  'Follow SessioFlow conventions strictly:',
  '- Bounded contexts live in `packages/modules/<module>/src/{domain,application,infrastructure,interfaces/http}` plus `container.ts`.',
  '- Domain layer has zero external framework imports (only domain, `@sessioflow/shared-*`, or `node_modules`).',
  '- Value Objects have `private constructor`, static `create`/`fromString`/`fromData`, `get value()`, and `equals()`.',
  '- Aggregate Roots use VOs (never raw primitives) in `create()` and `fromData()`, and flush events via `pullDomainEvents()`.',
  '- Domain Events live in `domain/events/`, end with `Event`, implement `DomainEvent`, define `type` + `timestamp`, and implement `toJSON()`.',
  '- Domain Exceptions live in `domain/exceptions/`, end with `Error`, and extend `DomainInvariantError` or `EntityNotFoundError`.',
  '- Response DTOs have `private constructor`, `readonly` primitive fields, and `static from(entity)`.',
  '- Controllers are factory functions in `interfaces/http/*.controller.ts`, validate with Zod, instantiate Command/Query DTOs, catch only `DomainError`, and NEVER import from `domain/**`.',
  '- Next.js `apps/frontend/src/app/api/v1/**/route.ts` files are thin delegates to `@sessioflow/<mod>/container` with relative `api-error` imports.',
  '- Never modify `tests/unit/architecture/` to make failing code pass; always fix application/domain code.',
].join('\n');

const TRAIN_DOMAINS = [
  {mod: 'submissions', entity: 'Submission', vo: 'SubmissionTitle', numVo: 'SubmissionWordCount', numField: 'wordCount', maxNum: 5000, field: 'title', errShort: 'SubmissionTitleTooShortError', errNum: 'SubmissionWordCountInvalidError', event: 'SubmissionCreatedEvent', action: 'create-submission', query: 'get-submission', route: '/api/v1/submissions', schema: 'SubmissionCreateSchema'},
  {mod: 'tickets', entity: 'Ticket', vo: 'TicketCode', numVo: 'TicketPriceCents', numField: 'priceCents', maxNum: 500_000, field: 'code', errShort: 'TicketCodeTooShortError', errNum: 'TicketPriceInvalidError', event: 'TicketIssuedEvent', action: 'issue-ticket', query: 'get-ticket', route: '/api/v1/tickets', schema: 'TicketIssueSchema'},
  {mod: 'speakers', entity: 'Speaker', vo: 'SpeakerName', numVo: 'MaxSessionsPerSpeaker', numField: 'maxSessions', maxNum: 20, field: 'name', errShort: 'SpeakerNameTooShortError', errNum: 'MaxSessionsInvalidError', event: 'SpeakerRegisteredEvent', action: 'register-speaker', query: 'get-speaker', route: '/api/v1/speakers', schema: 'SpeakerRegisterSchema'},
  {mod: 'reviews', entity: 'Review', vo: 'ReviewComment', numVo: 'ReviewScore', numField: 'score', maxNum: 10, field: 'comment', errShort: 'ReviewCommentTooShortError', errNum: 'ReviewScoreInvalidError', event: 'ReviewSubmittedEvent', action: 'submit-review', query: 'get-review', route: '/api/v1/reviews', schema: 'ReviewSubmitSchema'},
  {mod: 'sponsors', entity: 'Sponsor', vo: 'SponsorName', numVo: 'SponsorTierSeats', numField: 'tierSeats', maxNum: 100, field: 'name', errShort: 'SponsorNameTooShortError', errNum: 'SponsorTierSeatsInvalidError', event: 'SponsorAddedEvent', action: 'add-sponsor', query: 'get-sponsor', route: '/api/v1/sponsors', schema: 'SponsorAddSchema'},
  {mod: 'workshops', entity: 'Workshop', vo: 'WorkshopTitle', numVo: 'WorkshopCapacity', numField: 'capacity', maxNum: 500, field: 'title', errShort: 'WorkshopTitleTooShortError', errNum: 'WorkshopCapacityInvalidError', event: 'WorkshopScheduledEvent', action: 'schedule-workshop', query: 'get-workshop', route: '/api/v1/workshops', schema: 'WorkshopScheduleSchema'},
  {mod: 'notifications', entity: 'Notification', vo: 'NotificationSubject', numVo: 'RetryLimit', numField: 'retryLimit', maxNum: 10, field: 'subject', errShort: 'NotificationSubjectTooShortError', errNum: 'RetryLimitInvalidError', event: 'NotificationQueuedEvent', action: 'queue-notification', query: 'get-notification', route: '/api/v1/notifications', schema: 'NotificationQueueSchema'},
  {mod: 'badges', entity: 'Badge', vo: 'BadgeLabel', numVo: 'BadgePrintQuota', numField: 'printQuota', maxNum: 10_000, field: 'label', errShort: 'BadgeLabelTooShortError', errNum: 'BadgePrintQuotaInvalidError', event: 'BadgeIssuedEvent', action: 'issue-badge', query: 'get-badge', route: '/api/v1/badges', schema: 'BadgeIssueSchema'},
  {mod: 'checkins', entity: 'Checkin', vo: 'CheckinCode', numVo: 'GateNumber', numField: 'gateNumber', maxNum: 50, field: 'code', errShort: 'CheckinCodeTooShortError', errNum: 'GateNumberInvalidError', event: 'AttendeeCheckedInEvent', action: 'record-checkin', query: 'get-checkin', route: '/api/v1/checkins', schema: 'CheckinRecordSchema'},
  {mod: 'tracks', entity: 'Track', vo: 'TrackName', numVo: 'TrackSlotLimit', numField: 'slotLimit', maxNum: 40, field: 'name', errShort: 'TrackNameTooShortError', errNum: 'TrackSlotLimitInvalidError', event: 'TrackCreatedEvent', action: 'create-track', query: 'get-track', route: '/api/v1/tracks', schema: 'TrackCreateSchema'},
  {mod: 'venues', entity: 'Venue', vo: 'VenueName', numVo: 'VenueMaxCapacity', numField: 'maxCapacity', maxNum: 20_000, field: 'name', errShort: 'VenueNameTooShortError', errNum: 'VenueCapacityInvalidError', event: 'VenueRegisteredEvent', action: 'register-venue', query: 'get-venue', route: '/api/v1/venues', schema: 'VenueRegisterSchema'},
  {mod: 'rooms', entity: 'Room', vo: 'RoomName', numVo: 'RoomSeatCount', numField: 'seatCount', maxNum: 2000, field: 'name', errShort: 'RoomNameTooShortError', errNum: 'RoomSeatCountInvalidError', event: 'RoomAddedEvent', action: 'add-room', query: 'get-room', route: '/api/v1/rooms', schema: 'RoomAddSchema'},
  {mod: 'polls', entity: 'Poll', vo: 'PollQuestion', numVo: 'PollMaxChoices', numField: 'maxChoices', maxNum: 15, field: 'question', errShort: 'PollQuestionTooShortError', errNum: 'PollMaxChoicesInvalidError', event: 'PollPublishedEvent', action: 'create-poll', query: 'get-poll', route: '/api/v1/polls', schema: 'PollCreateSchema'},
  {mod: 'feedback', entity: 'Feedback', vo: 'FeedbackSummary', numVo: 'FeedbackRating', numField: 'rating', maxNum: 5, field: 'summary', errShort: 'FeedbackSummaryTooShortError', errNum: 'FeedbackRatingInvalidError', event: 'FeedbackSubmittedEvent', action: 'submit-feedback', query: 'get-feedback', route: '/api/v1/feedback', schema: 'FeedbackSubmitSchema'},
  {mod: 'certificates', entity: 'Certificate', vo: 'CertificateTitle', numVo: 'CreditHours', numField: 'creditHours', maxNum: 100, field: 'title', errShort: 'CertificateTitleTooShortError', errNum: 'CreditHoursInvalidError', event: 'CertificateIssuedEvent', action: 'issue-certificate', query: 'get-certificate', route: '/api/v1/certificates', schema: 'CertificateIssueSchema'},
  {mod: 'waitlists', entity: 'WaitlistEntry', vo: 'WaitlistNote', numVo: 'QueuePosition', numField: 'position', maxNum: 5000, field: 'note', errShort: 'WaitlistNoteTooShortError', errNum: 'QueuePositionInvalidError', event: 'WaitlistJoinedEvent', action: 'join-waitlist', query: 'get-waitlist-entry', route: '/api/v1/waitlists', schema: 'WaitlistJoinSchema'},
  {mod: 'discounts', entity: 'Discount', vo: 'DiscountCode', numVo: 'DiscountPercent', numField: 'percent', maxNum: 100, field: 'code', errShort: 'DiscountCodeTooShortError', errNum: 'DiscountPercentInvalidError', event: 'DiscountCreatedEvent', action: 'create-discount', query: 'get-discount', route: '/api/v1/discounts', schema: 'DiscountCreateSchema'},
  {mod: 'merchandise', entity: 'MerchItem', vo: 'MerchItemName', numVo: 'StockQuantity', numField: 'stockQuantity', maxNum: 10_000, field: 'name', errShort: 'MerchItemNameTooShortError', errNum: 'StockQuantityInvalidError', event: 'MerchItemAddedEvent', action: 'add-merch-item', query: 'get-merch-item', route: '/api/v1/merchandise', schema: 'MerchItemAddSchema'},
  {mod: 'recordings', entity: 'Recording', vo: 'RecordingTitle', numVo: 'DurationSeconds', numField: 'durationSeconds', maxNum: 36_000, field: 'title', errShort: 'RecordingTitleTooShortError', errNum: 'DurationSecondsInvalidError', event: 'RecordingPublishedEvent', action: 'publish-recording', query: 'get-recording', route: '/api/v1/recordings', schema: 'RecordingPublishSchema'},
  {mod: 'mentorships', entity: 'Mentorship', vo: 'MentorshipTopic', numVo: 'MentoringSlots', numField: 'slots', maxNum: 25, field: 'topic', errShort: 'MentorshipTopicTooShortError', errNum: 'MentoringSlotsInvalidError', event: 'MentorshipCreatedEvent', action: 'create-mentorship', query: 'get-mentorship', route: '/api/v1/mentorships', schema: 'MentorshipCreateSchema'},
  {mod: 'announcements', entity: 'Announcement', vo: 'AnnouncementHeadline', numVo: 'PriorityLevel', numField: 'priorityLevel', maxNum: 5, field: 'headline', errShort: 'AnnouncementHeadlineTooShortError', errNum: 'PriorityLevelInvalidError', event: 'AnnouncementPostedEvent', action: 'post-announcement', query: 'get-announcement', route: '/api/v1/announcements', schema: 'AnnouncementPostSchema'},
  {mod: 'volunteers', entity: 'VolunteerShift', vo: 'ShiftRoleName', numVo: 'RequiredVolunteers', numField: 'requiredCount', maxNum: 200, field: 'roleName', errShort: 'ShiftRoleNameTooShortError', errNum: 'RequiredVolunteersInvalidError', event: 'VolunteerShiftCreatedEvent', action: 'create-shift', query: 'get-shift', route: '/api/v1/volunteers', schema: 'VolunteerShiftCreateSchema'},
];

const EVAL_DOMAINS = [
  {mod: 'billing', entity: 'Invoice', vo: 'InvoiceReference', numVo: 'InvoiceAmountCents', numField: 'amountCents', maxNum: 10_000_000, field: 'reference', errShort: 'InvoiceReferenceTooShortError', errNum: 'InvoiceAmountInvalidError', event: 'InvoiceCreatedEvent', action: 'create-invoice', query: 'get-invoice', route: '/api/v1/invoices', schema: 'InvoiceCreateSchema'},
  {mod: 'schedule', entity: 'SessionSlot', vo: 'SlotLabel', numVo: 'SlotDurationMinutes', numField: 'durationMinutes', maxNum: 480, field: 'label', errShort: 'SlotLabelTooShortError', errNum: 'SlotDurationInvalidError', event: 'SessionSlotAssignedEvent', action: 'assign-slot', query: 'get-slot', route: '/api/v1/schedule', schema: 'SlotAssignSchema'},
  {mod: 'analytics', entity: 'ReportSnapshot', vo: 'ReportTitle', numVo: 'RetentionDays', numField: 'retentionDays', maxNum: 3650, field: 'title', errShort: 'ReportTitleTooShortError', errNum: 'RetentionDaysInvalidError', event: 'ReportGeneratedEvent', action: 'generate-report', query: 'get-report', route: '/api/v1/analytics', schema: 'ReportGenerateSchema'},
];

function toKebab(pascal) {
  return pascal.replaceAll(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function toUpperSnake(pascal) {
  return toKebab(pascal).replaceAll('-', '_').toUpperCase();
}

function toCamel(kebab) {
  return kebab.replaceAll(/-([a-z])/g, (_, c) => c.toUpperCase());
}

let sampleCounter = 0;

function makeMessage(user, assistant) {
  const systemPrompt = sampleCounter++ % 5 === 0 ? DETAILED_SYSTEM_PROMPT : MINIMAL_SYSTEM_PROMPT;
  return {
    messages: [
      {role: 'system', content: systemPrompt},
      {role: 'user', content: user},
      {role: 'assistant', content: assistant},
    ],
  };
}

function buildFilesForDomain(d) {
  const entityKebab = toKebab(d.entity);
  const entityCamel = d.entity[0].toLowerCase() + d.entity.slice(1);
  const voKebab = toKebab(d.vo);
  const numVoKebab = toKebab(d.numVo);
  const dateRangeClass = `${d.entity}DateRange`;
  const dateRangeKebab = `${entityKebab}-date-range`;
  const idClass = `${d.entity}Id`;
  const idKebab = `${entityKebab}-id`;
  const statusClass = `${d.entity}Status`;
  const statusKebab = `${entityKebab}-status`;
  const errKebab = toKebab(d.errShort);
  const errNumKebab = toKebab(d.errNum);
  const eventKebab = toKebab(d.event);
  const eventType = toUpperSnake(d.event.replace(/Event$/, ''));
  const actionCamel = toCamel(d.action);
  const actionPascal = actionCamel[0].toUpperCase() + actionCamel.slice(1);
  const queryCamel = toCamel(d.query);
  const queryPascal = queryCamel[0].toUpperCase() + queryCamel.slice(1);
  const containerName = `${d.mod}Container`;
  const tableName = `${d.mod}Table`;

  const base = `packages/modules/${d.mod}/src`;

  const domainEventInterface = `export interface DomainEvent {
  readonly type: string;
  readonly timestamp: Date;
  toJSON(): Record<string, unknown>;
}
`;

  const exceptionCode = `import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class ${d.errShort} extends DomainInvariantError {
  constructor(minLength = 3) {
    super('${toUpperSnake(d.errShort)}', \`${d.vo} must be at least \${minLength} characters long\`);
    this.name = '${d.errShort}';
  }
}
`;

  const numExceptionCode = `import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export class ${d.errNum} extends DomainInvariantError {
  constructor() {
    super('${toUpperSnake(d.errNum)}', '${d.numVo} must be a positive integer within allowed bounds');
    this.name = '${d.errNum}';
  }
}
`;

  const idVoCode = `import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ${idClass} {
  private constructor(private readonly _value: string) {}

  public static create(raw: string): ${idClass} {
    const normalized = raw.trim().toLowerCase();
    if (!UUID_V4_PATTERN.test(normalized)) {
      throw new DomainInvariantError(
        'INVALID_${toUpperSnake(idClass)}',
        \`${idClass} "\${raw}" must be a valid UUID\`,
      );
    }
    return new ${idClass}(normalized);
  }

  public static fromData(raw: string): ${idClass} {
    return ${idClass}.create(raw);
  }

  public static generate(): ${idClass} {
    return new ${idClass}(crypto.randomUUID());
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: ${idClass}): boolean {
    if (!other || !(other instanceof ${idClass})) return false;
    return this._value === other._value;
  }
}
`;

  const voCode = `import {${d.errShort}} from '../exceptions/${errKebab}.js';

const MIN_LENGTH = 3;

export class ${d.vo} {
  private constructor(private readonly _value: string) {}

  public static create(raw: string): ${d.vo} {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      throw new ${d.errShort}(MIN_LENGTH);
    }
    return new ${d.vo}(trimmed);
  }

  public static fromData(raw: string): ${d.vo} {
    return new ${d.vo}(raw);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: ${d.vo}): boolean {
    if (!other || !(other instanceof ${d.vo})) return false;
    return this._value === other._value;
  }
}
`;

  const numVoCode = `import {${d.errNum}} from '../exceptions/${errNumKebab}.js';

const MAX_VALUE = ${d.maxNum};

export class ${d.numVo} {
  private constructor(private readonly _value: number) {}

  public static create(value: number): ${d.numVo} {
    if (!Number.isInteger(value) || value <= 0 || value > MAX_VALUE) {
      throw new ${d.errNum}();
    }
    return new ${d.numVo}(value);
  }

  public static fromData(value: number): ${d.numVo} {
    return ${d.numVo}.create(value);
  }

  public get value(): number {
    return this._value;
  }

  public equals(other: ${d.numVo}): boolean {
    if (!other || !(other instanceof ${d.numVo})) return false;
    return this._value === other._value;
  }
}
`;

  const statusVoCode = `import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export type ${statusClass}Value = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

const TRANSITIONS: Record<${statusClass}Value, readonly ${statusClass}Value[]> = {
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['ARCHIVED'],
  ARCHIVED: [],
};

export class ${statusClass} {
  private constructor(private readonly _value: ${statusClass}Value) {}

  public static create(value: string): ${statusClass} {
    if (!(value in TRANSITIONS)) {
      throw new DomainInvariantError('INVALID_${toUpperSnake(statusClass)}', \`Invalid status: \${value}\`);
    }
    return new ${statusClass}(value as ${statusClass}Value);
  }

  public static fromData(value: string): ${statusClass} {
    return ${statusClass}.create(value);
  }

  public static canTransitionTo(current: ${statusClass}, target: ${statusClass}): boolean {
    return TRANSITIONS[current.value].includes(target.value);
  }

  public get value(): ${statusClass}Value {
    return this._value;
  }

  public equals(other: ${statusClass}): boolean {
    if (!other || !(other instanceof ${statusClass})) return false;
    return this._value === other._value;
  }
}
`;

  const dateRangeVoCode = `import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

export type ${dateRangeClass}Value = {
  readonly start: Date;
  readonly end: Date;
};

export class ${dateRangeClass} {
  private constructor(private readonly _value: ${dateRangeClass}Value) {}

  public static create(start: Date, end: Date): ${dateRangeClass} {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new DomainInvariantError('INVALID_DATE_RANGE', '${dateRangeClass} dates must be valid');
    }
    if (end.getTime() <= start.getTime()) {
      throw new DomainInvariantError('INVALID_DATE_RANGE', '${dateRangeClass} end must be after start');
    }
    return new ${dateRangeClass}({start: new Date(start.getTime()), end: new Date(end.getTime())});
  }

  public static fromData(start: Date, end: Date): ${dateRangeClass} {
    return new ${dateRangeClass}({start: new Date(start.getTime()), end: new Date(end.getTime())});
  }

  public get value(): ${dateRangeClass}Value {
    return this._value;
  }

  public get start(): Date {
    return this._value.start;
  }

  public get end(): Date {
    return this._value.end;
  }

  public equals(other: ${dateRangeClass}): boolean {
    if (!other || !(other instanceof ${dateRangeClass})) return false;
    return (
      this._value.start.getTime() === other._value.start.getTime() &&
      this._value.end.getTime() === other._value.end.getTime()
    );
  }
}
`;

  const eventCode = `import {DomainEvent} from './domain-event.interface.js';

export class ${d.event} implements DomainEvent {
  public readonly type = '${eventType}';
  public readonly timestamp: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly ${d.field}: string,
  ) {
    this.timestamp = new Date();
  }

  public toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      aggregateId: this.aggregateId,
      ${d.field}: this.${d.field},
      timestamp: this.timestamp.toISOString(),
    };
  }
}
`;

  const aggregateCode = `import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';
import {DomainEvent} from './events/domain-event.interface.js';
import {${d.event}} from './events/${eventKebab}.js';
import {${idClass}} from './value-objects/${idKebab}.js';
import {${statusClass}} from './value-objects/${statusKebab}.js';
import {${d.vo}} from './value-objects/${voKebab}.js';
import {${d.numVo}} from './value-objects/${numVoKebab}.js';

export type ${d.entity}Data = {
  id: ${idClass};
  ${d.field}: ${d.vo};
  ${d.numField}: ${d.numVo};
  status: ${statusClass};
  createdAt: Date;
};

export type Create${d.entity}Parameters = {
  ${d.field}: ${d.vo};
  ${d.numField}: ${d.numVo};
};

export class ${d.entity} {
  private constructor(
    private readonly _data: ${d.entity}Data,
    private _domainEvents: DomainEvent[],
  ) {}

  public static create(parameters: Create${d.entity}Parameters): ${d.entity} {
    const id = ${idClass}.generate();
    const ${entityCamel} = new ${d.entity}(
      {
        id,
        ${d.field}: parameters.${d.field},
        ${d.numField}: parameters.${d.numField},
        status: ${statusClass}.create('DRAFT'),
        createdAt: new Date(),
      },
      [],
    );
    ${entityCamel}.recordEvent(new ${d.event}(id.value, parameters.${d.field}.value));
    return ${entityCamel};
  }

  public static fromData(data: ${d.entity}Data): ${d.entity} {
    return new ${d.entity}(data, []);
  }

  public activate(): void {
    const target = ${statusClass}.create('ACTIVE');
    if (!${statusClass}.canTransitionTo(this._data.status, target)) {
      throw new DomainInvariantError('INVALID_STATUS_TRANSITION', 'Cannot activate from current status');
    }
    this._data.status = target;
  }

  public get id(): ${idClass} {
    return this._data.id;
  }

  public get ${d.field}(): ${d.vo} {
    return this._data.${d.field};
  }

  public get ${d.numField}(): ${d.numVo} {
    return this._data.${d.numField};
  }

  public get status(): ${statusClass} {
    return this._data.status;
  }

  public get createdAt(): Date {
    return this._data.createdAt;
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  private recordEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}
`;

  const repoInterfaceCode = `import type {${d.entity}} from './${entityKebab}.js';
import type {${idClass}} from './value-objects/${idKebab}.js';

export type TransactionClient = unknown;

export interface ${d.entity}Repository {
  findById(id: ${idClass}): Promise<${d.entity} | null>;
  save(${entityCamel}: ${d.entity}, tx?: TransactionClient): Promise<void>;
}
`;

  const commandCode = `export type ${actionPascal}CommandInput = {
  ${d.field}: string;
  ${d.numField}: number;
  actorId: string;
};

export class ${actionPascal}Command {
  public readonly ${d.field}: string;
  public readonly ${d.numField}: number;
  public readonly actorId: string;

  constructor(input: ${actionPascal}CommandInput) {
    this.${d.field} = input.${d.field};
    this.${d.numField} = input.${d.numField};
    this.actorId = input.actorId;
  }
}
`;

  const responseCode = `import type {${d.entity}} from '../../../domain/${entityKebab}.js';

export class ${actionPascal}Response {
  private constructor(
    public readonly id: string,
    public readonly ${d.field}: string,
    public readonly ${d.numField}: number,
    public readonly status: string,
    public readonly createdAt: string,
  ) {}

  public static from(${entityCamel}: ${d.entity}): ${actionPascal}Response {
    return new ${actionPascal}Response(
      ${entityCamel}.id.value,
      ${entityCamel}.${d.field}.value,
      ${entityCamel}.${d.numField}.value,
      ${entityCamel}.status.value,
      ${entityCamel}.createdAt.toISOString(),
    );
  }
}
`;

  const commandHandlerCode = `import type {OutboxRepository} from '@sessioflow/shared-database/outbox-repository';
import type {Logger} from '@sessioflow/shared-logging/logger';
import {${d.entity}} from '../../../domain/${entityKebab}.js';
import type {${d.entity}Repository} from '../../../domain/${entityKebab}-repository.interface.js';
import {${d.vo}} from '../../../domain/value-objects/${voKebab}.js';
import {${d.numVo}} from '../../../domain/value-objects/${numVoKebab}.js';
import type {TransactionRunner} from '../../transaction-runner.port.js';
import {${actionPascal}Command} from './${d.action}.command.js';
import {${actionPascal}Response} from './${d.action}.response.js';

export class ${actionPascal}CommandHandler {
  constructor(
    private readonly repository: ${d.entity}Repository,
    private readonly outboxRepository: OutboxRepository,
    private readonly transactionRunner: TransactionRunner,
    private readonly logger: Logger,
  ) {}

  public async execute(command: ${actionPascal}Command): Promise<${actionPascal}Response> {
    this.logger.info({actorId: command.actorId}, 'Executing ${actionPascal}Command');

    const ${entityCamel} = ${d.entity}.create({
      ${d.field}: ${d.vo}.create(command.${d.field}),
      ${d.numField}: ${d.numVo}.create(command.${d.numField}),
    });

    await this.transactionRunner.transaction(async tx => {
      await this.repository.save(${entityCamel}, tx);
      for (const event of ${entityCamel}.pullDomainEvents()) {
        await this.outboxRepository.save(event, tx);
      }
    });

    return ${actionPascal}Response.from(${entityCamel});
  }
}
`;

  const drizzleRepoCode = `import {eq} from 'drizzle-orm';
import {db, type DatabaseClient} from '@sessioflow/shared-database/client';
import {${tableName}} from '@sessioflow/shared-database/schema';
import {${d.entity}} from '../../domain/${entityKebab}.js';
import type {${d.entity}Repository, TransactionClient} from '../../domain/${entityKebab}-repository.interface.js';
import {${idClass}} from '../../domain/value-objects/${idKebab}.js';
import {${d.vo}} from '../../domain/value-objects/${voKebab}.js';
import {${d.numVo}} from '../../domain/value-objects/${numVoKebab}.js';
import {${statusClass}} from '../../domain/value-objects/${statusKebab}.js';

type ${d.entity}Row = typeof ${tableName}.$inferSelect;

export class Drizzle${d.entity}Repository implements ${d.entity}Repository {
  private readonly client: DatabaseClient;

  constructor(client?: DatabaseClient) {
    this.client = client ?? db;
  }

  public async findById(id: ${idClass}): Promise<${d.entity} | null> {
    const [row] = await this.client
      .select()
      .from(${tableName})
      .where(eq(${tableName}.id, id.value))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  public async save(${entityCamel}: ${d.entity}, tx?: TransactionClient): Promise<void> {
    const executor = (tx as DatabaseClient | undefined) ?? this.client;
    await executor.insert(${tableName}).values({
      id: ${entityCamel}.id.value,
      ${d.field}: ${entityCamel}.${d.field}.value,
      ${d.numField}: ${entityCamel}.${d.numField}.value,
      status: ${entityCamel}.status.value,
      createdAt: ${entityCamel}.createdAt,
    });
  }

  private toDomain(row: ${d.entity}Row): ${d.entity} {
    return ${d.entity}.fromData({
      id: ${idClass}.fromData(row.id),
      ${d.field}: ${d.vo}.fromData(row.${d.field}),
      ${d.numField}: ${d.numVo}.fromData(row.${d.numField}),
      status: ${statusClass}.fromData(row.status),
      createdAt: row.createdAt,
    });
  }
}
`;

  const containerCode = `import {InMemoryCommandBus, InMemoryQueryBus, LoggingMiddleware, Mediator} from '@sessioflow/bus';
import {db} from '@sessioflow/shared-database/client';
import {DrizzleOutboxRepository, type OutboxRepository} from '@sessioflow/shared-database/outbox-repository';
import {getLogger, type Logger} from '@sessioflow/shared-logging/logger';
import {${actionPascal}Command} from './application/commands/${d.action}/${d.action}.command.js';
import {${actionPascal}CommandHandler} from './application/commands/${d.action}/${d.action}.handler.js';
import type {TransactionRunner} from './application/transaction-runner.port.js';
import type {${d.entity}Repository} from './domain/${entityKebab}-repository.interface.js';
import {Drizzle${d.entity}Repository} from './infrastructure/database/${entityKebab}.repository.js';
import {${actionCamel}Controller, type GetAuthUser} from './interfaces/http/${d.action}.controller.js';

const defaultGetAuthUser: GetAuthUser = async () => ({id: 'mock-user-id'});

export interface ${d.entity}Dependencies {
  repository?: ${d.entity}Repository;
  outboxRepository?: OutboxRepository;
  transactionRunner?: TransactionRunner;
  logger?: Logger;
}

export const ${containerName} = {
  createMediator(dependencies: ${d.entity}Dependencies = {}): Mediator {
    const commandBus = new InMemoryCommandBus();
    const queryBus = new InMemoryQueryBus();
    const loggingMiddleware = new LoggingMiddleware();
    commandBus.use(loggingMiddleware);
    queryBus.use(loggingMiddleware);
    commandBus.register(${actionPascal}Command, this.create${actionPascal}Handler(dependencies));
    return new Mediator(commandBus, queryBus);
  },

  create${actionPascal}Handler(dependencies: ${d.entity}Dependencies = {}): ${actionPascal}CommandHandler {
    return new ${actionPascal}CommandHandler(
      dependencies.repository ?? new Drizzle${d.entity}Repository(),
      dependencies.outboxRepository ?? new DrizzleOutboxRepository(),
      dependencies.transactionRunner ?? (db as unknown as TransactionRunner),
      dependencies.logger ?? getLogger(),
    );
  },

  create${actionPascal}Controller(dependencies: ${d.entity}Dependencies = {}, getAuthUser = defaultGetAuthUser) {
    const handler = this.create${actionPascal}Handler(dependencies);
    return (request: Request) => ${actionCamel}Controller(request, handler, getAuthUser);
  },
};
`;

  const controllerCode = `import {${d.schema}} from '@sessioflow/api-definitions/zod/${d.mod}';
import {DomainError} from '@sessioflow/shared-domain/exceptions';
import {mapDomainErrorToResponse} from '@sessioflow/shared-http/error-mapper';
import {${actionPascal}Command} from '../../application/commands/${d.action}/${d.action}.command.js';
import type {${actionPascal}CommandHandler} from '../../application/commands/${d.action}/${d.action}.handler.js';
import {invalidBodyResponse, jsonResponse, unauthorizedResponse} from './json-response.js';

export type GetAuthUser = () => Promise<{id: string} | undefined>;

export async function ${actionCamel}Controller(
  request: Request,
  handler: ${actionPascal}CommandHandler,
  getAuthUser: GetAuthUser,
): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalidBodyResponse('Request body must be valid JSON');
  }

  const parsed = ${d.schema}.safeParse(payload);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return invalidBodyResponse(issue?.message ?? 'Invalid request body');
  }

  const user = await getAuthUser();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const command = new ${actionPascal}Command({
      ...parsed.data,
      actorId: user.id,
    });
    const result = await handler.execute(command);
    return jsonResponse({data: result}, 201);
  } catch (error) {
    if (error instanceof DomainError) {
      return mapDomainErrorToResponse(error);
    }
    throw error;
  }
}
`;

  const queryHandlerCode = `export class ${queryPascal}Query {
  public readonly id: string;

  constructor(input: {id: string}) {
    this.id = input.id;
  }
}

export interface ${d.entity}ReadRepository {
  findByIdString(id: string): Promise<{id: string; ${d.field}: string; ${d.numField}: number; status: string} | null>;
}

export class ${queryPascal}QueryHandler {
  constructor(private readonly repository: ${d.entity}ReadRepository) {}

  public async execute(query: ${queryPascal}Query) {
    return this.repository.findByIdString(query.id);
  }
}
`;

  const nextCollectionRouteCode = `import {${containerName}} from '@sessioflow/${d.mod}/container';
import {internalErrorResponse} from '../../../../lib/api-error';

const ${actionCamel} = ${containerName}.create${actionPascal}Controller();

export async function POST(request: Request): Promise<Response> {
  try {
    return await ${actionCamel}(request);
  } catch (error) {
    return internalErrorResponse('POST ${d.route}', error);
  }
}
`;

  const nextItemRouteCode = `import {${containerName}} from '@sessioflow/${d.mod}/container';
import {internalErrorResponse} from '../../../../../lib/api-error';

const ${queryCamel} = ${containerName}.create${queryPascal}Controller();

export async function GET(
  request: Request,
  context: {params: Promise<{id: string}>},
): Promise<Response> {
  const {id} = await context.params;

  try {
    return await ${queryCamel}(request, id);
  } catch (error) {
    return internalErrorResponse('GET ${d.route}/{id}', error);
  }
}
`;

  const unitTestCode = `import {describe, expect, it} from 'vitest';
import {${d.entity}} from '@sessioflow/${d.mod}/domain/${entityKebab}';
import {${d.vo}} from '@sessioflow/${d.mod}/domain/value-objects/${voKebab}';
import {${d.numVo}} from '@sessioflow/${d.mod}/domain/value-objects/${numVoKebab}';

describe('${d.entity}', () => {
  it('creates a DRAFT ${d.entity} and records ${d.event}', () => {
    const entity = ${d.entity}.create({
      ${d.field}: ${d.vo}.create('Sample ${d.entity}'),
      ${d.numField}: ${d.numVo}.create(1),
    });

    expect(entity.status.value).toBe('DRAFT');
    const events = entity.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('${eventType}');
    expect(entity.pullDomainEvents()).toHaveLength(0);
  });
});
`;

  return {
    [`${base}/domain/events/domain-event.interface.ts`]: domainEventInterface,
    [`${base}/domain/exceptions/${errKebab}.ts`]: exceptionCode,
    [`${base}/domain/exceptions/${errNumKebab}.ts`]: numExceptionCode,
    [`${base}/domain/value-objects/${idKebab}.ts`]: idVoCode,
    [`${base}/domain/value-objects/${voKebab}.ts`]: voCode,
    [`${base}/domain/value-objects/${numVoKebab}.ts`]: numVoCode,
    [`${base}/domain/value-objects/${statusKebab}.ts`]: statusVoCode,
    [`${base}/domain/value-objects/${dateRangeKebab}.ts`]: dateRangeVoCode,
    [`${base}/domain/events/${eventKebab}.ts`]: eventCode,
    [`${base}/domain/${entityKebab}.ts`]: aggregateCode,
    [`${base}/domain/${entityKebab}-repository.interface.ts`]: repoInterfaceCode,
    [`${base}/interfaces/http/${d.action}.controller.ts`]: controllerCode,
    [`${base}/application/queries/${d.query}/${d.query}.handler.ts`]: queryHandlerCode,
    meta: {
      entityKebab,
      voKebab,
      numVoKebab,
      dateRangeKebab,
      dateRangeClass,
      idKebab,
      statusKebab,
      errKebab,
      errNumKebab,
      eventKebab,
      base,
      containerName,
      actionPascal,
      queryPascal,
      commandCode,
      responseCode,
      commandHandlerCode,
      drizzleRepoCode,
      containerCode,
      nextCollectionRouteCode,
      nextItemRouteCode,
      unitTestCode,
    },
  };
}

function runCheckArch(targetPath) {
  try {
    const out = execFileSync('node', ['scripts/check-architecture.mjs', targetPath], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {ok: true, output: out};
  } catch (err) {
    return {
      ok: false,
      output: `${err.stdout ?? ''}\n${err.stderr ?? ''}`.trim(),
    };
  }
}

function verifyDomainFiles(d, files) {
  if (!VERIFY) return true;
  const tempModRoot = join(ROOT, 'packages/modules', `_synth_${d.mod}`);
  try {
    for (const [relPath, content] of Object.entries(files)) {
      if (relPath === 'meta') continue;
      const targetPath = join(
        ROOT,
        relPath.replace(`packages/modules/${d.mod}`, `packages/modules/_synth_${d.mod}`),
      );
      mkdirSync(join(targetPath, '..'), {recursive: true});
      writeFileSync(targetPath, content, 'utf8');
    }
    const res = runCheckArch(`packages/modules/_synth_${d.mod}`);
    if (!res.ok) {
      console.error(`⚠️ Oracle rejected synthetic domain "${d.mod}":\n${res.output}`);
      return false;
    }
    return true;
  } finally {
    rmSync(tempModRoot, {recursive: true, force: true});
  }
}

function generateTrainDomainExamples(d) {
  const files = buildFilesForDomain(d);
  if (!verifyDomainFiles(d, files)) return [];

  const m = files.meta;
  const {base} = m;
  const voPath = `${base}/domain/value-objects/${m.voKebab}.ts`;
  const numVoPath = `${base}/domain/value-objects/${m.numVoKebab}.ts`;
  const statusPath = `${base}/domain/value-objects/${m.statusKebab}.ts`;
  const dateRangePath = `${base}/domain/value-objects/${m.dateRangeKebab}.ts`;
  const errPath = `${base}/domain/exceptions/${m.errKebab}.ts`;
  const eventPath = `${base}/domain/events/${m.eventKebab}.ts`;
  const aggPath = `${base}/domain/${m.entityKebab}.ts`;
  const cmdPath = `${base}/application/commands/${d.action}/${d.action}.command.ts`;
  const respPath = `${base}/application/commands/${d.action}/${d.action}.response.ts`;
  const handlerPath = `${base}/application/commands/${d.action}/${d.action}.handler.ts`;
  const repoPath = `${base}/infrastructure/database/${m.entityKebab}.repository.ts`;
  const containerPath = `${base}/container.ts`;
  const ctrlPath = `${base}/interfaces/http/${d.action}.controller.ts`;
  const nextRoutePath = `apps/frontend/src/app${d.route}/route.ts`;
  const nextItemRoutePath = `apps/frontend/src/app${d.route}/[id]/route.ts`;
  const testPath = `tests/unit/modules/${d.mod}/domain/${m.entityKebab}.test.ts`;

  const brokenVo = files[voPath]
    .replace('private constructor', 'public constructor')
    .replace(/\n\s*public equals[\s\S]*?\n  \}\n/, '\n');

  const brokenDateRange = files[dateRangePath].replace(
    /  public get value\(\):[\s\S]*?\n  \}\n\n/,
    '',
  );

  const brokenController =
    `import {${d.vo}} from '../../domain/value-objects/${m.voKebab}.js';\n` + files[ctrlPath];

  return [
    // 1. Scaffolding
    makeMessage(
      `Scaffold the DDD folder structure for a new \`${d.mod}\` bounded context with a \`${d.entity}\` aggregate, \`${d.vo}\` and \`${d.numVo}\` value objects, \`${d.event}\` event, and \`${d.action}\` use case.`,
      [
        `\`\`\`text`,
        `packages/modules/${d.mod}/src/`,
        `├── container.ts`,
        `├── domain/`,
        `│   ├── ${m.entityKebab}.ts`,
        `│   ├── ${m.entityKebab}-repository.interface.ts`,
        `│   ├── value-objects/ (${m.idKebab}.ts, ${m.voKebab}.ts, ${m.numVoKebab}.ts, ${m.statusKebab}.ts, ${m.dateRangeKebab}.ts)`,
        `│   ├── events/ (domain-event.interface.ts, ${m.eventKebab}.ts)`,
        `│   └── exceptions/ (${m.errKebab}.ts, ${m.errNumKebab}.ts)`,
        `├── application/`,
        `│   ├── commands/${d.action}/ (${d.action}.command.ts, ${d.action}.handler.ts, ${d.action}.response.ts)`,
        `│   └── queries/${d.query}/ (${d.query}.query.ts, ${d.query}.handler.ts, ${d.query}.response.ts)`,
        `├── infrastructure/database/${m.entityKebab}.repository.ts`,
        `└── interfaces/http/${d.action}.controller.ts`,
        `apps/frontend/src/app${d.route}/`,
        `├── route.ts`,
        `└── [id]/route.ts`,
        `\`\`\``,
      ].join('\n'),
    ),

    // 2. String VO + Exception
    makeMessage(
      `Implement \`${d.vo}\` and \`${d.errShort}\` for \`${d.mod}\`.`,
      `\`${errPath}\`:\n\`\`\`typescript\n${files[errPath].trimEnd()}\n\`\`\`\n\n\`${voPath}\`:\n\`\`\`typescript\n${files[voPath].trimEnd()}\n\`\`\``,
    ),

    // 3. Numeric + State-machine VOs
    makeMessage(
      `Implement the numeric value object \`${d.numVo}\` and state-machine value object \`${d.entity}Status\` for \`${d.mod}\`.`,
      `\`${numVoPath}\`:\n\`\`\`typescript\n${files[numVoPath].trimEnd()}\n\`\`\`\n\n\`${statusPath}\`:\n\`\`\`typescript\n${files[statusPath].trimEnd()}\n\`\`\``,
    ),

    // 4. Composite DateRange VO
    makeMessage(
      `Create a date-range Value Object \`${m.dateRangeClass}\` in \`${dateRangePath}\` validating that \`end\` is after \`start\`, with \`get value()\`, \`start\`, \`end\`, and \`equals()\`.`,
      `\`${dateRangePath}\`:\n\`\`\`typescript\n${files[dateRangePath].trimEnd()}\n\`\`\``,
    ),

    // 5. Aggregate Root
    makeMessage(
      `Implement the \`${d.entity}\` Aggregate Root in \`${aggPath}\` using Value Objects, \`create()\`, \`fromData()\`, and \`pullDomainEvents()\`.`,
      `\`${aggPath}\`:\n\`\`\`typescript\n${files[aggPath].trimEnd()}\n\`\`\``,
    ),

    // 6. Domain Event
    makeMessage(
      `Create \`${d.event}\` in \`${eventPath}\` implementing \`DomainEvent\` for Transactional Outbox persistence.`,
      `\`${eventPath}\`:\n\`\`\`typescript\n${files[eventPath].trimEnd()}\n\`\`\``,
    ),

    // 7. CQRS Command + Response (private constructor + static from)
    makeMessage(
      `Create \`${m.actionPascal}Command\` and \`${m.actionPascal}Response\` for \`${d.mod}\` following \`response-conventions.test.ts\`.`,
      `\`${cmdPath}\`:\n\`\`\`typescript\n${m.commandCode.trimEnd()}\n\`\`\`\n\n\`${respPath}\`:\n\`\`\`typescript\n${m.responseCode.trimEnd()}\n\`\`\``,
    ),

    // 8. CQRS CommandHandler (TransactionRunner + OutboxRepository)
    makeMessage(
      `Implement \`${m.actionPascal}CommandHandler\` in \`${handlerPath}\` persisting both the aggregate and domain events via \`TransactionRunner\` and \`OutboxRepository\`.`,
      `\`${handlerPath}\`:\n\`\`\`typescript\n${m.commandHandlerCode.trimEnd()}\n\`\`\``,
    ),

    // 9. Drizzle Repository (reconstituting with fromData)
    makeMessage(
      `Implement \`Drizzle${d.entity}Repository\` in \`${repoPath}\` using \`${d.entity}.fromData(...)\` on reads.`,
      `\`${repoPath}\`:\n\`\`\`typescript\n${m.drizzleRepoCode.trimEnd()}\n\`\`\``,
    ),

    // 10. Module Container
    makeMessage(
      `Create the composition root \`${containerPath}\` wiring \`Mediator\`, \`InMemoryCommandBus\`, \`Drizzle${d.entity}Repository\`, and the HTTP controller factory.`,
      `\`${containerPath}\`:\n\`\`\`typescript\n${m.containerCode.trimEnd()}\n\`\`\``,
    ),

    // 11. Next.js App Router bridge
    makeMessage(
      `Create the Next.js App Router API route handlers (\`${nextRoutePath}\` and \`${nextItemRoutePath}\`) wired to \`${m.containerName}\`.`,
      `\`${nextRoutePath}\`:\n\`\`\`typescript\n${m.nextCollectionRouteCode.trimEnd()}\n\`\`\`\n\n\`${nextItemRoutePath}\`:\n\`\`\`typescript\n${m.nextItemRouteCode.trimEnd()}\n\`\`\``,
    ),

    // 12. Vitest unit test
    makeMessage(
      `Write a Vitest unit test in \`${testPath}\` verifying \`${d.entity}.create()\` and \`pullDomainEvents()\`.`,
      `\`${testPath}\`:\n\`\`\`typescript\n${m.unitTestCode.trimEnd()}\n\`\`\``,
    ),

    // 13. Fix: VO missing private constructor & equals
    makeMessage(
      `\`npm run check:arch packages/modules/${d.mod}\` failed on \`${voPath}\`:\n\`\`\`typescript\n${brokenVo.trimEnd()}\n\`\`\`\nFix it without modifying \`tests/unit/architecture/\`.`,
      `Value Objects must use \`private constructor\`, static \`create\`/\`fromString\`, \`get value()\`, and \`equals()\`. Updated \`${voPath}\`:\n\`\`\`typescript\n${files[voPath].trimEnd()}\n\`\`\``,
    ),

    // 14. Fix: Composite DateRange VO missing get value()
    makeMessage(
      `\`npm run check:arch\` reported \`VO "${m.dateRangeClass}" missing get value() getter\` on:\n\`\`\`typescript\n${brokenDateRange.trimEnd()}\n\`\`\`\nFix it while keeping \`start\` and \`end\` getters.`,
      `Keep \`get start()\` and \`get end()\` for domain ergonomics and add \`public get value()\` so \`${dateRangePath}\` satisfies \`check:arch\`:\n\`\`\`typescript\n${files[dateRangePath].trimEnd()}\n\`\`\``,
    ),

    // 15. Fix: Controller importing domain/
    makeMessage(
      `\`tests/unit/architecture/ddd-boundaries.test.ts\` failed on \`${ctrlPath}\` because it imports \`${d.vo}\` from \`domain/\`. Should we relax the architecture test or fix the controller?`,
      `Never modify \`tests/unit/architecture/\`. Keep \`${ctrlPath}\` decoupled from \`domain/\` by validating with Zod and passing primitives in the Command DTO:\n\`\`\`typescript\n${files[ctrlPath].trimEnd()}\n\`\`\``,
    ),

    // 16. Fix: Next.js route.ts importing Drizzle/Zod directly
    makeMessage(
      `Review and fix \`${nextRoutePath}\` — it currently imports \`db\` from \`@sessioflow/shared-database/client\` and \`${d.schema}\` directly instead of delegating to \`@sessioflow/${d.mod}/container\`.`,
      `Next.js App Router handlers in \`apps/frontend/src/app/api/v1/\` must stay thin delegates: resolve the controller from \`${m.containerName}\`, use a relative import for \`internalErrorResponse\`, and never touch Zod, domain, or infrastructure.\n\n\`${nextRoutePath}\`:\n\`\`\`typescript\n${m.nextCollectionRouteCode.trimEnd()}\n\`\`\``,
    ),

    // 17. Fix: CommandHandler with try/catch
    makeMessage(
      `Should \`${handlerPath}\` wrap \`repository.save()\` in a \`try/catch\` and return an HTTP status?`,
      `No. In SessioFlow, application handlers are pure and never contain \`try/catch\` for domain errors—exceptions propagate to the controller, which translates \`DomainError\` via \`mapDomainErrorToResponse\`.`,
    ),
  ];
}

function generateEvalDomainExamples(d) {
  const files = buildFilesForDomain(d);
  if (!verifyDomainFiles(d, files)) return [];

  const m = files.meta;
  const {base} = m;
  const numVoPath = `${base}/domain/value-objects/${m.numVoKebab}.ts`;
  const idPath = `${base}/domain/value-objects/${m.idKebab}.ts`;
  const dateRangePath = `${base}/domain/value-objects/${m.dateRangeKebab}.ts`;
  const aggPath = `${base}/domain/${m.entityKebab}.ts`;
  const eventPath = `${base}/domain/events/${m.eventKebab}.ts`;
  const handlerPath = `${base}/application/commands/${d.action}/${d.action}.handler.ts`;
  const repoPath = `${base}/infrastructure/database/${m.entityKebab}.repository.ts`;
  const ctrlPath = `${base}/interfaces/http/${d.action}.controller.ts`;
  const queryPath = `${base}/application/queries/${d.query}/${d.query}.handler.ts`;
  const nextItemRoutePath = `apps/frontend/src/app${d.route}/[id]/route.ts`;

  return [
    makeMessage(
      `Create the UUIDv4 identity VO \`${d.entity}Id\` and numeric VO \`${d.numVo}\` for the new \`${d.mod}\` module.`,
      `\`${idPath}\`:\n\`\`\`typescript\n${files[idPath].trimEnd()}\n\`\`\`\n\n\`${numVoPath}\`:\n\`\`\`typescript\n${files[numVoPath].trimEnd()}\n\`\`\``,
    ),
    makeMessage(
      `Create a date-range Value Object \`${m.dateRangeClass}\` in \`${dateRangePath}\` with \`get value()\`, \`start\`, \`end\`, and \`equals()\`.`,
      `\`${dateRangePath}\`:\n\`\`\`typescript\n${files[dateRangePath].trimEnd()}\n\`\`\``,
    ),
    makeMessage(
      `Write the \`${d.entity}\` Aggregate Root (\`${aggPath}\`) with \`create()\`, \`fromData()\`, state transition validation, and \`pullDomainEvents()\`.`,
      `\`${aggPath}\`:\n\`\`\`typescript\n${files[aggPath].trimEnd()}\n\`\`\``,
    ),
    makeMessage(
      `Implement \`${m.actionPascal}CommandHandler\` in \`${handlerPath}\` with \`TransactionRunner\` and \`OutboxRepository\`.`,
      `\`${handlerPath}\`:\n\`\`\`typescript\n${m.commandHandlerCode.trimEnd()}\n\`\`\``,
    ),
    makeMessage(
      `Implement \`Drizzle${d.entity}Repository\` in \`${repoPath}\` using \`fromData()\`.`,
      `\`${repoPath}\`:\n\`\`\`typescript\n${m.drizzleRepoCode.trimEnd()}\n\`\`\``,
    ),
    makeMessage(
      `Implement the \`${d.query}\` query and handler in \`${queryPath}\`.`,
      `\`${queryPath}\`:\n\`\`\`typescript\n${files[queryPath].trimEnd()}\n\`\`\``,
    ),
    makeMessage(
      `Write the HTTP controller \`${ctrlPath}\` following SessioFlow's Zod + \`GetAuthUser\` + \`DomainError\` mapping conventions.`,
      `\`${ctrlPath}\`:\n\`\`\`typescript\n${files[ctrlPath].trimEnd()}\n\`\`\``,
    ),
    makeMessage(
      `Wire the Next.js App Router \`GET\` handler at \`${nextItemRoutePath}\` to \`${m.containerName}\`.`,
      `\`${nextItemRoutePath}\`:\n\`\`\`typescript\n${m.nextItemRouteCode.trimEnd()}\n\`\`\``,
    ),
    makeMessage(
      `\`npm run check:arch\` reported \`${d.event}\` is missing \`toJSON()\` and \`implements DomainEvent\`. Fix \`${eventPath}\`.`,
      `\`${eventPath}\`:\n\`\`\`typescript\n${files[eventPath].trimEnd()}\n\`\`\``,
    ),
  ];
}

function generateFrontendXoExamples() {
  const components = [
    {name: 'TicketFilterBar', flag: 'isActive', label: 'Active tickets only', field: 'filterNote'},
    {name: 'SpeakerBioPanel', flag: 'isExpanded', label: 'Bio expanded', field: 'bioSummary'},
    {name: 'ReviewStatusBanner', flag: 'hasConflicts', label: 'Conflict detected', field: 'conflictMessage'},
    {name: 'WorkshopCapacityBadge', flag: 'isFull', label: 'Workshop is full', field: 'remainingText'},
    {name: 'SponsorTierCard', flag: 'hasFeaturedSlot', label: 'Featured sponsor', field: 'tierNote'},
    {name: 'CheckinScannerAlert', flag: 'isVerified', label: 'Badge verified', field: 'errorMessage'},
    {name: 'SubmissionDraftNotice', flag: 'hasPendingChanges', label: 'Unsaved changes', field: 'warningText'},
    {name: 'TrackScheduleHeader', flag: 'isPublished', label: 'Schedule published', field: 'subtitle'},
  ];

  const examples = [];
  for (const c of components) {
    const goodTsx = `import {Alert, AlertDescription} from '@/components/ui/alert';

export function ${c.name}({
  ${c.flag},
  ${c.field},
  onToggle,
}: {
  readonly ${c.flag}: boolean;
  readonly ${c.field}?: string;
  readonly onToggle: () => void;
}) {
  const statusText = ${c.flag} ? '${c.label}' : 'Standard view';

  return (
    <section className="space-y-4">
      <button type="button" onClick={onToggle}>
        {statusText}
      </button>
      {${c.field} !== undefined && (
        <Alert>
          <AlertDescription>{${c.field}}</AlertDescription>
        </Alert>
      )}
    </section>
  );
}
`;

    examples.push(
      makeMessage(
        `Create a React component \`${c.name}\` in \`apps/frontend\` that passes SessioFlow's \`xo\` + Prettier rules (\`readonly\` props, \`is*\`/\`has*\` booleans, no leaked render, sorted JSX props).`,
        `\`\`\`tsx\n${goodTsx.trimEnd()}\n\`\`\``,
      ),
    );

    const badTsx = `export function ${c.name}({active, ${c.field}, onToggle}: {active: boolean; ${c.field}?: string; onToggle: () => void}) {
  return <button onClick={onToggle} type="button">{!active ? 'Standard view' : '${c.label}'}{${c.field} && <span>{${c.field}}</span>}</button>;
}`;

    examples.push(
      makeMessage(
        `Fix this \`apps/frontend\` component so \`npm run lint\` (\`xo\`) passes:\n\`\`\`tsx\n${badTsx}\n\`\`\``,
        `Fix \`react/boolean-prop-naming\` (\`${c.flag}\`), \`react/prefer-read-only-props\`, \`unicorn/no-negated-condition\`, \`react/jsx-no-leaked-render\`, and \`react/jsx-sort-props\`:\n\`\`\`tsx\n${goodTsx.trimEnd()}\n\`\`\``,
      ),
    );
  }

  // Relative import rule for xo (no-unsafe-call on @/ alias)
  examples.push(
    makeMessage(
      `\`cd apps/frontend && npx xo src/app\` reports \`no-unsafe-call\` when calling \`createConferenceClient\` imported via \`@/lib/api-client\`. How should we fix it?`,
      `In \`apps/frontend\`, \`xo\`'s type program cannot resolve symbols imported through \`@/*\` when called directly. Use a **relative import** (e.g., \`import {createConferenceClient} from '../../lib/api-client';\`) for functions you call; keep \`@/\` aliases for JSX components.`,
    ),
  );

  return examples;
}

function extractConferenceExamples() {
  const targetFiles = [
    'packages/modules/conference/src/domain/conference.ts',
    'packages/modules/conference/src/domain/conference-repository.interface.ts',
    'packages/modules/conference/src/domain/value-objects/conference-id.ts',
    'packages/modules/conference/src/domain/value-objects/conference-name.ts',
    'packages/modules/conference/src/domain/value-objects/max-submissions.ts',
    'packages/modules/conference/src/domain/value-objects/conference-status.ts',
    'packages/modules/conference/src/domain/value-objects/cfp-start-date.ts',
    'packages/modules/conference/src/domain/value-objects/cfp-end-date.ts',
    'packages/modules/conference/src/domain/value-objects/cfp-config.ts',
    'packages/modules/conference/src/domain/events/conference-created-event.ts',
    'packages/modules/conference/src/domain/exceptions/conference-name-too-short-error.ts',
    'packages/modules/conference/src/application/commands/create-conference/create-conference.command.ts',
    'packages/modules/conference/src/application/commands/create-conference/create-conference.handler.ts',
    'packages/modules/conference/src/application/commands/create-conference/create-conference.response.ts',
    'packages/modules/conference/src/application/queries/get-conference/get-conference.query.ts',
    'packages/modules/conference/src/application/queries/get-conference/get-conference.handler.ts',
    'packages/modules/conference/src/application/queries/get-conference/get-conference.response.ts',
    'packages/modules/conference/src/infrastructure/database/conference.repository.ts',
    'packages/modules/conference/src/interfaces/http/create-conference.controller.ts',
    'packages/modules/conference/src/interfaces/http/get-conference.controller.ts',
    'packages/modules/conference/src/container.ts',
    'apps/frontend/src/app/api/v1/conferences/route.ts',
    'apps/frontend/src/app/api/v1/conferences/[id]/route.ts',
  ];

  const examples = [];
  for (const relPath of targetFiles) {
    const absPath = join(ROOT, relPath);
    if (!existsSync(absPath)) continue;
    const code = readFileSync(absPath, 'utf8').trimEnd();
    examples.push(
      makeMessage(
        `Show an idiomatic SessioFlow implementation of \`${relPath}\`.`,
        `\`${relPath}\`:\n\`\`\`typescript\n${code}\n\`\`\``,
      ),
    );
  }
  return examples;
}

function main() {
  mkdirSync(OUT_DIR, {recursive: true});

  const trainSamples = [
    ...extractConferenceExamples(),
    ...generateFrontendXoExamples(),
  ];
  for (const d of TRAIN_DOMAINS) {
    trainSamples.push(...generateTrainDomainExamples(d));
  }

  const evalSamples = [];
  for (const d of EVAL_DOMAINS) {
    evalSamples.push(...generateEvalDomainExamples(d));
  }

  const trainPath = join(OUT_DIR, 'train.jsonl');
  const evalPath = join(OUT_DIR, 'eval.jsonl');

  writeFileSync(trainPath, trainSamples.map(s => JSON.stringify(s)).join('\n') + '\n', 'utf8');
  writeFileSync(evalPath, evalSamples.map(s => JSON.stringify(s)).join('\n') + '\n', 'utf8');

  console.log(`✅ Generated ${trainSamples.length} train samples -> ${relative(ROOT, trainPath)}`);
  console.log(`✅ Generated ${evalSamples.length} eval samples  -> ${relative(ROOT, evalPath)}`);
  if (VERIFY) {
    console.log('🛡️  All synthetic modules passed scripts/check-architecture.mjs.');
  }
}

main();
