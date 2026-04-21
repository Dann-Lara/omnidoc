import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    UPDATE "User" 
    SET "organizationId" = NULL, "roleId" = NULL, "updatedAt" = NOW()
    WHERE email = 'superadmin@omnidoc.dev'
  `;
  console.log('Updated superadmin:', result);
  
  const user = await prisma.user.findFirst({
    where: { email: 'superadmin@omnidoc.dev' }
  });
  console.log('User now:', user?.organizationId, user?.roleId);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());