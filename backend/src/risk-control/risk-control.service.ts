import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RiskControlService {
  constructor(private prisma: PrismaService) {}

  async findByRisk(riskId: string) {
    return this.prisma.riskControl.findMany({
      where: { riskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByControl(controlId: string) {
    return this.prisma.riskControl.findMany({
      where: { controlId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.riskControl.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async link(data: { riskId: string; controlId: string; notes?: string }) {
    return this.prisma.riskControl.upsert({
      where: { riskId_controlId: { riskId: data.riskId, controlId: data.controlId } },
      update: { notes: data.notes },
      create: data,
    });
  }

  async unlink(riskId: string, controlId: string) {
    return this.prisma.riskControl.delete({
      where: { riskId_controlId: { riskId, controlId } },
    });
  }

  async remove(id: string) {
    return this.prisma.riskControl.delete({ where: { id } });
  }
}
