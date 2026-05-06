import { AppointmentStatus, AppointmentMode } from '@prisma/client'

export enum AppointmentStatusEnum {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppointmentModeEnum {
  IN_PERSON = 'IN_PERSON',
  TELEHEALTH = 'TELEHEALTH',
}

export interface Appointment {
  id: string
  organizationId: string
  patientId: string
  userId: string
  specialtyId?: string
  scheduledAt: Date
  duration: number
  status: AppointmentStatus
  mode?: AppointmentMode
  type: string
  room?: string
  reason?: string
  notes?: string
  aiPredictions?: any
  createdAt: Date
  updatedAt: Date
}

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    patient: true
    user: true
    specialty: true
  }
}>

import { Prisma } from '@prisma/client'

export type AppointmentPrisma = Prisma.AppointmentGetPayload<null>
