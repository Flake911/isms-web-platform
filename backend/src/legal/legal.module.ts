import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LegalService } from './legal.service';
import { LegalController } from './legal.controller';
@Module({ imports: [PrismaModule], controllers: [LegalController], providers: [LegalService] })
export class LegalModule {}
