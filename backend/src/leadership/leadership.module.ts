import { Module } from '@nestjs/common';
import { LeadershipController } from './leadership.controller';
import { LeadershipService } from './leadership.service';

@Module({
  controllers: [LeadershipController],
  providers: [LeadershipService],
})
export class LeadershipModule {}
