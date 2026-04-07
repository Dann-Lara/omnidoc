import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserRole } from './types/user.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly supabaseUrl: string;
  private readonly supabaseAdminKey: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'http://localhost:9999';
    this.supabaseAdminKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: { email?: string; password?: string }) {
    const email = body?.email;
    const password = body?.password;
    
    this.logger.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      return { error: 'Email and password are required', status: 400 };
    }

    try {
      const url = `${this.supabaseUrl}/auth/v1/token?grant_type=password`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAdminKey,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.warn(`Login failed for ${email}: ${JSON.stringify(data)}`);
        return { error: data.error_description || data.error || 'Invalid credentials', status: response.status };
      }

      const role = this.extractRole(data.user?.user_metadata);
      this.logger.log(`Extracted role: ${role}`);

      const loginResponse = new LoginResponseDto({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: data.expires_at,
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          role: role,
          first_name: data.user?.user_metadata?.first_name || null,
          last_name: data.user?.user_metadata?.last_name || null,
        },
      });

      this.logger.log(`Login successful for: ${email}, role: ${role}`);
      return loginResponse;
    } catch (error) {
      this.logger.error(`Login error: ${error}`);
      return { error: 'Authentication service unavailable' };
    }
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (signup)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async signup(@Body() body: { email?: string; password?: string; firstName?: string; lastName?: string }) {
    const email = body?.email;
    const password = body?.password;
    
    this.logger.log(`Signup attempt for email: ${email}`);

    if (!email || !password) {
      return { error: 'Email and password are required', status: 400 };
    }

    try {
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
              first_name: body.firstName,
              last_name: body.lastName,
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.warn(`Signup failed for ${email}: ${data.msg}`);
        return { error: data.msg || data.error || 'Signup failed' };
      }

      this.logger.log(`Signup successful for: ${email}`);

      return {
        user: data.user,
        session: data.session,
        message: 'User created successfully',
      };
    } catch (error) {
      this.logger.error(`Signup error: ${error}`);
      return { error: 'Authentication service unavailable' };
    }
  }

  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dev login - returns superadmin session' })
  async devLogin() {
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
}
