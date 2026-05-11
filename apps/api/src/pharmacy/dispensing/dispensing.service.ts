import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { FefoStrategy } from './fefo.strategy'
import { DispenseDto } from './dto/dispense.dto'
import { NotificationsService } from '../../notifications/notifications.service'
import { decrypt } from '../../lib/encryption'

@Injectable()
export class DispensingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fefoStrategy: FefoStrategy,
    private readonly notificationsService: NotificationsService,
  ) {}

  async dispense(dto: DispenseDto, user: any, createNotification: boolean = true) {
    const organizationId = user.organizationId

    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    })

    if (!patient || patient.organizationId !== organizationId) {
      throw new NotFoundException('Patient not found')
    }

    const note = await this.prisma.patientNote.findUnique({
      where: { id: dto.noteId },
    })

    if (!note || note.patientId !== dto.patientId) {
      throw new NotFoundException('Note not found')
    }

    if (!note.isSealed) {
      throw new BadRequestException('Note must be sealed before dispensing')
    }

    const records: any[] = []

    for (const item of dto.medications) {
      const dispensed = await this.fefoStrategy.dispense(
        item.productId,
        item.quantity,
        organizationId,
      )

      for (const d of dispensed) {
        records.push(
          this.prisma.dispensedMedication.create({
            data: {
              tenantId: organizationId,
              noteId: dto.noteId,
              batchId: d.batchId,
              productId: item.productId,
              quantity: d.quantity,
              dispensedBy: user.id,
            },
          }),
        )
      }

      await this.prisma.inventoryLog.create({
        data: {
          tenantId: organizationId,
          batchId: dispensed[0]?.batchId || '',
          doctorId: user.id,
          patientId: dto.patientId,
          type: 'DISPENSED',
          quantity: item.quantity,
        },
      })
    }

    await this.prisma.patientNote.update({
      where: { id: dto.noteId },
      data: { medicationDispensed: true },
    })

    const result = await Promise.all(records)

    if (createNotification) {
      const products = await this.prisma.productLibrary.findMany({
        where: { id: { in: dto.medications.map(m => m.productId) } },
        select: { id: true, commercialName: true },
      })
      const productMap = new Map(products.map(p => [p.id, p.commercialName]))
      const medSummary = dto.medications.map(m => productMap.get(m.productId) || m.productId).join(', ')

      await this.notificationsService.create({
        organizationId,
        targetPermission: 'pharmacy:dispense',
        type: 'dispensing_completed',
        title: 'Dispensación completada',
        message: `${patient.firstName} ${patient.lastName} — ${medSummary}`,
        noteId: dto.noteId,
      })
    }

    return result
  }

  async getHistory(organizationId: string) {
    const records = await this.prisma.dispensedMedication.findMany({
      where: { tenantId: organizationId },
      include: {
        note: {
          include: {
            patient: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        product: {
          select: { id: true, commercialName: true, activeSubstance: true, presentation: true, unitsPerBox: true },
        },
        batch: {
          select: { id: true, batchNumber: true, costPerBox: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const userIds = [...new Set(records.map(r => r.dispensedBy))]
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : []
    const userMap = new Map(users.map(u => [u.id, u]))

    return records.map(r => ({
      ...r,
      dispensedByUser: userMap.get(r.dispensedBy) ?? null,
    }))
  }

  async getPending(organizationId: string) {
    const notes = await this.prisma.patientNote.findMany({
      where: {
        organizationId,
        isSealed: true,
        medicationDispensed: false,
        plan: { not: null },
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true },
        },
        doctor: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return notes.filter(note => {
      if (!note.plan) return false
      try {
        const decrypted = decrypt(note.plan)
        const parsed = JSON.parse(decrypted)
        return parsed?.medications?.length > 0
      } catch {
        return false
      }
    }).map(note => ({
      ...note,
      plan: undefined,
    }))
  }
}