import { Module } from '@nestjs/common';
import { ControlsController } from './controls.controller';
import { ControlsService } from './controls.service';
@Module({ controllers: [ControlsController], providers: [ControlsService] })
export class ControlsModule {}
