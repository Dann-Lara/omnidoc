import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'superadmin@omnidoc.dev' },
    include: { role: true, organization: true }
  });
  console.log('User:', JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

main();