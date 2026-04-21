import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'http://localhost:9999';
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';

    const accessToken = request.cookies?.['sb-access-token'];

    if (!accessToken) {
      throw new UnauthorizedException('No access token');
    }

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseKey,
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await response.json();
      
      // Extract user metadata which contains organization info
      const userMetadata = user.user_metadata || {};
      const appMetadata = user.app_metadata || {};
      
      (request as Request & { 
        user?: { 
          id: string; 
          email: string;
          organizationId?: string;
          organizationSlug?: string;
          role?: string;
        } 
      }).user = {
        id: user.id,
        email: user.email,
        organizationId: userMetadata.organizationId || userMetadata.organization_id,
        organizationSlug: userMetadata.organizationSlug || userMetadata.organization_slug,
        role: userMetadata.role || appMetadata.role,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
