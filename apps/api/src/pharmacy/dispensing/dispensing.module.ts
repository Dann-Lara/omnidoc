import { Module } from '@nestjs/common'
import { DispensingService } from './dispensing.service'
import { DispensingController } from './dispensing.controller'
import { FefoStrategy } from './fefo.strategy'

@Module({
  controllers: [DispensingController],
  providers: [DispensingService, FefoStrategy],
  exports: [DispensingService],
})
export class DispensingModule {}
