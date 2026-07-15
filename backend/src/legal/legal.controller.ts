import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { LegalService } from './legal.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('api/legal')
export class LegalController {
  constructor(private readonly service: LegalService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(Role.SecurityOfficer) create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') @Roles(Role.SecurityOfficer) update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') @Roles(Role.ISMSManager) remove(@Param('id') id: string) { return this.service.remove(id); }
}
