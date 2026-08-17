/**
 * Primitive input for the CreateConference use case (CQRS boundary carrier).
 * Mirrors the validated body of POST /api/v1/conferences plus the
 * authenticated organizer. The co-located handler translates primitives
 * into domain value objects — this file must stay free of domain imports.
 */
export type CreateConferenceInput = {
  name: string;
  description: string;
  /** ISO date (YYYY-MM-DD) when the CfP window opens. */
  cfpStartDate: string;
  /** ISO date (YYYY-MM-DD) when the CfP window closes. */
  cfpEndDate: string;
  /** Optional submission cap; omitted means unlimited. */
  maxSubmissions?: number;
  requiresApproval: boolean;
  organizerId: string;
};

/**
 * CreateConferenceCommand - CQRS command DTO.
 * A simple container wrapping the primitive input.
 */
export class CreateConferenceCommand {
  constructor(readonly input: CreateConferenceInput) {}
}
