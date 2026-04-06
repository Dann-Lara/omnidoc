import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
