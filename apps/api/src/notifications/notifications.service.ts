import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { Subject } from 'rxjs'

@Injectable()
export class NotificationsService {
  private notificationEvents = new Subject<{ type: string }>()

  get events$() {
    return this.notificationEvents.asObservable()
  }

  constructor(private readonly prisma: PrismaService) {}

  async findByOrg(organizationId: string, userId: string, isOwner: boolean, userPermissions: string[]) {
    if (isOwner) {
      return this.prisma.notification.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    }
    return this.prisma.notification.findMany({
      where: {
        organizationId,
        OR: [
          { userId },
          { targetPermission: { in: userPermissions } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async countUnread(organizationId: string, userId: string, isOwner: boolean, userPermissions: string[]) {
    if (isOwner) {
      return this.prisma.notification.count({
        where: { organizationId, isRead: false },
      })
    }
    return this.prisma.notification.count({
      where: {
        organizationId,
        OR: [
          { userId },
          { targetPermission: { in: userPermissions } },
        ],
        isRead: false,
      },
    })
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, OR: [{ userId }, { userId: null }] },
      data: { isRead: true },
    })
  }

  async markAllAsRead(organizationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { organizationId, OR: [{ userId }, { userId: null }] },
      data: { isRead: true },
    })
  }

  async create(data: {
    organizationId: string
    targetPermission?: string
    userId?: string
    type: string
    title: string
    message?: string
    noteId?: string
  }) {
    const notification = await this.prisma.notification.create({ data })
    this.notificationEvents.next({ type: 'new' })
    return notification
  }
}
