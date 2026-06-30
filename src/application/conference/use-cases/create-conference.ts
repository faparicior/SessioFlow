import {createConferenceSchema} from '../dto/create-conference-dto.ts';
import {ConferenceSlug} from '@/domain/conference/value-objects/conference-slug.ts';
import {CfpValidationService} from '@/domain/conference/services/cfp-validation-service.ts';
import {ConferenceSlugConflictError} from '@/domain/conference/domain-errors.ts';
import {Result} from '@/domain/shared/result.ts';
import {Conference} from '@/domain/conference/conference.ts';
import {type ConferenceRepository} from '@/domain/conference/repositories/conference-repository.ts';

export class CreateConference {
  constructor(private readonly conferenceRepository: ConferenceRepository) {}

  async execute(input: unknown): Promise<Result<Conference>> {
    const validated = createConferenceSchema.safeParse(input);
    if (!validated.success) {
      const message = Object.values(validated.error.flatten().fieldErrors)
        .flat()
        .join(', ');
      return Result.fail(message);
    }

    const {data} = validated;

    const dateValidation = CfpValidationService.validateCfpDates(
      data.cfpStartDate,
      data.cfpEndDate,
    );
    if (!dateValidation.ok) {
      return Result.fail(dateValidation.error);
    }

    const slug = ConferenceSlug.generate(data.name);
    const existing = await this.conferenceRepository.findBySlug(slug);
    if (existing) {
      return Result.fail(`Slug "${slug.getValue()}" is already taken`);
    }

    const conferenceResult = Conference.create({
      name: data.name,
      description: data.description ?? undefined,
      logoUrl: data.logoUrl ?? undefined,
      cfpStartDate: data.cfpStartDate,
      cfpEndDate: data.cfpEndDate,
      maxSubmissions: data.maxSubmissions ?? undefined,
      requiresApproval: data.requiresApproval,
      organizerId: data.organizerId,
    });
    if (conferenceResult.isFailure) {
      return Result.fail(conferenceResult.error);
    }

    const conference = conferenceResult.value;
    const publishResult = conference.publishCfp();
    if (publishResult.isFailure) {
      return Result.fail(publishResult.error);
    }

    try {
      await this.conferenceRepository.save(conference);
    } catch (error) {
      if (error instanceof ConferenceSlugConflictError) {
        return Result.fail(`Slug "${slug.getValue()}" is already taken`);
      }

      console.error('Failed to save conference:', error);
      return Result.fail('Database error occurred while creating conference');
    }

    return Result.ok(conference);
  }
}
