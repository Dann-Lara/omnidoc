import { z } from 'zod';

export const CreateInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OPERATOR', 'SUBORDINATE']),
  organizationId: z.string().uuid().optional(),
  organizationName: z.string().optional(),
});

export const CompleteInvitationSchema = z.object({
  token: z.string().min(1),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8).max(100),
});

export type CreateInvitationDto = z.infer<typeof CreateInvitationSchema>;
export type CompleteInvitationDto = z.infer<typeof CompleteInvitationSchema>;
