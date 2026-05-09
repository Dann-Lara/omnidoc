import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { subDays } from 'date-fns'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(organizationId: string) {
    const ninetyDaysFromNow = subDays(new Date(), -90)
    const sevenDaysFromNow = subDays(new Date(), -7)

    const [allBatches, expiringCount, lowStockCount, procurementBatches] = await Promise.all([
      this.prisma.inventoryBatch.findMany({
        where: { tenantId: organizationId, quantity: { gt: 0 } },
        include: { product: { select: { unitsPerBox: true } } },
      }),
      this.prisma.inventoryBatch.count({
        where: {
          tenantId: organizationId,
          quantity: { gt: 0 },
          expiryDate: { lte: ninetyDaysFromNow },
        },
      }),
      this.getLowStockCount(organizationId),
      this.prisma.inventoryBatch.findMany({
        where: {
          tenantId: organizationId,
          quantity: { gt: 0 },
          expiryDate: { lte: sevenDaysFromNow },
        },
        orderBy: { expiryDate: 'asc' },
        take: 1,
      }),
    ])

    const totalValue = allBatches.reduce((sum: number, b: any) => {
      const boxes = b.quantity / (b.product?.unitsPerBox || 1)
      return sum + (boxes * (b.costPerBox ? Number(b.costPerBox) : 0))
    }, 0)

    const procurementPending = procurementBatches.length
    const procurementEta =
      procurementBatches.length > 0
        ? `${Math.ceil(
            (procurementBatches[0].expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
          )} days`
        : 'None'

    return {
      totalValue,
      totalValueChange: 0,
      expiryRisks90d: expiringCount,
      securityStockAlert: lowStockCount,
      procurementPending,
      procurementEta,
    }
  }

  async getSecurityStock(organizationId: string, productId: string) {
    const thirtyDaysAgo = subDays(new Date(), 30)

    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId: organizationId,
        productId,
      },
      select: { id: true },
    })
    const batchIds = batches.map(b => b.id)

    const logs = await this.prisma.inventoryLog.aggregate({
      where: {
        batchId: { in: batchIds },
        type: 'DISPENSED',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { quantity: true },
    })
    const totalDispensed = logs._sum?.quantity || 0
    const dailyAvg = totalDispensed / 30
    const securityStock = Math.ceil(dailyAvg * 7)

    const currentStock = await this.getCurrentStock(organizationId, productId)

    return {
      currentStock,
      securityStock,
      isBelowThreshold: currentStock < securityStock,
    }
  }

  async getSecurityStockList(organizationId: string) {
    const products = await this.prisma.inventoryBatch.groupBy({
      by: ['productId'],
      where: { tenantId: organizationId, quantity: { gt: 0 } },
      _sum: { quantity: true },
    })

    const result = []
    for (const item of products) {
      const security = await this.getSecurityStock(organizationId, item.productId)
      const product = await this.prisma.productLibrary.findUnique({
        where: { id: item.productId },
      })
      result.push({
        productId: item.productId,
        commercialName: product?.commercialName || 'Unknown',
        activeSubstance: product?.activeSubstance || '',
        currentStock: security.currentStock,
        securityStock: security.securityStock,
        isBelowThreshold: security.isBelowThreshold,
        deficit: Math.max(0, security.securityStock - security.currentStock),
      })
    }

    return result.sort((a, b) => b.deficit - a.deficit)
  }

  async getProcurement(organizationId: string) {
    const sevenDaysFromNow = subDays(new Date(), -7)

    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId: organizationId,
        quantity: { gt: 0 },
        expiryDate: { lte: sevenDaysFromNow },
      },
      include: { product: true },
      orderBy: { expiryDate: 'asc' },
    })

    return batches.map((batch: any) => ({
      product: batch.product,
      batchNumber: batch.batchNumber,
      quantity: batch.quantity,
      expiryDate: batch.expiryDate,
      daysUntilExpiry: Math.ceil(
        (batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
  }

  async getAlternatives(organizationId: string, productId: string) {
    const product = await this.prisma.productLibrary.findUnique({
      where: { id: productId },
    })

    if (!product) return []

    const alternatives = await this.prisma.productLibrary.findMany({
      where: {
        activeSubstance: product.activeSubstance,
        id: { not: productId },
        isActive: true,
      },
    })

    const withStock = await Promise.all(
      alternatives.map(async (alt: any) => {
        const stock = await this.getCurrentStock(organizationId, alt.id)
        return { ...alt, currentStock: stock }
      })
    )

    return withStock.filter((alt) => alt.currentStock > 0)
  }

  private async getCurrentStock(organizationId: string, productId: string) {
    const batches = await this.prisma.inventoryBatch.findMany({
      where: {
        tenantId: organizationId,
        productId,
      },
    })

    return batches.reduce((sum: number, b: any) => sum + b.quantity, 0)
  }

  private async getLowStockCount(organizationId: string) {
    const products = await this.prisma.inventoryBatch.groupBy({
      by: ['productId'],
      where: { tenantId: organizationId, quantity: { gt: 0 } },
      _sum: { quantity: true },
    })

    let lowStockCount = 0
    for (const product of products) {
      const security = await this.getSecurityStock(organizationId, product.productId)
      if (security.isBelowThreshold) lowStockCount++
    }

    return lowStockCount
  }
}
