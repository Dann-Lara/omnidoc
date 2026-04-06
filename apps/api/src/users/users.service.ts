import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserByClerkId(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        organization: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUsersByOrganization(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      include: {
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserPermissions(clerkId: string) {
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
      permissions: user.role.permissions,
      organizationId: user.organizationId,
      organizationSlug: user.organization.slug,
      isTenantAdmin: user.isTenantAdmin,
    };
  }
}
