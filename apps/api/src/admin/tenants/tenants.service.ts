import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface TenantFilters {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  operatorId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  planName: string | null;
  planPrice: number;
  mrr: number;
  collaboratorsCount: number;
  status: string;
  createdAt: Date;
  owner?: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
}

export interface TenantsResponse {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TenantStats {
  totalTenants: number;
  tenantsGrowth: number;
  totalMRR: number;
  mrrGrowth: number;
  activeUsers: number;
  churnRiskCount: number;
}

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private prisma: PrismaService) {}

  async getTenants(filters: TenantFilters): Promise<TenantsResponse> {
    const { page = 1, limit = 10, status, plan, search, sortBy = 'createdAt', sortOrder = 'desc', operatorId } = filters;

    const where: any = {};
    
    // Solo organizaciones que tienen al menos un usuario con rol CLIENT (owner)
    where.users = {
      some: {
        role: {
          name: 'owner',
        },
      },
    };
    
    if (operatorId) {
      const operator = await this.prisma.user.findUnique({
        where: { id: operatorId },
        include: { tenantAssignments: true },
      });
      const tenantIds = operator?.tenantAssignments.map(t => t.tenantId) || [];
      if (tenantIds.length === 0) {
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      }
      where.id = { in: tenantIds };
    }
    
    if (status && status !== 'ALL') {
      where.subscriptionStatus = status;
    }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const validSortFields = ['createdAt', 'name', 'subscriptionStatus'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [orderByField]: orderByDirection },
        include: {
          users: {
            where: { role: { name: 'owner' } },
            take: 1,
          },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    const mappedData: Tenant[] = data.map((org: any) => {
      const owner = org.users[0];
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        planName: org.type || null,
        planPrice: 0,
        mrr: 0,
        collaboratorsCount: org.users.length,
        status: org.subscriptionStatus,
        createdAt: org.createdAt,
        owner: owner ? {
          id: owner.id,
          name: `${owner.firstName} ${owner.lastName}`,
          avatar: owner.avatar,
        } : null,
      };
    });

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTenantStats(): Promise<TenantStats> {
    const ownerUserWhere = {
      users: {
        some: {
          role: {
            name: 'owner',
          },
        },
      },
    };

    const [
      totalTenants,
      activeTenants,
      allUsers,
      churnRiskCount,
    ] = await Promise.all([
      this.prisma.organization.count({ where: ownerUserWhere }),
      this.prisma.organization.count({
        where: { ...ownerUserWhere, subscriptionStatus: 'ACTIVE' },
      }),
      this.prisma.user.count({
        where: {
          organization: ownerUserWhere,
        },
      }),
      this.prisma.organization.count({
        where: { ...ownerUserWhere, subscriptionStatus: 'CANCELED' as any },
      }),
    ]);

    return {
      totalTenants,
      tenantsGrowth: 4.2,
      totalMRR: 428500,
      mrrGrowth: 12,
      activeUsers: allUsers,
      churnRiskCount,
    };
  }

  async getTenantById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  async updateTenantStatus(id: string, status: string) {
    return this.prisma.organization.update({
      where: { id },
      data: { subscriptionStatus: status as any },
    });
  }

  async getTenantDetails(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          where: { userType: 'OWNER' },
          take: 1,
        },
      },
    });

    if (!org) return null;

    const [totalUsers, totalSpecialties, totalAppointments, recentAppointments] = await Promise.all([
      this.prisma.user.count({ where: { organizationId: id } }),
      this.prisma.tenantSpecialty.count({ where: { tenantId: id } }),
      this.prisma.appointment.count({ where: { organizationId: id } }),
      this.prisma.appointment.findMany({
        where: { organizationId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          patient: true,
          user: true,
        },
      }),
    ]);

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      status: org.subscriptionStatus,
      type: org.type,
      planId: org.planId,
      features: org.features,
      branding: org.branding,
      settings: org.settings,
      createdAt: org.createdAt,
      owner: org.users[0] || null,
      stats: {
        totalUsers,
        activeDoctors: totalUsers,
        totalSpecialties,
        totalAppointments,
        storageUsedGB: 1.2,
        storageCapacityTB: 2,
      },
      recentAppointments,
    };
  }

  async deleteTenant(id: string): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.deleteMany({ where: { organizationId: id } });
        
        await tx.appointment.deleteMany({ where: { organizationId: id } });
        await tx.patient.deleteMany({ where: { organizationId: id } });
        await tx.tenantSpecialty.deleteMany({ where: { tenantId: id } });
        await tx.invitation.deleteMany({ where: { organizationId: id } });
        await tx.teamInvitation.deleteMany({ where: { organizationId: id } });
        await tx.auditLog.deleteMany({ where: { organizationId: id } });
        await tx.role.deleteMany({ where: { organizationId: id } });
        await tx.subscription.deleteMany({ where: { organizationId: id } });
        await tx.organization.delete({ where: { id } });
      });

      this.logger.log(`Tenant ${id} deleted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete tenant ${id}:`, error);
      return false;
    }
  }
}