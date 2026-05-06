import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { ListPatientsQueryDto } from './dto/list-patients-query.dto'
import { PatientAuditAction } from './types/patient.types'

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, query: ListPatientsQueryDto) {
    const { search, documentType, documentId, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: any = { organizationId }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (documentType) {
      where.documentType = documentType
    }

    if (documentId) {
      where.documentId = { contains: documentId, mode: 'insensitive' }
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        include: {
          _count: { select: { notes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.patient.count({ where }),
    ])

    return {
      data: patients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(userId: string | null, organizationId: string | null | undefined, id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        _count: { select: { notes: true } },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!patient) {
      throw new NotFoundException('Patient not found')
    }

    if (organizationId && userId) {
      try {
        await this.logAudit({
          patientId: id,
          userId,
          organizationId,
          action: PatientAuditAction.VIEWED,
        })
      } catch (error) {
        // Skip audit logging if it fails (e.g., user not found in DB)
      }
    }

    return patient
  }

  async create(userId: string, organizationId: string, dto: CreatePatientDto) {
    if (dto.documentId) {
      const existing = await this.prisma.patient.findFirst({
        where: {
          organizationId,
          documentId: dto.documentId,
        },
      })

      if (existing) {
        throw new ConflictException({
          message: 'Patient with this document ID already exists',
          patientId: existing.id,
        })
      }
    }

    const patient = await this.prisma.patient.create({
      data: {
        organizationId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        documentType: dto.documentType,
        documentId: dto.documentId,
        email: dto.email,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender,
        bloodType: dto.bloodType,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        allergies: dto.allergies || [],
        isChronic: dto.isChronic ?? false,
      },
    })

    await this.logAudit({
      patientId: patient.id,
      userId,
      organizationId,
      action: PatientAuditAction.CREATED,
      newValue: dto,
    })

    return patient
  }

  async update(
    userId: string,
    organizationId: string,
    id: string,
    dto: UpdatePatientDto,
  ) {
    const existing = await this.prisma.patient.findUnique({
      where: { id },
    })

    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Patient not found')
    }

    const oldValue = {
      firstName: existing.firstName,
      lastName: existing.lastName,
      email: existing.email,
      phone: existing.phone,
      gender: existing.gender,
      bloodType: existing.bloodType,
      allergies: existing.allergies,
    }

    const patient = await this.prisma.patient.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        documentType: dto.documentType,
        documentId: dto.documentId,
        email: dto.email,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        bloodType: dto.bloodType,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        allergies: dto.allergies,
        isChronic: dto.isChronic,
      },
    })

    const changedFields = Object.keys(dto).filter(
      (key) =>
        JSON.stringify(dto[key as keyof UpdatePatientDto]) !==
        JSON.stringify(oldValue[key as keyof typeof oldValue]),
    )

    if (changedFields.length > 0) {
      await this.logAudit({
        patientId: id,
        userId,
        organizationId,
        action: PatientAuditAction.UPDATED,
        fieldChanged: changedFields.join(', '),
        oldValue,
        newValue: dto,
      })
    }

    return patient
  }

  async remove(userId: string, organizationId: string, id: string) {
    const existing = await this.prisma.patient.findUnique({
      where: { id },
    })

    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Patient not found')
    }

    await this.prisma.patient.delete({
      where: { id },
    })

    await this.logAudit({
      patientId: id,
      userId,
      organizationId,
      action: PatientAuditAction.UPDATED,
      newValue: { deleted: true },
    })

    return { deleted: true }
  }

  private async logAudit(params: {
    patientId: string
    userId: string
    organizationId: string
    action: PatientAuditAction
    fieldChanged?: string
    oldValue?: any
    newValue?: any
    ipAddress?: string
  }) {
    await this.prisma.patientAuditLog.create({
      data: params,
    })
  }
}