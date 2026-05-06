import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, NotFoundException, Logger, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { t } from '@/i18n/translations';

@ApiTags('specialties')
@Controller()
export class SpecialtiesController {
  private readonly logger = new Logger(SpecialtiesController.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  @Get('specialties')
  @ApiOperation({ summary: 'Get all active specialties' })
  @ApiResponse({ status: 200, description: 'List of specialties' })
  async findAll() {
    const specialties = await this.prisma.specialty.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' }
    });
    return specialties.map(s => ({
      id: s.id,
      nameEn: s.nameEn,
      nameEs: s.nameEs,
      icon: s.icon,
      descriptionEn: s.descriptionEn,
      descriptionEs: s.descriptionEs,
      isActive: s.isActive,
    }));
  }

  @Get('specialties/:id')
  @ApiOperation({ summary: 'Get specialty by ID' })
  @ApiResponse({ status: 200, description: 'Specialty found' })
  @ApiResponse({ status: 404, description: 'Specialty not found' })
  async findById(@Param('id') id: string) {
    const specialty = await this.prisma.specialty.findUnique({ where: { id } });
    if (!specialty) {
      throw new NotFoundException(t('errors.specialty.notFound', 'es', { id }));
    }
    return specialty;
  }

  @Get('admin/specialties')
  @ApiOperation({ summary: 'Get all specialties (admin)' })
  @ApiResponse({ status: 200, description: 'List of all specialties' })
  async findAllAdmin() {
    return this.prisma.specialty.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get('admin/specialties/stats')
  @ApiOperation({ summary: 'Get specialties statistics' })
  @ApiResponse({ status: 200, description: 'Specialties stats' })
  async getSpecialtiesStats() {
    const [specialties, allOrgs] = await Promise.all([
      this.prisma.specialty.findMany(),
      this.prisma.organization.findMany({
        select: { specialtyIds: true }
      })
    ]);

    const totalSpecialties = specialties.length;
    const activeSpecialties = specialties.filter(s => s.isActive).length;

    const usageCount: Record<string, number> = {};
    allOrgs.forEach(org => {
      org.specialtyIds?.forEach(specId => {
        usageCount[specId] = (usageCount[specId] || 0) + 1;
      });
    });

    const sortedUsage = Object.entries(usageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topSpecialties = sortedUsage
      .map(([id, count]) => {
        const spec = specialties.find(s => s.id === id);
        return spec ? { ...spec, usageCount: count } : null;
      })
      .filter(Boolean);

    return {
      totalSpecialties,
      activeSpecialties,
      mostUsedCount: topSpecialties[0]?.usageCount || 0,
      topSpecialties
    };
  }

  @Post('admin/specialties')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new specialty (superadmin)' })
  @ApiResponse({ status: 201, description: 'Specialty created' })
  async create(@Body() data: any) {
    return this.prisma.specialty.create({
      data: {
        nameEn: data.nameEn,
        nameEs: data.nameEs,
        icon: data.icon,
        descriptionEn: data.descriptionEn,
        descriptionEs: data.descriptionEs,
        isActive: true,
      }
    });
  }

  @Patch('admin/specialties/:id')
  @ApiOperation({ summary: 'Update specialty (superadmin)' })
  @ApiResponse({ status: 200, description: 'Specialty updated' })
  async update(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.prisma.specialty.update({
        where: { id },
        data: {
          nameEn: data.nameEn,
          nameEs: data.nameEs,
          icon: data.icon,
          descriptionEn: data.descriptionEn,
          descriptionEs: data.descriptionEs,
          isActive: data.isActive,
          configSchema: data.configSchema,
        }
      });
    } catch (error) {
      throw new NotFoundException(t('errors.specialty.notFound', 'es', { id }));
    }
  }

  @Delete('admin/specialties/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete specialty (superadmin)' })
  @ApiResponse({ status: 204, description: 'Specialty deleted' })
  async delete(@Param('id') id: string) {
    try {
      await this.prisma.specialty.update({
        where: { id },
        data: { isActive: false }
      });
    } catch (error) {
      throw new NotFoundException(t('errors.specialty.notFound', 'es', { id }));
    }
  }

  @Get('my-specialties')
  @ApiOperation({ summary: 'Get tenant specialties' })
  @ApiResponse({ status: 200, description: 'List of tenant specialties with volume' })
  async getMySpecialties(@Req() req: Request) {
    const accessToken = (req as Request & { cookies?: Record<string, string> }).cookies?.['sb-access-token'];
    
    if (!accessToken) {
      const specialties = await this.prisma.specialty.findMany({
        where: { isActive: true }
      });
      return specialties.map(s => ({
        ...s,
        appointmentCount: 0,
        assignedAt: null,
      }));
    }
    
    let supabaseId: string | null = null;
    try {
      const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
      supabaseId = payload.sub || payload.user_id;
    } catch {
      supabaseId = null;
    }
    
    if (!supabaseId) {
      const specialties = await this.prisma.specialty.findMany({
        where: { isActive: true }
      });
      return specialties.map(s => ({
        ...s,
        appointmentCount: 0,
        assignedAt: null,
      }));
    }
    
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { organizationId: true, userType: true, specialtyIds: true },
    });
    
    if (!user?.organizationId) {
      const specialties = await this.prisma.specialty.findMany({
        where: { isActive: true }
      });
      return specialties.map(s => ({
        ...s,
        appointmentCount: 0,
        assignedAt: null,
      }));
    }
    
    let assignedIds: string[] = [];
    
    if (user.userType === 'COLLABORATOR' && user.specialtyIds && user.specialtyIds.length > 0) {
      assignedIds = user.specialtyIds;
      this.logger.log(`GET - user is COLLABORATOR, using user specialtyIds: ${JSON.stringify(assignedIds)}`);
    } else {
      const org = await this.prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: { specialtyIds: true },
      });
      assignedIds = org?.specialtyIds || [];
      this.logger.log(`GET - user is ${user.userType || 'OWNER'}, using org specialtyIds: ${JSON.stringify(assignedIds)}`);
    }
    
    const allSpecialties = await this.prisma.specialty.findMany({
      where: { isActive: true },
    });
    
    const counts = await this.prisma.appointment.groupBy({
      by: ['specialtyId'],
      where: {
        organizationId: user.organizationId,
        specialtyId: { in: assignedIds },
      },
      _count: { specialtyId: true },
    })
    
    const countMap = new Map(
      counts.map(c => [c.specialtyId!, c._count.specialtyId])
    )
    
    return allSpecialties.map(s => ({
      ...s,
      appointmentCount: countMap.get(s.id) || 0,
      assignedAt: assignedIds.includes(s.id) ? new Date().toISOString() : null,
    }));
  }

  @Post('my-specialties')
  @ApiOperation({ summary: 'Assign specialty to tenant' })
  @ApiResponse({ status: 201, description: 'Specialty assigned' })
  assignSpecialty(@Body() body: { specialtyId: string }) {
    return { message: 'Specialty assigned', specialtyId: body.specialtyId };
  }

  @Get('my-specialties/for-notes')
  @ApiOperation({ summary: 'Get specialties for notes (filtered by role)' })
  @ApiResponse({ status: 200, description: 'List of specialties based on user role' })
  async getSpecialtiesForNotes(@Req() req: any) {
    const accessToken = req.cookies?.['sb-access-token'];
    
    if (!accessToken) {
      return [];
    }
    
    let supabaseId: string | null = null;
    try {
      const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
      supabaseId = payload.sub || payload.user_id;
    } catch {
      return [];
    }
    
    if (!supabaseId) {
      return [];
    }
    
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { organizationId: true, userType: true, specialtyIds: true },
    });
    
    if (!user?.organizationId) {
      return [];
    }
    
    let specialtyIds: string[] = [];
    
    if (user.userType === 'COLLABORATOR') {
      specialtyIds = user.specialtyIds || [];
    } else {
      const org = await this.prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: { specialtyIds: true },
      });
      specialtyIds = org?.specialtyIds || [];
    }
    
    if (specialtyIds.length === 0) {
      return [];
    }
    
    return this.prisma.specialty.findMany({
      where: { id: { in: specialtyIds }, isActive: true },
      select: { id: true, nameEn: true, nameEs: true },
      orderBy: { nameEn: 'asc' },
    });
  }

  @Put('my-specialties')
  @ApiOperation({ summary: 'Update tenant specialties' })
  @ApiResponse({ status: 200, description: 'Specialties updated' })
  async updateMySpecialties(@Body() body: { organizationId: string; specialtyIds: string[] }) {
    const { organizationId, specialtyIds } = body;
    this.logger.log(`PUT - orgId: ${organizationId}, specialtyIds: ${JSON.stringify(specialtyIds)}`);
    
    try {
      await this.prisma.organization.update({
        where: { id: organizationId },
        data: { specialtyIds: specialtyIds },
      });
      
      const saved = await this.prisma.organization.findUnique({
        where: { id: organizationId },
        select: { specialtyIds: true },
      });
      this.logger.log(`PUT - verified specialtyIds: ${JSON.stringify(saved?.specialtyIds)}`);
    } catch (error) {
      this.logger.error(`PUT - Failed: ${error}`);
      throw error;
    }
    
    return { message: 'Specialties updated', specialtyIds };
  }
}
