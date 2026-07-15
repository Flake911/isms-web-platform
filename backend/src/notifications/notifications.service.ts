import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findForUser(userId?: string) {
    return this.prisma.notification.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : { userId: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  unreadCount(userId?: string) {
    return this.prisma.notification.count({
      where: {
        ...(userId ? { OR: [{ userId }, { userId: null }] } : { userId: null }),
        read: false,
      },
    });
  }

  markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  markAllRead(userId?: string) {
    return this.prisma.notification.updateMany({
      where: {
        ...(userId ? { OR: [{ userId }, { userId: null }] } : { userId: null }),
        read: false,
      },
      data: { read: true },
    });
  }

  create(data: any) {
    return this.prisma.notification.create({ data });
  }

  remove(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }
}
