import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import type { CreateOnboardingDto } from './onboarding.dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async createOnboarding(data: CreateOnboardingDto) {
    this.logger.log(`Creating onboarding for: ${data.email}`);

    const existingUser = await this.prisma.user.findFirst({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const slug = this.generateSlug(data.organizationName);

    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      throw new ConflictException('Organization with this name already exists');
    }

    const freePlan = await this.prisma.plan.findFirst({
      where: { name: 'Free' },
    });

    const organization = await this.prisma.organization.create({
      data: {
        name: data.organizationName,
        slug,
        type: data.type,
        planId: freePlan?.id,
        subscriptionStatus: 'TRIALING',
      },
    });

    const ownerRole = await this.prisma.role.create({
      data: {
        organizationId: organization.id,
        name: 'OWNER',
        permissions: [
          'appointments:read',
          'appointments:write',
          'appointments:delete',
          'patients:read',
          'patients:write',
          'patients:sensitive',
          'users:manage',
          'roles:manage',
          'billing:manage',
          'analytics:view',
          'settings:manage',
        ],
      },
    });
    
    let supabaseUser;
    try {
      supabaseUser = await this.authService.createUserInSupabase(
        data.email,
        data.password,
        {
          role: 'CLIENT',
          tenant_type: data.type,
          specialty: data.specialty,
          organization_id: organization.id,
          role_id: ownerRole.id,
        }
      );
    } catch (error) {
      await this.prisma.organization.delete({ where: { id: organization.id } });
      await this.prisma.role.delete({ where: { id: ownerRole.id } });
      throw error;
    }

    await this.prisma.user.create({
      data: {
        supabaseId: supabaseUser!.id,
        organizationId: organization.id,
        roleId: ownerRole.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        specialty: data.specialty,
        userType: 'OWNER',
      },
    });

    this.logger.log(`Onboarding complete for: ${data.email}`);

    return {
      userId: supabaseUser!.id,
      organizationId: organization.id,
      slug: organization.slug,
    };
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = randomBytes(4).toString('hex').slice(0, 6);
    return `${base}-${suffix}`;
  }
}
