import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('api/audit-logs')
@Roles(Role.Auditor)
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Get()
  findAll(@Query('module') module?: string, @Query('action') action?: string, @Query('take') take?: string) {
    return this.service.findAll({ module, action, take: take ? parseInt(take) : 100 });
  }

  @Get('count')
  count() { return this.service.count(); }
}
