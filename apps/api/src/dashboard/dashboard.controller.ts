import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { DashboardService } from './dashboard.service'

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(SupabaseAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  getStats(@Req() req: Request) {
    const organizationId = (req as any).user.organizationId
    const timezone = (req.headers['x-timezone'] as string) || 'UTC'
    return this.dashboardService.getStats(organizationId, timezone)
  }
}
