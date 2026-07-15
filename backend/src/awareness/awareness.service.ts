import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AwarenessService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.awarenessProgress.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.awarenessProgress.findUnique({ where: { id } }); }
  create(data: any) { return this.prisma.awarenessProgress.create({ data }); }
  update(id: string, data: any) { return this.prisma.awarenessProgress.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.awarenessProgress.delete({ where: { id } }); }
  count() { return this.prisma.awarenessProgress.count(); }

  // Upsert by (employeeName, courseId) — handles @@unique constraint
  upsertCompletion(employeeName: string, department: string, courseId: string, score: number) {
    return this.prisma.awarenessProgress.upsert({
      where: { employeeName_courseId: { employeeName, courseId } },
      create: { employeeName, department, courseId, score, completedAt: new Date() },
      update: { score, department, completedAt: new Date() },
    });
  }
}
