import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('global-lang')
  @ApiOperation({ summary: 'Get global SAAS language' })
  @ApiResponse({ status: 200, description: 'Returns global language setting' })
  async getGlobalLang() {
    return this.settingsService.getGlobalLang();
  }

  @Post('global-lang')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set global SAAS language (superadmin only)' })
  @ApiResponse({ status: 200, description: 'Global language updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - superadmin only' })
  async setGlobalLang(@Body() body: { lang: 'en' | 'es' }, @Req() req: Request) {
    const user = (req as any).user;
    if (user?.role !== 'SUPERADMIN') {
      throw new Error('Forbidden - superadmin only');
    }
    return this.settingsService.setGlobalLang(body.lang);
  }

  @Get('org-lang/:orgIdOrSlug')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organization language' })
  @ApiResponse({ status: 200, description: 'Returns organization language' })
  async getOrgLang(@Param('orgIdOrSlug') orgIdOrSlug: string, @Req() req: Request) {
    const user = (req as any).user;
    
    // Debug: log the user object
    console.log('User in settings:', JSON.stringify(user));
    
    // Allow if user belongs to the org (check by ID or slug)
    const userOrgId = user?.organizationId;
    const userOrgSlug = user?.organization?.slug || user?.organizationSlug;
    const userRole = user?.role;
    const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'SUPERADMIN';
    
    if (!isOwnerOrAdmin && userOrgId !== orgIdOrSlug && userOrgSlug !== orgIdOrSlug) {
      throw new Error('Forbidden');
    }
    return this.settingsService.getOrgLang(orgIdOrSlug);
  }

  @Patch('org-lang/:orgIdOrSlug')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organization language' })
  @ApiResponse({ status: 200, description: 'Organization language updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateOrgLang(
    @Param('orgIdOrSlug') orgIdOrSlug: string,
    @Body() body: { lang: 'en' | 'es' },
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const userOrgId = user?.organizationId;
    const userOrgSlug = user?.organization?.slug || user?.organizationSlug;
    const isOwnerOrAdmin = user?.role === 'OWNER' || user?.role === 'SUPERADMIN';
    
    if (!isOwnerOrAdmin && userOrgId !== orgIdOrSlug && userOrgSlug !== orgIdOrSlug) {
      throw new Error('Forbidden');
    }
    return this.settingsService.updateOrgLang(orgIdOrSlug, body.lang);
  }
}