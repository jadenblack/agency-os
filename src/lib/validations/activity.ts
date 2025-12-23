import { z } from 'zod';

export const activitySchema = z.object({
  subject: z.string().min(1, 'El asunto es obligatorio'),
  type: z.enum(['call', 'meeting', 'email', 'follow_up', 'note']).optional(),
  description: z.string().optional(),
  owner: z.string().min(1, 'El responsable es obligatorio'),
  scheduled_at: z.string().optional(),
  account: z.string().optional(),
  deal: z.string().optional(),
  contact: z.string().optional(),
  is_completed: z.boolean().optional(),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;