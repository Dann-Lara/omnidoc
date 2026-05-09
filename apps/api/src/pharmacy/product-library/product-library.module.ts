import { Module } from '@nestjs/common'
import { ProductLibraryController } from './product-library.controller'
import { ProductLibraryService } from './product-library.service'

@Module({
  controllers: [ProductLibraryController],
  providers: [ProductLibraryService],
  exports: [ProductLibraryService],
})
export class ProductLibraryModule {}
