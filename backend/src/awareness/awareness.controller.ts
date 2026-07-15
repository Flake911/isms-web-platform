import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AwarenessService } from './awareness.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('api/awareness')
export class AwarenessController {
  constructor(private readonly service: AwarenessService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get('count') count() { return this.service.count(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(Role.ISMSManager) create(@Body() data: any) { return this.service.create(data); }
  @Post('complete') complete(@Body() body: { employeeName: string; department: string; courseId: string; score: number }) {
    return this.service.upsertCompletion(body.employeeName, body.department, body.courseId, body.score);
  }
  @Put(':id') @Roles(Role.ISMSManager) update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }
  @Delete(':id') @Roles(Role.ISMSManager) remove(@Param('id') id: string) { return this.service.remove(id); }
}
