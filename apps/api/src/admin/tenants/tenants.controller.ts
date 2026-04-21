import { Controller, Get, Param, Put, Delete, Body, Query, HttpCode, HttpStatus, Logger, ParseIntPipe, DefaultValuePipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';

@ApiTags('admin - tenants')
@Controller('admin/tenants')
export class TenantsController {
  private readonly logger = new Logger(TenantsController.name);

  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated tenants list' })
  @ApiResponse({ status: 200, description: 'Tenants list' })
  async getTenants(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status: string = '',
    @Query('plan') plan: string = '',
    @Query('search') search: string = '',
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'desc',
  ) {
    const userRole = req.user?.user_metadata?.role;
    const userId = req.user?.id;

    const result = await this.tenantsService.getTenants({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      plan,
      search,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      operatorId: userRole === 'OPERATOR' ? userId : undefined,
    });
    return result;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tenants KPIs/stats' })
  @ApiResponse({ status: 200, description: 'Tenant statistics' })
  async getTenantStats() {
    return this.tenantsService.getTenantStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant details' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantById(@Param('id') id: string) {
    const tenant = await this.tenantsService.getTenantById(id);
    if (!tenant) {
      return { error: 'Tenant not found' };
    }
    return tenant;
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get tenant detailed view' })
  @ApiResponse({ status: 200, description: 'Tenant detailed information' })
  async getTenantDetails(@Param('id') id: string) {
    return this.tenantsService.getTenantDetails(id);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const updated = await this.tenantsService.updateTenantStatus(id, body.status);
    return { message: 'Status updated', tenant: updated };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a tenant and all associated data' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async deleteTenant(@Param('id') id: string) {
    this.logger.log(`Deleting tenant: ${id}`);
    const result = await this.tenantsService.deleteTenant(id);
    if (!result) {
      return { error: 'Tenant not found' };
    }
    return { message: 'Tenant deleted successfully' };
  }
}