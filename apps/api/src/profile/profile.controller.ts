import { Controller, Get, Put, Body, Req, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, UpdateAvatarDto, UpdateOrganizationDto } from './profile.dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  constructor(
    private readonly profileService: ProfileService,
    private configService: ConfigService,
  ) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'http://localhost:9999';
    this.supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';
  }

  private async getUserFromCookie(req: Request): Promise<string | null> {
    const accessToken = (req as Request & { cookies?: Record<string, string> }).cookies?.['sb-access-token'];
    if (!accessToken) return null;

    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': this.supabaseKey,
        },
      });

      if (!response.ok) return null;
      const user = await response.json();
      return user.id;
    } catch {
      return null;
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request) {
    const supabaseId = await this.getUserFromCookie(req);
    if (!supabaseId) {
      return { error: 'Unauthorized', user: null, organization: null };
    }
    return this.profileService.getProfile(supabaseId);
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ) {
    const supabaseId = await this.getUserFromCookie(req);
    if (!supabaseId) {
      return { error: 'Unauthorized', user: null, organization: null };
    }
    return this.profileService.updateProfile(supabaseId, dto);
  }

  @Put('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAvatar(@Req() req: Request, @Body() body: UpdateAvatarDto) {
    const supabaseId = await this.getUserFromCookie(req);
    if (!supabaseId) {
      return { error: 'Unauthorized', avatar: null };
    }
    return this.profileService.updateAvatar(supabaseId, body.avatar);
  }

  @Put('organization')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update organization (tenant admin only)' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateOrganization(
    @Req() req: Request,
    @Body() dto: UpdateOrganizationDto,
  ) {
    const supabaseId = await this.getUserFromCookie(req);
    if (!supabaseId) {
      return { error: 'Unauthorized' };
    }
    
    const profile = await this.profileService.getProfile(supabaseId);
    
    if (profile.user.role !== 'OWNER' || !profile.organization) {
      return { error: 'Only tenant admins can update organization' };
    }

    return this.profileService.updateOrganization(supabaseId, profile.organization.id, dto);
  }

  @Put('specialties')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user or organization specialties' })
  @ApiResponse({ status: 200, description: 'Specialties updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSpecialties(
    @Req() req: Request,
    @Body() body: { specialtyIds: string[] },
  ) {
    const supabaseId = await this.getUserFromCookie(req);
    if (!supabaseId) {
      return { error: 'Unauthorized' };
    }
    
    return this.profileService.updateProfile(supabaseId, { specialtyIds: body.specialtyIds });
  }
}
