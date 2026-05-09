import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard'
import { PharmacyPermissionsGuard } from '../guards/pharmacy-permissions.guard'
import { RequirePharmacyPermission } from '../guards/pharmacy-permissions.decorator'
import { DispensingService } from './dispensing.service'
import { DispenseDto } from './dto/dispense.dto'

@ApiTags('pharmacy/dispens')
@Controller('pharmacy/dispens')
@UseGuards(SupabaseAuthGuard, PharmacyPermissionsGuard)
export class DispensingController {
  constructor(private readonly dispensingService: DispensingService) {}

  @Post()
  @ApiOperation({ summary: 'Dispense medication (FEFO)' })
  @ApiResponse({ status: 201, description: 'Medication dispensed' })
  @RequirePharmacyPermission('pharmacy.dispens')
  async dispense(@Body() dto: DispenseDto, @Req() req: any) {
    return this.dispensingService.dispense(dto, req.user)
  }

  @Get('history')
  @ApiOperation({ summary: 'Dispensing history' })
  @ApiResponse({ status: 200, description: 'History list' })
  async getHistory(@Req() req: any) {
    const organizationId = req.user.organizationId
    return this.dispensingService.getHistory(organizationId)
  }
}
