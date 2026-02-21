import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED) // ส่ง Status 201 กลับไปเมื่อสำเร็จ
    async register(@Body() registerData: RegisterDto) {
        return this.authService.register(registerData);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK) // Login สำเร็จส่ง 200 OK
    async login(@Body() loginDto: LoginDto) {
        // รับค่า username และ password จาก body
        return this.authService.login(loginDto.username, loginDto.password);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refresh_token') refreshToken: string) {
        return this.authService.refresh(refreshToken);
    }

    @ApiBearerAuth() // 👈 สั่งให้ Swagger แสดงปุ่มแม่กุญแจสำหรับส่ง Token กรอบนี้
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req) {
        return this.authService.logout(req.user.userId);
    }

    @ApiBearerAuth() // 👈 สั่งให้ Swagger แสดงปุ่มแม่กุญแจสำหรับส่ง Token กรอบนี้
    @UseGuards(JwtAuthGuard) // 🛡️ ล็อกทั้ง Controller นี้เลย (ทุกประตูต้องตรวจบัตร)
    @Get('profile')
    getProfile(@Request() req) {
        // ข้อมูลที่ return จาก validate() ใน Strategy จะมาโผล่ตรง req.user ครับ
        return req.user;
    }
}