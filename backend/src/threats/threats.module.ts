import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ThreatsService } from './threats.service';
import { ThreatsController } from './threats.controller';
@Module({ imports: [PrismaModule], controllers: [ThreatsController], providers: [ThreatsService] })
export class ThreatsModule {}
