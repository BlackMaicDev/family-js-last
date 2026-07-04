import { Controller, Post, Body, HttpCode, HttpStatus, Patch, Param } from '@nestjs/common';
import { AuthNurseService } from './auth.service';
import { NurseLoginDto } from './dto/nurse-login.dto';

@Controller('nurse/auth')
export class AuthNurseController {
  constructor(private readonly authNurseService: AuthNurseService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: NurseLoginDto) {
    return this.authNurseService.login(loginDto);
  }

  // For testing purposes: Set password easily
  @Patch('set-password/:employeeId')
  async setPassword(
    @Param('employeeId') employeeId: string,
    @Body('password') password: string
  ) {
    await this.authNurseService.setPassword(employeeId, password);
    return { message: 'Password updated successfully' };
  }
}
