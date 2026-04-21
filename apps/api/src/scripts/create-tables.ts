import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "SystemSettings" ("id" TEXT NOT NULL PRIMARY KEY, "lang" TEXT NOT NULL DEFAULT 'es', "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW())`;
    await prisma.$executeRaw`INSERT INTO "SystemSettings" ("id", "lang", "updatedAt") VALUES ('global', 'es', NOW()) ON CONFLICT DO NOTHING`;
    console.log('✅ Tables created');
  } catch (e: any) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();