import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { t } from '@/i18n/translations';
import { UpdateProfileDto, UpdateAvatarDto, UpdateOrganizationDto } from './profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private prisma: PrismaService) {}

  private async getSpecialtiesFromIds(specialtyIds: string[] | null): Promise<Array<{ id: string; nameEn: string; nameEs: string; icon: string }>> {
    if (!specialtyIds || specialtyIds.length === 0) return [];
    
    const specialties = await this.prisma.specialty.findMany({
      where: { id: { in: specialtyIds } }
    });
    
    return specialtyIds
      .map(id => specialties.find(s => s.id === id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined)
      .map(s => ({ id: s.id, nameEn: s.nameEn, nameEs: s.nameEs || '', icon: s.icon || '' }));
  }

  private async getSpecialtyFromValue(value: string): Promise<{ id: string; nameEn: string; nameEs: string; icon: string } | null> {
    if (!value) return null;
    
    // Buscar por ID directo
    const byId = await this.prisma.specialty.findUnique({ where: { id: value } });
    if (byId) return { id: byId.id, nameEn: byId.nameEn, nameEs: byId.nameEs || '', icon: byId.icon || '' };
    
    return null;
  }

  async getProfile(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      include: { role: true, organization: true },
    });

    if (!user) {
      throw new NotFoundException(t('errors.user.notFound', 'es'));
    }

    const roleName = user.userType || user.role?.name || 'COLLABORATOR';
    const isOwner = roleName === 'OWNER' || roleName === 'SUPERADMIN';
    const userSpecialtyIds = user.specialtyIds || [];
    const orgSpecialtyIds = user.organization?.specialtyIds || [];
    const specialtyIds = isOwner ? orgSpecialtyIds : userSpecialtyIds;
    const specialties = await this.getSpecialtiesFromIds(specialtyIds);
    const orgSpecialties = await this.getSpecialtiesFromIds(orgSpecialtyIds);
    const specialtyObj = await this.getSpecialtyFromValue(user.specialty || '');

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: roleName,
        specialty: user.specialty,
        subtype: user.subtype,
        specialtyIds: userSpecialtyIds,
        specialties: specialties,
        specialtyData: specialtyObj,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        type: user.organization.type,
        subscriptionStatus: user.organization.subscriptionStatus,
        specialtyIds: orgSpecialtyIds,
        specialties: orgSpecialties,
      } : undefined,
    };
  }

  async updateProfile(supabaseId: string, data: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      include: { role: true, organization: true },
    });

    if (!user) {
      throw new NotFoundException(t('errors.user.notFound', 'es'));
    }

    const roleName = user.userType || user.role?.name || 'COLLABORATOR';
    const isOwner = roleName === 'OWNER' || roleName === 'SUPERADMIN';

    // Si viene specialtyIds en el DTO, actualizar según el rol
    if (data.specialtyIds !== undefined) {
      if (isOwner && user.organizationId) {
        // OWNER: guardar en organization
        await this.prisma.organization.update({
          where: { id: user.organizationId },
          data: { specialtyIds: data.specialtyIds }
        });
        this.logger.log(`Organization specialties updated for org: ${user.organizationId}`);
      } else {
        // COLLABORATOR: guardar en user
        await this.prisma.user.update({
          where: { supabaseId },
          data: { specialtyIds: data.specialtyIds }
        });
        this.logger.log(`User specialties updated for user: ${supabaseId}`);
      }
    }

    const updated = await this.prisma.user.update({
      where: { supabaseId },
      data: {
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        specialty: data.specialty ?? undefined,
      },
      include: { role: true, organization: true },
    });

    this.logger.log(`Profile updated for user: ${supabaseId}`);

    const userSpecialtyIds = updated.specialtyIds || [];
    const orgSpecialtyIds = updated.organization?.specialtyIds || [];
    const specialtyIds = isOwner ? orgSpecialtyIds : userSpecialtyIds;
    const specialties = await this.getSpecialtiesFromIds(specialtyIds);

    return {
      user: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: roleName,
        specialty: updated.specialty,
        subtype: updated.subtype,
        specialtyIds: updated.specialtyIds,
        specialties: specialties,
        avatar: updated.avatar,
        createdAt: updated.createdAt,
      },
      organization: updated.organization ? {
        id: updated.organization.id,
        name: updated.organization.name,
        slug: updated.organization.slug,
        type: updated.organization.type,
        subscriptionStatus: updated.organization.subscriptionStatus,
      } : undefined,
    };
  }

  async updateAvatar(supabaseId: string, avatar: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new NotFoundException(t('errors.user.notFound', 'es'));
    }

    const updated = await this.prisma.user.update({
      where: { supabaseId },
      data: { avatar },
    });

    this.logger.log(`Avatar updated for user: ${supabaseId}`);

    return { avatar: updated.avatar };
  }

  async updateOrganization(userId: string, orgId: string, data: UpdateOrganizationDto) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId: userId },
    });

    if (!user || user.organizationId !== orgId) {
      throw new NotFoundException('Organization not found');
    }

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        name: data.name ?? undefined,
      },
    });

    this.logger.log(`Organization updated: ${orgId}`);

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      type: updated.type,
      subscriptionStatus: updated.subscriptionStatus,
    };
  }
}
