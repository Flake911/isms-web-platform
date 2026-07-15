import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BcpService } from './bcp.service';
import { BcpController } from './bcp.controller';
@Module({ imports: [PrismaModule], controllers: [BcpController], providers: [BcpService] })
export class BcpModule {}
