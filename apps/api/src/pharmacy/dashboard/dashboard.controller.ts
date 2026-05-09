import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard'
import { PharmacyPermissionsGuard } from '../guards/pharmacy-permissions.guard'
import { RequirePharmacyPermission } from '../guards/pharmacy-permissions.decorator'
import { DashboardService } from './dashboard.service'

@ApiTags('pharmacy/dashboard')
@Controller('pharmacy/dashboard')
@UseGuards(SupabaseAuthGuard, PharmacyPermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'KPIs: total stock, expiring, security stock' })
  @ApiResponse({ status: 200, description: 'Dashboard summary' })
  @RequirePharmacyPermission('pharmacy.read')
  async getSummary(@Req() req: any) {
    const organizationId = req.user.organizationId
    return this.dashboardService.getSummary(organizationId)
  }

  @Get('security-stock')
  @ApiOperation({ summary: 'Security stock dynamic (30 days)' })
  @ApiResponse({ status: 200, description: 'Security stock info' })
  @RequirePharmacyPermission('pharmacy.read')
  async getSecurityStock(@Query('productId') productId: string, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.dashboardService.getSecurityStock(organizationId, productId)
  }

  @Get('security-stock-list')
  @ApiOperation({ summary: 'All products with security stock comparison' })
  @ApiResponse({ status: 200, description: 'Security stock list per product' })
  @RequirePharmacyPermission('pharmacy.read')
  async getSecurityStockList(@Req() req: any) {
    const organizationId = req.user.organizationId
    return this.dashboardService.getSecurityStockList(organizationId)
  }

  @Get('procurement')
  @ApiOperation({ summary: 'Purchase priority (<7 days)' })
  @ApiResponse({ status: 200, description: 'Procurement list' })
  @RequirePharmacyPermission('pharmacy.read')
  async getProcurement(@Req() req: any) {
    const organizationId = req.user.organizationId
    return this.dashboardService.getProcurement(organizationId)
  }

  @Get('alternatives')
  @ApiOperation({ summary: 'Substitutes by same active substance' })
  @ApiResponse({ status: 200, description: 'Alternatives list' })
  @RequirePharmacyPermission('pharmacy.read')
  async getAlternatives(@Query('productId') productId: string, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.dashboardService.getAlternatives(organizationId, productId)
  }
}
