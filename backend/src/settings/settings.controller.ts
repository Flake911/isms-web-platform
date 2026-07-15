import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @Roles(Role.ISMSManager)
  getAll() { return this.service.getAll(); }

  @Put()
  @Roles(Role.OrgAdmin)
  saveAll(@Body() data: Record<string, string>) { return this.service.saveAll(data); }
}
