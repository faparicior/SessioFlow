/**
 * CreateConference Command - CQRS Write Operation.
 *
 * Command: Creates a new conference with CfP configuration.
 * Side Effects: Creates Conference aggregate, publishes domain events, saves to DB.
 *
 * DDD Pattern: Command lives in application layer.
 */
export type CreateConferenceInput = {
  name: string;
  description?: string;
  organizerId: string;
  cfpStartDate: string;
  cfpEndDate: string;
  maxSubmissions?: number;
  requiresApproval?: boolean;
};

export class CreateConferenceCommand {
  constructor(readonly input: CreateConferenceInput) {}
}
