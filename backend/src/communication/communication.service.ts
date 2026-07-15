import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class CommunicationService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.communication.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.communication.findUnique({ where: { id } }); }
  create(data: any) { return this.prisma.communication.create({ data }); }
  update(id: string, data: any) { return this.prisma.communication.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.communication.delete({ where: { id } }); }
}
