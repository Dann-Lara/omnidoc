import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkService } from './clerk.service';
import { WebhookService } from './webhook.service';
import { DatabaseModule } from '../database';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, ClerkService, WebhookService],
  exports: [AuthService, ClerkService],
})
export class AuthModule {}
