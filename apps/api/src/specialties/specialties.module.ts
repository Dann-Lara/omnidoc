import { Module } from '@nestjs/common';
import { SpecialtiesController } from './specialties.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [SpecialtiesController],
  providers: [PrismaService],
})
export class SpecialtiesModule {}