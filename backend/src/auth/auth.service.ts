import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update lastLogin
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateMe(userId: string, data: { firstName?: string; lastName?: string; email?: string; currentPassword?: string; newPassword?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const update: Record<string, any> = {};
    if (data.firstName) update.firstName = data.firstName;
    if (data.lastName) update.lastName = data.lastName;
    if (data.email) update.email = data.email;

    if (data.newPassword) {
      if (!data.currentPassword) throw new UnauthorizedException('Current password is required');
      if (!user.password) throw new UnauthorizedException('Account has no password set');
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid) throw new UnauthorizedException('Current password is incorrect');
      update.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await this.prisma.user.update({ where: { id: userId }, data: update });
    const { password: _, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async seedAdmin() {
    const existing = await this.prisma.user.findUnique({
      where: { email: 'admin@sentraisms.com' },
    });
    if (!existing) {
      const hashedPassword = await this.hashPassword('Admin@2026');
      await this.prisma.user.create({
        data: {
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@sentraisms.com',
          password: hashedPassword,
          role: 'Super Admin',
          organization: 'SentraISMS',
          status: 'Active',
        },
      });
      console.log('🔐 Default Super Admin account created: admin@sentraisms.com');
    }
  }
}
