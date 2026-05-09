import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@Injectable()
export class ProductLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any, user: any) {
    const { search, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: any = { isActive: true }
    if (search) {
      where.OR = [
        { commercialName: { contains: search, mode: 'insensitive' } },
        { activeSubstance: { contains: search, mode: 'insensitive' } },
        { laboratory: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.productLibrary.findMany({
        where,
        orderBy: { commercialName: 'asc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.productLibrary.count({ where }),
    ])

    return {
      data,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    }
  }

  async findOne(id: string, user: any) {
    const product = await this.prisma.productLibrary.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  async create(dto: CreateProductDto, user: any) {
    return this.prisma.productLibrary.create({
      data: {
        commercialName: dto.commercialName,
        activeSubstance: dto.activeSubstance,
        presentation: dto.presentation,
        laboratory: dto.laboratory,
        barcode: dto.barcode,
        unitsPerBox: dto.unitsPerBox ?? 1,
      },
    })
  }

  async update(id: string, dto: UpdateProductDto, user: any) {
    const existing = await this.prisma.productLibrary.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Product not found')

    return this.prisma.productLibrary.update({
      where: { id },
      data: dto,
    })
  }

  async remove(id: string, user: any) {
    const existing = await this.prisma.productLibrary.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Product not found')

    return this.prisma.productLibrary.update({
      where: { id },
      data: { isActive: false },
    })
  }
}
