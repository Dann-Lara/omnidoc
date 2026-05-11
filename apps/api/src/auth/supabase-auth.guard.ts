import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../database/prisma.service';
import { flattenRolePermissions } from '../lib/permissions';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

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
      
      const userMetadata = user.user_metadata || {};
      const appMetadata = user.app_metadata || {};
      
      const organizationSlug = userMetadata.organizationSlug || userMetadata.organization_slug || userMetadata.org_slug;
      let organizationId = userMetadata.organizationId || userMetadata.organization_id;
      
      if (organizationSlug && !organizationId) {
        const org = await this.prisma.organization.findUnique({
          where: { slug: organizationSlug },
          select: { id: true },
        });
        if (org) {
          organizationId = org.id;
        }
      }

      // Find user in our DB by supabaseId to get internal ID
      const dbUser = await this.prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: {
          id: true,
          organizationId: true,
          permissions: true,
          role: {
            select: { permissions: true },
          },
        },
      });

      let internalUserId = dbUser?.id;
      let internalOrgId = dbUser?.organizationId || organizationId;

      // If user doesn't exist in DB, create them
      if (!internalUserId && organizationId) {
        // Find or create role
        let role = await this.prisma.role.findFirst({
          where: { organizationId },
          select: { id: true },
        });

        if (!role) {
          role = await this.prisma.role.create({
            data: {
              organizationId,
              name: 'OWNER',
            },
            select: { id: true },
          });
        }

        if (role) {
          const newUser = await this.prisma.user.create({
            data: {
              supabaseId: user.id,
              email: user.email,
              firstName: userMetadata.firstName || userMetadata.first_name || 'User',
              lastName: userMetadata.lastName || userMetadata.last_name || '',
              organizationId,
              roleId: role.id,
            },
            select: { id: true, organizationId: true },
          });
          internalUserId = newUser.id;
          internalOrgId = newUser.organizationId;
        }
      }

      if (!internalUserId) {
        throw new UnauthorizedException('User not found in database');
      }
      
      let permissions: Record<string, boolean> | null = null
      if (dbUser?.permissions && typeof dbUser.permissions === 'object') {
        permissions = dbUser.permissions as Record<string, boolean>
      } else if (dbUser?.role?.permissions) {
        permissions = flattenRolePermissions(dbUser.role.permissions as string[])
      }

      (request as Request & { 
        user?: { 
          id: string; 
          email: string;
          organizationId?: string;
          organizationSlug?: string;
          role?: string;
          permissions?: Record<string, boolean>;
        } 
      }).user = {
        id: internalUserId,
        email: user.email,
        organizationId: internalOrgId,
        organizationSlug,
        role: userMetadata.role || appMetadata.role,
        permissions: permissions ?? undefined,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
