import { Controller, Get, Param, Put, Delete, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OperatorsService } from './operators.service';
import { IsSuperadminGuard } from '../../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';

@ApiTags('admin - operators')
@Controller('admin/operators')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all operators' })
  @ApiResponse({ status: 200, description: 'Operators list' })
  async getOperators() {
    return this.operatorsService.getOperators();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get operator by ID' })
  @ApiResponse({ status: 200, description: 'Operator details' })
  @ApiResponse({ status: 404, description: 'Operator not found' })
  async getOperator(@Param('id') id: string) {
    return this.operatorsService.getOperatorById(id);
  }

  @Put(':id/tenants')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard, IsSuperadminGuard)
  @ApiOperation({ summary: 'Update operator tenant assignments' })
  @ApiResponse({ status: 200, description: 'Tenants updated' })
  async updateTenants(
    @Param('id') id: string,
    @Body() body: { tenantIds: string[] },
  ) {
    return this.operatorsService.updateOperatorTenants(id, body.tenantIds);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard, IsSuperadminGuard)
  @ApiOperation({ summary: 'Deactivate operator' })
  @ApiResponse({ status: 200, description: 'Operator deactivated' })
  async deactivateOperator(@Param('id') id: string) {
    return this.operatorsService.deactivateOperator(id);
  }

  @Put(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard, IsSuperadminGuard)
  @ApiOperation({ summary: 'Reactivate operator' })
  @ApiResponse({ status: 200, description: 'Operator reactivated' })
  async reactivateOperator(@Param('id') id: string) {
    return this.operatorsService.reactivateOperator(id);
  }
}