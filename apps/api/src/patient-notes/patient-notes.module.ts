import { Module } from '@nestjs/common'
import { PatientNotesController } from './patient-notes.controller'
import { PatientNotesService } from './patient-notes.service'
import { MailModule } from '../mail/mail.module'
import { DispensingModule } from '../pharmacy/dispensing/dispensing.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  controllers: [PatientNotesController],
  providers: [PatientNotesService],
  exports: [PatientNotesService],
  imports: [MailModule, DispensingModule, NotificationsModule],
})
export class PatientNotesModule {}