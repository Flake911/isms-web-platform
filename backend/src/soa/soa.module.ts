import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SoaService } from './soa.service';
import { SoaController } from './soa.controller';

@Module({ imports: [PrismaModule], controllers: [SoaController], providers: [SoaService] })
export class SoaModule {}
