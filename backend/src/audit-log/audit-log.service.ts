import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: { userId?: string; userEmail?: string; action: string; module: string; recordId?: string; recordName?: string; oldValues?: any; newValues?: any; ipAddress?: string }) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data.newValues ? JSON.stringify(data.newValues) : null,
      },
    });
  }

  findAll(query?: { module?: string; action?: string; take?: number }) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(query?.module ? { module: query.module } : {}),
        ...(query?.action ? { action: query.action } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: query?.take || 100,
    });
  }

  count() { return this.prisma.auditLog.count(); }
}
