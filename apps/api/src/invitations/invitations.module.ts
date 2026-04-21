import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [AuthModule, DatabaseModule, TeamModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
