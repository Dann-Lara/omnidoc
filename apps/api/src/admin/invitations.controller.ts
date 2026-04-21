import { Controller, Get, Post, Delete, Param, HttpCode, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';

@ApiTags('admin - invitations')
@Controller('admin/invitations')
export class AdminInvitationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all operator invitations' })
  @ApiResponse({ status: 200, description: 'Invitations list' })
  async getInvitations() {
    return this.prisma.invitation.findMany({
      where: { role: 'OPERATOR' },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post(':id/resend')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend invitation' })
  @ApiResponse({ status: 200, description: 'Invitation resent' })
  async resendInvitation(@Param('id') id: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation is not pending');
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.invitation.update({
      where: { id },
      data: { expiresAt },
    });

    await this.mailService.sendInvitationEmail({
      to: invitation.email,
      inviterName: 'Admin',
      organizationName: 'OmniDoc',
      organizationSlug: 'omnis',
      token: invitation.token,
      roleName: 'Operador',
      roleNameEn: 'Operator',
      expiresInDays: 7,
    });

    return { message: 'Invitation resent' };
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revoke invitation' })
  @ApiResponse({ status: 200, description: 'Invitation revoked' })
  async revokeInvitation(@Param('id') id: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation is not pending');
    }

    await this.prisma.invitation.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    return { message: 'Invitation revoked' };
  }
}