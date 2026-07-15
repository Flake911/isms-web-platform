import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CapaService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.cAPA.findMany({ orderBy: { createdAt: 'desc' } }); }

  async findOne(id: string) {
    const item = await this.prisma.cAPA.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`CAPA ${id} not found`);
    return item;
  }

  async create(data: any) {
    try { return await this.prisma.cAPA.create({ data }); }
    catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError) throw new BadRequestException(e.message); throw e; }
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    try { return await this.prisma.cAPA.update({ where: { id }, data }); }
    catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError) throw new BadRequestException(e.message); throw e; }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cAPA.delete({ where: { id } });
  }

  count() { return this.prisma.cAPA.count(); }
}
