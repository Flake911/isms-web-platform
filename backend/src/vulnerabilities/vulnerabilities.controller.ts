import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('api/vulnerabilities')
export class VulnerabilitiesController {
  constructor(private readonly service: VulnerabilitiesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get('count') count() { return this.service.count(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(Role.SecurityOfficer) create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') @Roles(Role.SecurityOfficer) update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') @Roles(Role.ISMSManager) remove(@Param('id') id: string) { return this.service.remove(id); }
}
