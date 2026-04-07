import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import type { CreateInvitationDto } from './invitations.dto';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async createInvitation(data: CreateInvitationDto & { createdBy: string }) {
    this.logger.log(`Creating invitation for: ${data.email}`);

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email: data.email,
        status: 'PENDING',
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('An invitation has already been sent to this email');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    let organizationId = data.organizationId;

    if (!organizationId && data.organizationName) {
      const slug = this.generateSlug(data.organizationName);
      const organization = await this.prisma.organization.create({
        data: {
          name: data.organizationName,
          slug,
          type: 'INDIVIDUAL',
          subscriptionStatus: 'TRIALING',
        },
      });
      organizationId = organization.id;
    }

    const invitation = await this.prisma.invitation.create({
      data: {
        token,
        email: data.email,
        role: data.role,
        organizationId,
        createdBy: data.createdBy,
        expiresAt,
      },
    });

    this.logger.log(`Invitation created: ${invitation.id}`);

    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      organizationId: invitation.organizationId,
    };
  }

  async getInvitations(organizationId: string) {
    return this.prisma.invitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      organizationName: invitation.organization?.name,
      organizationId: invitation.organizationId,
    };
  }

  async completeInvitation(data: {
    token: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    const invitation = await this.validateToken(data.token);

    const organizationId = invitation.organizationId;
    let roleId: string | undefined;

    if (invitation.role === 'SUBORDINATE' && invitation.organizationId) {
      const defaultRole = await this.prisma.role.findFirst({
        where: {
          organizationId: invitation.organizationId,
          isDefault: true,
        },
      });
      roleId = defaultRole?.id;
    }

    let supabaseUser;
    try {
      supabaseUser = await this.authService.createUserInSupabase(
        invitation.email,
        data.password,
        {
          role: invitation.role,
          organization_id: organizationId,
          role_id: roleId,
          first_name: data.firstName,
          last_name: data.lastName,
        }
      );
    } catch (error) {
      this.logger.error('Failed to create Supabase user', error);
      throw error;
    }

    if (organizationId && roleId) {
      await this.prisma.user.create({
        data: {
          supabaseId: supabaseUser!.id,
          organizationId,
          roleId,
          email: invitation.email,
          firstName: data.firstName,
          lastName: data.lastName,
          isTenantAdmin: false,
        },
      });
    }

    await this.prisma.invitation.update({
      where: { token: data.token },
      data: { status: 'ACCEPTED' },
    });

    const redirectUrl = invitation.role === 'OPERATOR' ? '/saas' : '/tenant';

    this.logger.log(`Invitation completed for: ${invitation.email}`);

    return {
      userId: supabaseUser!.id,
      organizationId,
      redirectUrl,
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
