import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ORG_SLUG = 'open-doc'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function icdPrefix(diagnosis: string | null): string | null {
  if (!diagnosis) return null
  const m = diagnosis.match(/ICD-10:\s*([A-Z]\d+)/)
  return m ? m[1] : null
}

const ICD_MEDICATION: Record<string, string[]> = {
  I20: ['Atorvastatin', 'Aspirin'],
  I47: ['Metoprolol'],
  I50: ['Metoprolol'],
  I35: ['Atorvastatin'],
  I10: ['Amlodipine', 'Losartan'],
  I48: ['Metoprolol'],
  I73: ['Atorvastatin'],
  E11: ['Metformin', 'Glibenclamide', 'Sitagliptin'],
  E10: ['Insulin Glargine'],
  E05: ['Metoprolol'],
  E03: ['Levothyroxine'],
  E88: ['Metformin'],
  E04: ['Levothyroxine'],
  D35: ['Prednisone'],
  J06: ['Paracetamol', 'Ibuprofen'],
  J22: ['Amoxicillin', 'Paracetamol'],
  J45: ['Prednisone', 'Loratadine'],
  J03: ['Amoxicillin', 'Ibuprofen'],
  J30: ['Loratadine', 'Prednisone'],
  K21: ['Omeprazole'],
  K80: ['Ursodeoxycholic Acid'],
  K58: ['Domperidone', 'Mesalazine'],
  K30: ['Omeprazole', 'Metronidazole'],
  K64: ['Ibuprofen', 'Paracetamol'],
  K59: ['Domperidone'],
  K04: ['Amoxicillin', 'Ibuprofen', 'Chlorhexidine'],
  K05: ['Amoxicillin', 'Chlorhexidine'],
  K02: ['Paracetamol', 'Ibuprofen'],
  K13: ['Chlorhexidine'],
  K12: ['Chlorhexidine', 'Metronidazole'],
  G43: ['Ibuprofen', 'Paracetamol'],
  G44: ['Ibuprofen', 'Paracetamol'],
  G62: ['Gabapentin'],
  G20: ['Carbamazepine'],
  G40: ['Carbamazepine', 'Valproic Acid', 'Levetiracetam'],
  G30: ['Donepezil'],
  G50: ['Carbamazepine', 'Gabapentin'],
  G47: ['Diphenhydramine'],
  L40: ['Betamethasone', 'Isotretinoin'],
  L71: ['Metronidazole', 'Isotretinoin'],
  L81: ['Isotretinoin'],
  L24: ['Hydrocortisone', 'Betamethasone'],
  L70: ['Isotretinoin'],
  L50: ['Loratadine', 'Prednisone'],
  B02: ['Acyclovir', 'Gabapentin'],
  N80: ['Ibuprofen', 'Medroxyprogesterone'],
  N95: ['Medroxyprogesterone'],
  N83: ['Ibuprofen'],
  M54: ['Ibuprofen', 'Paracetamol'],
  M25: ['Ibuprofen', 'Paracetamol', 'Prednisone'],
  M06: ['Prednisone', 'Ibuprofen'],
  M45: ['Ibuprofen', 'Prednisone'],
  M10: ['Ibuprofen', 'Prednisone'],
  M32: ['Prednisone'],
  H91: ['Betamethasone'],
  R53: ['Folic Acid'],
  R04: ['Amoxicillin'],
  H81: ['Betamethasone'],
  H66: ['Amoxicillin', 'Ibuprofen'],
  H25: ['Paracetamol'],
  H40: ['Prednisone'],
  H04: ['Prednisone'],
  H43: ['Paracetamol'],
  C50: ['Omeprazole', 'Prednisone'],
  C34: ['Paracetamol'],
  C81: ['Prednisone'],
  C61: ['Paracetamol'],
  C18: ['Omeprazole'],
  F32: ['Sertraline'],
  F41: ['Loratadine'],
  F90: ['Carbamazepine'],
  Z98: ['Amoxicillin', 'Ibuprofen', 'Paracetamol'],
  Z34: ['Folic Acid'],
  Z12: ['Folic Acid'],
  Z00: ['Paracetamol', 'Ibuprofen'],
  Z46: ['Ibuprofen'],
  A15: ['Amoxicillin', 'Metronidazole'],
  A90: ['Paracetamol'],
  T78: ['Diphenhydramine', 'Prednisone', 'Epinephrine'],
  B08: ['Paracetamol', 'Ibuprofen'],
  B18: ['Ursodeoxycholic Acid'],
  D22: ['Paracetamol'],
  D50: ['Folic Acid'],
  D69: ['Prednisone'],
  G90: ['Diphenhydramine'],
  K52: ['Domperidone'],
  L03: ['Amoxicillin', 'Metronidazole'],
  J23: ['Amoxicillin', 'Paracetamol'],
  S13: ['Ibuprofen', 'Paracetamol'],
  S06: ['Paracetamol'],
  S22: ['Paracetamol', 'Ibuprofen'],
  R26: ['Paracetamol'],
  W19: ['Paracetamol', 'Ibuprofen'],
  Z51: ['Omeprazole', 'Prednisone'],
  E78: ['Atorvastatin'],
  N39: ['Amoxicillin', 'Ibuprofen'],
  N20: ['Ibuprofen', 'Paracetamol'],
}

const SPECIALTY_MEDICATION: Record<string, string[]> = {
  Cardiology: ['Atorvastatin', 'Aspirin', 'Metoprolol', 'Amlodipine', 'Losartan'],
  Endocrinology: ['Metformin', 'Glibenclamide', 'Sitagliptin', 'Insulin Glargine', 'Levothyroxine'],
  'General Medicine': ['Atorvastatin', 'Metformin', 'Paracetamol', 'Ibuprofen', 'Omeprazole', 'Amoxicillin'],
  'Infectious Disease': ['Amoxicillin', 'Metronidazole', 'Acyclovir', 'Paracetamol'],
  Gastroenterology: ['Omeprazole', 'Ranitidine', 'Metronidazole', 'Mesalazine', 'Ursodeoxycholic Acid', 'Domperidone'],
  Neurology: ['Carbamazepine', 'Valproic Acid', 'Phenytoin', 'Levetiracetam', 'Gabapentin'],
  Dermatology: ['Betamethasone', 'Hydrocortisone', 'Clotrimazole', 'Isotretinoin', 'Acyclovir'],
  Gynecology: ['Medroxyprogesterone', 'Ethinylestradiol/Levonorgestrel', 'Clotrimazole', 'Metronidazole', 'Folic Acid'],
  Pediatrics: ['Amoxicillin', 'Paracetamol', 'Ibuprofen', 'Loratadine', 'Prednisone'],
  Dentistry: ['Amoxicillin', 'Metronidazole', 'Ibuprofen', 'Paracetamol', 'Chlorhexidine', 'Lidocaine'],
  Psychiatry: ['Carbamazepine', 'Valproic Acid', 'Gabapentin', 'Diphenhydramine'],
  'Allergy & Immunology': ['Loratadine', 'Diphenhydramine', 'Prednisone', 'Hydrocortisone'],
  Rheumatology: ['Prednisone', 'Ibuprofen', 'Paracetamol'],
  Oncology: ['Prednisone', 'Omeprazole', 'Paracetamol'],
  Ophthalmology: ['Prednisone', 'Acyclovir', 'Paracetamol'],
  Otolaryngology: ['Amoxicillin', 'Paracetamol', 'Ibuprofen', 'Loratadine', 'Prednisone'],
  Geriatrics: ['Atorvastatin', 'Metformin', 'Amlodipine', 'Losartan', 'Omeprazole'],
  Hematology: ['Prednisone', 'Folic Acid'],
}

const EXTRA_PRODUCTS = [
  { commercialName: 'Enalapril 10mg Tablets', activeSubstance: 'Enalapril', presentation: '10mg Tablets', laboratory: 'Merck' },
  { commercialName: 'Furosemide 40mg Tablets', activeSubstance: 'Furosemide', presentation: '40mg Tablets', laboratory: 'Sanofi' },
  { commercialName: 'Spironolactone 25mg Tablets', activeSubstance: 'Spironolactone', presentation: '25mg Tablets', laboratory: 'Pfizer' },
  { commercialName: 'Clopidogrel 75mg Tablets', activeSubstance: 'Clopidogrel', presentation: '75mg Tablets', laboratory: 'Sanofi' },
  { commercialName: 'Warfarin 5mg Tablets', activeSubstance: 'Warfarin', presentation: '5mg Tablets', laboratory: 'Bristol-Myers' },
  { commercialName: 'Apixaban 5mg Tablets', activeSubstance: 'Apixaban', presentation: '5mg Tablets', laboratory: 'Bristol-Myers' },
  { commercialName: 'Amiodarone 200mg Tablets', activeSubstance: 'Amiodarone', presentation: '200mg Tablets', laboratory: 'Sanofi' },
  { commercialName: 'Azithromycin 500mg Tablets', activeSubstance: 'Azithromycin', presentation: '500mg Tablets', laboratory: 'Pfizer' },
  { commercialName: 'Ciprofloxacin 500mg Tablets', activeSubstance: 'Ciprofloxacin', presentation: '500mg Tablets', laboratory: 'Bayer' },
  { commercialName: 'Ceftriaxone 1g Injection', activeSubstance: 'Ceftriaxone', presentation: '1g Injection', laboratory: 'Roche' },
  { commercialName: 'Sertraline 50mg Tablets', activeSubstance: 'Sertraline', presentation: '50mg Tablets', laboratory: 'Pfizer' },
  { commercialName: 'Donepezil 10mg Tablets', activeSubstance: 'Donepezil', presentation: '10mg Tablets', laboratory: 'Pfizer' },
  { commercialName: 'Epinephrine 0.3mg Auto-Injector', activeSubstance: 'Epinephrine', presentation: '0.3mg Auto-Injector', laboratory: 'GSK' },
  { commercialName: 'Memantine 10mg Tablets', activeSubstance: 'Memantine', presentation: '10mg Tablets', laboratory: 'Merck' },
  { commercialName: 'Budesonide 200mcg Inhaler', activeSubstance: 'Budesonide', presentation: '200mcg Inhaler', laboratory: 'AstraZeneca' },
  { commercialName: 'Salbutamol 100mcg Inhaler', activeSubstance: 'Salbutamol', presentation: '100mcg Inhaler', laboratory: 'GSK' },
  { commercialName: 'Bisoprolol 5mg Tablets', activeSubstance: 'Bisoprolol', presentation: '5mg Tablets', laboratory: 'Merck' },
]

function unitsPerBoxFor(name: string): number {
  const lower = name.toLowerCase()
  if (lower.includes('injection') || lower.includes('auto-injector')) return 1
  if (lower.includes('inhaler')) return 1
  return 20
}

async function ensureProduct(p: { commercialName: string; activeSubstance: string; presentation: string; laboratory: string }) {
  const existing = await prisma.productLibrary.findFirst({
    where: { commercialName: p.commercialName, activeSubstance: p.activeSubstance },
  })
  if (existing) return existing
  return prisma.productLibrary.create({
    data: { ...p, unitsPerBox: unitsPerBoxFor(p.commercialName) },
  })
}

async function ensureBatch(productId: string, tenantId: string) {
  const existing = await prisma.inventoryBatch.findFirst({
    where: { productId, tenantId, quantity: { gt: 0 } },
  })
  if (existing) return existing
  const d = new Date()
  d.setDate(d.getDate() + randomInt(30, 365))
  return prisma.inventoryBatch.create({
    data: {
      tenantId,
      productId,
      batchNumber: `SEED${String(randomInt(100, 999))}`,
      quantity: randomInt(100, 1000),
      costPerBox: randomInt(15, 500),
      expiryDate: d,
    },
  })
}

async function main() {
  const org = await prisma.organization.findFirst({ where: { slug: ORG_SLUG } })
  if (!org) { console.error(`Org "${ORG_SLUG}" not found`); return }
  const tenantId = org.id
  console.log(`\n🏥 Org: ${org.name} (${org.id})`)

  const existingProducts = await prisma.productLibrary.findMany()
  console.log(`📦 Productos existentes: ${existingProducts.length}`)

  let updatedUpb = 0
  for (const p of existingProducts) {
    if (p.unitsPerBox === 1) {
      const upb = unitsPerBoxFor(p.commercialName)
      if (upb !== 1) {
        await prisma.productLibrary.update({ where: { id: p.id }, data: { unitsPerBox: upb } })
        updatedUpb++
      }
    }
  }
  if (updatedUpb > 0) console.log(`📦 unitsPerBox actualizados: ${updatedUpb}`)

  const batchesWithoutCost = await prisma.inventoryBatch.findMany({
    where: { tenantId, costPerBox: null },
  })
  for (const b of batchesWithoutCost) {
    await prisma.inventoryBatch.update({
      where: { id: b.id },
      data: { costPerBox: randomInt(15, 500) },
    })
  }
  if (batchesWithoutCost.length > 0) {
    console.log(`💰 costPerBox asignados a ${batchesWithoutCost.length} lotes`)
  }

  const activeSubMap = new Map<string, typeof existingProducts[0]>()
  for (const p of existingProducts) {
    const key = p.activeSubstance.toLowerCase().trim()
    activeSubMap.set(key, p)
    const key2 = p.commercialName.toLowerCase().split(' ')[0]
    if (!activeSubMap.has(key2)) activeSubMap.set(key2, p)
  }

  let createdCount = 0
  for (const p of EXTRA_PRODUCTS) {
    if (!activeSubMap.has(p.activeSubstance.toLowerCase())) {
      const prod = await ensureProduct(p)
      activeSubMap.set(p.activeSubstance.toLowerCase(), prod)
      createdCount++
    }
  }
  if (createdCount > 0) console.log(`➕ Productos creados: ${createdCount}`)

  const allProducts = await prisma.productLibrary.findMany()
  const productBySubstance = new Map<string, typeof allProducts[0]>()
  for (const p of allProducts) {
    const key = p.activeSubstance.toLowerCase().trim()
    productBySubstance.set(key, p)
    for (const [icd, substances] of Object.entries(ICD_MEDICATION)) {
      for (const s of substances) {
        if (s.toLowerCase() === key) {
          if (!productBySubstance.has(icd)) productBySubstance.set(icd, p)
        }
      }
    }
  }

  const notes = await prisma.patientNote.findMany({
    where: { organizationId: tenantId, plan: { not: null } },
    include: {
      doctor: { select: { id: true } },
      dispensedMedications: { select: { id: true } },
    },
  })
  console.log(`📝 Notas con plan: ${notes.length}`)

  const notesWithoutDispensing = notes.filter(n => n.dispensedMedications.length === 0)
  console.log(`💊 Notas sin despachar: ${notesWithoutDispensing.length}`)

  let totalDispensed = 0
  let updatedNotes = 0

  for (const note of notesWithoutDispensing) {
    const icd = icdPrefix(note.diagnosis)
    const candidates = new Set<string>()

    if (icd && ICD_MEDICATION[icd]) {
      for (const s of ICD_MEDICATION[icd]) candidates.add(s)
    }

    if (candidates.size === 0) {
      const specialty = note.specialtyId
      if (specialty) {
        const specRec = await prisma.specialty.findUnique({ where: { id: specialty } })
        const specName = specRec?.nameEn || specRec?.nameEs || ''
        if (specName && SPECIALTY_MEDICATION[specName]) {
          for (const s of SPECIALTY_MEDICATION[specName]) candidates.add(s)
        }
      }
    }

    if (candidates.size === 0) {
      for (const s of SPECIALTY_MEDICATION['General Medicine']) candidates.add(s)
    }

    const validItems: { productId: string; activeSubstance: string }[] = []
    for (const substance of candidates) {
      const subKey = substance.toLowerCase().trim()
      const product = productBySubstance.get(subKey)
      const productAlt = allProducts.find(p => p.commercialName.toLowerCase().startsWith(subKey))
      const found = product || productAlt
      if (found) {
        const batch = await prisma.inventoryBatch.findFirst({
          where: { productId: found.id, tenantId, quantity: { gt: 0 } },
        })
        if (batch) {
          validItems.push({ productId: found.id, activeSubstance: substance })
        } else {
          const newBatch = await ensureBatch(found.id, tenantId)
          if (newBatch) validItems.push({ productId: found.id, activeSubstance: substance })
        }
      }
    }

    if (validItems.length === 0) continue

    const numItems = Math.min(randomInt(1, 2), validItems.length)
    const selected = validItems.sort(() => Math.random() - 0.5).slice(0, numItems)

    for (const item of selected) {
      const batch = await prisma.inventoryBatch.findFirst({
        where: { productId: item.productId, tenantId, quantity: { gt: 0 } },
        orderBy: { expiryDate: 'asc' },
      })
      if (!batch) continue

      const product = await prisma.productLibrary.findUnique({ where: { id: item.productId }, select: { unitsPerBox: true } })
      const upb = product?.unitsPerBox || 1
      const qty = upb * randomInt(1, 2)

      await prisma.dispensedMedication.create({
        data: {
          tenantId,
          noteId: note.id,
          batchId: batch.id,
          productId: item.productId,
          quantity: qty,
          dispensedBy: note.doctor?.id || 'seed-script',
        },
      })

      await prisma.inventoryBatch.update({
        where: { id: batch.id },
        data: { quantity: batch.quantity - qty },
      })

      await prisma.inventoryLog.create({
        data: {
          tenantId,
          batchId: batch.id,
          doctorId: note.doctor?.id || 'seed-script',
          patientId: note.patientId,
          quantity: qty,
          type: 'DISPENSED',
        },
      })

      totalDispensed++
    }

    if (!note.medicationDispensed) {
      await prisma.patientNote.update({
        where: { id: note.id },
        data: { medicationDispensed: true },
      })
    }
    updatedNotes++
  }

  console.log(`\n✅ Resultados:`)
  console.log(`   Notas procesadas: ${updatedNotes}`)
  console.log(`   DispensedMedication creados: ${totalDispensed}`)
  console.log(`   Total en DB ahora: ${await prisma.dispensedMedication.count()}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
