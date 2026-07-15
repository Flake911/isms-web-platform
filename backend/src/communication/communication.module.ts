import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
@Module({ imports: [PrismaModule], controllers: [CommunicationController], providers: [CommunicationService] })
export class CommunicationModule {}
