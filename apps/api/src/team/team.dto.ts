import { z } from 'zod';

export const CreateTeamInvitationSchema = z.object({
  email: z.string().email(),
  userType: z.string().min(1),
  subtype: z.string().optional(),
  specialtyIds: z.array(z.string()).optional(),
  permissions: z.unknown().optional(),
});

export const UpdateTeamMemberSchema = z.object({
  subtype: z.string().optional(),
  specialtyIds: z.array(z.string()).optional(),
  permissions: z.unknown().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const ResendInvitationSchema = z.object({
  invitationId: z.string().uuid(),
});

export const TeamQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING_INVITATION']).optional(),
  userType: z.string().optional(),
  specialtyId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTeamInvitationDto = z.infer<typeof CreateTeamInvitationSchema>;
export type UpdateTeamMemberDto = z.infer<typeof UpdateTeamMemberSchema>;
export type ResendInvitationDto = z.infer<typeof ResendInvitationSchema>;
export type TeamQueryDto = z.infer<typeof TeamQuerySchema>;