import { z } from 'zod';

export const CreateInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'COLLABORATOR', 'OPERATOR']),
  organizationId: z.string().uuid().optional(),
  organizationName: z.string().optional(),
  tenantIds: z.array(z.string().uuid()).optional(),
});

export const CompleteInvitationSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8).max(100),
});

export type CreateInvitationDto = z.infer<typeof CreateInvitationSchema>;
export type CompleteInvitationDto = z.infer<typeof CompleteInvitationSchema>;
