import { Module } from '@nestjs/common';
import { VulnerabilitiesController } from './vulnerabilities.controller';
import { VulnerabilitiesService } from './vulnerabilities.service';
@Module({ controllers: [VulnerabilitiesController], providers: [VulnerabilitiesService] })
export class VulnerabilitiesModule {}
