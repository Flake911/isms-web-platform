import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class MgmtReviewService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.managementReview.findMany({ orderBy: { createdAt: 'desc' } }); }
  findOne(id: string) { return this.prisma.managementReview.findUnique({ where: { id } }); }
  create(data: any) { return this.prisma.managementReview.create({ data }); }
  update(id: string, data: any) { return this.prisma.managementReview.update({ where: { id }, data }); }
  remove(id: string) { return this.prisma.managementReview.delete({ where: { id } }); }
}
