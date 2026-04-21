import { Controller, Post, Get, Param, Body, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { InvitationsService } from './invitations.service';
import { TeamService } from '../team/team.service';
import { CreateInvitationSchema, CompleteInvitationSchema } from './invitations.dto';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly teamService: TeamService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created' })
  async createInvitation(@Body() body: unknown) {
    const result = CreateInvitationSchema.safeParse(body);
    
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }

    return this.invitationsService.createInvitation({
      ...result.data,
      createdBy: 'system',
    });
  }

  @Get(':token')
  @ApiOperation({ summary: 'Validate invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation details' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async validateInvitation(@Param('token') token: string, @Req() req: Request) {
    try {
      return await this.teamService.validateInvitationComplete(token);
    } catch {
      return this.invitationsService.validateToken(token);
    }
  }

  @Post(':token/complete')
  @ApiOperation({ summary: 'Complete invitation setup' })
  @ApiResponse({ status: 201, description: 'Setup completed' })
  @ApiResponse({ status: 400, description: 'Invalid token or data' })
  async completeInvitation(@Param('token') token: string, @Body() body: unknown, @Req() req: Request) {
    const result = CompleteInvitationSchema.safeParse(body);
    
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }

    try {
      return await this.teamService.completeInvitation({
        token,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        password: result.data.password,
      });
    } catch {
      return this.invitationsService.completeInvitation({
        token,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        password: result.data.password,
      });
    }
  }
}
