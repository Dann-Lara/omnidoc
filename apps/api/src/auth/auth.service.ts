import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { supabaseAdmin } from '../lib/supabase';

export interface SyncUserData {
  supabaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  roleId?: string;
  userType?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService) {}

  async syncUser(data: SyncUserData) {
    const existingUser = await this.prisma.user.findUnique({
      where: { supabaseId: data.supabaseId },
    });

    if (existingUser) {
      this.logger.log(`User ${data.supabaseId} already exists, updating...`);
      return this.prisma.user.update({
        where: { supabaseId: data.supabaseId },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    }

    this.logger.log(`Creating new user for supabaseId: ${data.supabaseId}`);
    return this.prisma.user.create({
      data: {
        supabaseId: data.supabaseId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationId: data.organizationId || '',
        roleId: data.roleId || '',
        userType: data.userType || 'COLLABORATOR',
      },
    });
  }

  async getUserBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
      include: {
        organization: true,
        role: true,
      },
    });
  }

  async getUserRole(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      include: {
        role: true,
        organization: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      role: user.userType,
      roleId: user.roleId,
      organizationId: user.organizationId,
      organizationSlug: user.organization.slug,
      userType: user.userType,
      subtype: user.subtype,
      permissions: user.role?.permissions || [],
    };
  }

  async deleteUser(supabaseId: string) {
    this.logger.log(`Deleting user with supabaseId: ${supabaseId}`);

    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      this.logger.warn(`User with supabaseId ${supabaseId} not found in database`);
      return null;
    }

    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(supabaseId);
      if (error) {
        this.logger.warn(`Failed to delete user from Supabase: ${error.message}`);
      }
    } catch (error) {
      this.logger.warn(`Supabase user deletion skipped: ${error}`);
    }

    return this.prisma.user.delete({
      where: { supabaseId },
    });
  }

  async createUserInSupabase(email: string, password: string, metadata: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) {
      this.logger.error(`Failed to create user in Supabase: ${error.message}`);
      throw new Error(error.message);
    }

    return data.user;
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
      include: {
        organization: true,
        role: true,
      },
    });
  }
}
