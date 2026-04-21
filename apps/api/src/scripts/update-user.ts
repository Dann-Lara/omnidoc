import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'dann@opendoc.com' },
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  const result = await prisma.user.update({
    where: { supabaseId: user.supabaseId },
    data: { userType: 'OWNER' },
  });
  console.log('Updated:', result.email, '-> userType:', result.userType);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
