const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NAME_TO_CUID = {
  'Dentistry': 'cmo1j5wnr0000ncf49jvbde0g',
  'Nephrology': 'cmo1j5wo10001ncf4vae5blul',
  'Pediatrics': 'cmo1j5wo30002ncf454lka4ih',
  'Psychology': 'cmo1j5wo60003ncf4fevx426r',
  'Gynecology': 'cmo1j5wo80004ncf4xhfzq66s',
  'Dermatology': 'cmo1j5wo90005ncf4e6ypdlhe',
  'Cardiology': 'cmo1j5woa0006ncf4zyej36ld',
  'Ophthalmology': 'cmo1j5wob0007ncf4iq79vgr1',
  'Endocrinology': 'cmo1j5woc0008ncf4cvd0omc8',
  'Nutrition': 'cmo1j5wod0009ncf48r3bkpb5',
  'Orthopedics': 'cmo1j5wof000ancf4daxsmiad',
  'Gastroenterology': 'cmo1j5wog000bncf4w045cxsk',
  'Oncology': 'cmo1j5woi000cncf4ehuex1kw',
  'Otolaryngology': 'cmo1j5woj000dncf4vcvh0e66',
  'Urology': 'cmo1j5wol000encf4c397ou0q',
};

const OLD_NUMERIC_TO_NAME = {
  '1': 'Dentistry',
  '2': 'Nephrology',
  '3': 'Pediatrics',
  '4': 'Psychology',
  '5': 'Gynecology',
  '6': 'Dermatology',
  '7': 'Cardiology',
  '8': 'Ophthalmology',
  '9': 'Endocrinology',
  '10': 'Nutrition',
  '11': 'Orthopedics',
  '12': 'Gastroenterology',
  '13': 'Oncology',
  '14': 'Otolaryngology',
  '15': 'Urology',
};

async function migrate() {
  console.log('🔄 Iniciando migración de specialtyIds...\n');

  // Migrar organizaciones
  console.log('📦 Migrando organizaciones...');
  const organizations = await prisma.organization.findMany({
    where: {
      specialtyIds: { isEmpty: false }
    },
    select: { id: true, name: true, specialtyIds: true },
  });

  let orgMigrated = 0;
  for (const org of organizations) {
    const oldIds = org.specialtyIds;
    const newIds = oldIds
      .map(id => {
        const name = OLD_NUMERIC_TO_NAME[id];
        if (name && NAME_TO_CUID[name]) {
          return NAME_TO_CUID[name];
        }
        return null;
      })
      .filter(Boolean);

    if (newIds.length > 0 && JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
      await prisma.organization.update({
        where: { id: org.id },
        data: { specialtyIds: newIds },
      });
      console.log(`  ✅ ${org.name}:`);
      console.log(`     Antes: [${oldIds.join(', ')}]`);
      console.log(`     Después: [${newIds.join(', ')}]`);
      orgMigrated++;
    }
  }

  if (orgMigrated === 0) {
    console.log('  ⚠️ No se encontraron organizaciones con specialtyIds numéricos para migrar');
  }

  // Migrar usuarios COLLABORATOR
  console.log('\n👥 Migrando usuarios COLLABORATOR...');
  const collaborators = await prisma.user.findMany({
    where: {
      userType: 'COLLABORATOR',
      specialtyIds: { isEmpty: false }
    },
    select: { id: true, email: true, specialtyIds: true },
  });

  let userMigrated = 0;
  for (const user of collaborators) {
    const oldIds = user.specialtyIds;
    const newIds = oldIds
      .map(id => {
        const name = OLD_NUMERIC_TO_NAME[id];
        if (name && NAME_TO_CUID[name]) {
          return NAME_TO_CUID[name];
        }
        return null;
      })
      .filter(Boolean);

    if (newIds.length > 0 && JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { specialtyIds: newIds },
      });
      console.log(`  ✅ ${user.email}:`);
      console.log(`     Antes: [${oldIds.join(', ')}]`);
      console.log(`     Después: [${newIds.join(', ')}]`);
      userMigrated++;
    }
  }

  if (userMigrated === 0) {
    console.log('  ⚠️ No se encontraron usuarios COLLABORATOR con specialtyIds numéricos para migrar');
  }

  console.log('\n📊 Resumen:');
  console.log(`   - Organizaciones migradas: ${orgMigrated}`);
  console.log(`   - Usuarios migrados: ${userMigrated}`);

  // Verificar estado final
  console.log('\n🔍 Verificando estado final...');
  const finalOrgs = await prisma.organization.findMany({
    where: { specialtyIds: { isEmpty: false } },
    select: { name: true, specialtyIds: true },
  });
  
  if (finalOrgs.length > 0) {
    console.log('  Organizaciones con specialties:');
    finalOrgs.forEach(o => {
      console.log(`    ${o.name}: [${o.specialtyIds.join(', ')}]`);
    });
  } else {
    console.log('  Ninguna organización tiene specialties configuradas');
  }
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
