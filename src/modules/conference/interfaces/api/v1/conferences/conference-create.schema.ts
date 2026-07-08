import {z} from 'zod';

/**
 * Zod validation schema for conference creation requests.
 *
 * ADR-007: Use Zod for Validation
 */
export const ConferenceCreateSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().max(1000).optional().default(''),
    organizerId: z.guid().optional().transform(v => v ?? ''),
    cfpStartDate: z.iso.date({message: 'Start date must be a valid date'}),
    cfpEndDate: z.iso.date({message: 'End date must be a valid date'}),
    maxSubmissions: z.number().int().positive().optional(),
    requiresApproval: z.boolean().optional().default(true),
  })
  .refine(data => new Date(data.cfpEndDate) > new Date(data.cfpStartDate), {
    message: 'End date must be after start date',
    path: ['cfpEndDate'],
  });

/**
 * Zod validation schema for conference response (for API documentation).
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
  maxSubmissions: z.number().int().positive().nullable(),
  requiresApproval: z.boolean(),
  cfpUrl: z.url(),
  events: z.array(z.unknown()),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
