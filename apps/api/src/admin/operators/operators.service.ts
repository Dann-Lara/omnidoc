import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OperatorsService {
  private readonly logger = new Logger(OperatorsService.name);

  constructor(private prisma: PrismaService) {}

  async getOperators() {
    return this.prisma.user.findMany({
      where: { userType: 'OPERATOR' },
      include: {
        tenantAssignments: {
          include: {
            tenant: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOperatorById(id: string) {
    const operator = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tenantAssignments: {
          include: {
            tenant: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    return operator;
  }

  async updateOperatorTenants(id: string, tenantIds: string[]) {
    const operator = await this.prisma.user.findUnique({ where: { id } });
    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    await this.prisma.operatorTenant.deleteMany({ where: { operatorId: id } });

    if (tenantIds.length > 0) {
      const assignments = tenantIds.map((tenantId) => ({
        operatorId: id,
        tenantId,
      }));
      await this.prisma.operatorTenant.createMany({ data: assignments });
    }

    return this.getOperatorById(id);
  }

  async deactivateOperator(id: string) {
    const operator = await this.prisma.user.findUnique({ where: { id } });
    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async reactivateOperator(id: string) {
    const operator = await this.prisma.user.findUnique({ where: { id } });
    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }
}