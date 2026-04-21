import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:9999';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function createSuperadminInSupabase() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log('⚠️ SUPABASE_SERVICE_ROLE_KEY not set, skipping Supabase user creation');
    return null;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email: 'superadmin@omnidoc.dev',
    password: 'dev-superadmin-123',
    email_confirm: true,
    user_metadata: {
      role: 'SUPERADMIN',
      first_name: 'Super',
      last_name: 'Admin',
    },
  });

  if (error) {
    if (error.message.includes('already been registered') || error.message.includes('already exists')) {
      console.log('✅ Superadmin user already exists in Supabase');
      const existingUser = await supabase.auth.admin.listUsers();
      const superadmin = existingUser.data.users.find(u => u.email === 'superadmin@omnidoc.dev');
      return superadmin?.id || null;
    }
    console.log('⚠️ Failed to create superadmin in Supabase:', error.message);
    return null;
  }

  console.log('✅ Superadmin user created in Supabase:', data.user?.id);
  return data.user?.id;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Seed specialties
  const specialtiesData = [
    { nameEn: 'Dentistry', nameEs: 'Odontología', icon: 'dentistry', descriptionEn: 'Dental and oral health', descriptionEs: 'Salud dental y oral' },
    { nameEn: 'Nephrology', nameEs: 'Nefrología', icon: 'nephrology', descriptionEn: 'Kidney diseases', descriptionEs: 'Enfermedades renales' },
    { nameEn: 'Pediatrics', nameEs: 'Pediatría', icon: 'pediatrics', descriptionEn: 'Child healthcare', descriptionEs: 'Atención infantil' },
    { nameEn: 'Psychology', nameEs: 'Psicología', icon: 'psychology', descriptionEn: 'Mental health', descriptionEs: 'Salud mental' },
    { nameEn: 'Gynecology', nameEs: 'Ginecología', icon: 'gynecology', descriptionEn: 'Women health', descriptionEs: 'Salud de la mujer' },
    { nameEn: 'Dermatology', nameEs: 'Dermatología', icon: 'dermatology', descriptionEn: 'Skin health', descriptionEs: 'Salud de la piel' },
    { nameEn: 'Cardiology', nameEs: 'Cardiología', icon: 'cardiology', descriptionEn: 'Heart health', descriptionEs: 'Salud cardíaca' },
    { nameEn: 'Ophthalmology', nameEs: 'Oftalmología', icon: 'ophthalmology', descriptionEn: 'Eye health', descriptionEs: 'Salud ocular' },
    { nameEn: 'Endocrinology', nameEs: 'Endocrinología', icon: 'endocrinology', descriptionEn: 'Hormonal health', descriptionEs: 'Salud hormonal' },
    { nameEn: 'Nutrition', nameEs: 'Nutrición', icon: 'nutrition', descriptionEn: 'Diet and nutrition', descriptionEs: 'Dieta y nutrición' },
    { nameEn: 'Orthopedics', nameEs: 'Traumatología', icon: 'orthopedics', descriptionEn: 'Bone and joint', descriptionEs: 'Huesos y articulaciones' },
    { nameEn: 'Gastroenterology', nameEs: 'Gastroenterología', icon: 'gastroenterology', descriptionEn: 'Digestive health', descriptionEs: 'Salud digestiva' },
    { nameEn: 'Oncology', nameEs: 'Oncología', icon: 'oncology', descriptionEn: 'Cancer treatment', descriptionEs: 'Tratamiento de cáncer' },
    { nameEn: 'Otolaryngology', nameEs: 'Otorrinolaringología', icon: 'otolaryngology', descriptionEn: 'Ear, nose, throat', descriptionEs: 'Oído, nariz, garganta' },
    { nameEn: 'Urology', nameEs: 'Urología', icon: 'urology', descriptionEn: 'Urinary health', descriptionEs: 'Salud urinaria' },
  ];

  for (const spec of specialtiesData) {
    const existing = await prisma.specialty.findFirst({
      where: { nameEn: spec.nameEn }
    });
    if (!existing) {
      await prisma.specialty.create({
        data: {
          nameEn: spec.nameEn,
          nameEs: spec.nameEs,
          icon: spec.icon,
          descriptionEn: spec.descriptionEn,
          descriptionEs: spec.descriptionEs,
          isActive: true,
        }
      });
    }
  }
  console.log('✅ Specialties seeded:', specialtiesData.length);

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

  const saasOrg = await prisma.organization.upsert({
    where: { slug: 'omnidoc-saas' },
    update: {},
    create: {
      name: 'OmniDoc SaaS',
      slug: 'omnidoc-saas',
      type: 'CLINIC',
      features: { superadmin: true },
      subscriptionStatus: 'ACTIVE',
    },
  });

  console.log('✅ SaaS Organization created:', saasOrg.name);

  const superadminRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: saasOrg.id, name: 'SUPERADMIN' } },
    update: {},
    create: {
      organizationId: saasOrg.id,
      name: 'SUPERADMIN',
      permissions: ['*'],
    },
  });

  console.log('✅ SUPERADMIN role created:', superadminRole.name);

  const operatorRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: saasOrg.id, name: 'OPERATOR' } },
    update: {},
    create: {
      organizationId: saasOrg.id,
      name: 'OPERATOR',
      permissions: ['tenants:read', 'support:create', 'analytics:view'],
    },
  });

  console.log('✅ OPERATOR role created:', operatorRole.name);

  const supabaseId = await createSuperadminInSupabase();

  if (supabaseId) {
    await prisma.user.upsert({
      where: { supabaseId },
      update: {},
      create: {
        supabaseId,
        organizationId: saasOrg.id,
        roleId: superadminRole.id,
        email: 'superadmin@omnidoc.dev',
        firstName: 'Super',
        lastName: 'Admin',
        userType: 'OWNER',
      },
    });
    console.log('✅ Superadmin user created in database');
  } else {
    console.log('⚠️ Skipping database user creation (Supabase user not created)');
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\n📝 Development credentials:');
  console.log('   Email: superadmin@omnidoc.dev');
  console.log('   Password: dev-superadmin-123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
