import { Module } from '@nestjs/common'
import { DispensingService } from './dispensing.service'
import { DispensingController } from './dispensing.controller'
import { FefoStrategy } from './fefo.strategy'
import { NotificationsModule } from '../../notifications/notifications.module'

@Module({
  imports: [NotificationsModule],
  controllers: [DispensingController],
  providers: [DispensingService, FefoStrategy],
  exports: [DispensingService],
})
export class DispensingModule {}
