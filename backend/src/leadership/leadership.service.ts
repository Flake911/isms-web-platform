import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadershipService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.leadership.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.leadership.findUnique({ where: { id } }); }
  create(data: any) { return this.prisma.leadership.create({ data }); }
  update(id: string, data: any) { return this.prisma.leadership.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.leadership.delete({ where: { id } }); }
  count() { return this.prisma.leadership.count(); }
}
