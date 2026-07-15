import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RisksService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.risk.findMany({ orderBy: { createdAt: 'desc' } }); }

  async findOne(id: string) {
    const item = await this.prisma.risk.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Risk ${id} not found`);
    return item;
  }

  async create(data: any) {
    try { return await this.prisma.risk.create({ data }); }
    catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError || e instanceof Prisma.PrismaClientValidationError)
        throw new BadRequestException(e.message);
      throw e;
    }
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    try { return await this.prisma.risk.update({ where: { id }, data }); }
    catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError || e instanceof Prisma.PrismaClientValidationError)
        throw new BadRequestException(e.message);
      throw e;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.risk.delete({ where: { id } });
  }

  count() { return this.prisma.risk.count(); }
}
