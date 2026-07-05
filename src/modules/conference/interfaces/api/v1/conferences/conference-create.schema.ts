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
    organizerId: z.string().uuid().optional(),
    cfpStartDate: z.string().datetime({message: 'Start date must be a valid date'}),
    cfpEndDate: z.string().datetime({message: 'End date must be a valid date'}),
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
  id: z.string().uuid(),
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
  cfpStartDate: z.string().datetime(),
  cfpEndDate: z.string().datetime(),
  cfpStatus: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']),
  maxSubmissions: z.number().int().positive().nullable(),
  requiresApproval: z.boolean(),
  cfpUrl: z.string().url(),
  events: z.array(z.unknown()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
