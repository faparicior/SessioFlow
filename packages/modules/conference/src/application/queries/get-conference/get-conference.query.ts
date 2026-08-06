/**
 * Primitive input type for GetConference query.
 * Contains only primitives — domain type conversion is handled by the handler.
 */
export type GetConferenceQueryInput = {
  id: string;
};

/**
 * GetConference Query - CQRS Read Operation.
 */
export class GetConferenceQuery {
  constructor(readonly input: GetConferenceQueryInput) {}
}
