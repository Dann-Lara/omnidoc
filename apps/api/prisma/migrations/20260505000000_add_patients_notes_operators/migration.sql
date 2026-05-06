-- CreateEnum
CREATE TYPE "AppointmentMode" AS ENUM ('IN_PERSON', 'TELEHEALTH');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'CURP', 'SSN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('HOMBRE', 'MUJER');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "PatientAuditAction" AS ENUM ('CREATED', 'UPDATED', 'VIEWED', 'EXPORTED', 'SEALED', 'PRINTED');

-- CreateTable
CREATE TABLE "OperatorTenant" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "operatorId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatorTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientNote" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "specialtyId" TEXT,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "temperature" DECIMAL(4,1),
    "respRate" INTEGER,
    "oxygenSat" INTEGER,
    "weight" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "bmi" DECIMAL(4,2),
    "subjective" TEXT,
    "diagnosis" TEXT,
    "plan" TEXT,
    "isSealed" BOOLEAN NOT NULL DEFAULT false,
    "sealedAt" TIMESTAMP(3),
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAuditLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "patientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "action" "PatientAuditAction" NOT NULL,
    "fieldChanged" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientAuditLog_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "subtype" TEXT, ADD COLUMN "avatar" TEXT;

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN "tenantIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "TeamInvitation" ADD COLUMN "subtype" TEXT;

-- AlterTable - Appointment: add new columns first
ALTER TABLE "Appointment" 
    ADD COLUMN "userId" TEXT,
    ADD COLUMN "specialtyId" TEXT,
    ADD COLUMN "mode" "AppointmentMode" DEFAULT 'IN_PERSON',
    ADD COLUMN "room" TEXT,
    ADD COLUMN "reason" TEXT;

-- Migrate doctorId to userId
UPDATE "Appointment" SET "userId" = "doctorId"::uuid;

-- Make userId NOT NULL after migration
ALTER TABLE "Appointment" ALTER COLUMN "userId" SET NOT NULL;

-- Drop old column
ALTER TABLE "Appointment" DROP COLUMN "doctorId";

-- AlterTable - Patient: add new columns
ALTER TABLE "Patient" 
    ADD COLUMN "documentType" "DocumentType",
    ADD COLUMN "documentId" TEXT,
    ADD COLUMN "gender" "Gender",
    ADD COLUMN "bloodType" "BloodType",
    ADD COLUMN "emergencyContact" TEXT,
    ADD COLUMN "emergencyPhone" TEXT,
    ADD COLUMN "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "isChronic" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "OperatorTenant_operatorId_idx" ON "OperatorTenant"("operatorId");
CREATE INDEX "OperatorTenant_tenantId_idx" ON "OperatorTenant"("tenantId");
CREATE UNIQUE INDEX "OperatorTenant_operatorId_tenantId_key" ON "OperatorTenant"("operatorId", "tenantId");

CREATE INDEX "PatientNote_patientId_idx" ON "PatientNote"("patientId");
CREATE INDEX "PatientNote_doctorId_idx" ON "PatientNote"("doctorId");
CREATE INDEX "PatientNote_organizationId_idx" ON "PatientNote"("organizationId");
CREATE INDEX "PatientNote_isSealed_idx" ON "PatientNote"("isSealed");
CREATE INDEX "PatientNote_createdAt_idx" ON "PatientNote"("createdAt");

CREATE INDEX "PatientAuditLog_patientId_idx" ON "PatientAuditLog"("patientId");
CREATE INDEX "PatientAuditLog_userId_idx" ON "PatientAuditLog"("userId");
CREATE INDEX "PatientAuditLog_action_idx" ON "PatientAuditLog"("action");
CREATE INDEX "PatientAuditLog_createdAt_idx" ON "PatientAuditLog"("createdAt");

CREATE INDEX "Appointment_userId_idx" ON "Appointment"("userId");
CREATE INDEX "Appointment_specialtyId_idx" ON "Appointment"("specialtyId");

CREATE UNIQUE INDEX "Patient_organizationId_documentId_key" ON "Patient"("organizationId", "documentId");
CREATE INDEX "Patient_documentType_documentId_idx" ON "Patient"("documentType", "documentId");

-- Drop old index on nameEn (will be replaced by unique constraint)
DROP INDEX IF EXISTS "Specialty_nameEn_idx";

-- CreateIndex - Specialty unique constraint
CREATE UNIQUE INDEX "Specialty_nameEn_key" ON "Specialty"("nameEn");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OperatorTenant" ADD CONSTRAINT "OperatorTenant_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperatorTenant" ADD CONSTRAINT "OperatorTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PatientNote" ADD CONSTRAINT "PatientNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientNote" ADD CONSTRAINT "PatientNote_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PatientNote" ADD CONSTRAINT "PatientNote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PatientAuditLog" ADD CONSTRAINT "PatientAuditLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientAuditLog" ADD CONSTRAINT "PatientAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PatientAuditLog" ADD CONSTRAINT "PatientAuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


