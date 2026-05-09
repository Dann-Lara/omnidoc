import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { RestockDto } from './dto/restock.dto'
import { AdjustStockDto } from './dto/adjust-stock.dto'
import { UpdateBatchDto } from './dto/update-batch.dto'

const toSafeDate = (date: Date): Date => {
  const d = new Date(date)
  d.setUTCHours(12, 0, 0, 0)
  return d
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    const products = await this.prisma.productLibrary.findMany({
      where: { isActive: true },
      orderBy: { commercialName: 'asc' },
    })

    const batches = await this.prisma.inventoryBatch.findMany({
      where: { tenantId: organizationId },
      orderBy: { expiryDate: 'asc' },
    })

    const batchesByProduct = batches.reduce((acc: any, batch: any) => {
      if (!acc[batch.productId]) acc[batch.productId] = []
      acc[batch.productId].push(batch)
      return acc
    }, {})

    return products.map(product => ({
      product,
      totalStock: batchesByProduct[product.id]?.reduce((s: number, b: any) => s + b.quantity, 0) ?? 0,
      batches: batchesByProduct[product.id] ?? [],
    }))
  }

  async findOne(productId: string, organizationId: string) {
    const product = await this.prisma.productLibrary.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId: organizationId,
        productId,
      },
      orderBy: { expiryDate: 'asc' },
    })

    const totalStock = batches.reduce((sum: number, b: any) => sum + b.quantity, 0)

    return {
      product,
      totalStock,
      batches,
    }
  }

  async restock(dto: RestockDto, organizationId: string, user: any) {
    const product = await this.prisma.productLibrary.findUnique({
      where: { id: dto.productId },
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const existingBatch = await this.prisma.inventoryBatch.findFirst({
      where: {
        tenantId: organizationId,
        productId: dto.productId,
        batchNumber: dto.batchNumber,
        expiryDate: toSafeDate(new Date(dto.expiryDate)),
      },
    })

    const data: any = {
      quantity: existingBatch ? existingBatch.quantity + dto.quantity : dto.quantity,
    }
    if (dto.costPerBox !== undefined) data.costPerBox = dto.costPerBox

    if (existingBatch) {
      return this.prisma.inventoryBatch.update({
        where: { id: existingBatch.id },
        data,
      })
    }

    return this.prisma.inventoryBatch.create({
      data: {
        tenantId: organizationId,
        productId: dto.productId,
        batchNumber: dto.batchNumber,
        quantity: dto.quantity,
        costPerBox: dto.costPerBox ?? null,
        expiryDate: toSafeDate(new Date(dto.expiryDate)),
      },
    })
  }

  async adjust(dto: AdjustStockDto, organizationId: string, user: any) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Only Owner can adjust stock')
    }

    const batch = await this.prisma.inventoryBatch.findFirst({
      where: {
        id: dto.batchId,
        tenantId: organizationId,
      },
    })

    if (!batch) {
      throw new NotFoundException('Batch not found')
    }

    const newQuantity = dto.type === 'ADJUSTED' ? 
      Math.max(0, batch.quantity + dto.quantity) : 
      Math.max(0, batch.quantity - dto.quantity)

    await this.prisma.inventoryLog.create({
      data: {
        tenantId: organizationId,
        batchId: batch.id,
        doctorId: user.id,
        type: dto.type,
        quantity: dto.quantity,
        reason: dto.reason,
      },
    })

    return this.prisma.inventoryBatch.update({
      where: { id: batch.id },
      data: { quantity: newQuantity },
    })
  }

  async updateBatch(batchId: string, dto: UpdateBatchDto, organizationId: string) {
    const batch = await this.prisma.inventoryBatch.findFirst({
      where: { id: batchId, tenantId: organizationId },
    })

    if (!batch) {
      throw new NotFoundException('Batch not found')
    }

    const data: any = {}
    if (dto.batchNumber !== undefined) data.batchNumber = dto.batchNumber
    if (dto.quantity !== undefined) data.quantity = dto.quantity
    if (dto.expiryDate !== undefined) data.expiryDate = toSafeDate(dto.expiryDate)
    if (dto.costPerBox !== undefined) data.costPerBox = dto.costPerBox

    return this.prisma.inventoryBatch.update({
      where: { id: batchId },
      data,
    })
  }
}
