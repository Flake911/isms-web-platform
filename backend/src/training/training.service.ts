import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.training.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.training.findUnique({ where: { id } }); }
  create(data: any) { return this.prisma.training.create({ data }); }
  update(id: string, data: any) { return this.prisma.training.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.training.delete({ where: { id } }); }
  count() { return this.prisma.training.count(); }
}
