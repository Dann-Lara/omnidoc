import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../database/prisma.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto'
import { SaveVitalsDto } from './dto/save-vitals.dto'
import { AppointmentStatus, AppointmentMode } from '@prisma/client'
import { MailService } from '../mail/mail.service'

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(organizationId: string, query: ListAppointmentsQueryDto) {
    const {
      search,
      status,
      mode,
      patientId,
      userId,
      specialtyId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query
    const skip = (page - 1) * limit

    const where: any = { organizationId }

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        {
          patient: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ]
    }

    if (status) {
      where.status = status
    }

    if (mode) {
      where.mode = mode
    }

    if (patientId) {
      where.patientId = patientId
    }

    if (userId) {
      where.userId = userId
    }

    if (specialtyId) {
      where.specialtyId = specialtyId
    }

    if (startDate) {
      where.scheduledAt = { gte: new Date(startDate) }
    }

    if (endDate) {
      where.scheduledAt = { ...where.scheduledAt, lte: new Date(endDate) }
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          patient: true,
          user: true,
          specialty: true,
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ])

    return {
      data: appointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getKpis(organizationId: string) {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const [todayCount, pendingCount, cancelledCount] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          organizationId,
          scheduledAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      this.prisma.appointment.count({
        where: {
          organizationId,
          status: AppointmentStatus.SCHEDULED,
        },
      }),
      this.prisma.appointment.count({
        where: {
          organizationId,
          status: AppointmentStatus.CANCELED,
        },
      }),
    ])

    return {
      today: todayCount,
      pending: pendingCount,
      cancelled: cancelledCount,
    }
  }

  async findOne(organizationId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        user: true,
        specialty: true,
      },
    })

    if (!appointment || appointment.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    return appointment
  }

  async create(organizationId: string, dto: CreateAppointmentDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    })

    if (!patient || patient.organizationId !== organizationId) {
      throw new NotFoundException('Patient not found')
    }

    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      })

      if (!user || user.organizationId !== organizationId) {
        throw new NotFoundException('User not found')
      }
    }

    if (dto.specialtyId) {
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
        select: { specialtyIds: true },
      })

      if (!org?.specialtyIds?.includes(dto.specialtyId)) {
        throw new NotFoundException('Specialty not found in this organization')
      }
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        organizationId,
        patientId: dto.patientId,
        userId: dto.userId,
        specialtyId: dto.specialtyId,
        scheduledAt: new Date(dto.scheduledAt),
        duration: dto.duration,
        status: dto.status ?? AppointmentStatus.SCHEDULED,
        mode: dto.mode ?? AppointmentMode.IN_PERSON,
        type: dto.type,
        room: dto.room,
        reason: dto.reason,
        notes: dto.notes,
      },
      include: {
        patient: true,
        user: true,
        specialty: true,
        organization: true,
      },
    })

    // Send confirmation email to patient (fire and forget)
    await this.sendConfirmationEmail(appointment)

    const { organization, ...appointmentData } = appointment
    return appointmentData
  }

  async update(organizationId: string, id: string, dto: UpdateAppointmentDto) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
    })

    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    if (dto.patientId) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: dto.patientId },
      })

      if (!patient || patient.organizationId !== organizationId) {
        throw new NotFoundException('Patient not found')
      }
    }

    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      })

      if (!user || user.organizationId !== organizationId) {
        throw new NotFoundException('User not found')
      }
    }

    if (dto.specialtyId) {
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
        select: { specialtyIds: true },
      })

      if (!org?.specialtyIds?.includes(dto.specialtyId)) {
        throw new NotFoundException('Specialty not found in this organization')
      }
    }

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        patientId: dto.patientId,
        userId: dto.userId,
        specialtyId: dto.specialtyId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        duration: dto.duration,
        status: dto.status,
        mode: dto.mode,
        type: dto.type,
        room: dto.room,
        reason: dto.reason,
        notes: dto.notes,
      },
      include: {
        patient: true,
        user: true,
        specialty: true,
      },
    })

    return appointment
  }

  async remove(organizationId: string, id: string) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
    })

    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    await this.prisma.appointment.delete({
      where: { id },
    })

    return { deleted: true }
  }

  async resendAppointmentConfirmationEmail(organizationId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        user: true,
        specialty: true,
        organization: true,
      },
    })

    if (!appointment || appointment.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    if (!appointment.patient.email) {
      return { success: false, message: 'Patient has no email address' }
    }

    await this.sendConfirmationEmail(appointment)
    return { success: true, message: 'Confirmation email sent' }
  }

  private async sendConfirmationEmail(appointment: any) {
    if (!appointment.patient?.email) {
      console.warn(`Patient ${appointment.patient?.id || 'unknown'} has no email, skipping confirmation`)
      return
    }

    try {
      const scheduledDate = new Date(appointment.scheduledAt)
      const dateStr = scheduledDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
      const timeStr = scheduledDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
      const org = appointment.organization
      const appointmentUrl = `${this.configService.get('APP_URL')}/${org.slug}/operations/appointments/${appointment.id}`
      const lang = 'es'

      await this.mailService.sendAppointmentConfirmationEmail({
        to: appointment.patient.email,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        doctorName: appointment.user ? `Dr. ${appointment.user.firstName} ${appointment.user.lastName}` : 'Por asignar',
        specialty: lang === 'es'
          ? (appointment.specialty?.nameEs || appointment.specialty?.nameEn || 'General')
          : (appointment.specialty?.nameEn || 'General'),
        date: dateStr,
        time: timeStr,
        location: appointment.room || 'Por asignar',
        locationDetail: org.name,
        appointmentUrl,
        organizationName: org.name,
        organizationSlug: org.slug,
        lang,
      })
    } catch (err) {
      console.error(`Failed to send appointment confirmation email: ${err}`)
    }
  }

  async findBySpecialty(organizationId: string, specialtyId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return this.prisma.appointment.findMany({
      where: {
        organizationId,
        specialtyId,
        scheduledAt: { gte: today },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        specialty: { select: { id: true, nameEn: true, nameEs: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async updateStatus(organizationId: string, id: string, status: string) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        user: true,
        specialty: true,
      },
    })

    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: status as AppointmentStatus },
      include: {
        patient: true,
        user: true,
        specialty: true,
      },
    })

    if (updated.patient.email && (status === 'CONFIRMED' || status === 'CANCELED')) {
      await this.sendStatusChangeEmail(updated, status)
    }

    return updated
  }

  private async sendStatusChangeEmail(appointment: {
    patient: { email: string | null; firstName: string; lastName: string };
    user: { firstName: string; lastName: string };
    specialty?: { nameEn: string; nameEs: string | null } | null;
    scheduledAt: Date;
    room?: string | null;
  }, status: string) {
    if (!appointment.patient.email) return;

    try {
      const lang = 'es'
      const scheduledAt = new Date(appointment.scheduledAt)
      const dateStr = scheduledAt.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      const timeStr = scheduledAt.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })

      await this.mailService.sendAppointmentStatusChangeEmail({
        to: appointment.patient.email,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        doctorName: appointment.user ? `Dr. ${appointment.user.firstName} ${appointment.user.lastName}` : 'Por asignar',
        specialty: lang === 'es'
          ? (appointment.specialty?.nameEs || appointment.specialty?.nameEn || 'General')
          : (appointment.specialty?.nameEn || 'General'),
        date: dateStr,
        time: timeStr,
        location: appointment.room || 'Por asignar',
        organizationName: '',
        status: status as 'CONFIRMED' | 'CANCELED',
        lang,
      })
    } catch (err) {
      console.error(`Failed to send appointment status change email: ${err}`)
    }
  }

  async getAppointmentStats(organizationId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = await this.prisma.appointment.groupBy({
      by: ['specialtyId'],
      where: {
        organizationId,
        scheduledAt: { gte: today },
      },
      _count: {
        id: true,
      },
    })

    return stats.map(({ specialtyId, _count }) => ({
      specialtyId,
      count: _count.id,
    }))
  }

  async getAuditLog(organizationId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment || appointment.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    return this.prisma.auditLog.findMany({
      where: {
        organizationId,
        resourceType: 'appointment',
        resourceId: appointmentId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async saveVitals(organizationId: string, appointmentId: string, userId: string, dto: SaveVitalsDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment || appointment.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    if (appointment.status !== 'CONFIRMED') {
      throw new ConflictException('Vitals can only be taken for CONFIRMED appointments')
    }

    const bmi = dto.weight && dto.height
      ? Number((dto.weight / Math.pow(dto.height / 100, 2)).toFixed(2))
      : undefined

    const vitals = await this.prisma.appointmentVitals.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        organizationId,
        takenById: userId,
        bloodPressure: dto.bloodPressure,
        heartRate: dto.heartRate,
        temperature: dto.temperature,
        respRate: dto.respRate,
        oxygenSat: dto.oxygenSat,
        weight: dto.weight,
        height: dto.height,
        bmi,
        subjective: dto.subjective,
      },
      update: {
        takenById: userId,
        bloodPressure: dto.bloodPressure,
        heartRate: dto.heartRate,
        temperature: dto.temperature,
        respRate: dto.respRate,
        oxygenSat: dto.oxygenSat,
        weight: dto.weight,
        height: dto.height,
        bmi,
        subjective: dto.subjective,
      },
    })

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'IN_PROGRESS' },
    })

    return vitals
  }

  async getVitals(organizationId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { organizationId: true },
    })

    if (!appointment || appointment.organizationId !== organizationId) {
      throw new NotFoundException('Appointment not found')
    }

    return this.prisma.appointmentVitals.findUnique({
      where: { appointmentId },
    })
  }
}
