import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { RiskControlService } from './risk-control.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('api/risk-controls')
export class RiskControlController {
  constructor(private readonly service: RiskControlService) {}

  @Get()
  findAll(@Query('riskId') riskId?: string, @Query('controlId') controlId?: string) {
    if (riskId) return this.service.findByRisk(riskId);
    if (controlId) return this.service.findByControl(controlId);
    return this.service.findAll();
  }

  @Post()
  @Roles(Role.SecurityOfficer)
  link(@Body() data: { riskId: string; controlId: string; notes?: string }) {
    return this.service.link(data);
  }

  @Delete(':id')
  @Roles(Role.ISMSManager)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
