import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MgmtReviewService } from './mgmt-review.service';
import { MgmtReviewController } from './mgmt-review.controller';
@Module({ imports: [PrismaModule], controllers: [MgmtReviewController], providers: [MgmtReviewService] })
export class MgmtReviewModule {}
