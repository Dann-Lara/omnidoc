-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('DISPENSED', 'RESTOCKED', 'ADJUSTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "PatientNote" ADD COLUMN     "medicationDispensed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ProductLibrary" (
    "id" TEXT NOT NULL,
    "commercialName" TEXT NOT NULL,
    "activeSubstance" TEXT NOT NULL,
    "presentation" TEXT NOT NULL,
    "laboratory" TEXT NOT NULL,
    "barcode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryBatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchNumber" TEXT,
    "quantity" INTEGER NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "patientId" TEXT,
    "doctorId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "LogType" NOT NULL DEFAULT 'RESTOCKED',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispensedMedication" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dispensedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispensedMedication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductLibrary_barcode_key" ON "ProductLibrary"("barcode");

-- CreateIndex
CREATE INDEX "ProductLibrary_commercialName_idx" ON "ProductLibrary"("commercialName");

-- CreateIndex
CREATE INDEX "ProductLibrary_activeSubstance_idx" ON "ProductLibrary"("activeSubstance");

-- CreateIndex
CREATE INDEX "ProductLibrary_barcode_idx" ON "ProductLibrary"("barcode");

-- CreateIndex
CREATE INDEX "ProductLibrary_laboratory_idx" ON "ProductLibrary"("laboratory");

-- CreateIndex
CREATE INDEX "ProductLibrary_isActive_idx" ON "ProductLibrary"("isActive");

-- CreateIndex
CREATE INDEX "InventoryBatch_tenantId_idx" ON "InventoryBatch"("tenantId");

-- CreateIndex
CREATE INDEX "InventoryBatch_productId_idx" ON "InventoryBatch"("productId");

-- CreateIndex
CREATE INDEX "InventoryBatch_expiryDate_idx" ON "InventoryBatch"("expiryDate");

-- CreateIndex
CREATE INDEX "InventoryBatch_batchNumber_idx" ON "InventoryBatch"("batchNumber");

-- CreateIndex
CREATE INDEX "InventoryLog_tenantId_idx" ON "InventoryLog"("tenantId");

-- CreateIndex
CREATE INDEX "InventoryLog_batchId_idx" ON "InventoryLog"("batchId");

-- CreateIndex
CREATE INDEX "InventoryLog_doctorId_idx" ON "InventoryLog"("doctorId");

-- CreateIndex
CREATE INDEX "InventoryLog_patientId_idx" ON "InventoryLog"("patientId");

-- CreateIndex
CREATE INDEX "InventoryLog_createdAt_idx" ON "InventoryLog"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryLog_type_idx" ON "InventoryLog"("type");

-- CreateIndex
CREATE INDEX "DispensedMedication_tenantId_idx" ON "DispensedMedication"("tenantId");

-- CreateIndex
CREATE INDEX "DispensedMedication_noteId_idx" ON "DispensedMedication"("noteId");

-- CreateIndex
CREATE INDEX "DispensedMedication_batchId_idx" ON "DispensedMedication"("batchId");

-- CreateIndex
CREATE INDEX "DispensedMedication_productId_idx" ON "DispensedMedication"("productId");

-- CreateIndex
CREATE INDEX "PatientNote_medicationDispensed_idx" ON "PatientNote"("medicationDispensed");

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InventoryBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensedMedication" ADD CONSTRAINT "DispensedMedication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensedMedication" ADD CONSTRAINT "DispensedMedication_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "PatientNote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensedMedication" ADD CONSTRAINT "DispensedMedication_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InventoryBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispensedMedication" ADD CONSTRAINT "DispensedMedication_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

