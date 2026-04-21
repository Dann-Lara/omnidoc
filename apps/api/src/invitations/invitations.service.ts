import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { t } from '@/i18n/translations';
import type { CreateInvitationDto } from './invitations.dto';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private mailService: MailService,
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
      throw new BadRequestException(t('errors.team.invitationAlreadySent', 'es'));
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
        tenantIds: data.tenantIds || [],
      },
    });

    // Send invitation email
    if (data.role === 'OPERATOR') {
      try {
        await this.mailService.sendInvitationEmail({
          to: data.email,
          inviterName: 'Admin',
          organizationName: 'OmniDoc',
          organizationSlug: 'omnis-saas',
          token: invitation.token,
          roleName: 'Operador',
          roleNameEn: 'Operator',
          expiresInDays: 7,
        });
        this.logger.log(`Invitation email sent to: ${data.email}`);
      } catch (emailError) {
        this.logger.error(`Failed to send invitation email: ${emailError}`);
      }
    }

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
      throw new NotFoundException(t('errors.team.invitationNotFound', 'es'));
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(t('errors.team.invitationAlreadyUsed', 'es'));
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException(t('errors.team.invitationExpired', 'es'));
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      organizationName: invitation.organization?.name,
      organizationId: invitation.organizationId,
      tenantIds: invitation.tenantIds || [],
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
    let operatorOrgId: string | undefined;

    if (invitation.role === 'COLLABORATOR' && invitation.organizationId) {
      const defaultRole = await this.prisma.role.findFirst({
        where: {
          organizationId: invitation.organizationId,
          isDefault: true,
        },
      });
      roleId = defaultRole?.id;
    }

    if (invitation.role === 'OPERATOR') {
      let saasOrg = await this.prisma.organization.findFirst({
        where: { slug: 'omnis-saas' },
      });
      if (!saasOrg) {
        saasOrg = await this.prisma.organization.create({
          data: {
            name: 'OmniDoc SaaS',
            slug: 'omnis-saas',
            type: 'CLINIC',
            subscriptionStatus: 'ACTIVE',
          },
        });
      }
      operatorOrgId = saasOrg.id;
      let defaultRole = await this.prisma.role.findFirst({
        where: { organizationId: operatorOrgId, isDefault: true },
      });
      if (!defaultRole) {
        defaultRole = await this.prisma.role.findFirst({
          where: { organizationId: operatorOrgId, name: 'OPERATOR' },
        });
      }
      if (!defaultRole) {
        defaultRole = await this.prisma.role.create({
          data: {
            name: 'OPERATOR',
            organizationId: operatorOrgId,
            permissions: ['tenants:read', 'specialties:read', 'operators:read'],
            isDefault: true,
          },
        });
      }
      roleId = defaultRole.id;
    }

    let supabaseUser;
    try {
      supabaseUser = await this.authService.createUserInSupabase(
        invitation.email,
        data.password,
        {
          role: invitation.role,
          organization_id: organizationId || operatorOrgId,
          role_id: roleId,
          first_name: data.firstName,
          last_name: data.lastName,
        }
      );
    } catch (error) {
      this.logger.error('Failed to create Supabase user', error);
      throw error;
    }

    const userOrgId = invitation.role === 'OPERATOR' ? operatorOrgId : organizationId;

    this.logger.log(`Creating user - userOrgId: ${userOrgId}, roleId: ${roleId}, supabaseId: ${supabaseUser?.id}`);

    if (!userOrgId) {
      this.logger.error('Missing organizationId for user');
      throw new Error('Organization ID is required');
    }

    if (!roleId) {
      this.logger.error('Missing roleId for user');
      throw new Error('Role ID is required');
    }

    if (userOrgId && roleId) {
      const newUser = await this.prisma.user.create({
        data: {
          supabaseId: supabaseUser!.id,
          organizationId: userOrgId,
          roleId,
          email: invitation.email,
          firstName: data.firstName,
          lastName: data.lastName,
          userType: invitation.role,
          subtype: invitation.role === 'OPERATOR' ? 'OPERATOR' : 'COLLABORATOR',
        },
      });

      if (invitation.role === 'OPERATOR' && invitation.tenantIds?.length) {
        for (const tenantId of invitation.tenantIds) {
          await this.prisma.operatorTenant.create({
            data: {
              operatorId: newUser.id,
              tenantId,
            },
          });
        }
      }
    }

    await this.prisma.invitation.update({
      where: { token: data.token },
      data: { status: 'ACCEPTED' },
    });

    const redirectUrl = invitation.role === 'OPERATOR' ? '/admin' : '/tenant';

    this.logger.log(`Invitation completed for: ${invitation.email}`);

    return {
      userId: supabaseUser!.id,
      organizationId: userOrgId,
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
