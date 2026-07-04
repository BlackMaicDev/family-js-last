import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CrocAuthService } from './croc-auth.service';
import { RegisterCrocDto, LoginCrocDto } from './dto/croc-auth.dto';

@Controller('croc/auth')
export class CrocAuthController {
  constructor(private readonly crocAuthService: CrocAuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterCrocDto) {
    return this.crocAuthService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginCrocDto) {
    return this.crocAuthService.login(loginDto);
  }
}
