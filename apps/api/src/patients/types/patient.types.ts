export enum DocumentType {
  DNI = 'DNI',
  CURP = 'CURP',
  SSN = 'SSN',
}

export enum Gender {
  HOMBRE = 'HOMBRE',
  MUJER = 'MUJER',
}

export enum BloodType {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE',
}

export enum PatientAuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  VIEWED = 'VIEWED',
  EXPORTED = 'EXPORTED',
  SEALED = 'SEALED',
  PRINTED = 'PRINTED',
}

export interface VitalSigns {
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  respRate?: number
  oxygenSat?: number
  weight?: number
  height?: number
  bmi?: number
}

export interface PatientWithNotes extends Patient {
  notes: PatientNote[]
  _count?: { notes: number }
}

import { Prisma } from '@prisma/client'

export type Patient = Prisma.PatientGetPayload<null>
export type PatientNote = Prisma.PatientNoteGetPayload<null>
export type PatientAuditLog = Prisma.PatientAuditLogGetPayload<null>