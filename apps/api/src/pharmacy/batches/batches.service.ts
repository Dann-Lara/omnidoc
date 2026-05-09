import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async getExpiring(organizationId: string, query: any) {
    const days = (query && query.days) ? query.days : 90
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + Number(days))

    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId: organizationId,
        quantity: { gt: 0 },
        expiryDate: { lte: futureDate },
      },
      include: { product: true },
      orderBy: { expiryDate: 'asc' },
    })

    return batches.map((batch: any) => {
      const daysUntilExpiry = Math.ceil(
        (batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      let riskLevel: 'critical' | 'moderate' | 'stable' = 'stable'
      if (daysUntilExpiry <= 30) riskLevel = 'critical'
      else if (daysUntilExpiry <= 60) riskLevel = 'moderate'

      return {
        id: batch.id,
        productName: batch.product?.commercialName || 'Unknown',
        batchNumber: batch.batchNumber,
        quantity: batch.quantity,
        expiryDate: batch.expiryDate.toISOString().split('T')[0],
        riskLevel,
        daysUntilExpiry,
      }
    })
  }
}
