import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database';
import { HealthModule } from './health';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth';
import { OnboardingModule } from './onboarding';
import { InvitationsModule } from './invitations';
import { UsersModule } from './users';
import { ProfileModule } from './profile';
import { SpecialtiesModule } from './specialties/specialties.module';
import { TenantsModule } from './admin/tenants/tenants.module';
import { OperatorsModule } from './admin/operators/operators.module';
import { AdminInvitationsModule } from './admin/invitations.module';
import { TeamModule } from './team/team.module';
import { SettingsModule } from './settings/settings.module';
import { PatientsModule } from './patients/patients.module';
import { PatientNotesModule } from './patient-notes/patient-notes.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 segundo
        limit: 3,     // 3 requests por segundo
      },
      {
        name: 'medium',
        ttl: 60000,   // 1 minuto
        limit: 20,    // 20 requests por minuto
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hora
        limit: 100,   // 100 requests por hora
      },
    ]),
    DatabaseModule,
    HealthModule,
    MailModule,
    AuthModule,
    OnboardingModule,
    InvitationsModule,
    UsersModule,
    ProfileModule,
    SpecialtiesModule,
    TenantsModule,
    OperatorsModule,
    AdminInvitationsModule,
    TeamModule,
    SettingsModule,
    PatientsModule,
    PatientNotesModule,
    AppointmentsModule,
  ],

})
export class AppModule {}
