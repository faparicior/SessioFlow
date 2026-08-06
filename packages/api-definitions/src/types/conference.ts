/**
 * Data-only response interface for Conference API contracts.
 * Strictly decoupled from backend domain objects/behavior.
 */
export interface ConferenceApiResponse {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: string;
  organizerId: string;
  cfp: {
    isOpen: boolean;
    startDate: string;
    endDate: string;
    maxSubmissions?: number;
    requiresApproval: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
