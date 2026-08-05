/**
 * Interface response type — extends the plain handler response with
 * fields that only make sense at the HTTP boundary (URLs, links, etc.).
 */
import type { CreateConferenceResponse } from '../../application/commands/create-conference/create-conference.response';
import type { GetConferenceResponse } from '../../application/queries/get-conference/get-conference.response';

export type HttpCreateConferenceResponse = CreateConferenceResponse & {
  cfpUrl: string;
  events: Array<{ type: string }>;
};

export type HttpGetConferenceResponse = GetConferenceResponse & {
  cfpUrl: string;
  events: Array<{ type: string }>;
};
