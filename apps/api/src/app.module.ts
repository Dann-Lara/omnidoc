import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database';
import { HealthModule } from './health';
import { AuthModule } from './auth';
import { OnboardingModule } from './onboarding';
import { InvitationsModule } from './invitations';
import { UsersModule } from './users';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    OnboardingModule,
    InvitationsModule,
    UsersModule,
  ],
})
export class AppModule {}
