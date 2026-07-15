import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Exclude password from all query results
  private readonly selectWithoutPassword = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    organization: true,
    status: true,
    mfaEnabled: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
  };

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: this.selectWithoutPassword,
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.selectWithoutPassword,
    });
  }

  async create(data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.create({
      data,
      select: this.selectWithoutPassword,
    });
  }

  async update(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      // Don't overwrite existing password with null/empty
      delete data.password;
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.selectWithoutPassword,
    });
  }

  delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  count() {
    return this.prisma.user.count();
  }
}
