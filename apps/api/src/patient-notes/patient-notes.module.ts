import { Module, forwardRef } from '@nestjs/common'
import { PatientNotesController } from './patient-notes.controller'
import { PatientNotesService } from './patient-notes.service'
import { MailModule } from '../mail/mail.module'

@Module({
  controllers: [PatientNotesController],
  providers: [PatientNotesService],
  exports: [PatientNotesService],
  imports: [MailModule],
})
export class PatientNotesModule {}