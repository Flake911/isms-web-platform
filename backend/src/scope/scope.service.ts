import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScopeService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.scope.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.scope.findUnique({ where: { id } }); }
  create(data: any) { return this.prisma.scope.create({ data }); }
  update(id: string, data: any) { return this.prisma.scope.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.scope.delete({ where: { id } }); }
}
