import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ScopeService } from './scope.service';
import { ScopeController } from './scope.controller';

@Module({ imports: [PrismaModule], controllers: [ScopeController], providers: [ScopeService] })
export class ScopeModule {}
