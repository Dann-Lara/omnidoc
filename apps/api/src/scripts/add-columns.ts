import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subtype" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "TeamInvitation" ADD COLUMN IF NOT EXISTS "subtype" TEXT`;
    console.log('✅ Columns added');
  } catch (e: any) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();