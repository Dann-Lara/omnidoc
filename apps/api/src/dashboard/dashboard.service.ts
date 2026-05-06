import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { getTodayRangeUTC, getWeekStartUTC } from '../lib/date-utils'

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(organizationId: string, timezone: string) {
    const tz = timezone || 'UTC'

    const { start: todayStart, end: todayEnd } = getTodayRangeUTC(tz)
    const weekStart = getWeekStartUTC(tz)

    // 1. Total active patients
    const totalPatients = await this.prisma.patient.count({
      where: { organizationId },
    })

    // 2. Today's appointments
    const todayAppointments = await this.prisma.appointment.count({
      where: {
        organizationId,
        scheduledAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    })

    // 3. This week's appointments
    const weekAppointments = await this.prisma.appointment.count({
      where: {
        organizationId,
        scheduledAt: {
          gte: weekStart,
        },
      },
    })

    // 4. Notes created this week
    const weekNotes = await this.prisma.patientNote.count({
      where: {
        organizationId,
        createdAt: {
          gte: weekStart,
        },
      },
    })

    // 5. Upcoming appointments (next 7 days)
    const now = new Date()
    const next7DaysEnd = new Date(todayStart)
    next7DaysEnd.setDate(todayStart.getDate() + 7)

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        organizationId,
        scheduledAt: {
          gte: now,
          lt: next7DaysEnd,
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        specialty: {
          select: {
            nameEs: true,
            nameEn: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // 6. Recent notes (last 5)
    const recentNotes = await this.prisma.patientNote.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Fetch specialty names separately
    const specialtyIds = [...new Set(recentNotes.map(n => n.specialtyId).filter((id): id is string => Boolean(id)))]
    const specialties = specialtyIds.length > 0
      ? await this.prisma.specialty.findMany({ where: { id: { in: specialtyIds } } })
      : []
    const specialtyMap = new Map(specialties.map(s => [s.id, s]))

    return {
      totalPatients,
      todayAppointments,
      weekAppointments,
      weekNotes,
      upcomingAppointments: upcomingAppointments.map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt,
        patientName: `${a.patient.firstName} ${a.patient.lastName}`,
        specialtyName: a.specialty?.nameEs || a.specialty?.nameEn || '',
        doctorName: a.user ? `${a.user.firstName} ${a.user.lastName}` : null,
      })),
      recentNotes: recentNotes.map((n) => {
        const spec = n.specialtyId ? specialtyMap.get(n.specialtyId) : null
        return {
          id: n.id,
          createdAt: n.createdAt,
          patientName: `${n.patient.firstName} ${n.patient.lastName}`,
          doctorName: `${n.doctor.firstName} ${n.doctor.lastName}`,
          specialtyName: spec?.nameEs || spec?.nameEn || '',
          diagnosis: n.diagnosis ? n.diagnosis.substring(0, 100) : '',
        }
      }),
    }
  }
}
