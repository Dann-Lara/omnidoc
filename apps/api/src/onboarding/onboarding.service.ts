import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { ClerkService } from '../auth/clerk.service';
import type { CreateOnboardingDto } from './onboarding.dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private prisma: PrismaService,
    private clerkService: ClerkService,
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
        name: 'owner',
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
        isDefault: true,
      },
    });

    let clerkUser;
    try {
      clerkUser = await this.clerkService.createUser({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        publicMetadata: {
          role: 'CLIENT',
          tenantType: data.type,
          specialty: data.specialty,
        },
      });
    } catch (error) {
      await this.prisma.organization.delete({ where: { id: organization.id } });
      await this.prisma.role.delete({ where: { id: ownerRole.id } });
      throw error;
    }

    await this.prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        organizationId: organization.id,
        roleId: ownerRole.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        specialty: data.specialty,
        isTenantAdmin: true,
      },
    });

    await this.clerkService.updateUser(clerkUser.id, {
      publicMetadata: {
        role: 'CLIENT',
        tenantType: data.type,
        specialty: data.specialty,
        organizationId: organization.id,
        roleId: ownerRole.id,
        isTenantAdmin: true,
      },
    });

    this.logger.log(`Onboarding complete for: ${data.email}`);

    return {
      userId: clerkUser.id,
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
