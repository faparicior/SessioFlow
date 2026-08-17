/**
 * Primitive input for the GetConference query (CQRS boundary carrier).
 * This file must stay free of domain imports.
 */
export type GetConferenceInput = {
  conferenceId: string;
};

/**
 * GetConferenceQuery - CQRS query DTO.
 * A simple container wrapping the primitive input.
 */
export class GetConferenceQuery {
  constructor(readonly input: GetConferenceInput) {}
}
