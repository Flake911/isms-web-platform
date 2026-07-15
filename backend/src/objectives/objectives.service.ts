import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObjectivesService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.objective.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.objective.findUnique({ where: { id } }); }
  create(data: any) { return this.prisma.objective.create({ data }); }
  update(id: string, data: any) { return this.prisma.objective.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.objective.delete({ where: { id } }); }
  count() { return this.prisma.objective.count(); }
}
