import { Module } from '@nestjs/common';
import { RiskControlController } from './risk-control.controller';
import { RiskControlService } from './risk-control.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RiskControlController],
  providers: [RiskControlService],
})
export class RiskControlModule {}
