import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class LegalService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.legalRequirement.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.legalRequirement.findUnique({ where: { id } }); }
  create(data: any) { return this.prisma.legalRequirement.create({ data }); }
  update(id: string, data: any) { return this.prisma.legalRequirement.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.legalRequirement.delete({ where: { id } }); }
}
