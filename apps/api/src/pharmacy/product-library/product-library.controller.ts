import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard'
import { PharmacyPermissionsGuard } from '../guards/pharmacy-permissions.guard'
import { RequirePharmacyPermission } from '../guards/pharmacy-permissions.decorator'
import { ProductLibraryService } from './product-library.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@ApiTags('pharmacy/products')
@Controller('pharmacy/products')
@UseGuards(SupabaseAuthGuard, PharmacyPermissionsGuard)
export class ProductLibraryController {
  constructor(private readonly productLibraryService: ProductLibraryService) {}

  @Get()
  @ApiOperation({ summary: 'List product catalog (SUPERADMIN only)' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async findAll(@Query() query: any, @Req() req: any) {
    return this.productLibraryService.findAll(query, req.user)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details' })
  @ApiResponse({ status: 200, description: 'Product details' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.productLibraryService.findOne(id, req.user)
  }

  @Post()
  @ApiOperation({ summary: 'Create product in catalog (SUPERADMIN)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @RequirePharmacyPermission('pharmacy.create')
  async create(@Body() dto: CreateProductDto, @Req() req: any) {
    return this.productLibraryService.create(dto, req.user)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product metadata (SUPERADMIN)' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @RequirePharmacyPermission('pharmacy.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productLibraryService.update(id, dto, req.user)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate product (soft delete) (SUPERADMIN)' })
  @ApiResponse({ status: 200, description: 'Product deactivated' })
  @RequirePharmacyPermission('pharmacy.delete')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.productLibraryService.remove(id, req.user)
  }
}
