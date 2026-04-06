import { z } from 'zod';

export const CreateOnboardingSchema = z.object({
  organizationName: z.string().min(2).max(100),
  type: z.enum(['INDIVIDUAL', 'CLINIC']),
  specialty: z.string().min(1).max(100),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8).max(100),
});

export type CreateOnboardingDto = z.infer<typeof CreateOnboardingSchema>;
