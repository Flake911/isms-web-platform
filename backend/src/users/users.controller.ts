import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api/users')
@Roles(Role.OrgAdmin)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('count')
  count() { return this.service.count(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() data: CreateUserDto) { return this.service.create(data); }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: CreateUserDto) { return this.service.update(id, data); }

  @Delete(':id')
  delete(@Param('id') id: string) { return this.service.delete(id); }
}
