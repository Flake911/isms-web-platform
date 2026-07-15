import { Controller, Post, Get, Put, Body, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './roles.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Put('me')
  async updateMe(@Request() req: any, @Body() body: any) {
    return this.authService.updateMe(req.user.id, body);
  }
}
