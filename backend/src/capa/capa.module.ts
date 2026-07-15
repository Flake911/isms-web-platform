import { Module } from '@nestjs/common';
import { CapaController } from './capa.controller';
import { CapaService } from './capa.service';
@Module({ controllers: [CapaController], providers: [CapaService] })
export class CapaModule {}
