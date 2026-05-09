import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MANUFACTURERS = ['Bayer', 'Pfizer', 'Novartis', 'Roche', 'Sanofi', 'Merck', 'AstraZeneca', 'GSK', 'AbbVie', 'Johnson & Johnson']

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateBatchNumber(productIdx: number, batchIdx: number): string {
  const prefix = String.fromCharCode(65 + (productIdx % 26)) + String.fromCharCode(65 + ((productIdx * 7) % 26))
  const year = String(new Date().getFullYear()).slice(2)
  return `${prefix}${year}${String(batchIdx + 1).padStart(3, '0')}`
}

function generateExpiryDate(batchIdx: number): Date {
  const now = new Date()
  const d = new Date(now)

  // Spread batches across 2026-2027, with some soon-to-expire
  if (batchIdx === 0) {
    // First batch: expires within 30-90 days (critical/warning)
    d.setDate(d.getDate() + randomInt(15, 75))
  } else if (batchIdx === 1) {
    // Second batch: expires mid-range 2026
    d.setMonth(d.getMonth() + randomInt(6, 12))
  } else {
    // Third batch: expires 2027
    d.setFullYear(d.getFullYear() + 1)
    d.setMonth(randomInt(0, 11))
    d.setDate(randomInt(1, 28))
  }

  d.setUTCHours(12, 0, 0, 0)
  return d
}

function generateQuantity(productIdx: number, batchIdx: number): number {
  // Hospital-relevant quantities
  const base = [500, 1000, 250, 120, 300, 2000, 50, 150, 800, 400]
  const multiplier = batchIdx === 0 ? 1 : randomInt(1, 3)
  const qty = (base[productIdx % base.length] * multiplier)
  return Math.round(qty / 10) * 10 // round to nearest 10
}

async function main() {
  console.log('🏥 Seeding hospital stock data...')

  const organizations = await prisma.organization.findMany()
  if (organizations.length === 0) {
    console.log('❌ No organizations found. Run the main seed first.')
    return
  }

  const products = await prisma.productLibrary.findMany({
    where: { isActive: true },
    orderBy: { commercialName: 'asc' },
  })

  if (products.length === 0) {
    console.log('❌ No products in library. Seed products first.')
    return
  }

  let totalBatches = 0

  for (const org of organizations) {
    const slug = org.slug === 'omnidoc-saas' ? 'open-doc' : org.slug
    console.log(`\n📍 Organization: ${org.name} (${slug})`)

    for (let pi = 0; pi < products.length; pi++) {
      const product = products[pi]
      const numBatches = randomInt(1, 3) // 1-3 batches per product

      for (let bi = 0; bi < numBatches; bi++) {
        const batchNumber = generateBatchNumber(pi, bi)
        const expiryDate = generateExpiryDate(bi)
        const quantity = generateQuantity(pi, bi)

        const existing = await prisma.inventoryBatch.findFirst({
          where: {
            tenantId: org.id,
            productId: product.id,
            batchNumber,
          },
        })

        if (!existing) {
          await prisma.inventoryBatch.create({
            data: {
              tenantId: org.id,
              productId: product.id,
              batchNumber,
              quantity,
              expiryDate,
            },
          })
          totalBatches++
          console.log(`  ✅ ${product.commercialName} → ${batchNumber} (${quantity} units, expires ${expiryDate.toISOString().split('T')[0]})`)
        }
      }
    }
  }

  console.log(`\n🎉 Done! Created ${totalBatches} batch(es).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
