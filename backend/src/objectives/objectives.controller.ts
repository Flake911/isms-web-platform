import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('api/objectives')
export class ObjectivesController {
  constructor(private readonly service: ObjectivesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get('count') count() { return this.service.count(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(Role.ISMSManager) create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') @Roles(Role.ISMSManager) update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') @Roles(Role.ISMSManager) remove(@Param('id') id: string) { return this.service.remove(id); }
}
