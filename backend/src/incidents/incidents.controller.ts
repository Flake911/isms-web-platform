import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Controller('api/incidents')
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get('count') count() { return this.service.count(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(Role.Employee) create(@Body() data: CreateIncidentDto) { return this.service.create(data); }
  @Put(':id') @Roles(Role.SecurityOfficer) update(@Param('id') id: string, @Body() data: CreateIncidentDto) { return this.service.update(id, data); }
  @Delete(':id') @Roles(Role.ISMSManager) remove(@Param('id') id: string) { return this.service.remove(id); }
}
