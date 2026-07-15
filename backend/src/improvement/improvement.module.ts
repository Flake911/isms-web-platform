import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ImprovementService } from './improvement.service';
import { ImprovementController } from './improvement.controller';
@Module({ imports: [PrismaModule], controllers: [ImprovementController], providers: [ImprovementService] })
export class ImprovementModule {}
