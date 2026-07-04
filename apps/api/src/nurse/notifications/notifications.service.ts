import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaNurseService } from '../../prisma-nurse/prisma-nurse.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaNurseService) {}

  async findAll(nurseId: string, isRead?: string) {
    const whereCondition: any = { nurseId };
    
    if (isRead !== undefined) {
      whereCondition.isRead = isRead === 'true';
    }

    const items = await this.prisma.nurseNotification.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await this.prisma.nurseNotification.count({
      where: { nurseId, isRead: false },
    });

    return {
      total: items.length,
      unread: unreadCount,
      items,
    };
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.nurseNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.nurseNotification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(nurseId: string) {
    return this.prisma.nurseNotification.updateMany({
      where: { nurseId, isRead: false },
      data: { isRead: true },
    });
  }
}
