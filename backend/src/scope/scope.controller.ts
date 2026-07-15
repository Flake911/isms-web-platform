import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ScopeService } from './scope.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('api/scope')
export class ScopeController {
  constructor(private readonly service: ScopeService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(Role.ISMSManager) create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') @Roles(Role.ISMSManager) update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') @Roles(Role.ISMSManager) remove(@Param('id') id: string) { return this.service.remove(id); }
}
