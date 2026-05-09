import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard'
import { PharmacyPermissionsGuard } from '../guards/pharmacy-permissions.guard'
import { RequirePharmacyPermission } from '../guards/pharmacy-permissions.decorator'
import { InventoryService } from './inventory.service'
import { RestockDto } from './dto/restock.dto'
import { AdjustStockDto } from './dto/adjust-stock.dto'
import { UpdateBatchDto } from './dto/update-batch.dto'

@ApiTags('pharmacy/inventory')
@Controller('pharmacy/inventory')
@UseGuards(SupabaseAuthGuard, PharmacyPermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List tenant inventory (group by product)' })
  @ApiResponse({ status: 200, description: 'Inventory list' })
  async findAll(@Req() req: any) {
    const organizationId = req.user.organizationId
    return this.inventoryService.findAll(organizationId)
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get product details + batches' })
  @ApiResponse({ status: 200, description: 'Product with batches' })
  async findOne(@Param('productId') productId: string, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.inventoryService.findOne(productId, organizationId)
  }

  @Post('restock')
  @ApiOperation({ summary: 'Restock (new batch or +quantity)' })
  @ApiResponse({ status: 201, description: 'Stock updated' })
  @RequirePharmacyPermission('pharmacy.restock')
  async restock(@Body() dto: RestockDto, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.inventoryService.restock(dto, organizationId, req.user)
  }

  @Patch('adjust')
  @ApiOperation({ summary: 'Manual adjustment (Owner only, requires reason)' })
  @ApiResponse({ status: 200, description: 'Stock adjusted' })
  @RequirePharmacyPermission('pharmacy.adjust')
  async adjust(@Body() dto: AdjustStockDto, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.inventoryService.adjust(dto, organizationId, req.user)
  }

  @Patch('batches/:batchId')
  @ApiOperation({ summary: 'Update batch metadata (batchNumber, quantity, expiryDate)' })
  @ApiResponse({ status: 200, description: 'Batch updated' })
  async updateBatch(@Param('batchId') batchId: string, @Body() dto: UpdateBatchDto, @Req() req: any) {
    const organizationId = req.user.organizationId
    return this.inventoryService.updateBatch(batchId, dto, organizationId)
  }
}
