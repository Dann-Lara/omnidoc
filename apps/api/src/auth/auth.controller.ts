import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { UserRole } from './types/user.types';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: {
    id: string;
    email: string;
    role: UserRole | null;
    org_slug: string | null;
    first_name: string | null;
    last_name: string | null;
  };
  message: string;
  error?: string;
}

interface SignupResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email: string;
    role?: UserRole;
    org_slug?: string;
    first_name?: string;
    last_name?: string;
  };
  message?: string;
  error?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly supabaseUrl: string;
  private readonly supabaseAdminKey: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'http://localhost:9999';
    this.supabaseAdminKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: { email?: string; password?: string }): Promise<LoginResponse> {
    const { email, password } = body;

    this.logger.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      return { error: 'Email and password are required', message: '', user: { id: '', email: '', role: null, org_slug: null, first_name: null, last_name: null }, access_token: '', refresh_token: '', expires_in: 0, expires_at: 0 };
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAdminKey,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.warn(`Login failed for ${email}: ${JSON.stringify(data)}`);
        return {
          error: data.error_description || data.error || 'Invalid credentials',
          message: '',
          user: { id: '', email: '', role: null, org_slug: null, first_name: null, last_name: null },
          access_token: '',
          refresh_token: '',
          expires_in: 0,
          expires_at: 0,
        };
      }

      const role = this.extractRole(data.user?.user_metadata);
      const orgSlug = data.user?.user_metadata?.org_slug as string | undefined;

      this.logger.log(`Login successful for: ${email}, role: ${role}, org_slug: ${orgSlug}`);

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: data.expires_at,
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          role,
          org_slug: orgSlug || null,
          first_name: data.user?.user_metadata?.first_name || null,
          last_name: data.user?.user_metadata?.last_name || null,
        },
        message: 'Login successful',
      };
    } catch (error) {
      this.logger.error(`Login error: ${error}`);
      return {
        error: 'Authentication service unavailable',
        message: '',
        user: { id: '', email: '', role: null, org_slug: null, first_name: null, last_name: null },
        access_token: '',
        refresh_token: '',
        expires_in: 0,
        expires_at: 0,
      };
    }
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user and organization' })
  @ApiResponse({ status: 201, description: 'User and organization created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async signup(
    @Body()
    body: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      orgName?: string;
      specialty?: string;
    },
  ): Promise<SignupResponse> {
    const { email, password, firstName, lastName, orgName, specialty } = body;

    this.logger.log(`Signup attempt for email: ${email}, org: ${orgName}`);

    if (!email || !password || !orgName) {
      return { error: 'Email, password, and organization name are required' };
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters' };
    }

    try {
      const orgSlug = this.generateSlug(orgName);

      const response = await fetch(`${this.supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAdminKey,
        },
        body: JSON.stringify({
          email,
          password,
          options: {
            data: {
              first_name: firstName || '',
              last_name: lastName || '',
              org_name: orgName,
              org_slug: orgSlug,
              specialty: specialty || '',
              role: UserRole.CLIENT,
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.warn(`Signup failed for ${email}: ${JSON.stringify(data)}`);
        return { error: data.msg || data.error || 'Signup failed' };
      }

      this.logger.log(`Signup successful for: ${email}, org_slug: ${orgSlug}`);

      if (data.session) {
        return {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
          user: {
            id: data.user?.id || '',
            email: data.user?.email || '',
            role: UserRole.CLIENT,
            org_slug: orgSlug,
            first_name: firstName || '',
            last_name: lastName || '',
          },
          message: 'User and organization created successfully',
        };
      }

      return {
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          role: UserRole.CLIENT,
          org_slug: orgSlug,
          first_name: firstName || '',
          last_name: lastName || '',
        },
        message: 'User created successfully. Please check your email to confirm.',
      };
    } catch (error) {
      this.logger.error(`Signup error: ${error}`);
      return { error: 'Authentication service unavailable' };
    }
  }

  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dev login - returns superadmin session' })
  async devLogin(): Promise<LoginResponse> {
    return this.login({
      email: 'superadmin@omnidoc.dev',
      password: 'dev-superadmin-123',
    });
  }

  private extractRole(metadata?: Record<string, unknown>): UserRole | null {
    if (!metadata) return null;
    const role = metadata.role;
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      return role as UserRole;
    }
    return null;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
}
