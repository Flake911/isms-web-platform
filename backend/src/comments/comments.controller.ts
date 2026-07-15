import { Controller, Get, Post, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('api/comments')
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  @Get() findAll(@Query('module') module: string, @Query('recordId') recordId: string) {
    return this.service.findAll(module, recordId);
  }

  @Post() create(@Body() data: any, @Request() req: any) {
    return this.service.create({
      ...data,
      userId: req.user?.sub || null,
      userEmail: req.user?.email || null,
    });
  }

  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
