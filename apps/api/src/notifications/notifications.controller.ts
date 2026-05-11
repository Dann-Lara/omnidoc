import { Controller, Get, Patch, Param, Req, UseGuards, Sse } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { NotificationsService } from './notifications.service'

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(SupabaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  async findAll(@Req() req: any) {
    const { organizationId, id: userId, permissions, role } = req.user
    const isOwner = role === 'OWNER' || role === 'SUPERADMIN'
    const userPerms = permissions ? Object.keys(permissions).map(k => k.replace('.', ':')) : []
    return this.notificationsService.findByOrg(organizationId, userId, isOwner, userPerms)
  }

  @Get('count')
  @ApiOperation({ summary: 'Count unread notifications' })
  async count(@Req() req: any) {
    const { organizationId, id: userId, permissions, role } = req.user
    const isOwner = role === 'OWNER' || role === 'SUPERADMIN'
    const userPerms = permissions ? Object.keys(permissions).map(k => k.replace('.', ':')) : []
    const count = await this.notificationsService.countUnread(organizationId, userId, isOwner, userPerms)
    return { count }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id)
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.organizationId, req.user.id)
  }

  @Sse('events')
  events(): Observable<any> {
    return this.notificationsService.events$.pipe(
      map(() => ({ data: { type: 'new' } })),
    )
  }
}
