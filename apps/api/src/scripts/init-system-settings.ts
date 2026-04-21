import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.systemSettings.create({
      data: { id: 'global', lang: 'es' },
    });
    console.log('✅ SystemSettings created');
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('⚠️  SystemSettings already exists');
    } else {
      console.error('❌ Error:', e.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();