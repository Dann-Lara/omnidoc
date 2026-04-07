import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  roleId?: string;
}

class DevLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (signup)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async signup(@Body() dto: SignupDto) {
    this.logger.log(`Signup attempt for email: ${dto.email}`);

    try {
      const user = await this.authService.createUserInSupabase(dto.email, dto.password, {
        first_name: dto.firstName,
        last_name: dto.lastName,
        organization_id: dto.organizationId,
        role_id: dto.roleId,
      });

      await this.authService.syncUser({
        supabaseId: user.id,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        organizationId: dto.organizationId,
        roleId: dto.roleId,
      });

      this.logger.log(`User created successfully: ${user.id}`);
      return { user, message: 'User created successfully' };
    } catch (error) {
      this.logger.error(`Signup failed: ${error}`);
      throw error;
    }
  }

  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dev login - create and login superadmin (dev only)' })
  @ApiResponse({ status: 200, description: 'Dev login successful' })
  @ApiResponse({ status: 403, description: 'Not in development mode' })
  async devLogin(@Body() dto: DevLoginDto) {
    const isDevMode = this.configService.get<string>('DEV_MODE') === 'true';

    if (!isDevMode) {
      this.logger.warn('Dev login attempted in non-dev environment');
      return { error: 'Dev login is only available in development mode' };
    }

    this.logger.log(`Dev login for: ${dto.email}`);

    try {
      const user = await this.authService.createUserInSupabase(dto.email, dto.password, {
        role: 'SUPERADMIN',
        first_name: 'Super',
        last_name: 'Admin',
      });

      return {
        user,
        message: 'Dev login successful',
      };
    } catch (error) {
      this.logger.error(`Dev login failed: ${error}`);
      throw error;
    }
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Req() req: Request) {
    const headers = req.headers as unknown as Record<string, string | undefined>;
    const authHeader = headers['authorization'];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    return { token };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token verified' })
  async verifyToken(@Body() _body: { token: string }) {
    return { valid: true, message: 'Token verification endpoint' };
  }
}
