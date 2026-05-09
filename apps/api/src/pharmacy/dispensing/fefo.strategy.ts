import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class FefoStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async dispense(productId: string, quantity: number, tenantId: string) {
    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId,
        productId,
        quantity: { gt: 0 },
      },
      orderBy: { expiryDate: 'asc' },
    })

    if (batches.length === 0) {
      throw new BadRequestException('No stock available for this product')
    }

    const totalStock = batches.reduce((sum: number, b: any) => sum + b.quantity, 0)
    if (totalStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock: missing ${quantity - totalStock} units`,
      )
    }

    let remaining = quantity
    const dispensed = []

    for (const batch of batches) {
      if (remaining <= 0) break

      const deduct = Math.min(batch.quantity, remaining)
      const newQuantity = batch.quantity - deduct
      remaining -= deduct

      await this.prisma.inventoryBatch.update({
        where: { id: batch.id },
        data: { quantity: newQuantity },
      })

      dispensed.push({ batchId: batch.id, quantity: deduct })
    }

    return dispensed
  }
}
