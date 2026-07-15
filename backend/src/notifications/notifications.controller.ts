import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get() findAll(@Request() req: any) {
    return this.service.findForUser(req.user?.sub);
  }

  @Get('unread-count') unreadCount(@Request() req: any) {
    return this.service.unreadCount(req.user?.sub);
  }

  @Put('mark-all-read') markAllRead(@Request() req: any) {
    return this.service.markAllRead(req.user?.sub);
  }

  @Put(':id/read') markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  @Post() create(@Body() data: any) {
    return this.service.create(data);
  }

  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
