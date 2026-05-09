-- AlterTable
ALTER TABLE "InventoryBatch" ADD COLUMN     "costPerBox" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "ProductLibrary" ADD COLUMN     "unitsPerBox" INTEGER NOT NULL DEFAULT 1;
