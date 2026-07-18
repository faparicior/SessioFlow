import {z} from 'zod';

/**
 * Zod validation schema for conference creation requests.
 * Focuses strictly on payload contract validation (types and presence).
 * Business invariants (like minimum length or date bounds) are left to the Domain.
 */
export const ConferenceCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(''),
  cfpStartDate: z.iso.date({message: 'Start date must be a valid date'}),
  cfpEndDate: z.iso.date({message: 'End date must be a valid date'}),
  maxSubmissions: z.number().int().positive().optional(),
  requiresApproval: z.boolean().optional().default(true),
});
