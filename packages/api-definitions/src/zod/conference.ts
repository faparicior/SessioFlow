import { z } from 'zod';

export const ConferenceCfpSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  maxSubmissions: z.number().optional(),
  requiresApproval: z.boolean().default(true),
  status: z.string().default('DRAFT'),
});

export const ConferenceCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(''),
  cfpStartDate: z.iso.date({ message: 'Start date must be a valid date' }),
  cfpEndDate: z.iso.date({ message: 'End date must be a valid date' }),
  maxSubmissions: z.number().int().positive().optional(),
  requiresApproval: z.boolean().optional().default(true),
});

export const CreateConferenceInputSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  slug: z.string().min(3).max(200),
  organizerId: z.string().min(1),
  cfpConfig: ConferenceCfpSchema,
});

export type CreateConferenceInput = z.infer<typeof CreateConferenceInputSchema>;
export type ConferenceCreateInput = z.infer<typeof ConferenceCreateSchema>;

