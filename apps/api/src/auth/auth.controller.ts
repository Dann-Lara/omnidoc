import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IsEmail, IsString } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

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
    this.supabaseAdminKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAdminKey,
        },
        body: JSON.stringify({
          email: dto.email,
          password: dto.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.warn(`Login failed for ${dto.email}: ${data.msg}`);
        return { error: data.msg || 'Invalid credentials', status: response.status };
      }

      this.logger.log(`Login successful for: ${dto.email}`);

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        expires_at: data.expires_at,
        user: data.user,
      };
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
  async signup(@Body() dto: { email: string; password: string; firstName: string; lastName: string }) {
    this.logger.log(`Signup attempt for email: ${dto.email}`);

    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAdminKey,
        },
        body: JSON.stringify({
          email: dto.email,
          password: dto.password,
          options: {
            data: {
              first_name: dto.firstName,
              last_name: dto.lastName,
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.warn(`Signup failed for ${dto.email}: ${data.msg}`);
        return { error: data.msg || 'Signup failed' };
      }

      this.logger.log(`Signup successful for: ${dto.email}`);

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
    const isDevMode = this.configService.get<string>('NODE_ENV') === 'development';

    if (!isDevMode) {
      return { error: 'Dev login is only available in development mode' };
    }

    return this.login({
      email: 'superadmin@omnidoc.dev',
      password: 'dev-superadmin-123',
    });
  }
}
