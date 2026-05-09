import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { FefoStrategy } from './fefo.strategy'
import { DispenseDto } from './dto/dispense.dto'

@Injectable()
export class DispensingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fefoStrategy: FefoStrategy,
  ) {}

  async dispense(dto: DispenseDto, user: any) {
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

    return Promise.all(records)
  }

  async getHistory(organizationId: string) {
    return this.prisma.dispensedMedication.findMany({
      where: { tenantId: organizationId },
      include: {
        note: {
          include: {
            patient: {
              select: { id: true, firstName: true, lastName: true },
            },
            doctor: {
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
  }
}