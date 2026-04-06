import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const freePlan = await prisma.plan.upsert({
    where: { stripePriceId: 'price_free' },
    update: {},
    create: {
      name: 'Free',
      stripePriceId: 'price_free',
      price: 0,
      features: {
        appointments: 50,
        patients: 25,
        users: 1,
        aiInsights: false,
      },
      limits: {
        appointmentsPerMonth: 50,
        patients: 25,
        users: 1,
      },
    },
  });

  const basicPlan = await prisma.plan.upsert({
    where: { stripePriceId: 'price_basic' },
    update: {},
    create: {
      name: 'Basic',
      stripePriceId: 'price_basic',
      price: 29,
      features: {
        appointments: 200,
        patients: 100,
        users: 3,
        aiInsights: true,
      },
      limits: {
        appointmentsPerMonth: 200,
        patients: 100,
        users: 3,
      },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { stripePriceId: 'price_pro' },
    update: {},
    create: {
      name: 'Pro',
      stripePriceId: 'price_pro',
      price: 79,
      features: {
        appointments: 500,
        patients: 500,
        users: 10,
        aiInsights: true,
        analytics: true,
      },
      limits: {
        appointmentsPerMonth: 500,
        patients: 500,
        users: 10,
      },
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { stripePriceId: 'price_enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      stripePriceId: 'price_enterprise',
      price: 199,
      features: {
        appointments: -1,
        patients: -1,
        users: -1,
        aiInsights: true,
        analytics: true,
        customBranding: true,
        apiAccess: true,
      },
      limits: {
        appointmentsPerMonth: -1,
        patients: -1,
        users: -1,
      },
    },
  });

  console.log('✅ Plans seeded:', { freePlan, basicPlan, proPlan, enterprisePlan });
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
