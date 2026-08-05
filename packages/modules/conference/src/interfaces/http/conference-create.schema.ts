import { z } from 'zod';

/**
 * Zod validation schema for conference creation requests.
 * Focuses strictly on payload contract validation (types and presence).
 * Business invariants (like minimum length or date bounds) are left to the Domain.
 */
export const ConferenceCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(''),
  cfpStartDate: z.iso.date({ message: 'Start date must be a valid date' }),
  cfpEndDate: z.iso.date({ message: 'End date must be a valid date' }),
  maxSubmissions: z.number().int().positive().optional(),
  requiresApproval: z.boolean().optional().default(true),
});

/**
 * Zod validation schema for conference response (for API documentation and serialization).
 */
export const ConferenceResponseSchema = z.object({
  id: z.guid(),
  name: z.string(),
  slug: z.string(),
  status: z.enum([
    'DRAFT',
    'CFP_OPEN',
    'CFP_CLOSED',
    'REVIEWING',
    'SCHEDULED',
    'PUBLISHED',
    'COMPLETED',
    'DELETED',
  ]),
  cfpStartDate: z.iso.datetime(),
  cfpEndDate: z.iso.datetime(),
  cfpStatus: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']),
  maxSubmissions: z.number().int().positive().optional(),
  requiresApproval: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
