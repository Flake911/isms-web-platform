import { Module } from '@nestjs/common';
import { ObjectivesController } from './objectives.controller';
import { ObjectivesService } from './objectives.service';
@Module({ controllers: [ObjectivesController], providers: [ObjectivesService] })
export class ObjectivesModule {}
