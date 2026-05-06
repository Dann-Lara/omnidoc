import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { t } from '@/i18n/translations';
import { 
  CreateTeamInvitationDto, 
  UpdateTeamMemberDto,
  TeamQueryDto 
} from './team.dto';

const DEFAULT_USER_TYPES = {
  doctor: {
    name: 'Médico',
    nameEn: 'Doctor',
    description: 'Profesional médico con licencia',
    descriptionEn: 'Licensed medical professional',
    icon: 'medical_services',
    dashboard: '/specialties',
    permissions: ['appointments:read', 'appointments:write', 'patients:read', 'patients:write', 'clinical_history:read', 'clinical_history:write'],
    canHaveSpecialties: true,
    canViewOwnOnly: true,
  },
  nurse: {
    name: 'Enfermero',
    nameEn: 'Nurse',
    description: 'Personal de enfermería',
    descriptionEn: 'Nursing staff',
    icon: 'health_and_safety',
    dashboard: '/nursing',
    permissions: ['appointments:read', 'patients:read', 'clinical_history:read'],
    canHaveSpecialties: true,
    canViewOwnOnly: false,
  },
  receptionist: {
    name: 'Recepcionista',
    nameEn: 'Receptionist',
    description: 'Personal de recepción',
    descriptionEn: 'Reception staff',
    icon: 'desk',
    dashboard: '/reception',
    permissions: ['appointments:read', 'appointments:write', 'patients:read', 'patients:write'],
    canHaveSpecialties: true,
    canViewOwnOnly: false,
  },
  subadmin: {
    name: 'Subadministrador',
    nameEn: 'Subadmin',
    description: 'Administrador de área',
    descriptionEn: 'Area administrator',
    icon: 'admin_panel_settings',
    dashboard: '/admin',
    permissions: ['inventory:read', 'inventory:write', 'users:read', 'users:manage', 'settings:read', 'settings:manage'],
    canHaveSpecialties: true,
    canViewOwnOnly: false,
  },
};

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  async getUserBySupabaseId(supabaseId: string) {
    return this.prisma.user.findFirst({
      where: { supabaseId },
      select: { id: true, organizationId: true, userType: true },
    });
  }

  async getTeam(organizationId: string, query: TeamQueryDto) {
    const { page, limit, status, userType, specialtyId, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { organizationId, userType: 'COLLABORATOR' };

    if (status) {
      where.status = status;
    }
    if (userType) {
      where.userType = userType;
    }
    if (specialtyId) {
      where.specialtyIds = { has: specialtyId };
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userType: true,
          subtype: true,
          specialtyIds: true,
          specialty: true,
          avatar: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          role: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ])

    const allSpecialtyIds = [...new Set(members.flatMap(m => m.specialtyIds))]
    const specialties = allSpecialtyIds.length > 0
      ? await this.prisma.specialty.findMany({
          where: { id: { in: allSpecialtyIds } },
          select: { id: true, nameEn: true, nameEs: true },
        })
      : []
    const specialtyMap = new Map(specialties.map(s => [s.id, s]))

    const membersWithSpecialties = members.map(m => ({
      ...m,
      specialties: m.specialtyIds
        .map(id => specialtyMap.get(id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
        .map(s => ({
          specialtyId: s.id,
          specialty: {
            name: s.nameEs || s.nameEn,
          },
        })),
    }))

    return {
      data: membersWithSpecialties,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getTeamMember(userId: string, organizationId: string) {
    const member = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        subtype: true,
        specialtyIds: true,
        specialty: true,
        avatar: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        role: {
          select: { id: true, name: true },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(t('errors.team.memberNotFound', 'es'));
    }

    return member;
  }

  async updateTeamMember(userId: string, organizationId: string, data: UpdateTeamMemberDto) {
    const existing = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(t('errors.team.memberNotFound', 'es'));
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        subtype: data.subtype,
        specialtyIds: data.specialtyIds,
        permissions: data.permissions as any,
        status: data.status,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        subtype: true,
        specialtyIds: true,
        specialty: true,
        avatar: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        role: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async deactivateTeamMember(userId: string, organizationId: string) {
    const existing = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(t('errors.team.memberNotFound', 'es'));
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' as any },
    });
  }

  async createInvitation(data: CreateTeamInvitationDto & { organizationId: string; invitedBy: string }) {
    this.logger.log(`Creating invitation for: ${data.email}, userType: ${data.userType}`);

    const existingUser = await this.prisma.user.findFirst({
      where: { email: data.email, organizationId: data.organizationId },
    });

    if (existingUser) {
      throw new BadRequestException(t('errors.team.userAlreadyExists', 'es'));
    }

    const pendingInvitation = await this.prisma.teamInvitation.findFirst({
      where: { email: data.email, organizationId: data.organizationId, status: 'PENDING' },
    });

    if (pendingInvitation) {
      throw new BadRequestException(t('errors.team.invitationAlreadySent', 'es'));
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const defaultRole = await this.prisma.role.findFirst({
      where: { organizationId: data.organizationId, isDefault: true },
    });

    if (!defaultRole) {
      throw new NotFoundException(t('errors.team.defaultRoleNotFound', 'es'));
    }

    const invitation = await this.prisma.teamInvitation.create({
      data: {
        organizationId: data.organizationId,
        email: data.email,
        userType: 'COLLABORATOR',
        subtype: data.subtype || data.userType,
        specialtyIds: data.specialtyIds || [],
        permissions: data.permissions as any,
        roleId: defaultRole.id,
        invitedBy: data.invitedBy,
        expiresAt,
        token,
      },
    });

    this.logger.log(`Invitation created: ${invitation.id}`);

    // Send invitation email
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: data.organizationId },
      });
      const invitedByUser = await this.prisma.user.findUnique({
        where: { id: data.invitedBy },
      });
      const userTypes = (organization?.settings as any)?.userTypes || {};
      const roleConfig = userTypes[data.userType] || {};
      const orgSettings = organization?.settings as any || {};
      const lang = orgSettings?.lang || 'es';

      await this.mailService.sendInvitationEmail({
        to: data.email,
        inviterName: invitedByUser ? `${invitedByUser.firstName} ${invitedByUser.lastName}` : 'The administrator',
        organizationName: organization?.name || 'the clinic',
        organizationSlug: organization?.slug || '',
        token: invitation.token,
        roleName: roleConfig.name || roleConfig.nameEn || data.userType,
        roleNameEn: roleConfig.nameEn || roleConfig.name || data.userType,
        expiresInDays: 7,
        lang,
      });
    } catch (emailError) {
      this.logger.error(`Failed to send invitation email: ${emailError}`);
    }

    return invitation;
  }

  async resendInvitation(invitationId: string, organizationId: string) {
    const invitation = await this.prisma.teamInvitation.findFirst({
      where: { id: invitationId, organizationId },
    });

    if (!invitation) {
      throw new NotFoundException(t('errors.team.invitationNotFound', 'es'));
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(t('errors.team.invitationNotPending', 'es'));
    }

    const newToken = randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
      },
    });

    // Send resend email
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });
      const invitedByUser = await this.prisma.user.findUnique({
        where: { id: invitation.invitedBy },
      });
      const userTypes = (organization?.settings as any)?.userTypes || {};
      const roleConfig = userTypes[invitation.userType] || {};

      await this.mailService.sendInvitationEmail({
        to: invitation.email,
        inviterName: invitedByUser ? `${invitedByUser.firstName} ${invitedByUser.lastName}` : 'The administrator',
        organizationName: organization?.name || 'the clinic',
        organizationSlug: organization?.slug || '',
        token: updated.token,
        roleName: roleConfig.name || roleConfig.nameEn || invitation.userType,
        roleNameEn: roleConfig.nameEn || roleConfig.name || invitation.userType,
        expiresInDays: 7,
      });
    } catch (emailError) {
      this.logger.error(`Failed to resend invitation email: ${emailError}`);
    }

    return updated;
  }

  async revokeInvitation(invitationId: string, organizationId: string) {
    const invitation = await this.prisma.teamInvitation.findFirst({
      where: { id: invitationId, organizationId },
    });

    if (!invitation) {
      throw new NotFoundException(t('errors.team.invitationNotFound', 'es'));
    }

    return this.prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'REVOKED' },
    });
  }

  async getInvitations(organizationId: string) {
    return this.prisma.teamInvitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async getUserTypes(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    const orgSettings = organization?.settings as any;
    const customUserTypes = orgSettings?.userTypes || {};
    
    this.logger.log(`[getUserTypes] orgId: ${organizationId}, customTypes:`, JSON.stringify(customUserTypes));
    return customUserTypes;
  }

  async updateUserTypes(organizationId: string, userTypes: Record<string, any>) {
    this.logger.log(`[updateUserTypes] Receiving from frontend:`, JSON.stringify(userTypes));
    
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    const currentSettings = (organization?.settings as any) || {};
    
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        settings: {
          ...currentSettings,
          userTypes: userTypes,
        },
      },
    });

    this.logger.log(`User types updated for organization: ${organizationId}`);
    return { success: true, userTypes };
  }

  async validateInvitationComplete(token: string) {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
        role: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException(t('errors.team.invitationNotFound', 'es'));
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(t('errors.team.invitationNotPending', 'es'));
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException(t('errors.team.invitationExpired', 'es'));
    }

    return invitation;
  }

  async completeInvitation(data: {
    token: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    const invitation = await this.validateInvitationComplete(data.token);

    const supabaseUser = await this.authService.createUserInSupabase(
      invitation.email,
      data.password,
      {
        userType: invitation.userType,
        organization_id: invitation.organizationId,
        first_name: data.firstName,
        last_name: data.lastName,
      }
    );

    const user = await this.prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        organizationId: invitation.organizationId,
        roleId: invitation.roleId,
        email: invitation.email,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: 'COLLABORATOR',
        subtype: invitation.subtype,
        specialtyIds: invitation.specialtyIds,
        permissions: invitation.permissions as any,
      },
    });

    await this.prisma.teamInvitation.update({
      where: { token: data.token },
      data: { status: 'ACCEPTED' as any },
    });

    this.logger.log(`Invitation completed for: ${invitation.email}`);

    const organization = await this.prisma.organization.findUnique({
      where: { id: invitation.organizationId },
    });

    return {
      userId: user.id,
      organizationId: invitation.organizationId,
      organizationSlug: organization?.slug || '',
      redirectUrl: `/${organization?.slug || ''}/dashboard`,
    };
  }

  private flattenPermissions(permissions: Record<string, any>): string[] {
    const result: string[] = [];
    
    for (const [module, perms] of Object.entries(permissions)) {
      if (typeof perms === 'object' && perms !== null) {
        for (const [action, enabled] of Object.entries(perms)) {
          if (enabled) {
            result.push(`${module}:${action}`);
          }
        }
      } else if (perms === true) {
        result.push(module);
      }
    }
    
    return result;
  }
}