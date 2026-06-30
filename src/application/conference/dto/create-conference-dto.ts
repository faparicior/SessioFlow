import {z} from 'zod';

export const createConferenceSchema = z.object({
  name: z
    .string()
    .min(3, 'Conference name must be at least 3 characters')
    .max(100, 'Conference name cannot exceed 100 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  logoUrl: z.string().optional().nullable(),
  cfpStartDate: z.coerce.date(),
  cfpEndDate: z.coerce.date(),
  maxSubmissions: z.number().int().positive().max(10_000).optional().nullable(),
  requiresApproval: z.boolean().default(true),
  organizerId: z.string().min(1, 'Organizer ID is required'),
});

export const createConferenceResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  cfpUrl: z.string().url(),
  cfpConfig: z.object({
    startDate: z.string(),
    endDate: z.string(),
    maxSubmissions: z.string(),
    requiresApproval: z.boolean(),
    status: z.string(),
  }),
  createdAt: z.string(),
});

export type CreateConferenceInput = z.infer<typeof createConferenceSchema>;
export type CreateConferenceOutput = z.infer<typeof createConferenceResponseSchema>;
