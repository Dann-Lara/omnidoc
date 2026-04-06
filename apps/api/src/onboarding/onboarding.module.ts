import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
