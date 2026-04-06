import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { WebhookService } from './webhook.service';

interface ClerkWebhookPayload {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string;
    last_name: string;
    public_metadata?: Record<string, unknown>;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Clerk webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async handleWebhook(
    @Body() body: string,
    @Headers('clerk-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

    if (!webhookSecret) {
      this.logger.error('CLERK_WEBHOOK_SECRET not configured');
      return { error: 'Webhook not configured' };
    }

    const isValid = this.webhookService.verifyClerkWebhook(body, signature, webhookSecret);
    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      return { error: 'Invalid signature' };
    }

    const payload: ClerkWebhookPayload = JSON.parse(body);
    const { type, data } = payload;

    this.logger.log(`Processing webhook: ${type} for user ${data.id}`);

    switch (type) {
      case 'user.created':
        await this.handleUserCreated(data);
        break;
      case 'user.updated':
        await this.handleUserUpdated(data);
        break;
      case 'user.deleted':
        await this.handleUserDeleted(data);
        break;
      default:
        this.logger.log(`Unhandled webhook type: ${type}`);
    }

    return { received: true };
  }

  private async handleUserCreated(data: ClerkWebhookPayload['data']) {
    this.logger.log(`User created in Clerk: ${data.id}`);

    await this.authService.syncUser({
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address || '',
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      organizationId: data.public_metadata?.organizationId as string,
      roleId: data.public_metadata?.roleId as string,
      isTenantAdmin: data.public_metadata?.isTenantAdmin as boolean,
    });
  }

  private async handleUserUpdated(data: ClerkWebhookPayload['data']) {
    this.logger.log(`User updated in Clerk: ${data.id}`);
    
    await this.authService.syncUser({
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address || '',
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      organizationId: data.public_metadata?.organizationId as string,
      roleId: data.public_metadata?.roleId as string,
      isTenantAdmin: data.public_metadata?.isTenantAdmin as boolean,
    });
  }

  private async handleUserDeleted(data: { id: string }) {
    this.logger.log(`User deleted from Clerk: ${data.id}`);
    
    await this.authService.deleteUser(data.id);
  }
}
