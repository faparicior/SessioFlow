import {z} from 'zod';

export const ConferenceCreateSchema = z
  .object({
    name: z.string().min(3, {message: 'Name must be at least 3 characters'}).max(100),
    description: z.string().max(1000).optional().default(''),
    cfpStartDate: z.iso.date({message: 'Start date must be a valid date'}),
    cfpEndDate: z.iso.date({message: 'End date must be a valid date'}),
    maxSubmissions: z.number().int().positive().optional(),
    requiresApproval: z.boolean().optional().default(true),
  })
  .refine(data => data.cfpEndDate > data.cfpStartDate, {
    message: 'End date must be after start date',
  });

export type ConferenceCreateInput = z.infer<typeof ConferenceCreateSchema>;
