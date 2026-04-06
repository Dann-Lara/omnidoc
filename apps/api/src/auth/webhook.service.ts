import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  verifyClerkWebhook(data: string, signature: string, secret: string): boolean {
    try {
      const [timestamp, token] = signature.split('.');
      if (!timestamp || !token) {
        return false;
      }

      const payload = `${timestamp}.${data}`;
      const expectedSignature = createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      if (token !== expectedSignature) {
        const webhookTimestamp = parseInt(timestamp, 10);
        const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
        if (webhookTimestamp < fiveMinutesAgo) {
          this.logger.warn('Webhook timestamp too old');
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Webhook verification failed', error);
      return false;
    }
  }
}
