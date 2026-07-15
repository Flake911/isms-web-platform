import { Module } from '@nestjs/common';
import { AwarenessController } from './awareness.controller';
import { AwarenessService } from './awareness.service';
@Module({ controllers: [AwarenessController], providers: [AwarenessService] })
export class AwarenessModule {}
