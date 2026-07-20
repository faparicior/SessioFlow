import { z } from 'zod';

export const ConferenceCfpSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  maxSubmissions: z.number().optional(),
  requiresApproval: z.boolean().default(true),
  status: z.string().default('DRAFT'),
});

export const CreateConferenceInputSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  slug: z.string().min(3).max(200),
  organizerId: z.string().min(1),
  cfpConfig: ConferenceCfpSchema,
});

export type CreateConferenceInput = z.infer<typeof CreateConferenceInputSchema>;
