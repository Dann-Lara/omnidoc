import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, NotFoundException, BadRequestException, ForbiddenException, Logger, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { TeamService } from './team.service';
import { t } from '@/i18n/translations';
import { 
  CreateTeamInvitationSchema, 
  UpdateTeamMemberSchema,
  ResendInvitationSchema,
  TeamQuerySchema,
  TeamQueryDto,
  CreateTeamInvitationDto,
  UpdateTeamMemberDto,
  ResendInvitationDto,
} from './team.dto';

@ApiTags('team')
@Controller('team')
export class TeamController {
  private readonly logger = new Logger(TeamController.name);
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  constructor(
    private readonly teamService: TeamService,
    private configService: ConfigService,
  ) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'http://localhost:9999';
    this.supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';
  }

  private async getUserFromCookie(req: Request): Promise<string | null> {
    const accessToken = (req as Request & { cookies?: Record<string, string> }).cookies?.['sb-access-token'];
    console.log('[TeamController] Access token from cookie:', accessToken ? 'present' : 'missing');
    if (!accessToken) return null;

    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': this.supabaseKey,
        },
      });

      if (!response.ok) {
        console.log('[TeamController] Supabase auth failed:', response.status);
        return null;
      }
      const user = await response.json();
      console.log('[TeamController] User from Supabase:', user.id);
      return user.id;
    } catch (error) {
      console.log('[TeamController] Error validating token:', error);
      return null;
    }
  }

  private async getOrganizationId(req: Request): Promise<string | null> {
    const supabaseId = await this.getUserFromCookie(req);
    console.log('[TeamController] supabaseId from cookie:', supabaseId);
    
    if (!supabaseId) return null;

    const user = await this.teamService.getUserBySupabaseId(supabaseId);
    console.log('[TeamController] user from DB:', user);
    return user?.organizationId || null;
  }

  private async isOwner(req: Request): Promise<boolean> {
    const supabaseId = await this.getUserFromCookie(req);
    if (!supabaseId) return false;

    const user = await this.teamService.getUserBySupabaseId(supabaseId);
    return user?.userType === 'OWNER';
  }

  private getUserId(req: Request): string {
    return (req as any).user?.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get team members' })
  @ApiResponse({ status: 200, description: 'List of team members' })
  async getTeam(@Req() req: Request, @Query() query: unknown) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    const result = TeamQuerySchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(t('errors.auth.invalidParams', 'es'));
    }

    return this.teamService.getTeam(orgId, result.data as TeamQueryDto);
  }

  @Get('user-types')
  @ApiOperation({ summary: 'Get user types configuration' })
  @ApiResponse({ status: 200, description: 'User types for the organization' })
  async getUserTypes(@Req() req: Request) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    return this.teamService.getUserTypes(orgId);
  }

  @Put('user-types')
  @ApiOperation({ summary: 'Update user types configuration' })
  @ApiResponse({ status: 200, description: 'User types updated' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Only owners can update user types' })
  async updateUserTypes(@Req() req: Request, @Body() body: unknown) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    const isAuthorized = await this.isOwner(req);
    if (!isAuthorized) {
      throw new ForbiddenException(t('errors.auth.onlyOwners', 'es'));
    }

    if (!body || typeof body !== 'object') {
      throw new BadRequestException(t('errors.auth.userTypesRequired', 'es'));
    }

    return this.teamService.updateUserTypes(orgId, body as Record<string, any>);
  }

  @Get('invitations')
  @ApiOperation({ summary: 'Get pending invitations' })
  @ApiResponse({ status: 200, description: 'List of invitations' })
  async getInvitations(@Req() req: Request) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    return this.teamService.getInvitations(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team member by ID' })
  @ApiResponse({ status: 200, description: 'Team member details' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async getTeamMember(@Req() req: Request, @Param('id') id: string) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    return this.teamService.getTeamMember(id, orgId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update team member' })
  @ApiResponse({ status: 200, description: 'Team member updated' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async updateTeamMember(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    const result = UpdateTeamMemberSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid data';
      throw new BadRequestException(firstError);
    }

    return this.teamService.updateTeamMember(id, orgId, result.data as UpdateTeamMemberDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate team member' })
  @ApiResponse({ status: 204, description: 'Team member deactivated' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async deactivateTeamMember(@Req() req: Request, @Param('id') id: string) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    await this.teamService.deactivateTeamMember(id, orgId);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Create team invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created' })
  @ApiResponse({ status: 400, description: 'Invalid data or email already exists' })
  async createInvitation(@Req() req: Request, @Body() body: unknown) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    const supabaseId = await this.getUserFromCookie(req);
    if (!supabaseId) {
      throw new BadRequestException(t('errors.user.notFound', 'es'));
    }

    const result = CreateTeamInvitationSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid data';
      throw new BadRequestException(firstError);
    }

    const dbUser = await this.teamService.getUserBySupabaseId(supabaseId);
    if (!dbUser) {
      throw new BadRequestException(t('errors.user.notFound', 'es'));
    }

    const invitation = await this.teamService.createInvitation({
      ...result.data as CreateTeamInvitationDto,
      organizationId: orgId,
      invitedBy: dbUser.id,
    });

    return invitation;
  }

  @Post('invite/resend')
  @ApiOperation({ summary: 'Resend invitation' })
  @ApiResponse({ status: 200, description: 'Invitation resent' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async resendInvitation(@Req() req: Request, @Body() body: unknown) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    const result = ResendInvitationSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid data';
      throw new BadRequestException(firstError);
    }

    const { invitationId } = result.data as ResendInvitationDto;
    return this.teamService.resendInvitation(invitationId, orgId);
  }

  @Delete('invite/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke invitation' })
  @ApiResponse({ status: 204, description: 'Invitation revoked' })
  async revokeInvitation(@Req() req: Request, @Param('id') id: string) {
    const orgId = await this.getOrganizationId(req);
    if (!orgId) {
      throw new BadRequestException(t('errors.auth.organizationNotFound', 'es'));
    }

    await this.teamService.revokeInvitation(id, orgId);
  }

  @Post('setup/:token')
  @ApiOperation({ summary: 'Complete team invitation setup' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async completeSetup(
    @Param('token') token: string,
    @Body() body: { firstName: string; lastName: string; password: string },
  ) {
    if (!body.firstName || !body.lastName || !body.password) {
      throw new BadRequestException(t('errors.auth.requiredFields', 'es'));
    }

    return this.teamService.completeInvitation({
      token,
      firstName: body.firstName,
      lastName: body.lastName,
      password: body.password,
    });
  }

  @Get('setup/:token')
  @ApiOperation({ summary: 'Validate setup token' })
  @ApiResponse({ status: 200, description: 'Invitation details' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async validateSetup(@Param('token') token: string) {
    return this.teamService.validateInvitationComplete(token);
  }
}