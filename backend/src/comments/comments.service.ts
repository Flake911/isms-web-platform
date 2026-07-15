import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  findAll(module: string, recordId: string) {
    return this.prisma.comment.findMany({
      where: { module, recordId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(data: any) {
    return this.prisma.comment.create({ data });
  }

  async remove(id: string) {
    const item = await this.prisma.comment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Comment ${id} not found`);
    return this.prisma.comment.delete({ where: { id } });
  }
}
