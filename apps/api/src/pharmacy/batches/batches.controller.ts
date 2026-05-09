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
import { BatchesService } from './batches.service'

@ApiTags('pharmacy/batches')
@Controller('pharmacy/batches')
@UseGuards(SupabaseAuthGuard, PharmacyPermissionsGuard)
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get('expiring')
  @ApiOperation({ summary: 'Get batches expiring in <90 days' })
  @ApiResponse({ status: 200, description: 'Expiring batches' })
  @RequirePharmacyPermission('pharmacy.read')
  async getExpiring(@Query() query: any, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.batchesService.getExpiring(organizationId, query)
  }
}
