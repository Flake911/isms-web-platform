import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SoaService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.soA.findMany({ orderBy: { createdAt: 'desc' } }); }

  async findOne(id: string) {
    const item = await this.prisma.soA.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`SoA entry ${id} not found`);
    return item;
  }

  async create(data: any) {
    try { return await this.prisma.soA.create({ data }); }
    catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError) throw new BadRequestException(e.message); throw e; }
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    try { return await this.prisma.soA.update({ where: { id }, data }); }
    catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError) throw new BadRequestException(e.message); throw e; }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.soA.delete({ where: { id } });
  }
}
