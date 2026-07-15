import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvidenceService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.evidence.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.evidence.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Evidence ${id} not found`);
    return item;
  }

  create(data: any) {
    return this.prisma.evidence.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.evidence.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.evidence.delete({ where: { id } });
  }
}
