import { Module } from '@nestjs/common';
import { AdminInvitationsController } from './invitations.controller';
import { PrismaService } from '../database/prisma.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [AdminInvitationsController],
  providers: [PrismaService],
})
export class AdminInvitationsModule {}