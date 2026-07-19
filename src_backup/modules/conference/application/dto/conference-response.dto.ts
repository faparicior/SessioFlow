/**
 * ConferenceResponseDto - Response DTO for conference creation/queries.
 *
 * Separate from domain entity to optimize API response.
 */
export type ConferenceResponseDto = {
  id: string;
  name: string;
  slug: string;
  status: string;
  cfpStartDate: string;
  cfpEndDate: string;
  cfpStatus: string;
  maxSubmissions: number | undefined;
  requiresApproval: boolean;
  cfpUrl: string;
  events: Array<{type: string}>;
  createdAt: string;
  updatedAt: string;
};
