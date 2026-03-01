import {
    Controller, Post, Body, HttpCode, HttpStatus,
    Get, UseGuards, Request, Res, UnauthorizedException
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// ⏱️ อายุ Cookie ที่ Browser จะเก็บ (หน่วย milliseconds)
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;         // 15 นาที
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 วัน

// 🍪 Helper: สร้าง Cookie Options ที่ปลอดภัย
const getCookieOptions = (maxAge: number) => ({
    httpOnly: true,    // JS อ่านไม่ได้ (กัน XSS)
    secure: process.env.NODE_ENV === 'production', // ส่งผ่าน HTTPS เท่านั้นใน Production
    sameSite: 'lax' as const,  // กัน CSRF เบื้องต้น
    maxAge,
    path: '/',
});

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerData: RegisterDto) {
        return this.authService.register(registerData);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response, // passthrough: true = NestJS ยังส่งผลตามปกติ
    ) {
        const { accessToken, refreshToken, user } =
            await this.authService.login(loginDto.username, loginDto.password);

        // 🍪 Set Access Token ใน HttpOnly Cookie
        res.cookie('access_token', accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));

        // 🍪 Set Refresh Token ใน HttpOnly Cookie (แยก path เพื่อความปลอดภัยยิ่งขึ้น)
        res.cookie('refresh_token', refreshToken, {
            ...getCookieOptions(REFRESH_TOKEN_MAX_AGE),
            path: '/auth/refresh', // Browser จะส่ง Cookie นี้เฉพาะเส้นทาง /auth/refresh เท่านั้น
        });

        // ส่งแค่ข้อมูล user กลับไป (ไม่ส่ง token ใน body อีกต่อไป)
        return { message: 'Login successful', user, accessToken };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Request() req,
        @Res({ passthrough: true }) res: Response,
    ) {
        // 🍪 อ่าน Refresh Token จาก Cookie (ไม่ใช่ Body อีกต่อไป)
        const refreshToken = req.cookies?.['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await this.authService.refresh(refreshToken);

        // 🍪 Set Cookie ชุดใหม่แทนที่ของเก่า (Token Rotation)
        res.cookie('access_token', accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));
        res.cookie('refresh_token', newRefreshToken, {
            ...getCookieOptions(REFRESH_TOKEN_MAX_AGE),
            path: '/auth/refresh',
        });

        return { message: 'Token refreshed successfully', accessToken };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Request() req,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.authService.logout(req.user.userId);

        // 🍪 ลบ Cookies ออกจาก Browser โดย Set maxAge เป็น 0
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/auth/refresh' });

        return { message: 'Logged out from all devices successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    // 🔍 Endpoint สำหรับ Frontend เช็คว่ายัง Login อยู่ไหม (ใช้ Cookie ที่ Browser ส่งมาให้อัตโนมัติ)
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @HttpCode(HttpStatus.OK)
    getMe(@Request() req) {
        return req.user;
    }
}