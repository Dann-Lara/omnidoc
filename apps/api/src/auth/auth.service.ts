import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ClerkService } from './clerk.service';

export interface SyncUserData {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  roleId?: string;
  isTenantAdmin?: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private clerkService: ClerkService,
  ) {}

  async syncUser(data: SyncUserData) {
    const existingUser = await this.prisma.user.findUnique({
      where: { clerkId: data.clerkId },
    });

    if (existingUser) {
      this.logger.log(`User ${data.clerkId} already exists, updating...`);
      return this.prisma.user.update({
        where: { clerkId: data.clerkId },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    }

    this.logger.log(`Creating new user for clerkId: ${data.clerkId}`);
    return this.prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationId: data.organizationId || '',
        roleId: data.roleId || '',
        isTenantAdmin: data.isTenantAdmin || false,
      },
    });
  }

  async getUserByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        organization: true,
        role: true,
      },
    });
  }

  async getUserRole(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        role: true,
        organization: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      role: user.role.name,
      roleId: user.roleId,
      organizationId: user.organizationId,
      organizationSlug: user.organization.slug,
      isTenantAdmin: user.isTenantAdmin,
      permissions: user.role.permissions,
    };
  }

  async deleteUser(clerkId: string) {
    this.logger.log(`Deleting user with clerkId: ${clerkId}`);
    
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      this.logger.warn(`User with clerkId ${clerkId} not found in database`);
      return null;
    }

    await this.clerkService.deleteUser(clerkId);

    return this.prisma.user.delete({
      where: { clerkId },
    });
  }
}
